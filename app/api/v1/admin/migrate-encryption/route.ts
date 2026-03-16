import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { encryptSensitive, isEncryptionEnabled } from '@/lib/encryption'

/**
 * POST /api/v1/admin/migrate-encryption
 * Migra dados sensíveis em texto puro para colunas criptografadas.
 * SOMENTE ADMIN pode executar esta rota.
 * 
 * Migra:
 * - profiles.cpf -> profiles.cpf_encrypted
 * - user_2fa.secret -> user_2fa.secret_encrypted
 * - webhooks.secret -> webhooks.secret_encrypted
 */
export async function POST(request: Request) {
  try {
    // Verificar CRON_SECRET ou admin auth
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Verificar se é admin autenticado
      const supabase = createAdminClient()
      const { data: { user }, error } = await supabase.auth.getUser(
        request.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    if (!isEncryptionEnabled()) {
      return NextResponse.json({ error: 'ENCRYPTION_KEY not configured' }, { status: 500 })
    }

    const supabase = createAdminClient()
    const results = {
      profiles: { total: 0, migrated: 0, errors: 0 },
      user_2fa: { total: 0, migrated: 0, errors: 0 },
      webhooks: { total: 0, migrated: 0, errors: 0 },
    }

    // 1. Migrar profiles.cpf
    const { data: profilesWithCpf } = await supabase
      .from('profiles')
      .select('id, cpf')
      .not('cpf', 'is', null)
      .is('cpf_encrypted', null)
      .limit(500)

    results.profiles.total = profilesWithCpf?.length || 0

    for (const profile of profilesWithCpf || []) {
      try {
        const encrypted = await encryptSensitive(profile.cpf)
        if (encrypted) {
          await supabase
            .from('profiles')
            .update({
              cpf_encrypted: encrypted,
              cpf: null, // Limpar texto puro após migrar
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)
          results.profiles.migrated++
        } else {
          results.profiles.errors++
        }
      } catch {
        results.profiles.errors++
      }
    }

    // 2. Migrar user_2fa.secret
    const { data: tfaRecords } = await supabase
      .from('user_2fa')
      .select('id, secret')
      .not('secret', 'is', null)
      .is('secret_encrypted', null)
      .limit(500)

    results.user_2fa.total = tfaRecords?.length || 0

    for (const tfa of tfaRecords || []) {
      try {
        const encrypted = await encryptSensitive(tfa.secret)
        if (encrypted) {
          await supabase
            .from('user_2fa')
            .update({
              secret_encrypted: encrypted,
              secret: null,
            })
            .eq('id', tfa.id)
          results.user_2fa.migrated++
        } else {
          results.user_2fa.errors++
        }
      } catch {
        results.user_2fa.errors++
      }
    }

    // 3. Migrar webhooks.secret
    const { data: webhookRecords } = await supabase
      .from('webhooks')
      .select('id, secret')
      .not('secret', 'is', null)
      .is('secret_encrypted', null)
      .limit(500)

    results.webhooks.total = webhookRecords?.length || 0

    for (const webhook of webhookRecords || []) {
      try {
        const encrypted = await encryptSensitive(webhook.secret)
        if (encrypted) {
          await supabase
            .from('webhooks')
            .update({
              secret_encrypted: encrypted,
              secret: null,
            })
            .eq('id', webhook.id)
          results.webhooks.migrated++
        } else {
          results.webhooks.errors++
        }
      } catch {
        results.webhooks.errors++
      }
    }

    const totalMigrated = results.profiles.migrated + results.user_2fa.migrated + results.webhooks.migrated
    const totalErrors = results.profiles.errors + results.user_2fa.errors + results.webhooks.errors
    const hasMore = 
      results.profiles.total === 500 || 
      results.user_2fa.total === 500 || 
      results.webhooks.total === 500

    return NextResponse.json({
      success: true,
      message: hasMore 
        ? `Migrated ${totalMigrated} records. Run again to continue (batch limit 500).`
        : `Migration complete. ${totalMigrated} records migrated.`,
      results,
      has_more: hasMore,
      total_migrated: totalMigrated,
      total_errors: totalErrors,
    })
  } catch (err: any) {
    console.error('[migrate-encryption] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/v1/admin/migrate-encryption
 * Verifica status da migração de criptografia.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Contar registros pendentes de migração
    const { count: profilesPending } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .not('cpf', 'is', null)
      .is('cpf_encrypted', null)

    const { count: tfaPending } = await supabase
      .from('user_2fa')
      .select('id', { count: 'exact', head: true })
      .not('secret', 'is', null)
      .is('secret_encrypted', null)

    const { count: webhooksPending } = await supabase
      .from('webhooks')
      .select('id', { count: 'exact', head: true })
      .not('secret', 'is', null)
      .is('secret_encrypted', null)

    const totalPending = (profilesPending || 0) + (tfaPending || 0) + (webhooksPending || 0)

    return NextResponse.json({
      encryption_enabled: isEncryptionEnabled(),
      pending_migration: {
        profiles: profilesPending || 0,
        user_2fa: tfaPending || 0,
        webhooks: webhooksPending || 0,
        total: totalPending,
      },
      migration_complete: totalPending === 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
