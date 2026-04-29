import { DEFAULT_APP_PREFERENCES_STATE } from "@/features/preferences/config/default-preferences-state";
import type { AppPreferencesState } from "@/features/preferences/types";

export function normalizeAppPreferencesState(raw: unknown): AppPreferencesState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_APP_PREFERENCES_STATE;
  }

  const candidate = raw as Partial<AppPreferencesState>;

  return {
    googleAiStudioApiKey:
      typeof candidate.googleAiStudioApiKey === "string"
        ? candidate.googleAiStudioApiKey.trim().slice(0, 256)
        : DEFAULT_APP_PREFERENCES_STATE.googleAiStudioApiKey,
    theme:
      candidate.theme === "light" || candidate.theme === "dark"
        ? candidate.theme
        : DEFAULT_APP_PREFERENCES_STATE.theme,
  };
}
