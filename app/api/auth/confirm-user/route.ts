import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Cria ou confirma usuário via Admin API (bypassa restrições de signup público)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email, password, fullName, role } = body

    // Modo 1: confirmar email de usuário já criado
    if (userId && !email) {
      const { error } = await supabaseAdmin.auth.admin.updateUser(userId, {
        email_confirm: true,
      })
      if (error) {
        console.error("[confirm-user] updateUser error:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    // Modo 2: criar usuário via admin (bypassa "Signup disabled")
    if (email && password) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName ?? "",
          role: role ?? "passenger",
        },
      })

      if (error) {
        console.error("[confirm-user] createUser error:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, userId: data.user?.id })
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  } catch (err) {
    console.error("[confirm-user] catch:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
