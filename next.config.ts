import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    newDevOverlay: true,
  },
  transpilePackages: ['next-mdx-remote'],
};

export default nextConfig;
