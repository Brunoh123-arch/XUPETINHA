# UPPI - Sistema de Emails Personalizados

**Data:** 11/03/2026

## Opcao 1: Sistema via Resend (RECOMENDADO)

O projeto ja tem um sistema de emails customizados integrado via **Resend**. Os templates ficam salvos no codigo (`/lib/email.ts`) e funcionam automaticamente em qualquer conta Supabase.

### Vantagens:
- Templates salvos no codigo (nao perde ao trocar de Supabase)
- Design personalizado com a marca UPPI
- Gratuito ate 3000 emails/mes
- Facil de customizar

### Como Configurar:

1. **Crie uma conta no Resend**: https://resend.com
2. **Obtenha sua API Key** no dashboard do Resend
3. **Configure as variaveis de ambiente** na Vercel:

```env
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_FROM_EMAIL=UPPI <noreply@seudominio.com>
INTERNAL_API_KEY=sua_chave_interna_secreta
```

4. **(Opcional) Verifique seu dominio** no Resend para usar um email personalizado

### Emails Disponiveis:

| Funcao | Descricao |
|--------|-----------|
| `sendConfirmSignupEmail()` | Confirmacao de cadastro |
| `sendPasswordResetEmail()` | Recuperacao de senha |
| `sendMagicLinkEmail()` | Login sem senha |
| `sendEmailChangeEmail()` | Confirmacao de novo email |
| `sendInviteEmail()` | Convite para novos usuarios |
| `sendWelcomeEmail()` | Boas-vindas apos confirmacao |
| `sendRideReportEmail()` | Relatorio de corrida |

### API de Envio:

```bash
POST /api/email/auth
{
  "type": "password_reset",
  "email": "usuario@email.com",
  "name": "Nome do Usuario",
  "url": "https://seusite.com/reset-password?token=xxx"
}
```

### Customizar a Marca:

Edite o objeto `BRAND` em `/lib/email.ts`:

```typescript
const BRAND = {
  name: 'UPPI',
  tagline: 'Sua corrida, do seu jeito',
  blue: '#3b82f6',        // azul da logo
  orange: '#f97316',      // laranja da logo
  primaryColor: '#f97316', // laranja
  secondaryColor: '#3b82f6', // azul
  logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aea87665-c904-40c2-97ee-07cf7c0a3723-GCOI62oxS3Fr70FcCwhVmBsXuE4HMa.jpg',
  fromEmail: 'UPPI <onboarding@resend.dev>',
}
```

---

## Opcao 2: Templates no Supabase Dashboard (Alternativa)

Se preferir usar os emails nativos do Supabase, configure os templates abaixo no dashboard. **Atencao:** esses templates serao perdidos se voce trocar de projeto Supabase.

### Como Configurar:

1. Acesse o **Dashboard do Supabase**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Va em **Authentication** > **Email Templates**
4. Copie e cole os templates abaixo em cada campo

---

## 1. Confirm Signup (Confirmacao de Cadastro)

**Subject:** Confirme seu cadastro na UPPI

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu cadastro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">UPPI</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #888888;">Sua corrida, sua escolha</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Bem-vindo a UPPI!</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Estamos muito felizes em ter voce conosco. Para comecar a usar o app, confirme seu email clicando no botao abaixo:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      Confirmar Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #888888;">
                Se voce nao criou uma conta na UPPI, pode ignorar este email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888;">
                UPPI - Mobilidade Urbana
              </p>
              <p style="margin: 0; font-size: 12px; color: #888888;">
                Este email foi enviado automaticamente. Por favor, nao responda.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password (Recuperacao de Senha)

**Subject:** Recupere sua senha da UPPI

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar senha</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">UPPI</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #888888;">Sua corrida, sua escolha</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Esqueceu sua senha?</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Sem problemas! Clique no botao abaixo para criar uma nova senha. O link expira em 1 hora.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #888888;">
                Se voce nao solicitou a recuperacao de senha, pode ignorar este email. Sua conta continua segura.
              </p>
            </td>
          </tr>
          
          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8e6; border-radius: 8px; padding: 16px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; color: #b8860b;">
                      <strong>Dica de seguranca:</strong> Nunca compartilhe este link com ninguem. A equipe UPPI nunca pedira sua senha.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888;">
                UPPI - Mobilidade Urbana
              </p>
              <p style="margin: 0; font-size: 12px; color: #888888;">
                Este email foi enviado automaticamente. Por favor, nao responda.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Magic Link (Login sem Senha)

**Subject:** Seu link de acesso UPPI

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link de acesso</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">UPPI</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #888888;">Sua corrida, sua escolha</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Acesse sua conta</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Clique no botao abaixo para acessar sua conta UPPI. Este link expira em 1 hora e so pode ser usado uma vez.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      Entrar na UPPI
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #888888;">
                Se voce nao solicitou este link, pode ignorar este email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888;">
                UPPI - Mobilidade Urbana
              </p>
              <p style="margin: 0; font-size: 12px; color: #888888;">
                Este email foi enviado automaticamente. Por favor, nao responda.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Change Email Address (Alteracao de Email)

**Subject:** Confirme seu novo email na UPPI

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmar novo email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">UPPI</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #888888;">Sua corrida, sua escolha</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Confirme seu novo email</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Voce solicitou a alteracao do email da sua conta UPPI. Clique no botao abaixo para confirmar:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      Confirmar Novo Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #888888;">
                Se voce nao solicitou esta alteracao, entre em contato conosco imediatamente.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888;">
                UPPI - Mobilidade Urbana
              </p>
              <p style="margin: 0; font-size: 12px; color: #888888;">
                Este email foi enviado automaticamente. Por favor, nao responda.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Invite User (Convite de Usuario)

**Subject:** Voce foi convidado para a UPPI!

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite UPPI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">UPPI</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #888888;">Sua corrida, sua escolha</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Voce foi convidado!</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Voce recebeu um convite para fazer parte da UPPI. Clique no botao abaixo para aceitar o convite e criar sua conta:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #888888;">
                Se voce nao esperava este convite, pode ignorar este email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888;">
                UPPI - Mobilidade Urbana
              </p>
              <p style="margin: 0; font-size: 12px; color: #888888;">
                Este email foi enviado automaticamente. Por favor, nao responda.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Configuracoes Adicionais

### URL de Redirecionamento (Site URL)

No Supabase Dashboard, em **Authentication** > **URL Configuration**:

- **Site URL:** `https://seu-dominio.vercel.app`
- **Redirect URLs:** 
  - `https://seu-dominio.vercel.app/auth/callback`
  - `https://seu-dominio.vercel.app/auth/callback?type=recovery`

### Nome do Remetente

Em **Project Settings** > **Authentication**:

- **Sender name:** `UPPI`
- **Sender email:** Configure um dominio customizado se possivel

---

## Variaveis Disponiveis nos Templates

| Variavel | Descricao |
|----------|-----------|
| `{{ .ConfirmationURL }}` | Link de confirmacao |
| `{{ .Email }}` | Email do usuario |
| `{{ .Token }}` | Token de confirmacao |
| `{{ .TokenHash }}` | Hash do token |
| `{{ .SiteURL }}` | URL do site configurada |
| `{{ .RedirectTo }}` | URL de redirecionamento |

---

**Atualizado em:** 11/03/2026
