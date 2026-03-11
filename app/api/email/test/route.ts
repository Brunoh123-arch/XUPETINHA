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
    
    const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aea87665-c904-40c2-97ee-07cf7c0a3723-GCOI62oxS3Fr70FcCwhVmBsXuE4HMa.jpg'
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Teste de Email - UPPI',
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UPPI - Teste</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050505;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">
          
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <img src="${logoUrl}" alt="UPPI" width="80" height="80" style="display:block;margin:0 auto;width:80px;height:80px;border-radius:20px;" />
            </td>
          </tr>
          
          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(180deg, #141414 0%, #0a0a0a 100%);border-radius:24px;overflow:hidden;border:1px solid #27272a;">
              
              <!-- Barra gradiente -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg, #3b82f6 0%, #f97316 100%);"></td>
                </tr>
              </table>
              
              <!-- Conteudo -->
              <tr>
                <td style="padding:40px 32px;text-align:center;">
                  
                  <div style="display:inline-block;width:56px;height:56px;line-height:56px;background:#22c55e;border-radius:16px;font-size:24px;text-align:center;margin-bottom:20px;">
                    &#10004;
                  </div>
                  
                  <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 12px 0;letter-spacing:-0.5px;">
                    Email configurado!
                  </h1>
                  
                  <p style="color:#a1a1aa;font-size:16px;line-height:1.7;margin:0 0 32px 0;">
                    Se voce esta vendo esta mensagem, o sistema de emails do <strong style="color:#f97316;">UPPI</strong> esta funcionando perfeitamente.
                  </p>
                  
                  <div style="background:#1a1a1a;border-radius:16px;padding:24px;border:1px solid #27272a;margin-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #27272a;">
                          <span style="color:#71717a;font-size:13px;">De:</span>
                          <span style="color:#ffffff;font-size:14px;float:right;">${fromEmail}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #27272a;">
                          <span style="color:#71717a;font-size:13px;">Para:</span>
                          <span style="color:#ffffff;font-size:14px;float:right;">${toEmail}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#71717a;font-size:13px;">Enviado:</span>
                          <span style="color:#ffffff;font-size:14px;float:right;">${new Date().toLocaleString('pt-BR')}</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="color:#71717a;font-size:13px;margin:0;">
                    Emails de confirmacao, recuperacao de senha e notificacoes estao prontos.
                  </p>
                  
                </td>
              </tr>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:32px 24px;text-align:center;">
              <img src="${logoUrl}" alt="UPPI" width="32" height="32" style="display:block;margin:0 auto 16px auto;width:32px;height:32px;border-radius:8px;opacity:0.6;" />
              <p style="color:#71717a;font-size:13px;margin:0;">UPPI - Tecnologia em mobilidade urbana</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
