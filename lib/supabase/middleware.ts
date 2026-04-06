import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Firebase gerencia sessao via cookie "firebase-session" setado pelo cliente
  // Nao precisamos renovar tokens como no Supabase SSR
  return NextResponse.next({ request })
}
