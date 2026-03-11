import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Pegar email da query string
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email')
    
    // Verificar se a API key está configurada
    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'BREVO_API_KEY não configurada',
        hint: 'Configure a variável BREVO_API_KEY nas configurações do projeto. Crie uma conta grátis em https://brevo.com'
      }, { status: 500 })
    }

    const toEmail = testEmail || 'teste@exemplo.com'
    const fromName = process.env.BREVO_FROM_NAME || 'UPPI'
    const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@uppi.app'
    
    // Enviar email de teste via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: [{ email: toEmail }],
        subject: 'Teste UPPI - Sistema de Emails',
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f1f5f9;">
            <div style="max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px;">
              <div style="background: #f97316; border-radius: 8px; padding: 12px 24px; text-align: center; margin-bottom: 20px;">
                <span style="color: white; font-size: 24px; font-weight: bold;">UPPI</span>
              </div>
              <h1 style="color: #22c55e; text-align: center;">Teste realizado com sucesso!</h1>
              <p style="color: #94a3b8; text-align: center;">
                O sistema de emails customizados com Brevo está funcionando corretamente.
              </p>
              <p style="color: #f97316; text-align: center; font-weight: bold;">
                9.000 emails/mês grátis!
              </p>
              <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
                Enviado em: ${new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        `,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.message || 'Erro ao enviar email',
        details: data,
        config: {
          apiKeyConfigured: true,
          fromName,
          fromEmail,
          toEmail,
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Email de teste enviado com sucesso para ${toEmail}!`,
      messageId: data.messageId,
      config: {
        provider: 'Brevo (9.000 emails/mês grátis)',
        apiKeyConfigured: true,
        fromName,
        fromEmail,
        toEmail,
      },
      hint: testEmail 
        ? 'Verifique sua caixa de entrada e spam' 
        : 'Adicione ?email=seu@email.com para enviar para seu email real'
    })

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 })
  }
}
