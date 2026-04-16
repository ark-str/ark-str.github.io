import type { NextConfig } from "next";

const appDir = process.cwd();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: appDir,
  turbopack: {
    root: appDir,
  },
};

export default nextConfig;
