import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable Turbopack
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Output configuration
  output: 'standalone',
}

export default nextConfig
