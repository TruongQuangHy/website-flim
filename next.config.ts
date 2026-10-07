import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "vsmov.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.vsmov.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nguon.vsphim.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.vsphim.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.streamvsmov.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.ophim.live",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.ophim1.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["zustand", "axios"],
  },
};

export default nextConfig;
