import { STORY_NOTE_TEXT_MAX_LENGTH } from "@/features/notes/config/default-story-notes-state";
import type { StoryNoteDraft, StoryNotesState } from "@/features/notes/types";

export function updateStoryNoteState(state: StoryNotesState, draft: StoryNoteDraft): StoryNotesState {
  const storyId = draft.storyId.trim();
  const text = draft.text.slice(0, STORY_NOTE_TEXT_MAX_LENGTH);

  if (!storyId) {
    return state;
  }

  if (text.trim().length === 0) {
    const remainingNotes = { ...state.notes };
    delete remainingNotes[storyId];
    return {
      notes: remainingNotes,
    };
  }

  return {
    notes: {
      ...state.notes,
      [storyId]: {
        storyId,
        locale: draft.locale,
        groupId: draft.groupId.trim(),
        storyTitle: draft.storyTitle.trim(),
        groupTitle: draft.groupTitle.trim(),
        text,
        updatedAt: new Date().toISOString(),
      },
    },
  };
}
