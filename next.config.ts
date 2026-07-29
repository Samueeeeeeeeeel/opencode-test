import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  allowedDevOrigins: ['192.168.1.87'],
};

export default nextConfig;
