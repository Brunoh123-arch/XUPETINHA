/**
 * Firebase Admin — FCM HTTP v1 API
 *
 * Gera um OAuth2 access token via JWT assinado com a Service Account,
 * sem depender do pacote firebase-admin (incompativel com Edge Runtime).
 *
 * Variavel de ambiente necessaria:
 *   FIREBASE_SERVICE_ACCOUNT_JSON  — conteudo JSON da chave de servico do Firebase
 *
 * Fluxo:
 *  1. Parse do JSON da service account
 *  2. Gera JWT (RS256) assinado com a private_key da service account
 *  3. Troca o JWT por um access_token OAuth2 do Google
 *  4. Usa o access_token para autenticar chamadas a FCM HTTP v1 API
 */

const FCM_ENDPOINT = 'https://fcm.googleapis.com/v1/projects'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'

interface ServiceAccount {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
}

interface FcmMessage {
  token: string
  notification?: { title: string; body: string }
  android?: {
    priority?: 'NORMAL' | 'HIGH'
    notification?: {
      sound?: string
      click_action?: string
      channel_id?: string
    }
  }
  data?: Record<string, string>
}

interface FcmBatchResult {
  sent: number
  failed: number
  expiredTokens: string[]
}

// Cache do access token para evitar chamadas excessivas ao Google
let cachedToken: { value: string; expiresAt: number } | null = null

/**
 * Converte uma string base64 para ArrayBuffer (compativel com Web Crypto API)
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Remove cabecalho PEM se presente
  const b64 = base64
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Codifica objeto para base64url (sem padding)
 */
function base64url(obj: object): string {
  const json = JSON.stringify(obj)
  return btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Codifica string para base64url (sem padding)
 */
function strToBase64url(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Gera um JWT RS256 assinado com a private_key da service account
 */
async function createJwt(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const header = base64url({ alg: 'RS256', typ: 'JWT' })
  const payload = base64url({
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
    scope: FCM_SCOPE,
  })

  const signingInput = `${header}.${payload}`

  const keyData = base64ToArrayBuffer(serviceAccount.private_key)

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signingInput)
  )

  const sigBase64url = strToBase64url(
    String.fromCharCode(...new Uint8Array(signature))
  )

  return `${signingInput}.${sigBase64url}`
}

/**
 * Obtem (ou renova) o OAuth2 access token para a FCM API
 */
export async function getFcmAccessToken(): Promise<string> {
  // Retorna token cacheado se ainda valido (margem de 5 min)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.value
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON nao configurada')

  const serviceAccount: ServiceAccount = JSON.parse(raw)

  const jwt = await createJwt(serviceAccount)

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Falha ao obter FCM access token: ${err}`)
  }

  const { access_token, expires_in } = await res.json()

  cachedToken = {
    value: access_token,
    expiresAt: Date.now() + (expires_in ?? 3600) * 1000,
  }

  return access_token
}

/**
 * Envia uma mensagem FCM para um unico token via HTTP v1 API
 */
async function sendFcmV1(
  accessToken: string,
  projectId: string,
  message: FcmMessage
): Promise<{ success: boolean; expired: boolean }> {
  const res = await fetch(`${FCM_ENDPOINT}/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message }),
  })

  if (res.ok) return { success: true, expired: false }

  const body = await res.json().catch(() => ({}))
  const status = body?.error?.status ?? ''

  // Token invalido ou expirado
  const expired =
    status === 'INVALID_ARGUMENT' ||
    status === 'UNREGISTERED' ||
    res.status === 400 ||
    res.status === 404

  return { success: false, expired }
}

/**
 * Envia FCM para uma lista de tokens (em paralelo, ate 100 por vez)
 *
 * A FCM HTTP v1 nao suporta multicast — cada token e um request separado.
 * Enviamos em chunks de 100 requests paralelos para velocidade.
 */
export async function sendFcmToTokens(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<FcmBatchResult> {
  if (tokens.length === 0) return { sent: 0, failed: 0, expiredTokens: [] }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON nao configurada')

  const { project_id }: ServiceAccount = JSON.parse(raw)
  const accessToken = await getFcmAccessToken()

  let sent = 0
  let failed = 0
  const expiredTokens: string[] = []

  // Processa em chunks de 100 paralelos
  const CHUNK = 100
  for (let i = 0; i < tokens.length; i += CHUNK) {
    const chunk = tokens.slice(i, i + CHUNK)

    const results = await Promise.all(
      chunk.map((token) =>
        sendFcmV1(accessToken, project_id, {
          token,
          notification: { title, body },
          android: {
            priority: 'HIGH',
            notification: {
              sound: 'default',
              channel_id: 'uppi_default',
            },
          },
          data: { ...data, title, body },
        })
      )
    )

    for (let j = 0; j < results.length; j++) {
      if (results[j].success) {
        sent++
      } else {
        failed++
        if (results[j].expired) {
          expiredTokens.push(chunk[j])
        }
      }
    }
  }

  return { sent, failed, expiredTokens }
}
