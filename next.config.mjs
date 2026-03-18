import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */

// Quando BUILD_TARGET=android, gera output estatico para o Capacitor
// Em producao Vercel, BUILD_TARGET nao e definido e o app roda normalmente
const isAndroidBuild = process.env.BUILD_TARGET === 'android'

// Pacotes nativos/opcionais que devem ser substituidos por mocks no build web
const NATIVE_PACKAGES = [
  '@capacitor/core',
  '@capacitor/geolocation',
  '@capacitor/preferences',
  '@capacitor/push-notifications',
  '@capacitor/local-notifications',
  '@capacitor/haptics',
  '@capacitor/network',
  '@capacitor/device',
  '@capacitor/camera',
  '@capacitor/share',
  '@capacitor/clipboard',
  '@capacitor/browser',
  '@capacitor/app',
  '@capacitor/app-launcher',
  '@capacitor/status-bar',
  '@capacitor/splash-screen',
  '@capacitor/keyboard',
  '@capacitor/google-maps',
  '@capacitor-community/keep-awake',
  '@capacitor-community/background-geolocation',
  '@capacitor-community/text-to-speech',
  '@capacitor-community/biometric-auth',
  '@capacitor-community/microphone',
  // Google Maps packages (only needed at runtime when API key is set)
  '@vis.gl/react-google-maps',
  'google-maps',
]

const capacitorMockPath = path.resolve(__dirname, 'lib/capacitor-mock.js')

const nextConfig = {
  // Static export apenas para build Android (Capacitor usa /out como webDir)
  ...(isAndroidBuild && { output: 'export' }),

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  serverExternalPackages: ['resend', 'web-push'],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,

  // Turbopack aliases (Next.js 16 usa Turbopack por padrao)
  // resolveAlias mapeia cada pacote nativo para o mock local
  turbopack: !isAndroidBuild ? {
    resolveAlias: Object.fromEntries(
      NATIVE_PACKAGES.map((pkg) => [pkg, capacitorMockPath])
    ),
  } : {},

  // Manter webpack config para compatibilidade com builds Android e edge cases
  webpack(config) {
    if (!isAndroidBuild) {
      NATIVE_PACKAGES.forEach((pkg) => {
        config.resolve.alias[pkg] = capacitorMockPath
      })
    }
    return config
  },
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
