import { Resend } from 'resend'

// ============================================
// RESEND - 3.000 emails/mes gratis
// ============================================

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// ============================================
// CONFIGURACAO DA MARCA
// ============================================
const BRAND = {
  name: 'UPPI',
  tagline: 'Sua corrida, do seu jeito',
  // Cores baseadas na logo (azul e laranja)
  blue: '#3b82f6',
  orange: '#f97316',
  primaryColor: '#f97316', // laranja
  secondaryColor: '#3b82f6', // azul
  // Tons escuros
  bgDark: '#0a0a0a',
  bgCard: '#141414',
  bgCardLight: '#1a1a1a',
  // Textos
  textLight: '#ffffff',
  textMuted: '#a1a1aa',
  textDark: '#71717a',
  // Bordas
  borderColor: '#27272a',
  // Logo URL oficial (hospedada publicamente)
  logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aea87665-c904-40c2-97ee-07cf7c0a3723-GCOI62oxS3Fr70FcCwhVmBsXuE4HMa.jpg',
  fromEmail: process.env.RESEND_FROM_EMAIL || 'UPPI <onboarding@resend.dev>',
}

// ============================================
// TEMPLATE BASE - Design Profissional
// ============================================
function getEmailWrapper(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${BRAND.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    .hover-orange:hover { background-color: #ea580c !important; }
    .hover-blue:hover { background-color: #2563eb !important; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 24px 20px !important; }
      .logo { width: 60px !important; height: 60px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#050505;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050505;padding:40px 16px;">
    <tr>
      <td align="center">
        <table class="container" width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">
          
          <!-- Header com Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.name}" class="logo" width="80" height="80" style="display:block;margin:0 auto;width:80px;height:80px;border-radius:20px;" />
            </td>
          </tr>
          
          <!-- Card Principal -->
          <tr>
            <td style="background:linear-gradient(180deg, ${BRAND.bgCard} 0%, ${BRAND.bgDark} 100%);border-radius:24px;overflow:hidden;border:1px solid ${BRAND.borderColor};">
              
              <!-- Barra de cor no topo -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg, ${BRAND.blue} 0%, ${BRAND.orange} 100%);"></td>
                </tr>
              </table>
              
              <!-- Conteudo -->
              ${content}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:32px 24px;text-align:center;">
              <!-- Logo pequena no footer -->
              <img src="${BRAND.logoUrl}" alt="${BRAND.name}" width="32" height="32" style="display:block;margin:0 auto 16px auto;width:32px;height:32px;border-radius:8px;opacity:0.6;" />
              
              <p style="color:${BRAND.textDark};font-size:13px;margin:0 0 8px 0;font-weight:500;">
                ${BRAND.name} - Tecnologia em mobilidade urbana
              </p>
              <p style="color:#52525b;font-size:12px;margin:0 0 16px 0;">
                Este e-mail foi enviado automaticamente. Nao responda.
              </p>
              
              <!-- Links do footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="#" style="color:${BRAND.textDark};font-size:12px;text-decoration:none;margin:0 12px;">Termos</a>
                    <span style="color:#3f3f46;">|</span>
                    <a href="#" style="color:${BRAND.textDark};font-size:12px;text-decoration:none;margin:0 12px;">Privacidade</a>
                    <span style="color:#3f3f46;">|</span>
                    <a href="#" style="color:${BRAND.textDark};font-size:12px;text-decoration:none;margin:0 12px;">Suporte</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

function getButtonHtml(text: string, url: string, variant: 'orange' | 'blue' = 'orange'): string {
  const bgColor = variant === 'orange' ? BRAND.orange : BRAND.blue
  const hoverClass = variant === 'orange' ? 'hover-orange' : 'hover-blue'
  return `
    <a href="${url}" class="${hoverClass}" style="display:inline-block;background:${bgColor};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:12px;margin:8px 0;box-shadow:0 4px 14px 0 rgba(0,0,0,0.4);transition:all 0.2s ease;">
      ${text}
    </a>
  `
}

function getIconCircle(emoji: string, bgColor: string = BRAND.orange): string {
  return `
    <div style="display:inline-block;width:56px;height:56px;line-height:56px;background:${bgColor};border-radius:16px;font-size:24px;text-align:center;margin-bottom:20px;">
      ${emoji}
    </div>
  `
}

// ============================================
// EMAILS DE AUTENTICACAO
// ============================================

/**
 * Email de confirmacao de cadastro
 */
export async function sendConfirmSignupEmail(
  email: string,
  name: string,
  confirmationUrl: string
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'Usuario'
  
  const content = `
    <tr>
      <td class="content" style="padding:40px 32px;text-align:center;">
        ${getIconCircle('&#128075;', BRAND.blue)}
        
        <h1 style="color:${BRAND.textLight};font-size:28px;font-weight:800;margin:0 0 12px 0;letter-spacing:-0.5px;">
          Bem-vindo ao ${BRAND.name}!
        </h1>
        
        <p style="color:${BRAND.textMuted};font-size:16px;line-height:1.7;margin:0 0 32px 0;">
          Ola <strong style="color:${BRAND.orange};">${firstName}</strong>, estamos muito felizes em te ter conosco!
        </p>
        
        <div style="background:${BRAND.bgCardLight};border-radius:16px;padding:32px;border:1px solid ${BRAND.borderColor};margin-bottom:28px;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 24px 0;line-height:1.6;">
            Para comecar a usar todos os recursos do ${BRAND.name}, confirme seu email clicando no botao abaixo:
          </p>
          ${getButtonHtml('Confirmar meu email', confirmationUrl, 'blue')}
        </div>
        
        <p style="color:${BRAND.textDark};font-size:13px;margin:0;">
          Se voce nao criou uma conta, pode ignorar este email com seguranca.
        </p>
      </td>
    </tr>
  `
  
  try {
    const { error } = await getResend().emails.send({
      from: BRAND.fromEmail,
      to: email,
      subject: `Confirme seu cadastro na ${BRAND.name}`,
      html: getEmailWrapper(content, `Confirme seu email para comecar a usar o ${BRAND.name}`),
    })
    
    if (error) {
      console.error('sendConfirmSignupEmail error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('sendConfirmSignupEmail error:', err)
    return false
  }
}

/**
 * Email de recuperacao de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'Usuario'
  
  const content = `
    <tr>
      <td class="content" style="padding:40px 32px;text-align:center;">
        ${getIconCircle('&#128274;', BRAND.orange)}
        
        <h1 style="color:${BRAND.textLight};font-size:28px;font-weight:800;margin:0 0 12px 0;letter-spacing:-0.5px;">
          Recuperar senha
        </h1>
        
        <p style="color:${BRAND.textMuted};font-size:16px;line-height:1.7;margin:0 0 32px 0;">
          Ola <strong style="color:${BRAND.orange};">${firstName}</strong>, recebemos uma solicitacao para redefinir sua senha.
        </p>
        
        <div style="background:${BRAND.bgCardLight};border-radius:16px;padding:32px;border:1px solid ${BRAND.borderColor};margin-bottom:24px;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 24px 0;line-height:1.6;">
            Clique no botao abaixo para criar uma nova senha segura:
          </p>
          ${getButtonHtml('Redefinir minha senha', resetUrl, 'orange')}
        </div>
        
        <div style="background:rgba(239,68,68,0.1);border-radius:12px;padding:16px 20px;border:1px solid rgba(239,68,68,0.2);">
          <p style="color:#fca5a5;font-size:13px;margin:0;line-height:1.5;">
            <strong>Atencao:</strong> Este link expira em 1 hora.<br/>Se voce nao solicitou, ignore este email.
          </p>
        </div>
      </td>
    </tr>
  `
  
  try {
    const { error } = await getResend().emails.send({
      from: BRAND.fromEmail,
      to: email,
      subject: `Recupere sua senha da ${BRAND.name}`,
      html: getEmailWrapper(content, 'Clique para redefinir sua senha'),
    })
    
    if (error) {
      console.error('sendPasswordResetEmail error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('sendPasswordResetEmail error:', err)
    return false
  }
}

/**
 * Email de Magic Link (login sem senha)
 */
export async function sendMagicLinkEmail(
  email: string,
  name: string,
  magicLinkUrl: string
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'Usuario'
  
  const content = `
    <tr>
      <td class="content" style="padding:40px 32px;text-align:center;">
        ${getIconCircle('&#128279;', BRAND.blue)}
        
        <h1 style="color:${BRAND.textLight};font-size:28px;font-weight:800;margin:0 0 12px 0;letter-spacing:-0.5px;">
          Seu link de acesso
        </h1>
        
        <p style="color:${BRAND.textMuted};font-size:16px;line-height:1.7;margin:0 0 32px 0;">
          Ola <strong style="color:${BRAND.orange};">${firstName}</strong>, use o botao abaixo para acessar sua conta instantaneamente.
        </p>
        
        <div style="background:${BRAND.bgCardLight};border-radius:16px;padding:32px;border:1px solid ${BRAND.borderColor};margin-bottom:24px;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 24px 0;line-height:1.6;">
            Clique para entrar sem precisar de senha:
          </p>
          ${getButtonHtml('Entrar na minha conta', magicLinkUrl, 'blue')}
        </div>
        
        <p style="color:${BRAND.textDark};font-size:13px;margin:0;">
          Este link expira em 1 hora e so pode ser usado uma vez.
        </p>
      </td>
    </tr>
  `
  
  try {
    const { error } = await getResend().emails.send({
      from: BRAND.fromEmail,
      to: email,
      subject: `Seu link de acesso ${BRAND.name}`,
      html: getEmailWrapper(content, 'Clique para acessar sua conta'),
    })
    
    if (error) {
      console.error('sendMagicLinkEmail error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('sendMagicLinkEmail error:', err)
    return false
  }
}

/**
 * Email de confirmacao de mudanca de email
 */
export async function sendEmailChangeEmail(
  newEmail: string,
  name: string,
  confirmUrl: string
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'Usuario'
  
  const content = `
    <tr>
      <td class="content" style="padding:40px 32px;text-align:center;">
        ${getIconCircle('&#9993;', BRAND.orange)}
        
        <h1 style="color:${BRAND.textLight};font-size:28px;font-weight:800;margin:0 0 12px 0;letter-spacing:-0.5px;">
          Confirme seu novo email
        </h1>
        
        <p style="color:${BRAND.textMuted};font-size:16px;line-height:1.7;margin:0 0 32px 0;">
          Ola <strong style="color:${BRAND.orange};">${firstName}</strong>, voce solicitou a alteracao do email da sua conta.
        </p>
        
        <div style="background:${BRAND.bgCardLight};border-radius:16px;padding:32px;border:1px solid ${BRAND.borderColor};margin-bottom:24px;">
          <p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 8px 0;">Novo email:</p>
          <p style="color:${BRAND.textLight};font-size:18px;font-weight:700;margin:0 0 24px 0;word-break:break-all;">
            ${newEmail}
          </p>
          ${getButtonHtml('Confirmar novo email', confirmUrl, 'orange')}
        </div>
        
        <p style="color:${BRAND.textDark};font-size:13px;margin:0;">
          Se voce nao solicitou esta alteracao, ignore este email.
        </p>
      </td>
    </tr>
  `
  
  try {
    const { error } = await getResend().emails.send({
      from: BRAND.fromEmail,
      to: newEmail,
      subject: `Confirme seu novo email na ${BRAND.name}`,
      html: getEmailWrapper(content, 'Confirme a alteracao do seu email'),
    })
    
    if (error) {
      console.error('sendEmailChangeEmail error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('sendEmailChangeEmail error:', err)
    return false
  }
}

/**
 * Email de convite para novo usuario
 */
export async function sendInviteEmail(
  email: string,
  inviterName: string,
  inviteUrl: string
): Promise<boolean> {
  const content = `
    <tr>
      <td class="content" style="padding:40px 32px;text-align:center;">
        ${getIconCircle('&#127881;', BRAND.blue)}
        
        <h1 style="color:${BRAND.textLight};font-size:28px;font-weight:800;margin:0 0 12px 0;letter-spacing:-0.5px;">
          Voce foi convidado!
        </h1>
        
        <p style="color:${BRAND.textMuted};font-size:16px;line-height:1.7;margin:0 0 32px 0;">
          <strong style="color:${BRAND.orange};">${inviterName}</strong> convidou voce para fazer parte do ${BRAND.name}!
        </p>
        
        <div style="background:${BRAND.bgCardLight};border-radius:16px;padding:32px;border:1px solid ${BRAND.borderColor};margin-bottom:28px;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 24px 0;line-height:1.6;">
            Aceite o convite e comece a usar:
          </p>
          ${getButtonHtml('Aceitar convite', inviteUrl, 'blue')}
        </div>
        
        <!-- Beneficios -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
          <tr>
            <td style="padding:12px;text-align:center;width:33%;">
              <div style="background:${BRAND.bgCardLight};border-radius:12px;padding:16px 8px;border:1px solid ${BRAND.borderColor};">
                <div style="color:${BRAND.blue};font-size:24px;margin-bottom:8px;">&#128663;</div>
                <p style="color:${BRAND.textLight};font-size:12px;font-weight:600;margin:0;">Corridas seguras</p>
              </div>
            </td>
            <td style="padding:12px;text-align:center;width:33%;">
              <div style="background:${BRAND.bgCardLight};border-radius:12px;padding:16px 8px;border:1px solid ${BRAND.borderColor};">
                <div style="color:${BRAND.orange};font-size:24px;margin-bottom:8px;">&#128176;</div>
                <p style="color:${BRAND.textLight};font-size:12px;font-weight:600;margin:0;">Precos justos</p>
              </div>
            </td>
            <td style="padding:12px;text-align:center;width:33%;">
              <div style="background:${BRAND.bgCardLight};border-radius:12px;padding:16px 8px;border:1px solid ${BRAND.borderColor};">
                <div style="color:${BRAND.blue};font-size:24px;margin-bottom:8px;">&#128222;</div>
                <p style="color:${BRAND.textLight};font-size:12px;font-weight:600;margin:0;">Suporte 24h</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
  
  try {
    const { error } = await getResend().emails.send({
      from: BRAND.fromEmail,
      to: email,
      subject: `${inviterName} convidou voce para o ${BRAND.name}!`,
      html: getEmailWrapper(content, `Voce foi convidado para o ${BRAND.name}`),
    })
    
    if (error) {
      console.error('sendInviteEmail error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('sendInviteEmail error:', err)
    return false
  }
}

/**
 * Email de boas-vindas apos confirmacao
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'Usuario'
  
  const content = `
    <tr>
      <td class="content" style="padding:40px 32px;text-align:center;">
        ${getIconCircle('&#10024;', BRAND.orange)}
        
        <h1 style="color:${BRAND.textLight};font-size:28px;font-weight:800;margin:0 0 12px 0;letter-spacing:-0.5px;">
          Bem-vindo ao ${BRAND.name}, ${firstName}!
        </h1>
        
        <p style="color:${BRAND.textMuted};font-size:16px;line-height:1.7;margin:0 0 32px 0;">
          Sua conta foi confirmada com sucesso. Agora voce pode aproveitar todas as vantagens!
        </p>
        
        <div style="background:${BRAND.bgCardLight};border-radius:16px;padding:28px;border:1px solid ${BRAND.borderColor};text-align:left;">
          <p style="color:${BRAND.orange};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 20px 0;text-align:center;">
            O que voce pode fazer
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderColor};">
                <span style="color:${BRAND.blue};font-size:18px;margin-right:14px;">&#128663;</span>
                <span style="color:${BRAND.textLight};font-size:14px;">Solicitar corridas com motoristas verificados</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderColor};">
                <span style="color:${BRAND.orange};font-size:18px;margin-right:14px;">&#128179;</span>
                <span style="color:${BRAND.textLight};font-size:14px;">Pagar com PIX, cartao ou dinheiro</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderColor};">
                <span style="color:${BRAND.blue};font-size:18px;margin-right:14px;">&#128205;</span>
                <span style="color:${BRAND.textLight};font-size:14px;">Acompanhar sua corrida em tempo real</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <span style="color:${BRAND.orange};font-size:18px;margin-right:14px;">&#127873;</span>
                <span style="color:${BRAND.textLight};font-size:14px;">Convidar amigos e ganhar descontos</span>
              </td>
            </tr>
          </table>
        </div>
        
        <p style="color:${BRAND.textDark};font-size:13px;margin:28px 0 0 0;">
          Duvidas? Estamos aqui para ajudar pelo app!
        </p>
      </td>
    </tr>
  `
  
  try {
    const { error } = await getResend().emails.send({
      from: BRAND.fromEmail,
      to: email,
      subject: `Bem-vindo ao ${BRAND.name}!`,
      html: getEmailWrapper(content, `Sua conta ${BRAND.name} esta pronta!`),
    })
    
    if (error) {
      console.error('sendWelcomeEmail error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('sendWelcomeEmail error:', err)
    return false
  }
}

export interface RideReportData {
  rideId: string
  passengerName: string
  passengerEmail: string
  driverName: string
  driverPhone?: string
  vehicleBrand: string
  vehicleModel: string
  vehiclePlate: string
  vehicleColor: string
  pickupAddress: string
  dropoffAddress: string
  distanceKm: number
  durationMinutes: number
  finalPrice: number
  paymentMethod: string
  startedAt: string
  completedAt: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    pix: 'Pix',
    credit_card: 'Cartao de Credito',
    debit_card: 'Cartao de Debito',
    cash: 'Dinheiro',
    wallet: 'Carteira Uppi',
  }
  return map[method] || method
}

export async function sendRideReportEmail(data: RideReportData): Promise<boolean> {
  try {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatorio de Corrida - Uppi</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1e293b;border-radius:16px 16px 0 0;padding:32px;text-align:center;border-bottom:1px solid #334155;">
              <div style="display:inline-block;background:#f97316;border-radius:12px;padding:12px 20px;margin-bottom:16px;">
                <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">UPPI</span>
              </div>
              <h1 style="color:#f1f5f9;font-size:20px;font-weight:700;margin:0 0 4px 0;">Corrida Concluida</h1>
              <p style="color:#94a3b8;font-size:14px;margin:0;">Relatorio completo da sua viagem</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="background:#1e293b;padding:24px 32px 0;">
              <p style="color:#e2e8f0;font-size:15px;margin:0 0 4px 0;">Ola, <strong style="color:#f97316;">${data.passengerName.split(' ')[0]}</strong>!</p>
              <p style="color:#94a3b8;font-size:14px;margin:0;">Sua corrida foi concluida com sucesso. Abaixo esta o relatorio completo.</p>
            </td>
          </tr>

          <!-- Route Card -->
          <tr>
            <td style="background:#1e293b;padding:24px 32px;">
              <div style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #334155;">
                <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px 0;">Percurso</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:24px;vertical-align:top;padding-top:2px;">
                      <div style="width:10px;height:10px;border-radius:50%;background:#22c55e;"></div>
                    </td>
                    <td style="padding-bottom:12px;">
                      <p style="color:#64748b;font-size:11px;margin:0 0 2px 0;">ORIGEM</p>
                      <p style="color:#f1f5f9;font-size:14px;font-weight:600;margin:0;">${data.pickupAddress}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="width:24px;vertical-align:top;padding-top:2px;">
                      <div style="width:10px;height:10px;border-radius:50%;background:#ef4444;"></div>
                    </td>
                    <td>
                      <p style="color:#64748b;font-size:11px;margin:0 0 2px 0;">DESTINO</p>
                      <p style="color:#f1f5f9;font-size:14px;font-weight:600;margin:0;">${data.dropoffAddress}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Stats Row -->
          <tr>
            <td style="background:#1e293b;padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:33%;padding-right:8px;">
                    <div style="background:#0f172a;border-radius:10px;padding:16px;text-align:center;border:1px solid #334155;">
                      <p style="color:#f97316;font-size:20px;font-weight:800;margin:0 0 2px 0;">${data.distanceKm.toFixed(1)} km</p>
                      <p style="color:#64748b;font-size:11px;margin:0;">Distancia</p>
                    </div>
                  </td>
                  <td style="width:33%;padding:0 4px;">
                    <div style="background:#0f172a;border-radius:10px;padding:16px;text-align:center;border:1px solid #334155;">
                      <p style="color:#f97316;font-size:20px;font-weight:800;margin:0 0 2px 0;">${formatDuration(data.durationMinutes)}</p>
                      <p style="color:#64748b;font-size:11px;margin:0;">Duracao</p>
                    </div>
                  </td>
                  <td style="width:33%;padding-left:8px;">
                    <div style="background:#0f172a;border-radius:10px;padding:16px;text-align:center;border:1px solid #334155;">
                      <p style="color:#22c55e;font-size:20px;font-weight:800;margin:0 0 2px 0;">${formatCurrency(data.finalPrice)}</p>
                      <p style="color:#64748b;font-size:11px;margin:0;">Total pago</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Driver Info -->
          <tr>
            <td style="background:#1e293b;padding:0 32px 24px;">
              <div style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #334155;">
                <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px 0;">Motorista</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:10px;">
                      <p style="color:#64748b;font-size:12px;margin:0 0 2px 0;">Nome completo</p>
                      <p style="color:#f1f5f9;font-size:15px;font-weight:700;margin:0;">${data.driverName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:50%;padding-right:8px;">
                            <p style="color:#64748b;font-size:12px;margin:0 0 2px 0;">Veiculo</p>
                            <p style="color:#f1f5f9;font-size:14px;font-weight:600;margin:0;">${data.vehicleBrand} ${data.vehicleModel}</p>
                            <p style="color:#94a3b8;font-size:12px;margin:2px 0 0 0;">${data.vehicleColor}</p>
                          </td>
                          <td style="width:50%;padding-left:8px;">
                            <p style="color:#64748b;font-size:12px;margin:0 0 4px 0;">Placa</p>
                            <div style="display:inline-block;background:#1e293b;border:2px solid #475569;border-radius:6px;padding:6px 14px;">
                              <span style="color:#f1f5f9;font-size:16px;font-weight:800;letter-spacing:3px;">${data.vehiclePlate}</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Payment Info -->
          <tr>
            <td style="background:#1e293b;padding:0 32px 24px;">
              <div style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #334155;">
                <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px 0;">Pagamento</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:8px;"><p style="color:#94a3b8;font-size:13px;margin:0;">Metodo</p></td>
                    <td style="text-align:right;padding-bottom:8px;"><p style="color:#f1f5f9;font-size:13px;font-weight:600;margin:0;">${paymentMethodLabel(data.paymentMethod)}</p></td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:8px;"><p style="color:#94a3b8;font-size:13px;margin:0;">Inicio</p></td>
                    <td style="text-align:right;padding-bottom:8px;"><p style="color:#f1f5f9;font-size:13px;margin:0;">${formatDate(data.startedAt)}</p></td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:12px;"><p style="color:#94a3b8;font-size:13px;margin:0;">Termino</p></td>
                    <td style="text-align:right;padding-bottom:12px;"><p style="color:#f1f5f9;font-size:13px;margin:0;">${formatDate(data.completedAt)}</p></td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #334155;padding-top:12px;"><p style="color:#f1f5f9;font-size:15px;font-weight:700;margin:0;">Total</p></td>
                    <td style="border-top:1px solid #334155;padding-top:12px;text-align:right;"><p style="color:#22c55e;font-size:18px;font-weight:800;margin:0;">${formatCurrency(data.finalPrice)}</p></td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Ride ID -->
          <tr>
            <td style="background:#1e293b;padding:0 32px 24px;">
              <p style="color:#475569;font-size:11px;text-align:center;margin:0;">ID da corrida: <span style="color:#64748b;font-family:monospace;">${data.rideId}</span></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#475569;font-size:12px;margin:0 0 4px 0;">Uppi - Tecnologia em mobilidade urbana</p>
              <p style="color:#334155;font-size:11px;margin:0;">Este e-mail foi enviado automaticamente. Nao responda a esta mensagem.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const { error } = await getResend().emails.send({
      from: BRAND.fromEmail,
      to: data.passengerEmail,
      subject: `Relatorio da sua corrida - ${formatCurrency(data.finalPrice)} | Uppi`,
      html,
    })

    if (error) {
      console.error('sendRideReportEmail error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('sendRideReportEmail error:', err)
    return false
  }
}
