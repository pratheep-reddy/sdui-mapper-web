import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ixigo.com',
        pathname: '/image/upload/**',
      },
    ],
  },
};

export default nextConfig;
