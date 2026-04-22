import type { AssetManifest, ContentIndex, StoryDetail, SummaryManifest } from "@/features/content/types";

function getRuntimeBasePath() {
  if (typeof window === "undefined") {
    return "";
  }

  const marker = "/reader";
  const markerIndex = window.location.pathname.indexOf(marker);
  return markerIndex > 0 ? window.location.pathname.slice(0, markerIndex) : "";
}

export function resolveRuntimePublicPath(publicPath: string | null): string | null {
  if (!publicPath) {
    return null;
  }

  return `${getRuntimeBasePath()}${publicPath}`;
}

async function fetchGeneratedJson<T>(publicPath: string): Promise<T> {
  const response = await fetch(resolveRuntimePublicPath(publicPath) ?? publicPath);
  if (!response.ok) {
    throw new Error(`Unable to load generated content: ${publicPath}`);
  }

  return (await response.json()) as T;
}

export function fetchContentIndex() {
  return fetchGeneratedJson<ContentIndex>("/generated/content/index.json");
}

export function fetchSummaryManifest() {
  return fetchGeneratedJson<SummaryManifest>("/generated/content/status/summary-manifest.json");
}

export function fetchAssetManifest() {
  return fetchGeneratedJson<AssetManifest>("/generated/content/assets.json");
}

export function fetchStoryDetail(bodyPath: string) {
  return fetchGeneratedJson<StoryDetail>(`/generated/content/${bodyPath.replace(/^\/+/, "")}`);
}
