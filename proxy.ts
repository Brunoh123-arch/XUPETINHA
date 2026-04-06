import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy middleware — Firebase version.
 * O cookie de sessao e gerenciado pelo AuthProvider no cliente.
 */
export default async function proxy(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|glb|gltf|js|json|webmanifest)$).*)',
  ],
}
