import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['resend', 'web-push'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    const capacitorStub = path.resolve(__dirname, 'lib/capacitor-stub.js')
    const capacitorPackages = [
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor/app-launcher',
      '@capacitor/browser',
      '@capacitor/camera',
      '@capacitor/clipboard',
      '@capacitor/device',
      '@capacitor/geolocation',
      '@capacitor/google-maps',
      '@capacitor/haptics',
      '@capacitor/local-notifications',
      '@capacitor/network',
      '@capacitor/preferences',
      '@capacitor/push-notifications',
      '@capacitor/share',
      '@capacitor/splash-screen',
      '@capacitor/status-bar',
      '@capacitor-community/background-geolocation',
      '@capacitor-community/keep-awake',
      '@capacitor-community/biometric-auth',
      '@capacitor-community/microphone',
      '@capacitor-community/text-to-speech',
    ]
    capacitorPackages.forEach((pkg) => {
      config.resolve.alias[pkg] = capacitorStub
    })
    return config
  },
}

export default nextConfig
