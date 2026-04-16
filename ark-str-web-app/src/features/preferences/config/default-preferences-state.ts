import type { AppPreferencesState } from "@/features/preferences/types";

export const APP_PREFERENCES_STORAGE_KEY = "ark-str:app-preferences:v1";

export const DEFAULT_APP_PREFERENCES_STATE: AppPreferencesState = {
  theme: "light",
};
