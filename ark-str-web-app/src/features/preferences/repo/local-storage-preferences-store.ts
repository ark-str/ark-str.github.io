import { APP_PREFERENCES_STORAGE_KEY } from "@/features/preferences/config/default-preferences-state";
import type { AppPreferencesState } from "@/features/preferences/types";

export function readPersistedAppPreferences(): unknown | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function writePersistedAppPreferences(state: AppPreferencesState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(state));
}
