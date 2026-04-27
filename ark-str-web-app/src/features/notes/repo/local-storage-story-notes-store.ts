import { STORY_NOTES_STORAGE_KEY } from "@/features/notes/config/default-story-notes-state";
import type { StoryNotesState } from "@/features/notes/types";

export function readPersistedStoryNotesState(): unknown | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORY_NOTES_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function writePersistedStoryNotesState(state: StoryNotesState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORY_NOTES_STORAGE_KEY, JSON.stringify(state));
}
