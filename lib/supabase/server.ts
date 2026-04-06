/**
 * Camada de compatibilidade server-side — redireciona para Firebase Admin.
 * Todos os arquivos que faziam `import { createClient } from "@/lib/supabase/server"`
 * agora usam Firebase Admin automaticamente.
 */
import { createFirestoreClient } from "@/lib/firebase/firestore"
import { cookies } from "next/headers"

export async function createClient() {
  const client = createFirestoreClient()

  // Tenta extrair o userId do cookie de sessao Firebase
  let userId: string | null = null
  let userEmail: string | null = null

  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("firebase-session")
    if (sessionCookie?.value) {
      const parsed = JSON.parse(sessionCookie.value)
      userId = parsed.uid ?? null
      userEmail = parsed.email ?? null
    }
  } catch {
    // Sem cookie de sessao
  }

  return {
    ...client,
    auth: {
      async getUser() {
        if (!userId) return { data: { user: null }, error: null }
        return {
          data: {
            user: {
              id: userId,
              email: userEmail,
              user_metadata: {},
            },
          },
          error: null,
        }
      },
      async getSession() {
        if (!userId) return { data: { session: null }, error: null }
        return {
          data: {
            session: {
              user: { id: userId, email: userEmail },
            },
          },
          error: null,
        }
      },
      admin: {
        async createUser(data: { email: string; password: string; email_confirm?: boolean; user_metadata?: Record<string, unknown> }) {
          try {
            const { adminAuth } = await import("@/lib/firebase/admin")
            const user = await adminAuth.createUser({
              email: data.email,
              password: data.password,
              emailVerified: data.email_confirm ?? true,
              displayName: (data.user_metadata?.full_name as string) ?? undefined,
            })
            return { data: { user: { id: user.uid, email: user.email } }, error: null }
          } catch (err: unknown) {
            return { data: null, error: { message: (err as Error).message } }
          }
        },
        async updateUser(uid: string, data: Record<string, unknown>) {
          try {
            const { adminAuth } = await import("@/lib/firebase/admin")
            await adminAuth.updateUser(uid, {
              emailVerified: (data.email_confirm as boolean) ?? undefined,
            })
            return { error: null }
          } catch (err: unknown) {
            return { error: { message: (err as Error).message } }
          }
        },
      },
    },
  }
}
