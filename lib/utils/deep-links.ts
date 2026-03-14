import { iosToast } from './ios-toast'
import { triggerHaptic } from '@/hooks/use-haptic'

export interface ShareRideData {
  rideId: string
  pickupAddress: string
  dropoffAddress: string
  price?: number
  driverName?: string
}

export interface ShareCouponData {
  code: string
  discount: number
  description?: string
}

/**
 * Generate deep link URL for sharing a ride
 */
export function generateRideDeepLink(data: ShareRideData): string {
  const baseUrl = 'https://uppi.app'
  const params = new URLSearchParams({
    type: 'ride',
    id: data.rideId,
    pickup: data.pickupAddress,
    dropoff: data.dropoffAddress,
    ...(data.price && { price: data.price.toString() }),
    ...(data.driverName && { driver: data.driverName }),
  })
  return `${baseUrl}/share?${params.toString()}`
}

/**
 * Generate deep link URL for sharing a coupon
 */
export function generateCouponDeepLink(data: ShareCouponData): string {
  const baseUrl = 'https://uppi.app'
  const params = new URLSearchParams({
    type: 'coupon',
    code: data.code,
    discount: data.discount.toString(),
    ...(data.description && { desc: data.description }),
  })
  return `${baseUrl}/share?${params.toString()}`
}

/**
 * Share ride via native share API or clipboard fallback
 */
export async function shareRide(data: ShareRideData): Promise<boolean> {
  const link = generateRideDeepLink(data)
  const shareText = `🚗 Olha minha corrida no Uppi!\n\n📍 De: ${data.pickupAddress}\n📍 Para: ${data.dropoffAddress}${data.price ? `\n💰 R$ ${data.price.toFixed(2)}` : ''}\n\n${link}`

  triggerHaptic('impact')

  try {
    const { nativeShare } = await import('@/lib/native')
    await nativeShare({ title: 'Minha corrida - Uppi', text: shareText, url: link })
    return true
  } catch {
    return false
  }
}

/**
 * Share coupon via native share API or clipboard fallback
 */
export async function shareCoupon(data: ShareCouponData): Promise<boolean> {
  const link = generateCouponDeepLink(data)
  const shareText = `🎁 Ganhe ${data.discount}% de desconto no Uppi!\n\nCodigo: ${data.code}\n${data.description || 'Use na sua proxima corrida'}\n\n${link}`

  triggerHaptic('impact')

  try {
    const { nativeShare } = await import('@/lib/native')
    await nativeShare({ title: 'Cupom Uppi', text: shareText, url: link })
    return true
  } catch {
    return false
  }
}

/**
 * Parse deep link parameters from URL
 */
export function parseDeepLink(url: string): { type: 'ride' | 'coupon'; data: any } | null {
  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams
    const type = params.get('type')

    if (type === 'ride') {
      return {
        type: 'ride',
        data: {
          rideId: params.get('id'),
          pickupAddress: params.get('pickup'),
          dropoffAddress: params.get('dropoff'),
          price: params.get('price') ? parseFloat(params.get('price')!) : undefined,
          driverName: params.get('driver') || undefined,
        },
      }
    }

    if (type === 'coupon') {
      return {
        type: 'coupon',
        data: {
          code: params.get('code'),
          discount: params.get('discount') ? parseInt(params.get('discount')!) : 0,
          description: params.get('desc') || undefined,
        },
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing deep link:', error)
    return null
  }
}

export interface InviteData {
  code: string
  role?: 'driver' | 'passenger'
  referrerId?: string
}

/**
 * Generate deep link URL for driver/passenger invite
 */
export function generateInviteDeepLink(data: InviteData): string {
  const baseUrl = 'https://uppi.app'
  const path = data.role === 'driver' ? '/driver/invite' : '/invite'
  const params = new URLSearchParams({
    code: data.code,
    ...(data.referrerId && { ref: data.referrerId }),
  })
  return `${baseUrl}${path}/${data.code}?${params.toString()}`
}

/**
 * Parse deep link parameters from URL — expanded to support driver routes and invites
 */
export function parseDeepLinkExtended(url: string): {
  type: 'ride' | 'coupon' | 'driver_ride' | 'driver_accept' | 'invite' | 'driver_invite'
  data: any
} | null {
  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams
    const pathname = urlObj.pathname

    // /share?type=... (existing)
    const type = params.get('type')
    if (type === 'ride') {
      return {
        type: 'ride',
        data: {
          rideId: params.get('id'),
          pickupAddress: params.get('pickup'),
          dropoffAddress: params.get('dropoff'),
          price: params.get('price') ? parseFloat(params.get('price')!) : undefined,
        },
      }
    }
    if (type === 'coupon') {
      return {
        type: 'coupon',
        data: {
          code: params.get('code'),
          discount: params.get('discount') ? parseInt(params.get('discount')!) : 0,
        },
      }
    }

    // /uppi/ride/:id/* — passageiro vê corrida
    const rideMatch = pathname.match(/^\/uppi\/ride\/([^/]+)/)
    if (rideMatch) {
      return { type: 'ride', data: { rideId: rideMatch[1] } }
    }

    // /uppi/driver/ride/:id/accept — motorista aceitar corrida via push tap
    const driverAcceptMatch = pathname.match(/^\/uppi\/driver\/ride\/([^/]+)\/accept/)
    if (driverAcceptMatch) {
      return { type: 'driver_accept', data: { rideId: driverAcceptMatch[1] } }
    }

    // /uppi/driver/ride/:id/* — motorista na tela de corrida
    const driverRideMatch = pathname.match(/^\/uppi\/driver\/ride\/([^/]+)/)
    if (driverRideMatch) {
      return { type: 'driver_ride', data: { rideId: driverRideMatch[1] } }
    }

    // /driver/invite/:code
    const driverInviteMatch = pathname.match(/^\/driver\/invite\/([^/]+)/)
    if (driverInviteMatch) {
      return { type: 'driver_invite', data: { code: driverInviteMatch[1] } }
    }

    // /invite/:code
    const inviteMatch = pathname.match(/^\/invite\/([^/]+)/)
    if (inviteMatch) {
      return { type: 'invite', data: { code: inviteMatch[1] } }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Handle incoming deep link — roteamento completo para passageiro e motorista
 */
export function handleDeepLink(url: string, router: any): void {
  const parsed = parseDeepLinkExtended(url)

  if (!parsed) {
    // Tenta fallback com parseDeepLink legado
    const legacy = parseDeepLink(url)
    if (!legacy) return
    triggerHaptic('impact')
    if (legacy.type === 'ride') {
      router.push(`/uppi/ride/${legacy.data.rideId}/details`)
    } else if (legacy.type === 'coupon') {
      router.push(`/uppi/promotions?code=${legacy.data.code}`)
    }
    return
  }

  triggerHaptic('impact')

  switch (parsed.type) {
    case 'ride':
      if (parsed.data.rideId) {
        router.push(`/uppi/ride/${parsed.data.rideId}/details`)
      } else if (parsed.data.pickupAddress && parsed.data.dropoffAddress) {
        router.push(
          `/uppi/request-ride?pickup=${encodeURIComponent(parsed.data.pickupAddress)}&destination=${encodeURIComponent(parsed.data.dropoffAddress)}`
        )
      }
      break

    case 'coupon':
      router.push(`/uppi/promotions?code=${parsed.data.code}`)
      iosToast.success('Cupom recebido')
      break

    case 'driver_accept':
      router.push(`/uppi/driver/ride/${parsed.data.rideId}/accept`)
      break

    case 'driver_ride':
      router.push(`/uppi/driver/ride/${parsed.data.rideId}/active`)
      break

    case 'invite':
      router.push(`/invite/${parsed.data.code}`)
      iosToast.success('Convite recebido')
      break

    case 'driver_invite':
      router.push(`/driver/invite/${parsed.data.code}`)
      iosToast.success('Convite de motorista recebido')
      break
  }
}
