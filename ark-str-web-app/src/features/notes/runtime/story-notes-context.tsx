"use client";

import { createContext, useContext, useEffect, useEffectEvent, useState } from "react";
import { DEFAULT_STORY_NOTES_STATE } from "@/features/notes/config/default-story-notes-state";
import {
  readPersistedStoryNotesState,
  writePersistedStoryNotesState,
} from "@/features/notes/repo/local-storage-story-notes-store";
import { normalizeStoryNotesState } from "@/features/notes/service/normalize-story-notes-state";
import { updateStoryNoteState } from "@/features/notes/service/update-story-note-state";
import type { StoryNoteDraft, StoryNotesState } from "@/features/notes/types";

function useStoryNotesStore() {
  const [state, setState] = useState<StoryNotesState>(DEFAULT_STORY_NOTES_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrateFromStorage = useEffectEvent(() => {
    const persisted = readPersistedStoryNotesState();
    setState(normalizeStoryNotesState(persisted));
    setIsHydrated(true);
  });

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writePersistedStoryNotesState(state);
  }, [isHydrated, state]);

  return {
    state,
    isHydrated,
    setStoryNote(draft: StoryNoteDraft) {
      setState((current) => updateStoryNoteState(current, draft));
    },
    replaceStoryNotes(nextState: StoryNotesState) {
      setState(normalizeStoryNotesState(nextState));
    },
    resetStoryNotes() {
      setState(DEFAULT_STORY_NOTES_STATE);
    },
  };
}

type StoryNotesContextValue = ReturnType<typeof useStoryNotesStore>;

const StoryNotesContext = createContext<StoryNotesContextValue | null>(null);

export function StoryNotesProvider({ children }: { children: React.ReactNode }) {
  const value = useStoryNotesStore();

  return <StoryNotesContext.Provider value={value}>{children}</StoryNotesContext.Provider>;
}

export function useStoryNotes() {
  const context = useContext(StoryNotesContext);

  if (!context) {
    throw new Error("useStoryNotes must be used within StoryNotesProvider");
  }

  return context;
}
