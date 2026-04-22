"use client";

import { useEffect, useState } from "react";
import type { AssetManifest, ContentIndex, StoryDetail, SummaryManifest } from "@/features/content/types";
import {
  fetchAssetManifest,
  fetchContentIndex,
  fetchStoryDetail,
  fetchSummaryManifest,
  resolveRuntimePublicPath,
} from "@/features/content/repo/public-content-repo";

type AsyncState<T> =
  | { data: null; error: null; status: "idle" | "loading" }
  | { data: T; error: null; status: "ready" }
  | { data: null; error: Error; status: "error" };

const indexCache: { value: ContentIndex | null; promise: Promise<ContentIndex> | null } = {
  value: null,
  promise: null,
};
const summaryCache: { value: SummaryManifest | null; promise: Promise<SummaryManifest> | null } = {
  value: null,
  promise: null,
};
const assetCache: { value: AssetManifest | null; promise: Promise<AssetManifest> | null } = {
  value: null,
  promise: null,
};
const storyDetailCache = new Map<string, Promise<StoryDetail>>();

function loadContentIndex() {
  if (indexCache.value) {
    return Promise.resolve(indexCache.value);
  }

  indexCache.promise ??= fetchContentIndex().then((index) => {
    indexCache.value = index;
    return index;
  });
  return indexCache.promise;
}

function loadSummaryManifest() {
  if (summaryCache.value) {
    return Promise.resolve(summaryCache.value);
  }

  summaryCache.promise ??= fetchSummaryManifest().then((manifest) => {
    summaryCache.value = manifest;
    return manifest;
  });
  return summaryCache.promise;
}

function loadAssetManifest() {
  if (assetCache.value) {
    return Promise.resolve(assetCache.value);
  }

  assetCache.promise ??= fetchAssetManifest().then((manifest) => {
    assetCache.value = manifest;
    return manifest;
  });
  return assetCache.promise;
}

function loadStoryDetail(bodyPath: string) {
  const normalizedBodyPath = bodyPath.replace(/^\/+/, "");
  const cached = storyDetailCache.get(normalizedBodyPath);
  if (cached) {
    return cached;
  }

  const promise = fetchStoryDetail(normalizedBodyPath);
  storyDetailCache.set(normalizedBodyPath, promise);
  return promise;
}

function createErrorState<T>(error: unknown): AsyncState<T> {
  return {
    data: null,
    error: error instanceof Error ? error : new Error("Unknown generated content load failure"),
    status: "error",
  };
}

export function useContentIndex() {
  const [state, setState] = useState<AsyncState<ContentIndex>>({
    data: null,
    error: null,
    status: "loading",
  });

  useEffect(() => {
    let isCancelled = false;
    loadContentIndex()
      .then((data) => {
        if (!isCancelled) {
          setState({ data, error: null, status: "ready" });
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setState(createErrorState(error));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return state;
}

export function useSummaryManifest() {
  const [state, setState] = useState<AsyncState<SummaryManifest>>({
    data: null,
    error: null,
    status: "loading",
  });

  useEffect(() => {
    let isCancelled = false;
    loadSummaryManifest()
      .then((data) => {
        if (!isCancelled) {
          setState({ data, error: null, status: "ready" });
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setState(createErrorState(error));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return state;
}

export function useAssetManifest() {
  const [state, setState] = useState<AsyncState<AssetManifest>>({
    data: null,
    error: null,
    status: "loading",
  });

  useEffect(() => {
    let isCancelled = false;
    loadAssetManifest()
      .then((data) => {
        if (!isCancelled) {
          setState({ data, error: null, status: "ready" });
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setState(createErrorState(error));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return state;
}

export function useStoryDetail(bodyPath: string | null) {
  const [state, setState] = useState<{
    bodyPath: string | null;
    result: AsyncState<StoryDetail>;
  }>({
    bodyPath: null,
    result: { data: null, error: null, status: "loading" },
  });

  useEffect(() => {
    let isCancelled = false;
    if (!bodyPath) {
      return () => {
        isCancelled = true;
      };
    }

    loadStoryDetail(bodyPath)
      .then((data) => {
        if (!isCancelled) {
          setState({ bodyPath, result: { data, error: null, status: "ready" } });
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setState({ bodyPath, result: createErrorState(error) });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [bodyPath]);

  if (!bodyPath) {
    return { data: null, error: null, status: "ready" } satisfies AsyncState<StoryDetail | null>;
  }

  if (state.bodyPath !== bodyPath) {
    return { data: null, error: null, status: "loading" } satisfies AsyncState<StoryDetail | null>;
  }

  return state.result;
}

export { resolveRuntimePublicPath };
