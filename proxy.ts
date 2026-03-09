import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

// Next.js 16: proxy.ts substitui middleware.ts
// Requer export default OU named export "proxy"
export default async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|glb|gltf|js|json|webmanifest)$).*)',
  ],
}
