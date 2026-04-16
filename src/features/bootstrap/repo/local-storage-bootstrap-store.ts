import { BOOTSTRAP_STORAGE_KEY } from "@/features/bootstrap/config/default-bootstrap-state";
import type { ReaderBootstrapState } from "@/features/bootstrap/types";

export function readPersistedBootstrapState(): unknown | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(BOOTSTRAP_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function writePersistedBootstrapState(state: ReaderBootstrapState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BOOTSTRAP_STORAGE_KEY, JSON.stringify(state));
}

export function clearPersistedBootstrapState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BOOTSTRAP_STORAGE_KEY);
}
