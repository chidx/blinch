import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack configuration (moved from experimental.turbo in Next.js 15+)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Output configuration
  output: 'standalone',
}

export default nextConfig
