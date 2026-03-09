// @ts-nocheck
// Supabase Edge Function: send-push-notification
// FCM HTTP v1 API com Service Account JWT (compativel com Play Store)
//
// Variaveis de ambiente necessarias (Supabase Dashboard > Settings > Edge Functions > Secrets):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   FIREBASE_SERVICE_ACCOUNT_JSON  — conteudo do arquivo JSON gerado no Firebase Console

import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SA_JSON          = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON')

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const FCM_SCOPE        = 'https://www.googleapis.com/auth/firebase.messaging'

// Cache do access token (evita chamadas repetidas ao Google)
let cachedAccessToken: { value: string; expiresAt: number } | null = null

// ---------------------------------------------------------------
// JWT RS256 para o Google OAuth2
// ---------------------------------------------------------------
function base64url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function strToBase64url(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const binary = atob(b64)
  const bytes  = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function getAccessToken(): Promise<string> {
  // Retorna token cacheado se ainda valido (margem 5 min)
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedAccessToken.value
  }

  if (!SA_JSON) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON nao configurada')

  const sa    = JSON.parse(SA_JSON)
  const now   = Math.floor(Date.now() / 1000)
  const header  = base64url({ alg: 'RS256', typ: 'JWT' })
  const payload = base64url({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
    scope: FCM_SCOPE,
  })

  const signingInput = `${header}.${payload}`
  const keyData = pemToArrayBuffer(sa.private_key)

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const jwt = `${signingInput}.${strToBase64url(String.fromCharCode(...new Uint8Array(signature)))}`

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  })

  if (!res.ok) throw new Error(`Falha ao obter access token: ${await res.text()}`)

  const { access_token, expires_in } = await res.json()
  cachedAccessToken = { value: access_token, expiresAt: Date.now() + (expires_in ?? 3600) * 1000 }
  return access_token
}

// ---------------------------------------------------------------
// Envia FCM HTTP v1 para um unico token
// ---------------------------------------------------------------
async function sendOne(
  accessToken:  string,
  projectId:    string,
  token:        string,
  title:        string,
  body:         string,
  data:         Record<string, string>
): Promise<{ success: boolean; expired: boolean }> {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          android: {
            priority: 'HIGH',
            notification: {
              sound:      'default',
              channel_id: 'uppi_rides',
              click_action: 'MAIN_ACTIVITY',
            },
          },
          data: { ...data, title, body },
        },
      }),
    }
  )

  if (res.ok) return { success: true, expired: false }

  const err    = await res.json().catch(() => ({}))
  const status = err?.error?.status ?? ''
  const expired = ['INVALID_ARGUMENT', 'UNREGISTERED'].includes(status)
    || res.status === 400
    || res.status === 404

  return { success: false, expired }
}

// ---------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------
serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  if (!SA_JSON) {
    return new Response(
      JSON.stringify({ error: 'FIREBASE_SERVICE_ACCOUNT_JSON nao configurada' }),
      { status: 500 }
    )
  }

  let payload: {
    user_id?:  string
    user_ids?: string[]
    title:     string
    body?:     string
    data?:     Record<string, string>
  }

  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON invalido' }), { status: 400 })
  }

  const { title, body: msgBody = '', data = {} } = payload
  const userIds: string[] = payload.user_ids
    ?? (payload.user_id ? [payload.user_id] : [])

  if (!title || userIds.length === 0) {
    return new Response(
      JSON.stringify({ error: 'title e user_id sao obrigatorios' }),
      { status: 400 }
    )
  }

  const supabase   = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const sa         = JSON.parse(SA_JSON)
  const projectId  = sa.project_id

  // Busca tokens FCM ativos dos usuarios
  const { data: fcmRows } = await supabase
    .from('fcm_tokens')
    .select('token, user_id')
    .in('user_id', userIds)
    .eq('is_active', true)

  const allTokens = (fcmRows ?? []).map((r) => r.token)

  if (allTokens.length === 0) {
    return new Response(
      JSON.stringify({ success: true, fcm: { sent: 0, failed: 0 }, tokens: 0 }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const dataStr      = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
  const accessToken  = await getAccessToken()

  let sent    = 0
  let failed  = 0
  const expiredTokens: string[] = []

  // Envia em chunks de 100 paralelos (FCM v1 = 1 request por token)
  const CHUNK = 100
  for (let i = 0; i < allTokens.length; i += CHUNK) {
    const chunk   = allTokens.slice(i, i + CHUNK)
    const results = await Promise.all(
      chunk.map((token) => sendOne(accessToken, projectId, token, title, msgBody, dataStr))
    )
    for (let j = 0; j < results.length; j++) {
      if (results[j].success) {
        sent++
      } else {
        failed++
        if (results[j].expired) expiredTokens.push(chunk[j])
      }
    }
  }

  // Desativa tokens invalidos/expirados
  if (expiredTokens.length > 0) {
    await supabase
      .from('fcm_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in('token', expiredTokens)
  }

  // Registra log para cada usuario
  for (const uid of userIds) {
    await supabase.from('push_log').insert({
      user_id: uid,
      title,
      body:    msgBody,
      channel: 'fcm_v1',
      status:  sent > 0 ? 'sent' : allTokens.length === 0 ? 'skipped' : 'failed',
    })
  }

  return new Response(
    JSON.stringify({
      success: true,
      fcm:     { sent, failed, expired_cleaned: expiredTokens.length },
      tokens:  allTokens.length,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
