import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // During SSR or when env vars are not yet available, return a no-op client
    // The actual client will be created on the client side
    if (typeof window === 'undefined') {
      // Server-side: return a minimal stub to avoid crashing
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithPassword: async () => ({ data: null, error: { message: 'Client not ready' } }),
          signUp: async () => ({ data: null, error: { message: 'Client not ready' } }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          resetPasswordForEmail: async () => ({ data: null, error: { message: 'Client not ready' } }),
          updateUser: async () => ({ data: null, error: { message: 'Client not ready' } }),
          signInWithOAuth: async () => ({ data: null, error: { message: 'Client not ready' } }),
        },
        from: () => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
          insert: async () => ({ data: null, error: null }),
          update: async () => ({ data: null, error: null }),
          delete: async () => ({ data: null, error: null }),
        }),
      } as any
    }
    throw new Error('@supabase/ssr: Your project\'s URL and API key are required to create a Supabase client!')
  }

  return createBrowserClient(url, anonKey)
}
