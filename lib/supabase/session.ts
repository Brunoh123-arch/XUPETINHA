import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  // Le o cookie de sessao Firebase
  const sessionCookie = request.cookies.get('firebase-session')
  let user: { uid: string; email: string } | null = null

  if (sessionCookie?.value) {
    try {
      user = JSON.parse(sessionCookie.value)
    } catch {
      user = null
    }
  }

  // Public admin routes — nunca redireciona
  const adminPublicPaths = ['/admin/login', '/admin/forgot-password']
  const isAdminPublicRoute = adminPublicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Rotas protegidas
  const protectedPaths = ['/uppi', '/admin']
  const isProtectedRoute =
    !isAdminPublicRoute &&
    protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    )

  if (isProtectedRoute && !user) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/login'
      return NextResponse.redirect(redirectUrl)
    }

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/onboarding/splash'
    return NextResponse.redirect(redirectUrl)
  }

  // Auth routes — redireciona se ja logado
  const authPaths = ['/auth/login', '/auth/signup']
  const isAuthRoute = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/uppi/home'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
