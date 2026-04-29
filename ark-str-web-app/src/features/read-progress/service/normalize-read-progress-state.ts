import { DEFAULT_READ_PROGRESS_STATE } from "@/features/read-progress/config/default-read-progress-state";
import type { ReadProgressState, ReadStoryEntry } from "@/features/read-progress/types";

const MAX_STORY_ID_LENGTH = 240;

function normalizeStoryId(value: unknown, fallback: string): string | null {
  const candidate = typeof value === "string" ? value : fallback;
  const trimmed = candidate.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.slice(0, MAX_STORY_ID_LENGTH);
}

function normalizeReadAt(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    return null;
  }

  return new Date(time).toISOString();
}

function normalizeEntry(key: string, raw: unknown): ReadStoryEntry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<Record<keyof ReadStoryEntry, unknown>>;
  const storyId = normalizeStoryId(candidate.storyId, key);
  const readAt = normalizeReadAt(candidate.readAt);

  if (!storyId || !readAt) {
    return null;
  }

  return {
    storyId,
    readAt,
  };
}

export function normalizeReadProgressState(raw: unknown): ReadProgressState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_READ_PROGRESS_STATE;
  }

  const readStories = (raw as { readStories?: unknown }).readStories;
  if (!readStories || typeof readStories !== "object") {
    return DEFAULT_READ_PROGRESS_STATE;
  }

  const normalizedReadStories: ReadProgressState["readStories"] = {};

  for (const [key, value] of Object.entries(readStories)) {
    const normalizedEntry = normalizeEntry(key, value);
    if (normalizedEntry) {
      normalizedReadStories[normalizedEntry.storyId] = normalizedEntry;
    }
  }

  return {
    readStories: normalizedReadStories,
  };
}
