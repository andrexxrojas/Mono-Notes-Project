import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  output: "standalone",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
