import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: Request) {
  try {
    // Pegar email da query string
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email')
    
    // Verificar se a API key está configurada
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY não configurada',
        hint: 'Configure a variável RESEND_API_KEY nas configurações do projeto'
      }, { status: 500 })
    }

    console.log('[v0] RESEND_API_KEY configurada:', process.env.RESEND_API_KEY?.substring(0, 10) + '...')
    console.log('[v0] RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL)

    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Se não passar email, usa o email de teste do Resend
    const toEmail = testEmail || 'delivered@resend.dev'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'UPPI <onboarding@resend.dev>'
    
    console.log('[v0] Enviando email de teste para:', toEmail)
    console.log('[v0] From:', fromEmail)
    
    // Enviar email de teste
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Teste UPPI - Sistema de Emails',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f1f5f9;">
          <div style="max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px;">
            <div style="background: #f97316; border-radius: 8px; padding: 12px 24px; text-align: center; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">UPPI</span>
            </div>
            <h1 style="color: #22c55e; text-align: center;">Teste realizado com sucesso!</h1>
            <p style="color: #94a3b8; text-align: center;">
              O sistema de emails customizados está funcionando corretamente.
            </p>
            <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
              Enviado em: ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[v0] Resend error:', JSON.stringify(error, null, 2))
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        config: {
          apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
          fromEmail: fromEmail,
          toEmail: toEmail,
        }
      }, { status: 500 })
    }

    console.log('[v0] Email enviado com sucesso! ID:', data?.id)

    return NextResponse.json({
      success: true,
      message: `Email de teste enviado com sucesso para ${toEmail}!`,
      emailId: data?.id,
      config: {
        apiKeyConfigured: true,
        fromEmail: fromEmail,
        toEmail: toEmail,
      },
      hint: testEmail ? 'Verifique sua caixa de entrada e spam' : 'Adicione ?email=seu@email.com para enviar para seu email real'
    })

  } catch (err: any) {
    console.error('[v0] Test email error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Erro desconhecido',
    }, { status: 500 })
  }
}
