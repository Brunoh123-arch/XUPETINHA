import { updateSession } from '@/lib/supabase/session'
import { type NextRequest, NextResponse } from 'next/server'

// Next.js 16: proxy.ts substituiu middleware.ts mas ambos sao aceitos.
// Usar apenas middleware.ts elimina o conflito "Both detected".
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|glb|gltf|js|json|webmanifest)$).*)',
  ],
}
