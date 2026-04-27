import type { StoryNotesState } from "@/features/notes/types";

export const STORY_NOTES_STORAGE_KEY = "ark-str:story-notes:v1";
export const STORY_NOTE_TEXT_MAX_LENGTH = 8000;

export const DEFAULT_STORY_NOTES_STATE: StoryNotesState = {
  notes: {},
};
