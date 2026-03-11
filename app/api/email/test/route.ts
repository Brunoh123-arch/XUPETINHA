import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email')
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY nao configurada',
        hint: 'Configure a variavel RESEND_API_KEY nas configuracoes do projeto'
      }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const toEmail = testEmail || 'delivered@resend.dev'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'UPPI <onboarding@resend.dev>'
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Teste de Email - UPPI',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f97316; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">UPPI</h1>
          </div>
          <div style="background: #1e293b; padding: 24px; border-radius: 12px; color: #f1f5f9;">
            <h2 style="margin: 0 0 16px 0; color: #22c55e;">Email funcionando!</h2>
            <p style="margin: 0; line-height: 1.6;">
              Este e um email de teste do sistema UPPI. Se voce recebeu esta mensagem, 
              o servico de email esta configurado corretamente.
            </p>
            <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 14px;">
              Enviado em: ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Email enviado com sucesso para ${toEmail}!`,
      emailId: data?.id,
      config: {
        fromEmail,
        toEmail,
      },
      hint: testEmail 
        ? 'Verifique sua caixa de entrada e spam' 
        : 'Adicione ?email=seu@email.com para enviar para seu email (use o email cadastrado no Resend)'
    })

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    }, { status: 500 })
  }
}
