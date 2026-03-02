import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Only create the client on the browser
  if (typeof window === 'undefined') {
    // Return a safe stub during SSR – actual calls happen client-side
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: 'SSR stub' } }),
        signUp: async () => ({ data: null, error: { message: 'SSR stub' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_event: any, _callback: any) => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        resetPasswordForEmail: async () => ({ data: null, error: { message: 'SSR stub' } }),
        updateUser: async () => ({ data: null, error: { message: 'SSR stub' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'SSR stub' } }),
      },
      from: (_table: string) => ({
        select: (_cols?: string) => ({
          eq: (_col: string, _val: any) => ({
            single: async () => ({ data: null, error: null }),
            order: (_col: string, _opts?: any) => ({
              limit: (_n: number) => ({ data: [], error: null }),
            }),
          }),
          order: (_col: string, _opts?: any) => ({
            limit: (_n: number) => ({ data: [], error: null }),
          }),
          single: async () => ({ data: null, error: null }),
        }),
        insert: async (_rows: any) => ({ data: null, error: null }),
        update: (_rows: any) => ({
          eq: (_col: string, _val: any) => ({ data: null, error: null }),
        }),
        delete: () => ({
          eq: (_col: string, _val: any) => ({ data: null, error: null }),
        }),
      }),
      storage: {
        from: (_bucket: string) => ({
          upload: async () => ({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      channel: (_name: string) => ({
        on: () => ({ subscribe: () => {} }),
      }),
    } as any
  }

  // Singleton on the client
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    client = createBrowserClient(url, anonKey)
  }

  return client
}
