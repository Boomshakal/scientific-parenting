import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.50.250', 'localhost', '127.0.0.1'],
  output: 'standalone',
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://parenting.lhmsite.top:8443' : undefined,
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowedOrigin = isProduction
      ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://parenting.lhmsite.top:8443')
      : 'http://localhost:3000';
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigin,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
