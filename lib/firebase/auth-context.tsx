"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./config"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  user_type: "passenger" | "driver" | "admin"
  created_at: string
  [key: string]: unknown
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ user: User | null; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(u: User) {
    try {
      const snap = await getDoc(doc(db, "profiles", u.uid))
      if (snap.exists()) {
        setProfile({ id: u.uid, ...snap.data() } as UserProfile)
      } else {
        setProfile(null)
      }
    } catch {
      setProfile(null)
    }
  }

  // Sincroniza cookie de sessao no servidor para SSR
  async function syncSessionCookie(u: User | null) {
    try {
      if (u) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: u.uid, email: u.email, displayName: u.displayName }),
        })
      } else {
        await fetch("/api/auth/session", { method: "DELETE" })
      }
    } catch {
      // Ignora erros de sync
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await fetchProfile(u)
        await syncSessionCookie(u)
      } else {
        setProfile(null)
        await syncSessionCookie(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)

      const fullName = (metadata?.full_name as string) ?? ""
      if (fullName) {
        await updateProfile(newUser, { displayName: fullName })
      }

      const userType = (metadata?.role as string) === "driver" ? "driver" : "passenger"

      // Cria perfil no Firestore
      await setDoc(doc(db, "profiles", newUser.uid), {
        email,
        full_name: fullName || null,
        avatar_url: null,
        phone: (metadata?.phone as string) ?? null,
        user_type: userType,
        trust_score: 100,
        trust_level: "gold",
        referral_code: newUser.uid.slice(0, 8).toUpperCase(),
        is_verified: false,
        is_active: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      await fetchProfile(newUser)
      return { user: newUser, error: null }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Erro ao criar conta"
      return { user: null, error: msg }
    }
  }

  async function signIn(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Erro ao fazer login"
      return { error: msg }
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
    setUser(null)
    setProfile(null)
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { error: null }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Erro ao enviar email"
      return { error: msg }
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, resetPassword, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}
