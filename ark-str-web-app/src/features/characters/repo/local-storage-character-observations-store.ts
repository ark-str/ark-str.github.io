import type { CharacterObservationsState } from "@/features/characters/types";
import { CHARACTER_OBSERVATIONS_STORAGE_KEY } from "@/features/characters/config/default-character-observations-state";

export function readPersistedCharacterObservationsState(): unknown | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(CHARACTER_OBSERVATIONS_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function writePersistedCharacterObservationsState(state: CharacterObservationsState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHARACTER_OBSERVATIONS_STORAGE_KEY, JSON.stringify(state));
}
