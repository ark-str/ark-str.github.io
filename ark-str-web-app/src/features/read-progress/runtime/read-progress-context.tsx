"use client";

import { createContext, useContext, useEffect, useEffectEvent, useState } from "react";
import { DEFAULT_READ_PROGRESS_STATE } from "@/features/read-progress/config/default-read-progress-state";
import {
  readPersistedReadProgressState,
  writePersistedReadProgressState,
} from "@/features/read-progress/repo/local-storage-read-progress-store";
import { normalizeReadProgressState } from "@/features/read-progress/service/normalize-read-progress-state";
import { setStoryReadState } from "@/features/read-progress/service/update-read-progress-state";
import type { ReadProgressState } from "@/features/read-progress/types";

function useReadProgressStore() {
  const [state, setState] = useState<ReadProgressState>(DEFAULT_READ_PROGRESS_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrateFromStorage = useEffectEvent(() => {
    const persisted = readPersistedReadProgressState();
    setState(normalizeReadProgressState(persisted));
    setIsHydrated(true);
  });

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writePersistedReadProgressState(state);
  }, [isHydrated, state]);

  return {
    state,
    isHydrated,
    isStoryRead(storyId: string) {
      return Boolean(state.readStories[storyId]);
    },
    setStoryRead(storyId: string, isRead: boolean) {
      setState((current) => setStoryReadState(current, storyId, isRead));
    },
    toggleStoryRead(storyId: string) {
      setState((current) => setStoryReadState(current, storyId, !current.readStories[storyId]));
    },
    replaceReadProgress(nextState: ReadProgressState) {
      setState(normalizeReadProgressState(nextState));
    },
    resetReadProgress() {
      setState(DEFAULT_READ_PROGRESS_STATE);
    },
  };
}

type ReadProgressContextValue = ReturnType<typeof useReadProgressStore>;

const ReadProgressContext = createContext<ReadProgressContextValue | null>(null);

export function ReadProgressProvider({ children }: { children: React.ReactNode }) {
  const value = useReadProgressStore();

  return <ReadProgressContext.Provider value={value}>{children}</ReadProgressContext.Provider>;
}

export function useReadProgress() {
  const context = useContext(ReadProgressContext);

  if (!context) {
    throw new Error("useReadProgress must be used within ReadProgressProvider");
  }

  return context;
}
