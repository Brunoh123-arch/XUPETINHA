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
}

export default nextConfig
