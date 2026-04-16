import path from "node:path";
import { readText, relativePath, walkFiles } from "./lib.mjs";

const featureRoot = path.join(process.cwd(), "src", "features");
const importPattern = /from\s+["']([^"']+)["']/g;

const allowedTargets = {
  types: new Set(),
  config: new Set(["types"]),
  repo: new Set(["types", "config"]),
  service: new Set(["types", "config"]),
  runtime: new Set(["types", "config", "repo", "service"]),
  ui: new Set(["types", "config", "service", "runtime"]),
};

function getLayerFromFilePath(filePath) {
  const normalized = relativePath(filePath).replaceAll("\\", "/");

  if (normalized.endsWith("/types.ts")) {
    return "types";
  }

  const match = normalized.match(/src\/features\/[^/]+\/(config|repo|service|runtime|ui)\//);
  return match?.[1] ?? null;
}

function getTargetLayer(specifier) {
  const normalized = specifier.replaceAll("\\", "/");

  if (/^@\/features\/[^/]+\/types$/.test(normalized)) {
    return "types";
  }

  const match = normalized.match(/^@\/features\/[^/]+\/(config|repo|service|runtime|ui)\//);
  return match?.[1] ?? null;
}

const files = walkFiles(featureRoot, (filePath) => /\.(ts|tsx)$/.test(filePath));
const violations = [];

for (const filePath of files) {
  const sourceLayer = getLayerFromFilePath(filePath);
  if (!sourceLayer) {
    continue;
  }

  const allowed = allowedTargets[sourceLayer];
  const text = readText(filePath);
  let match;

  while ((match = importPattern.exec(text)) !== null) {
    const specifier = match[1];
    if (!specifier.startsWith("@/features/")) {
      continue;
    }

    if (specifier.endsWith(".css")) {
      continue;
    }

    const targetLayer = getTargetLayer(specifier);
    if (!targetLayer) {
      continue;
    }

    if (!allowed.has(targetLayer)) {
      violations.push(
        `${relativePath(filePath)}: ${sourceLayer} cannot import ${targetLayer} (${specifier})`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("Architecture violations detected:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("architecture check passed");
