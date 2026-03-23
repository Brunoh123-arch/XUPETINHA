-- Seed: Planos de assinatura do Club Uppi
-- Popula a tabela subscription_plans com os 3 planos usados em club/page.tsx

INSERT INTO subscription_plans (id, name, price, billing_period, discount_percentage, features, is_active, sort_order, description, created_at)
VALUES
  (
    gen_random_uuid(),
    'basic',
    14.90,
    'monthly',
    5,
    '{"discount_percent": 5, "cashback_percent": 0, "priority_support": false, "premium_vehicles": false, "free_cancellations": 0, "monthly_coupons": 1, "coupon_value": 5}'::jsonb,
    true,
    1,
    'Plano basico com 5% de desconto em corridas',
    NOW()
  ),
  (
    gen_random_uuid(),
    'premium',
    29.90,
    'monthly',
    12,
    '{"discount_percent": 12, "cashback_percent": 3, "priority_support": true, "premium_vehicles": true, "free_cancellations": 2, "monthly_coupons": 3, "coupon_value": 5}'::jsonb,
    true,
    2,
    'Plano premium com 12% de desconto e 3% de cashback',
    NOW()
  ),
  (
    gen_random_uuid(),
    'vip',
    49.90,
    'monthly',
    20,
    '{"discount_percent": 20, "cashback_percent": 5, "priority_support": true, "premium_vehicles": true, "free_cancellations": -1, "monthly_coupons": 5, "coupon_value": 10, "travel_insurance": true}'::jsonb,
    true,
    3,
    'Plano VIP com 20% de desconto, 5% de cashback e beneficios exclusivos',
    NOW()
  )
ON CONFLICT DO NOTHING;
