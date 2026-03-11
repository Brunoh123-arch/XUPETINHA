import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// ============================================
// CONFIGURACAO DA MARCA
// ============================================
const BRAND = {
  name: 'UPPI',
  tagline: 'Sua corrida, do seu jeito',
  primaryColor: '#f97316', // orange-500
  secondaryColor: '#22c55e', // green-500
  bgDark: '#0f172a', // slate-900
  bgCard: '#1e293b', // slate-800
  textLight: '#f1f5f9', // slate-100
  textMuted: '#94a3b8', // slate-400
  borderColor: '#334155', // slate-700
  fromEmail: process.env.RESEND_FROM_EMAIL || 'UPPI <noreply@resend.dev>',
}

// ============================================
// TEMPLATE BASE
// ============================================
function getEmailWrapper(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND.name}</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#0f172a;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background:${BRAND.bgDark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bgDark};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND.bgCard};border-radius:16px 16px 0 0;padding:32px;text-align:center;border-bottom:1px solid ${BRAND.borderColor};">
              <div style="display:inline-block;background:${BRAND.primaryColor};border-radius:12px;padding:12px 24px;margin-bottom:8px;">
                <span style="color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${BRAND.name}</span>
              </div>
              <p style="color:${BRAND.textMuted};font-size:13px;margin:8px 0 0 0;">${BRAND.tagline}</p>
            </td>
          </tr>
          
          <!-- Content -->
          ${content}
          
          <!-- Footer -->
          <tr>
            <td style="background:${BRAND.bgDark};border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;border-top:1px solid ${BRAND.bgCard};">
              <p style="color:#475569;font-size:12px;margin:0 0 4px 0;">${BRAND.name} - Tecnologia em mobilidade urbana</p>
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
}

function getButtonHtml(text: string, url: string, color: string = BRAND.primaryColor): string {
  return `
    <a href="${url}" style="display:inline-block;background:${color};color:#fff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;margin:8px 0;">
      ${text}
    </a>
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
      <td style="background:${BRAND.bgCard};padding:32px;">
        <h1 style="color:${BRAND.textLight};font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;">
          Bem-vindo a ${BRAND.name}!
        </h1>
        <p style="color:${BRAND.textMuted};font-size:15px;line-height:1.6;margin:0 0 24px 0;text-align:center;">
          Ola <strong style="color:${BRAND.primaryColor};">${firstName}</strong>, estamos felizes em te ter conosco!
        </p>
        
        <div style="background:${BRAND.bgDark};border-radius:12px;padding:24px;border:1px solid ${BRAND.borderColor};text-align:center;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 20px 0;">
            Para comecar a usar o ${BRAND.name}, confirme seu email clicando no botao abaixo:
          </p>
          ${getButtonHtml('Confirmar meu email', confirmationUrl, BRAND.secondaryColor)}
        </div>
        
        <p style="color:#64748b;font-size:13px;margin:24px 0 0 0;text-align:center;">
          Se voce nao criou uma conta no ${BRAND.name}, ignore este email.
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
      <td style="background:${BRAND.bgCard};padding:32px;">
        <h1 style="color:${BRAND.textLight};font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;">
          Recuperar senha
        </h1>
        <p style="color:${BRAND.textMuted};font-size:15px;line-height:1.6;margin:0 0 24px 0;text-align:center;">
          Ola <strong style="color:${BRAND.primaryColor};">${firstName}</strong>, recebemos uma solicitacao para redefinir sua senha.
        </p>
        
        <div style="background:${BRAND.bgDark};border-radius:12px;padding:24px;border:1px solid ${BRAND.borderColor};text-align:center;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 20px 0;">
            Clique no botao abaixo para criar uma nova senha:
          </p>
          ${getButtonHtml('Redefinir minha senha', resetUrl)}
        </div>
        
        <div style="background:#7f1d1d;border-radius:8px;padding:16px;margin-top:24px;border:1px solid #991b1b;">
          <p style="color:#fecaca;font-size:13px;margin:0;text-align:center;">
            <strong>Atencao:</strong> Este link expira em 1 hora. Se voce nao solicitou a recuperacao de senha, ignore este email.
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
      <td style="background:${BRAND.bgCard};padding:32px;">
        <h1 style="color:${BRAND.textLight};font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;">
          Seu link de acesso
        </h1>
        <p style="color:${BRAND.textMuted};font-size:15px;line-height:1.6;margin:0 0 24px 0;text-align:center;">
          Ola <strong style="color:${BRAND.primaryColor};">${firstName}</strong>, use o botao abaixo para acessar sua conta.
        </p>
        
        <div style="background:${BRAND.bgDark};border-radius:12px;padding:24px;border:1px solid ${BRAND.borderColor};text-align:center;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 20px 0;">
            Clique para entrar instantaneamente:
          </p>
          ${getButtonHtml('Entrar na minha conta', magicLinkUrl, BRAND.secondaryColor)}
        </div>
        
        <p style="color:#64748b;font-size:13px;margin:24px 0 0 0;text-align:center;">
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
      <td style="background:${BRAND.bgCard};padding:32px;">
        <h1 style="color:${BRAND.textLight};font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;">
          Confirme seu novo email
        </h1>
        <p style="color:${BRAND.textMuted};font-size:15px;line-height:1.6;margin:0 0 24px 0;text-align:center;">
          Ola <strong style="color:${BRAND.primaryColor};">${firstName}</strong>, voce solicitou a alteracao do email da sua conta ${BRAND.name}.
        </p>
        
        <div style="background:${BRAND.bgDark};border-radius:12px;padding:24px;border:1px solid ${BRAND.borderColor};text-align:center;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 8px 0;">
            Novo email:
          </p>
          <p style="color:${BRAND.primaryColor};font-size:16px;font-weight:700;margin:0 0 20px 0;">
            ${newEmail}
          </p>
          ${getButtonHtml('Confirmar novo email', confirmUrl)}
        </div>
        
        <p style="color:#64748b;font-size:13px;margin:24px 0 0 0;text-align:center;">
          Se voce nao solicitou esta alteracao, ignore este email ou entre em contato conosco.
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
      <td style="background:${BRAND.bgCard};padding:32px;">
        <h1 style="color:${BRAND.textLight};font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;">
          Voce foi convidado!
        </h1>
        <p style="color:${BRAND.textMuted};font-size:15px;line-height:1.6;margin:0 0 24px 0;text-align:center;">
          <strong style="color:${BRAND.primaryColor};">${inviterName}</strong> convidou voce para fazer parte do ${BRAND.name}!
        </p>
        
        <div style="background:${BRAND.bgDark};border-radius:12px;padding:24px;border:1px solid ${BRAND.borderColor};text-align:center;">
          <p style="color:${BRAND.textLight};font-size:15px;margin:0 0 20px 0;">
            Aceite o convite e crie sua conta:
          </p>
          ${getButtonHtml('Aceitar convite', inviteUrl, BRAND.secondaryColor)}
        </div>
        
        <div style="margin-top:24px;text-align:center;">
          <p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 8px 0;">Por que usar o ${BRAND.name}?</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px;text-align:center;">
                <span style="color:${BRAND.secondaryColor};font-size:20px;">&#10003;</span>
                <p style="color:${BRAND.textLight};font-size:13px;margin:4px 0 0 0;">Corridas seguras</p>
              </td>
              <td style="padding:8px;text-align:center;">
                <span style="color:${BRAND.secondaryColor};font-size:20px;">&#10003;</span>
                <p style="color:${BRAND.textLight};font-size:13px;margin:4px 0 0 0;">Precos justos</p>
              </td>
              <td style="padding:8px;text-align:center;">
                <span style="color:${BRAND.secondaryColor};font-size:20px;">&#10003;</span>
                <p style="color:${BRAND.textLight};font-size:13px;margin:4px 0 0 0;">Suporte 24h</p>
              </td>
            </tr>
          </table>
        </div>
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
      <td style="background:${BRAND.bgCard};padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:48px;">&#127881;</span>
        </div>
        <h1 style="color:${BRAND.textLight};font-size:24px;font-weight:700;margin:0 0 8px 0;text-align:center;">
          Bem-vindo ao ${BRAND.name}, ${firstName}!
        </h1>
        <p style="color:${BRAND.textMuted};font-size:15px;line-height:1.6;margin:0 0 24px 0;text-align:center;">
          Sua conta foi confirmada com sucesso. Agora voce pode aproveitar todas as vantagens do ${BRAND.name}!
        </p>
        
        <div style="background:${BRAND.bgDark};border-radius:12px;padding:24px;border:1px solid ${BRAND.borderColor};">
          <p style="color:${BRAND.primaryColor};font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px 0;">
            O que voce pode fazer agora:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;">
                <span style="color:${BRAND.secondaryColor};font-size:16px;margin-right:12px;">&#10003;</span>
                <span style="color:${BRAND.textLight};font-size:14px;">Solicitar corridas com motoristas verificados</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:${BRAND.secondaryColor};font-size:16px;margin-right:12px;">&#10003;</span>
                <span style="color:${BRAND.textLight};font-size:14px;">Pagar com PIX, cartao ou dinheiro</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:${BRAND.secondaryColor};font-size:16px;margin-right:12px;">&#10003;</span>
                <span style="color:${BRAND.textLight};font-size:14px;">Acompanhar sua corrida em tempo real</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:${BRAND.secondaryColor};font-size:16px;margin-right:12px;">&#10003;</span>
                <span style="color:${BRAND.textLight};font-size:14px;">Convidar amigos e ganhar descontos</span>
              </td>
            </tr>
          </table>
        </div>
        
        <p style="color:${BRAND.textMuted};font-size:13px;margin:24px 0 0 0;text-align:center;">
          Duvidas? Estamos aqui para ajudar! Entre em contato pelo app.
        </p>
      </td>
    </tr>
  `
  
  try {
    const { error } = await getResend().emails.send({
      from: BRAND.fromEmail,
      to: email,
      subject: `Bem-vindo ao ${BRAND.name}! &#127881;`,
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
      from: 'Uppi <noreply@uppi.app>',
      to: data.passengerEmail,
      subject: `Relatorio da sua corrida - ${formatCurrency(data.finalPrice)} | Uppi`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('sendRideReportEmail error:', err)
    return false
  }
}
