import type { NextConfig } from "next";

const appDir = process.cwd();
const configuredBasePath = process.env.ARK_STR_BASE_PATH?.trim() ?? "";
const normalizedBasePath =
  configuredBasePath.length > 0
    ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  outputFileTracingRoot: appDir,
  trailingSlash: true,
  basePath: normalizedBasePath || undefined,
  assetPrefix: normalizedBasePath || undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: appDir,
  },
};

export default nextConfig;
