/* global process */

/** @type {import('next').NextConfig} */
const normalizeUrl = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
};

const firstAbsoluteUrl = (...values) =>
  values.map(normalizeUrl).find((value) => value && !value.startsWith('/'));

const apiProxyUrl =
  firstAbsoluteUrl(
    process.env.API_PROXY_TARGET_URL,
    process.env.INTERNAL_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ) ?? 'http://localhost:4000/api';

const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  transpilePackages: ['@buzzshot/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
