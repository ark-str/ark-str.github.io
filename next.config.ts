import type { NextConfig } from "next";

const rootDir = process.cwd();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: rootDir,
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
