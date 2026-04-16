import type { ContentReadinessSnapshot } from "@/features/content/types";
import { contentIndex, summaryManifest } from "@/generated/content/registry";

export function readContentReadiness(): ContentReadinessSnapshot {
  return {
    serverCount: Array.isArray(contentIndex.vendor?.servers) ? contentIndex.vendor.servers.length : 0,
    storyCount: Array.isArray(contentIndex.stories) ? contentIndex.stories.length : 0,
    summaryMissingCount: Array.isArray(summaryManifest.items)
      ? summaryManifest.items.filter((item) => item.status === "missing").length
      : 0,
    generatedAt: typeof contentIndex.generatedAt === "string" ? contentIndex.generatedAt : null,
  };
}
