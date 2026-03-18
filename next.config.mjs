import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */

const isAndroidBuild = process.env.BUILD_TARGET === 'android'

// Pacotes nativos que devem ser substituidos por mocks no build web
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
  '@vis.gl/react-google-maps',
  'google-maps',
]

const capacitorMockPath = path.resolve(__dirname, 'lib/capacitor-mock.js')

const nextConfig = {
  ...(isAndroidBuild && { output: 'export' }),

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
    unoptimized: isAndroidBuild,
  },

  webpack(config) {
    // Aliases para substituir pacotes Capacitor por mocks no build web
    if (!isAndroidBuild) {
      NATIVE_PACKAGES.forEach((pkg) => {
        config.resolve.alias[pkg] = capacitorMockPath
      })
    }

    // Garante que o fallback existe para evitar erros de resolucao
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },

  async headers() {
    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self), payment=(self)' },
    ]
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ]
  },
}

export default nextConfig
