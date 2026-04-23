import { DEFAULT_READER_SESSION_STATE } from "@/features/reader/config/default-reader-session-state";
import type { ReaderSessionState } from "@/features/reader/types";

function mapLegacyLocale(value: unknown): ReaderSessionState["preferredLocale"] {
  if (value === "ko-KR") {
    return "kr";
  }

  if (value === "en-US") {
    return "en";
  }

  if (value === "ja-JP") {
    return "jp";
  }

  if (value === "cn" || value === "en" || value === "jp" || value === "kr" || value === "tw") {
    return value;
  }

  return DEFAULT_READER_SESSION_STATE.preferredLocale;
}

function normalizeVisitedGroup(raw: unknown): ReaderSessionState["lastVisitedGroup"] {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    locale?: unknown;
    groupId?: unknown;
  };

  if (
    candidate.locale !== "cn" &&
    candidate.locale !== "en" &&
    candidate.locale !== "jp" &&
    candidate.locale !== "kr" &&
    candidate.locale !== "tw"
  ) {
    return null;
  }

  if (typeof candidate.groupId !== "string" || candidate.groupId.length === 0) {
    return null;
  }

  return {
    locale: candidate.locale,
    groupId: candidate.groupId,
  };
}

function normalizeVisitedStory(raw: unknown): ReaderSessionState["lastVisitedStory"] {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    locale?: unknown;
    groupId?: unknown;
    storyId?: unknown;
    title?: unknown;
  };

  if (
    candidate.locale !== "cn" &&
    candidate.locale !== "en" &&
    candidate.locale !== "jp" &&
    candidate.locale !== "kr" &&
    candidate.locale !== "tw"
  ) {
    return null;
  }

  if (typeof candidate.groupId !== "string" || candidate.groupId.length === 0) {
    return null;
  }

  if (typeof candidate.storyId !== "string" || candidate.storyId.length === 0) {
    return null;
  }

  if (typeof candidate.title !== "string" || candidate.title.length === 0) {
    return null;
  }

  return {
    locale: candidate.locale,
    groupId: candidate.groupId,
    storyId: candidate.storyId,
    title: candidate.title,
  };
}

function normalizeNickName(raw: unknown): string {
  if (typeof raw !== "string") {
    return DEFAULT_READER_SESSION_STATE.nickName;
  }

  return raw.slice(0, 24);
}

export function normalizeReaderSessionState(
  raw: unknown,
  legacyBootstrapRaw?: unknown,
): ReaderSessionState {
  const fallbackPreferredLocale =
    legacyBootstrapRaw && typeof legacyBootstrapRaw === "object"
      ? mapLegacyLocale((legacyBootstrapRaw as { preferredLocale?: unknown }).preferredLocale)
      : DEFAULT_READER_SESSION_STATE.preferredLocale;

  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_READER_SESSION_STATE,
      preferredLocale: fallbackPreferredLocale,
    };
  }

  const candidate = raw as Partial<ReaderSessionState>;

  return {
    preferredLocale: mapLegacyLocale(candidate.preferredLocale ?? fallbackPreferredLocale),
    nickName: normalizeNickName(candidate.nickName),
    lastVisitedGroup: normalizeVisitedGroup(candidate.lastVisitedGroup),
    lastVisitedStory: normalizeVisitedStory(candidate.lastVisitedStory),
  };
}
