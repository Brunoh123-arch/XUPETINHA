import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendRideReportEmail } from '@/lib/email'
import { sendFcmToTokens } from '@/lib/firebase-admin'

/** Busca os FCM tokens ativos de um usuario e dispara push silenciosamente. */
async function pushToUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  try {
    const { data: tokens } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (!tokens || tokens.length === 0) return

    await sendFcmToTokens(
      tokens.map((t: { token: string }) => t.token),
      title,
      body,
      data
    )
  } catch {
    // Push nao e critico — falha silenciosa
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { status, cancellation_reason } = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Status válidos alinhados com o ENUM do banco
    const validStatuses = ['pending', 'negotiating', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled', 'failed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Status inválido: ${status}` }, { status: 400 })
    }

    // Timestamps adicionais por status
    const extra: Record<string, string | null> = {}
    if (status === 'in_progress') extra.started_at = new Date().toISOString()
    if (status === 'completed')   extra.completed_at = new Date().toISOString()
    if (status === 'cancelled')   extra.cancelled_at = new Date().toISOString()
    if (cancellation_reason)      extra.cancellation_reason = cancellation_reason

    const { data: ride, error } = await supabase
      .from('rides')
      .update({ status, updated_at: new Date().toISOString(), ...extra })
      .eq('id', id)
      .select('*, passenger:profiles!passenger_id(full_name, email), driver:profiles!driver_id(full_name)')
      .single()

    if (error) throw error

    // Notificar ambas as partes conforme o status — campo real é "body" não "message"
    const notifications: { user_id: string; title: string; body: string }[] = []

    if (status === 'driver_arrived' && ride.passenger_id) {
      notifications.push({
        user_id: ride.passenger_id,
        title: 'Motorista chegou',
        body: 'Seu motorista chegou ao ponto de embarque.',
      })
    }
    if (status === 'in_progress' && ride.passenger_id) {
      notifications.push({
        user_id: ride.passenger_id,
        title: 'Corrida iniciada',
        body: 'Sua corrida foi iniciada. Boa viagem!',
      })
    }
    if (status === 'completed') {
      if (ride.passenger_id) {
        notifications.push({
          user_id: ride.passenger_id,
          title: 'Corrida finalizada',
          body: 'Chegamos! Avalie sua experiência.',
        })
      }
      if (ride.driver_id) {
        notifications.push({
          user_id: ride.driver_id,
          title: 'Corrida concluída',
          body: `Corrida para ${ride.dropoff_address} finalizada. Ganho registrado!`,
        })
      }
    }
    if (status === 'cancelled') {
      const other = user.id === ride.passenger_id ? ride.driver_id : ride.passenger_id
      if (other) {
        notifications.push({
          user_id: other,
          title: 'Corrida cancelada',
          body: cancellation_reason || 'A corrida foi cancelada.',
        })
      }
    }

    for (const notif of notifications) {
      await supabase.from('notifications').insert({
        user_id: notif.user_id,
        type: 'ride',
        title: notif.title,
        body: notif.body,
        data: { ride_id: id, status },
        is_read: false,
      })
      pushToUser(supabase, notif.user_id, notif.title, notif.body, {
        ride_id: id,
        status,
        type: 'ride_update',
      })
    }

    // Push adicional ao passageiro quando motorista aceita a corrida
    if (status === 'accepted' && ride.passenger_id) {
      const driverName = (ride.driver as any)?.full_name || 'Motorista'
      pushToUser(
        supabase,
        ride.passenger_id,
        'Corrida aceita',
        `${driverName} aceitou sua corrida e esta a caminho.`,
        { ride_id: id, status: 'accepted', type: 'ride_update' }
      )
    }

    // Email de relatório ao finalizar
    if (status === 'completed') {
      try {
        const { data: fullRide } = await supabase
          .from('rides')
          .select(`
            id, pickup_address, dropoff_address, estimated_distance,
            estimated_duration, final_price, payment_method,
            started_at, completed_at,
            passenger:profiles!passenger_id(full_name, email),
            driver:profiles!driver_id(
              full_name,
              driver_profile:driver_profiles!driver_profiles_user_id_fkey(license_number, license_category)
            )
          `)
          .eq('id', id)
          .single()

        if (fullRide) {
          const passenger = fullRide.passenger as any
          const driver = fullRide.driver as any
          const dp = driver?.driver_profile as any

          if (passenger?.email) {
            const durationMinutes = fullRide.started_at && fullRide.completed_at
              ? Math.round((new Date(fullRide.completed_at).getTime() - new Date(fullRide.started_at).getTime()) / 60000)
              : fullRide.estimated_duration_minutes || 0

            await sendRideReportEmail({
              rideId: fullRide.id,
              passengerName: passenger.full_name || 'Passageiro',
              passengerEmail: passenger.email,
              driverName: driver?.full_name || 'Motorista',
              vehicleBrand: 'Veículo',
              vehicleModel: '',
              vehiclePlate: '—',
              vehicleColor: '',
              pickupAddress: fullRide.pickup_address,
              dropoffAddress: fullRide.dropoff_address,
              distanceKm: fullRide.estimated_distance || 0,
              durationMinutes: fullRide.started_at && fullRide.completed_at
                ? Math.round((new Date(fullRide.completed_at).getTime() - new Date(fullRide.started_at).getTime()) / 60000)
                : fullRide.estimated_duration || 0,
              finalPrice: fullRide.final_price || 0,
              paymentMethod: fullRide.payment_method || 'pix',
              startedAt: fullRide.started_at || fullRide.completed_at || new Date().toISOString(),
              completedAt: fullRide.completed_at || new Date().toISOString(),
            })
          }
        }
      } catch (_) {}
    }

    return NextResponse.json({ success: true, ride })
  } catch (error: any) {
    console.error('[rides/status] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar status' },
      { status: 500 }
    )
  }
}
