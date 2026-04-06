import { NextResponse } from 'next/server'

/**
 * Auth callback — Firebase nao usa code exchange como Supabase.
 * Este callback e mantido para compatibilidade com links de redirecionamento.
 * No Firebase, a autenticacao e feita diretamente no cliente.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const type = requestUrl.searchParams.get('type')

  // Recuperacao de senha
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  // Redireciona para home como fallback
  return NextResponse.redirect(`${origin}/uppi/home`)
}
