import {
  DEFAULT_STORY_NOTES_STATE,
  STORY_NOTE_TEXT_MAX_LENGTH,
} from "@/features/notes/config/default-story-notes-state";
import type { StoryNoteEntry, StoryNoteLocale, StoryNotesState } from "@/features/notes/types";

const LOCALES = new Set<StoryNoteLocale>(["cn", "en", "jp", "kr", "tw"]);
const MAX_ID_LENGTH = 240;
const MAX_TITLE_LENGTH = 240;

function normalizeRequiredString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function normalizeLocale(value: unknown): StoryNoteLocale | null {
  return typeof value === "string" && LOCALES.has(value as StoryNoteLocale)
    ? (value as StoryNoteLocale)
    : null;
}

function normalizeUpdatedAt(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    return null;
  }

  return new Date(time).toISOString();
}

function normalizeEntry(key: string, raw: unknown): StoryNoteEntry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<Record<keyof StoryNoteEntry, unknown>>;
  const storyId = normalizeRequiredString(candidate.storyId, MAX_ID_LENGTH) ?? key.slice(0, MAX_ID_LENGTH);
  const locale = normalizeLocale(candidate.locale);
  const groupId = normalizeRequiredString(candidate.groupId, MAX_ID_LENGTH);
  const storyTitle = normalizeRequiredString(candidate.storyTitle, MAX_TITLE_LENGTH);
  const groupTitle = normalizeRequiredString(candidate.groupTitle, MAX_TITLE_LENGTH);
  const updatedAt = normalizeUpdatedAt(candidate.updatedAt);

  if (!storyId || !locale || !groupId || !storyTitle || !groupTitle || !updatedAt) {
    return null;
  }

  const text = typeof candidate.text === "string" ? candidate.text.slice(0, STORY_NOTE_TEXT_MAX_LENGTH) : "";
  if (text.trim().length === 0) {
    return null;
  }

  return {
    storyId,
    locale,
    groupId,
    storyTitle,
    groupTitle,
    text,
    updatedAt,
  };
}

export function normalizeStoryNotesState(raw: unknown): StoryNotesState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_STORY_NOTES_STATE;
  }

  const notes = (raw as { notes?: unknown }).notes;
  if (!notes || typeof notes !== "object") {
    return DEFAULT_STORY_NOTES_STATE;
  }

  const normalizedNotes: StoryNotesState["notes"] = {};

  for (const [key, value] of Object.entries(notes)) {
    const normalizedEntry = normalizeEntry(key, value);
    if (normalizedEntry) {
      normalizedNotes[normalizedEntry.storyId] = normalizedEntry;
    }
  }

  return {
    notes: normalizedNotes,
  };
}
