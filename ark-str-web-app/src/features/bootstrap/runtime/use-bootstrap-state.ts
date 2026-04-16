"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { DEFAULT_BOOTSTRAP_STATE } from "@/features/bootstrap/config/default-bootstrap-state";
import {
  clearPersistedBootstrapState,
  readPersistedBootstrapState,
  writePersistedBootstrapState,
} from "@/features/bootstrap/repo/local-storage-bootstrap-store";
import { normalizeBootstrapState } from "@/features/bootstrap/service/normalize-bootstrap-state";
import type { ReaderBootstrapState, ReaderLocale } from "@/features/bootstrap/types";

export function useBootstrapState() {
  const [state, setState] = useState<ReaderBootstrapState>(DEFAULT_BOOTSTRAP_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrateFromStorage = useEffectEvent(() => {
    const persisted = readPersistedBootstrapState();
    setState(normalizeBootstrapState(persisted));
    setIsHydrated(true);
  });

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writePersistedBootstrapState(state);
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
    setOnboardingAccepted(onboardingAccepted: boolean) {
      setState((current) => ({
        ...current,
        onboardingAccepted,
      }));
    },
    setNote(note: string) {
      setState((current) => ({
        ...current,
        note,
      }));
    },
    reset() {
      clearPersistedBootstrapState();
      setState(DEFAULT_BOOTSTRAP_STATE);
    },
  };
}
