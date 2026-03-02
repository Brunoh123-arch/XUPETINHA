import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Retornar cedo se variáveis não disponíveis (build time)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  // IMPORTANTE: Não colocar código entre createServerClient e auth.getUser()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  // CRÍTICO: Não interromper entre createServerClient e getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas protegidas — requer autenticação
  const protectedPaths = ['/uppi']
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !user) {
    // Permitir acesso se completou o onboarding (cookie)
    const onboardingDone = request.cookies.get('onboarding_done')
    if (!onboardingDone) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/onboarding/splash'
      // CRÍTICO: copiar cookies para o redirect response
      const redirectResponse = NextResponse.redirect(redirectUrl)
      supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
        redirectResponse.cookies.set(name, value)
      })
      return redirectResponse
    }
  }

  // Rotas de auth — redirecionar para home se já logado
  const authPaths = ['/auth/login', '/auth/signup']
  const isAuthRoute = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/uppi/home'
    const redirectResponse = NextResponse.redirect(redirectUrl)
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      redirectResponse.cookies.set(name, value)
    })
    return redirectResponse
  }

  // CRÍTICO: retornar sempre o supabaseResponse para preservar cookies de sessão
  return supabaseResponse
}
