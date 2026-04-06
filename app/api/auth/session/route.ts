import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// POST — salva sessao Firebase no cookie httpOnly
export async function POST(request: Request) {
  try {
    const { uid, email, displayName } = await request.json()

    if (!uid) {
      return NextResponse.json({ error: "uid obrigatorio" }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set("firebase-session", JSON.stringify({ uid, email, displayName }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE — remove cookie de sessao (logout)
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("firebase-session")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
