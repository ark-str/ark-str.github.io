import type { NextConfig } from "next";

const appDir = process.cwd();
const configuredBasePath = process.env.ARK_STR_BASE_PATH?.trim() ?? "";
const configuredDistDir = process.env.ARK_STR_DIST_DIR?.trim() ?? "";
const normalizedBasePath =
  configuredBasePath.length > 0
    ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";
const normalizedDistDir = configuredDistDir.length > 0 ? configuredDistDir : ".next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: normalizedDistDir,
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
