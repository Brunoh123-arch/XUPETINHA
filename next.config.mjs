/** @type {import('next').NextConfig} */

// Quando BUILD_TARGET=android, gera output estatico para o Capacitor
// Em producao Vercel, BUILD_TARGET nao e definido e o app roda normalmente
const isAndroidBuild = process.env.BUILD_TARGET === 'android'

const nextConfig = {
  // Static export apenas para build Android (Capacitor usa /out como webDir)
  ...(isAndroidBuild && { output: 'export' }),
  // Next.js 16: usar proxy.ts em vez de middleware.ts
  // O export default em proxy.ts é suficiente; sem config adicional necessário

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  serverExternalPackages: ['resend', 'web-push'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
    // Necessario para static export — imagens nao podem usar o Image Optimizer
    unoptimized: true,
  },
  async headers() {
    // Headers de seguranca para todas as rotas
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(self), microphone=(self), geolocation=(self), payment=(self)',
      },
    ]

    return [
      {
        // Aplicar headers de seguranca em todas as rotas
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Digital Asset Links must be served with this content-type
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      {
        // Manifest must be accessible
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ]
  },
}

export default nextConfig
