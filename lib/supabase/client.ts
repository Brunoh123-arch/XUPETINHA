/**
 * Camada de compatibilidade — redireciona createClient() para Firebase/Firestore.
 * Todos os arquivos que faziam `import { createClient } from "@/lib/supabase/client"`
 * agora usam Firebase automaticamente sem precisar ser reescritos.
 */
import { createFirestoreClient } from "@/lib/firebase/firestore"
import { auth } from "@/lib/firebase/config"

export function createClient() {
  const client = createFirestoreClient()

  // Sobrescreve auth para usar Firebase Auth
  return {
    ...client,
    auth: {
      async getUser() {
        const user = auth.currentUser
        if (!user) return { data: { user: null }, error: null }
        return {
          data: {
            user: {
              id: user.uid,
              email: user.email,
              user_metadata: {
                full_name: user.displayName,
                avatar_url: user.photoURL,
              },
            },
          },
          error: null,
        }
      },
      async getSession() {
        const user = auth.currentUser
        if (!user) return { data: { session: null }, error: null }
        return {
          data: {
            session: {
              user: {
                id: user.uid,
                email: user.email,
              },
            },
          },
          error: null,
        }
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        try {
          const { signInWithEmailAndPassword } = await import("firebase/auth")
          const result = await signInWithEmailAndPassword(auth, email, password)
          return {
            data: {
              user: { id: result.user.uid, email: result.user.email },
              session: { user: { id: result.user.uid } },
            },
            error: null,
          }
        } catch (err: unknown) {
          return { data: { user: null, session: null }, error: { message: (err as Error).message } }
        }
      },
      async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, unknown>; emailRedirectTo?: string } }) {
        try {
          const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
          const result = await createUserWithEmailAndPassword(auth, email, password)

          const fullName = options?.data?.full_name as string
          if (fullName) {
            await updateProfile(result.user, { displayName: fullName })
          }

          // Cria perfil no Firestore
          const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")
          const { db } = await import("@/lib/firebase/config")
          const userType = (options?.data?.role as string) === "driver" ? "driver" : "passenger"

          await setDoc(doc(db, "profiles", result.user.uid), {
            email,
            full_name: fullName ?? null,
            avatar_url: null,
            phone: (options?.data?.phone as string) ?? null,
            user_type: userType,
            trust_score: 100,
            trust_level: "gold",
            referral_code: result.user.uid.slice(0, 8).toUpperCase(),
            is_verified: false,
            is_active: true,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          })

          return {
            data: {
              user: { id: result.user.uid, email: result.user.email },
              session: { user: { id: result.user.uid } },
            },
            error: null,
          }
        } catch (err: unknown) {
          return { data: { user: null, session: null }, error: { message: (err as Error).message } }
        }
      },
      async signOut() {
        const { signOut } = await import("firebase/auth")
        await signOut(auth)
        return { error: null }
      },
      async resetPasswordForEmail(email: string) {
        try {
          const { sendPasswordResetEmail } = await import("firebase/auth")
          await sendPasswordResetEmail(auth, email)
          return { error: null }
        } catch (err: unknown) {
          return { error: { message: (err as Error).message } }
        }
      },
      async updateUser(data: { password?: string; data?: Record<string, unknown> }) {
        try {
          const user = auth.currentUser
          if (!user) return { error: { message: "Nao autenticado" } }
          if (data.password) {
            const { updatePassword } = await import("firebase/auth")
            await updatePassword(user, data.password)
          }
          if (data.data) {
            const { updateProfile } = await import("firebase/auth")
            await updateProfile(user, {
              displayName: (data.data.full_name as string) ?? user.displayName,
            })
          }
          return { data: { user: { id: user.uid } }, error: null }
        } catch (err: unknown) {
          return { data: null, error: { message: (err as Error).message } }
        }
      },
      async signInWithOAuth({ provider, options }: { provider: string; options?: { redirectTo?: string } }) {
        try {
          if (provider === "google") {
            const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth")
            const googleProvider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, googleProvider)

            // Cria perfil se nao existe
            const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore")
            const { db } = await import("@/lib/firebase/config")
            const snap = await getDoc(doc(db, "profiles", result.user.uid))
            if (!snap.exists()) {
              await setDoc(doc(db, "profiles", result.user.uid), {
                email: result.user.email,
                full_name: result.user.displayName ?? null,
                avatar_url: result.user.photoURL ?? null,
                phone: result.user.phoneNumber ?? null,
                user_type: "passenger",
                trust_score: 100,
                trust_level: "gold",
                referral_code: result.user.uid.slice(0, 8).toUpperCase(),
                is_verified: true,
                is_active: true,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
              })
            }

            // Sync session cookie
            await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uid: result.user.uid, email: result.user.email, displayName: result.user.displayName }),
            })

            return { data: { user: { id: result.user.uid } }, error: null }
          }
          return { data: null, error: { message: `Provider ${provider} nao suportado` } }
        } catch (err: unknown) {
          return { data: null, error: { message: (err as Error).message } }
        }
      },
      async exchangeCodeForSession(_code: string) {
        // Firebase nao usa code exchange — no-op de compatibilidade
        return { data: { user: null, session: null }, error: null }
      },
      onAuthStateChange(callback: (event: string, session: unknown) => void) {
        const { onAuthStateChanged } = require("firebase/auth")
        const unsub = onAuthStateChanged(auth, (user: unknown) => {
          const u = user as { uid: string; email: string } | null
          callback(u ? "SIGNED_IN" : "SIGNED_OUT", u ? { user: { id: u.uid, email: u.email } } : null)
        })
        return { data: { subscription: { unsubscribe: unsub } } }
      },
    },
    // Realtime compat — Firestore onSnapshot
    channel(name: string, _opts?: unknown) {
      const listeners: Array<{ unsub: (() => void) | null }> = []

      const channelObj = {
        topic: name,
        on(type: string, opts: { event?: string; schema?: string; table?: string; filter?: string }, callback: (payload: unknown) => void) {
          if (type === "postgres_changes" && opts.table) {
            // Sera subscrito no .subscribe()
            ;(channelObj as any)._pendingSubscription = { table: opts.table, filter: opts.filter, event: opts.event, callback }
          }
          return channelObj
        },
        subscribe(statusCallback?: (status: string) => void) {
          const pending = (channelObj as any)._pendingSubscription
          if (pending) {
            import("firebase/firestore").then(({ collection: col, query: q, where: w, onSnapshot: snap }) => {
              import("@/lib/firebase/config").then(({ db: fireDb }) => {
                const colRef = col(fireDb, pending.table)
                let queryRef = q(colRef)
                if (pending.filter) {
                  const parts = pending.filter.split("=eq.")
                  if (parts.length === 2) {
                    queryRef = q(colRef, w(parts[0], "==", parts[1]))
                  }
                }
                const unsub = snap(queryRef, (snapshot) => {
                  snapshot.docChanges().forEach((change) => {
                    let eventType = "UPDATE"
                    if (change.type === "added") eventType = "INSERT"
                    if (change.type === "removed") eventType = "DELETE"
                    if (pending.event && pending.event !== "*" && pending.event !== eventType) return
                    pending.callback({
                      eventType,
                      new: { id: change.doc.id, ...change.doc.data() },
                      old: null,
                      table: pending.table,
                    })
                  })
                })
                listeners.push({ unsub })
                if (statusCallback) statusCallback("SUBSCRIBED")
              })
            })
          }
          return channelObj
        },
        async send(_msg: unknown) {
          // no-op — Firestore nao tem broadcast
        },
        track(_data: unknown) {
          return Promise.resolve()
        },
        unsubscribe() {
          listeners.forEach((l) => l.unsub?.())
          listeners.length = 0
        },
      }

      return channelObj
    },
    removeChannel(channel: { unsubscribe?: () => void }) {
      channel?.unsubscribe?.()
      return Promise.resolve()
    },

    // Storage compat (bucket-level)
    storage: {
      from(_bucket: string) {
        return {
          async upload(path: string, file: File) {
            try {
              const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")
              const { storage: firebaseStorage } = await import("@/lib/firebase/config")
              const storageRef = ref(firebaseStorage, `${_bucket}/${path}`)
              await uploadBytes(storageRef, file)
              const url = await getDownloadURL(storageRef)
              return { data: { path, fullPath: `${_bucket}/${path}` }, error: null }
            } catch (err: unknown) {
              return { data: null, error: err as Error }
            }
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: `/api/storage/${_bucket}/${path}` } }
          },
        }
      },
    },
  }
}
