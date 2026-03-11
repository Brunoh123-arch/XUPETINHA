import { NextRequest, NextResponse } from 'next/server'
import {
  sendConfirmSignupEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail,
  sendEmailChangeEmail,
  sendInviteEmail,
  sendWelcomeEmail,
} from '@/lib/email'

// Webhook secret para validar requests do Supabase
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET

/**
 * API para envio de emails customizados
 * Pode ser chamada via:
 * 1. Supabase Auth Hooks (webhooks)
 * 2. Diretamente do codigo
 */
export async function POST(request: NextRequest) {
  try {
    // Validar webhook secret (se configurado)
    const authHeader = request.headers.get('authorization')
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      // Se nao for webhook, verificar se e chamada interna
      const internalKey = request.headers.get('x-internal-key')
      if (internalKey !== process.env.INTERNAL_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { type, email, name, url, inviter_name } = body

    let success = false

    switch (type) {
      case 'signup':
      case 'confirm_signup':
        success = await sendConfirmSignupEmail(email, name || 'Usuario', url)
        break

      case 'recovery':
      case 'password_reset':
        success = await sendPasswordResetEmail(email, name || 'Usuario', url)
        break

      case 'magic_link':
      case 'magiclink':
        success = await sendMagicLinkEmail(email, name || 'Usuario', url)
        break

      case 'email_change':
      case 'change_email':
        success = await sendEmailChangeEmail(email, name || 'Usuario', url)
        break

      case 'invite':
        success = await sendInviteEmail(email, inviter_name || 'Alguem', url)
        break

      case 'welcome':
        success = await sendWelcomeEmail(email, name || 'Usuario')
        break

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
