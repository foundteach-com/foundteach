import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'foundteach-assets.sfo3.cdn.digitaloceanspaces.com',
        pathname: '/logo-unimagdalena.png',
      },
    ],
  },
};

export default nextConfig;
