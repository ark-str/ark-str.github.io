"use client";

import { createContext, useContext, useEffect, useEffectEvent, useState } from "react";
import { DEFAULT_APP_PREFERENCES_STATE } from "@/features/preferences/config/default-preferences-state";
import {
  readPersistedAppPreferences,
  writePersistedAppPreferences,
} from "@/features/preferences/repo/local-storage-preferences-store";
import { normalizeAppPreferencesState } from "@/features/preferences/service/normalize-preferences-state";
import type { AppTheme, AppPreferencesState } from "@/features/preferences/types";

function useAppPreferencesStore() {
  const [state, setState] = useState<AppPreferencesState>(DEFAULT_APP_PREFERENCES_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrateFromStorage = useEffectEvent(() => {
    const persisted = readPersistedAppPreferences();
    setState(normalizeAppPreferencesState(persisted));
    setIsHydrated(true);
  });

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writePersistedAppPreferences(state);
  }, [isHydrated, state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  return {
    state,
    isHydrated,
    setTheme(theme: AppTheme) {
      setState((current) => ({
        ...current,
        theme,
      }));
    },
    toggleTheme() {
      setState((current) => ({
        ...current,
        theme: current.theme === "light" ? "dark" : "light",
      }));
    },
  };
}

type AppPreferencesContextValue = ReturnType<typeof useAppPreferencesStore>;

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const value = useAppPreferencesStore();

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }

  return context;
}
