import { READ_PROGRESS_STORAGE_KEY } from "@/features/read-progress/config/default-read-progress-state";
import type { ReadProgressState } from "@/features/read-progress/types";

export function readPersistedReadProgressState(): unknown | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(READ_PROGRESS_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function writePersistedReadProgressState(state: ReadProgressState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(READ_PROGRESS_STORAGE_KEY, JSON.stringify(state));
}
