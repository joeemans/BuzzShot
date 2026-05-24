/* global process */

/** @type {import('next').NextConfig} */
const apiProxyUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  transpilePackages: ['@buzzshot/shared'],
  async rewrites() {
    if (!apiProxyUrl || apiProxyUrl.startsWith('/')) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
