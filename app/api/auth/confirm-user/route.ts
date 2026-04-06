import { NextResponse } from "next/server"

/**
 * Confirma/cria usuario via Firebase Admin.
 * Substitui o Supabase Admin API.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email, password, fullName, role } = body

    // Modo 1: confirmar email de usuario ja criado
    if (userId && !email) {
      try {
        const { adminAuth } = await import("@/lib/firebase/admin")
        await adminAuth.updateUser(userId, { emailVerified: true })
        return NextResponse.json({ success: true })
      } catch (err: unknown) {
        console.error("[confirm-user] updateUser error:", (err as Error).message)
        return NextResponse.json({ error: (err as Error).message }, { status: 500 })
      }
    }

    // Modo 2: criar usuario via admin
    if (email && password) {
      try {
        const { adminAuth } = await import("@/lib/firebase/admin")
        const { adminDb } = await import("@/lib/firebase/admin")

        const user = await adminAuth.createUser({
          email,
          password,
          emailVerified: true,
          displayName: fullName ?? "",
        })

        // Cria perfil no Firestore
        await adminDb.collection("profiles").doc(user.uid).set({
          email,
          full_name: fullName ?? null,
          avatar_url: null,
          phone: null,
          user_type: role ?? "passenger",
          trust_score: 100,
          trust_level: "gold",
          referral_code: user.uid.slice(0, 8).toUpperCase(),
          is_verified: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        return NextResponse.json({ success: true, userId: user.uid })
      } catch (err: unknown) {
        console.error("[confirm-user] createUser error:", (err as Error).message)
        return NextResponse.json({ error: (err as Error).message }, { status: 500 })
      }
    }

    return NextResponse.json({ error: "Parametros invalidos" }, { status: 400 })
  } catch (err) {
    console.error("[confirm-user] catch:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
