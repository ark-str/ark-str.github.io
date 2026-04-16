import { DEFAULT_APP_PREFERENCES_STATE } from "@/features/preferences/config/default-preferences-state";
import type { AppPreferencesState } from "@/features/preferences/types";

export function normalizeAppPreferencesState(raw: unknown): AppPreferencesState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_APP_PREFERENCES_STATE;
  }

  const candidate = raw as Partial<AppPreferencesState>;

  return {
    theme:
      candidate.theme === "light" || candidate.theme === "dark"
        ? candidate.theme
        : DEFAULT_APP_PREFERENCES_STATE.theme,
  };
}
