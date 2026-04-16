import { READER_SESSION_STORAGE_KEY } from "@/features/reader/config/default-reader-session-state";

export function readPersistedReaderSessionState(): unknown | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(READER_SESSION_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function writePersistedReaderSessionState(state: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(READER_SESSION_STORAGE_KEY, JSON.stringify(state));
}

export function clearPersistedReaderSessionState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(READER_SESSION_STORAGE_KEY);
}
