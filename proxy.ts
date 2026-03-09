import { updateSession } from '@/lib/supabase/session'
import { type NextRequest } from 'next/server'

// Next.js 16: proxy.ts substitui middleware.ts
// Exporta TANTO o named "proxy" quanto o default para máxima compatibilidade
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export default proxy

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|glb|gltf|js|json|webmanifest)$).*)',
  ],
}
