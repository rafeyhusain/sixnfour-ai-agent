import type { NextConfig } from "next";
import { config } from "./sdk/core/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**", // match all paths
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "**", // match all paths
      },
    ],
  },
  ...(process.platform !== "win32" ? { output: "standalone" } : {}),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // async rewrites() {
  //   return [
  //     { source: '/api/auth/:path*', destination: `${config.auth.url}/:path*` },
  //     { source: '/api/dashboard/:path*', destination: `${config.dashboard.url}/:path*` },
  //     { source: '/api/marketing/:path*', destination: `${config.marketing.url}/:path*` },
  //   ];
  // },
};

export default nextConfig;
