import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/v1/auth/email-otp/verify
// Verifica o código de 6 dígitos enviado por email via Supabase Auth OTP
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, token } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    }

    if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
      return NextResponse.json({ error: 'Código inválido. Digite os 6 dígitos.' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verifica o OTP via Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      console.error('[v0] Email OTP verify error:', error)
      return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    console.error('[v0] Email OTP verify unexpected error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
