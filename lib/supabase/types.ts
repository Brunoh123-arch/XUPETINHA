/**
 * lib/supabase/types.ts
 * Re-exporta os tipos canônicos de lib/types/database.ts para evitar divergências.
 * NÃO duplicate definições aqui — use lib/types/database.ts como fonte única de verdade.
 */
export * from '@/lib/types/database'

// Aliases de conveniência (mantidos por compatibilidade retroativa)
export type { Profile as User } from '@/lib/types/database'
