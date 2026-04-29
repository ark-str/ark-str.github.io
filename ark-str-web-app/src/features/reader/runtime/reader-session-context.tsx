"use client";

import { createContext, useContext, useEffect, useEffectEvent, useState } from "react";
import { readPersistedBootstrapState } from "@/features/bootstrap/repo/local-storage-bootstrap-store";
import { DEFAULT_READER_SESSION_STATE } from "@/features/reader/config/default-reader-session-state";
import {
  clearPersistedReaderSessionState,
  readPersistedReaderSessionState,
  writePersistedReaderSessionState,
} from "@/features/reader/repo/local-storage-reader-session-store";
import { normalizeReaderSessionState } from "@/features/reader/service/normalize-reader-session-state";
import type { LastVisitedStory, ReaderSessionState } from "@/features/reader/types";
import type { ReaderLocale } from "@/features/content/types";

function useReaderSessionStore() {
  const [state, setState] = useState<ReaderSessionState>(DEFAULT_READER_SESSION_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrateFromStorage = useEffectEvent(() => {
    const persisted = readPersistedReaderSessionState();
    const legacyBootstrap = persisted ? null : readPersistedBootstrapState();

    setState(normalizeReaderSessionState(persisted, legacyBootstrap));
    setIsHydrated(true);
  });

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writePersistedReaderSessionState(state);
  }, [isHydrated, state]);

  return {
    state,
    isHydrated,
    setPreferredLocale(preferredLocale: ReaderLocale) {
      setState((current) => ({
        ...current,
        preferredLocale,
      }));
    },
    setNickName(nickName: string) {
      setState((current) => ({
        ...current,
        nickName: nickName.slice(0, 24),
      }));
    },
    replaceReaderSession(nextState: ReaderSessionState) {
      setState(normalizeReaderSessionState(nextState));
    },
    setLastVisitedStory(lastVisitedStory: LastVisitedStory) {
      setState((current) => ({
        ...current,
        preferredLocale: lastVisitedStory.locale,
        lastVisitedGroup: {
          locale: lastVisitedStory.locale,
          groupId: lastVisitedStory.groupId,
        },
        lastVisitedStory,
      }));
    },
    reset() {
      clearPersistedReaderSessionState();
      setState(DEFAULT_READER_SESSION_STATE);
    },
  };
}

type ReaderSessionContextValue = ReturnType<typeof useReaderSessionStore>;

const ReaderSessionContext = createContext<ReaderSessionContextValue | null>(null);

export function ReaderSessionProvider({ children }: { children: React.ReactNode }) {
  const value = useReaderSessionStore();

  return <ReaderSessionContext.Provider value={value}>{children}</ReaderSessionContext.Provider>;
}

export function useReaderSession() {
  const context = useContext(ReaderSessionContext);

  if (!context) {
    throw new Error("useReaderSession must be used within ReaderSessionProvider");
  }

  return context;
}
