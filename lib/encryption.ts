/**
 * Encryption helper para dados sensíveis (CPF, 2FA secret, webhook secret)
 * Usa pgcrypto no banco de dados para criptografia AES-256
 */

import { createAdminClient } from '@/lib/supabase/admin'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  console.warn('[encryption] ENCRYPTION_KEY não configurada - criptografia desabilitada')
}

/**
 * Criptografa um texto usando pgcrypto (AES-256) no banco
 * @param plainText Texto a ser criptografado
 * @returns Dados criptografados em base64 ou null se falhar
 */
export async function encryptSensitive(plainText: string): Promise<string | null> {
  if (!plainText || !ENCRYPTION_KEY) return null

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('encrypt_sensitive', {
      plain_text: plainText,
      encryption_key: ENCRYPTION_KEY,
    })

    if (error) {
      console.error('[encryption] Erro ao criptografar:', error.message)
      return null
    }

    // pgcrypto retorna bytea, convertemos para base64 para storage
    return data ? Buffer.from(data, 'hex').toString('base64') : null
  } catch (err) {
    console.error('[encryption] Erro ao criptografar:', err)
    return null
  }
}

/**
 * Descriptografa dados usando pgcrypto no banco
 * @param encryptedBase64 Dados criptografados em base64
 * @returns Texto original ou null se falhar
 */
export async function decryptSensitive(encryptedBase64: string): Promise<string | null> {
  if (!encryptedBase64 || !ENCRYPTION_KEY) return null

  try {
    const supabase = createAdminClient()

    // Converter base64 de volta para bytea (hex)
    const hexData = Buffer.from(encryptedBase64, 'base64').toString('hex')

    const { data, error } = await supabase.rpc('decrypt_sensitive', {
      encrypted_data: `\\x${hexData}`,
      encryption_key: ENCRYPTION_KEY,
    })

    if (error) {
      console.error('[encryption] Erro ao descriptografar:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('[encryption] Erro ao descriptografar:', err)
    return null
  }
}

/**
 * Busca CPF descriptografado do perfil do usuário
 * @param supabase Cliente Supabase (já autenticado)
 * @param userId ID do usuário
 * @returns CPF descriptografado ou null
 */
export async function getDecryptedCpf(userId: string): Promise<string | null> {
  try {
    const supabase = createAdminClient()

    // Primeiro tenta a coluna criptografada
    const { data: profile } = await supabase
      .from('profiles')
      .select('cpf_encrypted, cpf')
      .eq('id', userId)
      .single()

    if (!profile) return null

    // Se tem cpf_encrypted, descriptografa
    if (profile.cpf_encrypted) {
      const decrypted = await decryptSensitive(profile.cpf_encrypted)
      if (decrypted) return decrypted
    }

    // Fallback para cpf em texto puro (dados legados)
    return profile.cpf || null
  } catch (err) {
    console.error('[encryption] Erro ao buscar CPF:', err)
    return null
  }
}

/**
 * Atualiza CPF do perfil de forma criptografada
 * @param userId ID do usuário
 * @param cpf CPF em texto puro
 * @returns true se sucesso
 */
export async function updateEncryptedCpf(userId: string, cpf: string): Promise<boolean> {
  try {
    const encrypted = await encryptSensitive(cpf)
    if (!encrypted) return false

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        cpf_encrypted: encrypted,
        cpf: null, // Limpa o CPF em texto puro após migrar
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('[encryption] Erro ao atualizar CPF:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('[encryption] Erro ao atualizar CPF:', err)
    return false
  }
}

/**
 * Verifica se a ENCRYPTION_KEY está configurada
 */
export function isEncryptionEnabled(): boolean {
  return !!ENCRYPTION_KEY
}
