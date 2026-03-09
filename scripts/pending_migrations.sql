-- Migration 013: Complete ride logic + achievements + wallet columns
-- Execute manually if auto-migration fails due to DB instability

-- Step A: Add missing columns to wallet_transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wallet_transactions' AND column_name='balance_after') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN balance_after NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wallet_transactions' AND column_name='reference_type') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN reference_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wallet_transactions' AND column_name='pix_key') THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN pix_key TEXT;
  END IF;
END$$;

-- Step B: Unique constraint on payments.ride_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payments_ride_id_unique' AND conrelid='public.payments'::regclass) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_ride_id_unique UNIQUE (ride_id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

-- Step C: check_and_award_achievements RPC
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID, p_user_type TEXT DEFAULT 'passenger')
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total_rides INTEGER := 0; v_rating NUMERIC := 5.0; v_total_saved NUMERIC := 0;
  v_unlocked_ids TEXT[] := ARRAY[]::TEXT[];
  v_ach RECORD;
BEGIN
  SELECT COALESCE(total_rides,0), COALESCE(rating,5.0), COALESCE(total_saved,0)
  INTO v_total_rides, v_rating, v_total_saved FROM public.profiles WHERE id = p_user_id;
  SELECT ARRAY_AGG(achievement_id::TEXT) INTO v_unlocked_ids FROM public.user_achievements WHERE user_id = p_user_id;
  v_unlocked_ids := COALESCE(v_unlocked_ids, ARRAY[]::TEXT[]);
  FOR v_ach IN SELECT * FROM public.achievements WHERE is_active=true AND (user_type=p_user_type OR user_type='all') LOOP
    CONTINUE WHEN v_ach.id::TEXT = ANY(v_unlocked_ids);
    BEGIN
      IF (v_ach.criteria_type='total_rides' AND v_total_rides>=(v_ach.criteria->>'value')::INTEGER)
      OR (v_ach.criteria_type='rating'       AND v_rating     >=(v_ach.criteria->>'value')::NUMERIC)
      OR (v_ach.criteria_type='total_saved'  AND v_total_saved>=(v_ach.criteria->>'value')::NUMERIC)
      THEN
        INSERT INTO public.user_achievements (user_id,achievement_id,unlocked_at) VALUES (p_user_id,v_ach.id,NOW()) ON CONFLICT (user_id,achievement_id) DO NOTHING;
        PERFORM public.send_notification(p_user_id,'Conquista desbloqueada!','Voce desbloqueou: '||v_ach.name,'achievement_unlocked',jsonb_build_object('achievement_id',v_ach.id));
      END IF;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END;
$$;

-- Step D: complete_ride with full logic
CREATE OR REPLACE FUNCTION public.complete_ride(p_ride_id UUID, p_driver_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ride            public.rides%ROWTYPE;
  v_commission_pct  NUMERIC := 0.20;
  v_driver_pct      NUMERIC := 0.80;
  v_total_price     NUMERIC;
  v_platform_fee    NUMERIC;
  v_driver_earnings NUMERIC;
BEGIN
  SELECT * INTO v_ride FROM public.rides WHERE id=p_ride_id AND driver_id=p_driver_id AND status='in_progress' FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Corrida nao encontrada ou nao esta em andamento'); END IF;

  BEGIN
    SELECT (value->>'value')::NUMERIC/100 INTO v_commission_pct FROM public.app_config WHERE key='platform_fee_percent';
    SELECT (value->>'value')::NUMERIC/100 INTO v_driver_pct     FROM public.app_config WHERE key='driver_earnings_percent';
    v_commission_pct:=COALESCE(v_commission_pct,0.20); v_driver_pct:=COALESCE(v_driver_pct,0.80);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  v_total_price:=COALESCE(v_ride.final_price,v_ride.passenger_price_offer,0);
  v_platform_fee:=ROUND(v_total_price*v_commission_pct,2);
  v_driver_earnings:=ROUND(v_total_price*v_driver_pct,2);

  UPDATE public.rides SET status='completed',completed_at=NOW(),updated_at=NOW() WHERE id=p_ride_id;
  UPDATE public.driver_profiles SET total_earnings=total_earnings+v_driver_earnings,total_rides=total_rides+1,is_available=TRUE,updated_at=NOW() WHERE id=p_driver_id;
  INSERT INTO public.user_wallets (user_id,balance,total_earned,total_withdrawn) VALUES (p_driver_id,v_driver_earnings,v_driver_earnings,0)
    ON CONFLICT (user_id) DO UPDATE SET balance=user_wallets.balance+v_driver_earnings,total_earned=user_wallets.total_earned+v_driver_earnings,updated_at=NOW();
  UPDATE public.driver_locations SET is_available=TRUE,updated_at=NOW() WHERE driver_id=p_driver_id;
  UPDATE public.profiles SET total_rides=total_rides+1,updated_at=NOW() WHERE id=v_ride.passenger_id;
  INSERT INTO public.wallet_transactions (user_id,type,amount,description,ride_id,status) VALUES (p_driver_id,'earning',v_driver_earnings,'Ganho por corrida concluida',p_ride_id,'completed');
  BEGIN
    INSERT INTO public.payments (ride_id,user_id,driver_id,amount,platform_fee,driver_earnings,payment_method,status)
    VALUES (p_ride_id,v_ride.passenger_id,p_driver_id,v_total_price,v_platform_fee,v_driver_earnings,COALESCE(v_ride.payment_method,'cash'),'completed');
  EXCEPTION WHEN unique_violation THEN
    UPDATE public.payments SET status='completed',updated_at=NOW() WHERE ride_id=p_ride_id;
  END;
  BEGIN PERFORM public.check_and_award_achievements(v_ride.passenger_id,'passenger'); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM public.check_and_award_achievements(p_driver_id,'driver'); EXCEPTION WHEN OTHERS THEN NULL; END;
  PERFORM public.send_notification(v_ride.passenger_id,'Corrida concluida!','Avalie seu motorista.','ride_completed',jsonb_build_object('ride_id',p_ride_id,'total_price',v_total_price));
  BEGIN PERFORM public.snapshot_platform_metrics(); EXCEPTION WHEN OTHERS THEN NULL; END;
  RETURN jsonb_build_object('success',true,'earnings',v_driver_earnings,'platform_fee',v_platform_fee,'total_price',v_total_price);
END;
$$;

-- Step E: cancel_ride with driver release
CREATE OR REPLACE FUNCTION public.cancel_ride(p_ride_id UUID, p_user_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ride public.rides%ROWTYPE;
BEGIN
  SELECT * INTO v_ride FROM public.rides
  WHERE id=p_ride_id AND (passenger_id=p_user_id OR driver_id=p_user_id)
    AND status IN ('pending','searching','accepted','arriving','in_progress') FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Corrida nao encontrada ou nao pode ser cancelada'); END IF;
  UPDATE public.rides SET status='cancelled',cancelled_at=NOW(),cancel_reason=p_reason,updated_at=NOW() WHERE id=p_ride_id;
  IF v_ride.driver_id IS NOT NULL THEN
    UPDATE public.driver_profiles SET is_available=TRUE,updated_at=NOW() WHERE id=v_ride.driver_id;
    UPDATE public.driver_locations SET is_available=TRUE,updated_at=NOW() WHERE driver_id=v_ride.driver_id;
  END IF;
  IF p_user_id=v_ride.passenger_id AND v_ride.driver_id IS NOT NULL THEN
    PERFORM public.send_notification(v_ride.driver_id,'Corrida cancelada','O passageiro cancelou.','ride_cancelled',jsonb_build_object('ride_id',p_ride_id));
  ELSIF p_user_id=v_ride.driver_id THEN
    PERFORM public.send_notification(v_ride.passenger_id,'Corrida cancelada','O motorista cancelou. Buscando outro...','ride_cancelled',jsonb_build_object('ride_id',p_ride_id));
  END IF;
  RETURN jsonb_build_object('success',true,'ride_id',p_ride_id);
END;
$$;
