import fs from "node:fs";
import path from "node:path";
import type { ContentReadinessSnapshot } from "@/features/content/types";

function getGeneratedPath(fileName: string) {
  return path.join(process.cwd(), "public", "generated", "content", fileName);
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function readContentReadiness(): ContentReadinessSnapshot {
  const indexPath = getGeneratedPath("index.json");
  const summaryManifestPath = getGeneratedPath(path.join("status", "summary-manifest.json"));

  if (!fs.existsSync(indexPath) || !fs.existsSync(summaryManifestPath)) {
    return {
      serverCount: 0,
      storyCount: 0,
      summaryMissingCount: 0,
      generatedAt: null,
    };
  }

  try {
    const index = readJson(indexPath);
    const summaryManifest = readJson(summaryManifestPath);

    return {
      serverCount: Array.isArray(index.vendor?.servers) ? index.vendor.servers.length : 0,
      storyCount: Array.isArray(index.stories) ? index.stories.length : 0,
      summaryMissingCount: Array.isArray(summaryManifest.items)
        ? summaryManifest.items.filter((item: { status?: string }) => item.status === "missing").length
        : 0,
      generatedAt: typeof index.generatedAt === "string" ? index.generatedAt : null,
    };
  } catch {
    return {
      serverCount: 0,
      storyCount: 0,
      summaryMissingCount: 0,
      generatedAt: null,
    };
  }
}
