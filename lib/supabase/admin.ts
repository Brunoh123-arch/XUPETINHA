/**
 * Admin client — camada de compatibilidade Firebase.
 * Redireciona para Firebase Admin SDK + Firestore client de compatibilidade.
 */
import { createFirestoreClient } from "@/lib/firebase/firestore"

export function createAdminClient() {
  const client = createFirestoreClient()

  return {
    ...client,
    auth: {
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
