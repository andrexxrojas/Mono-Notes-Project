import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"]
  }
};

export default nextConfig;
