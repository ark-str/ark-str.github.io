"use client";

import { STORAGE_KEY } from "@/features/harness/config/resource-manifest";
import {
  createDefaultWorkspaceState,
  normalizeWorkspaceState,
  SERVER_WORKSPACE_SNAPSHOT,
} from "./workspace-state";
import type { WorkspaceState } from "@/features/harness/types";

const listeners = new Set<() => void>();
let cachedWorkspaceState: WorkspaceState = SERVER_WORKSPACE_SNAPSHOT;
let hasLoadedWorkspaceState = false;

function emitWorkspaceChange() {
  for (const listener of listeners) {
    listener();
  }
}

function readWorkspaceStateFromStorage() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return normalizeSerializedWorkspaceState(rawValue);
  } catch {
    return createDefaultWorkspaceState();
  }
}

function normalizeSerializedWorkspaceState(rawValue: string | null) {
  if (!rawValue) {
    return createDefaultWorkspaceState();
  }

  try {
    return normalizeWorkspaceState(JSON.parse(rawValue) as unknown);
  } catch {
    return createDefaultWorkspaceState();
  }
}

function ensureWorkspaceStateLoaded() {
  if (!hasLoadedWorkspaceState && typeof window !== "undefined") {
    cachedWorkspaceState = readWorkspaceStateFromStorage();
    hasLoadedWorkspaceState = true;
  }

  return cachedWorkspaceState;
}

export function getWorkspaceSnapshot() {
  return ensureWorkspaceStateLoaded();
}

export function getWorkspaceServerSnapshot() {
  return SERVER_WORKSPACE_SNAPSHOT;
}

export function loadWorkspaceState() {
  return getWorkspaceSnapshot();
}

export function saveWorkspaceState(state: WorkspaceState) {
  const nextState = normalizeWorkspaceState(state);
  cachedWorkspaceState = nextState;
  hasLoadedWorkspaceState = true;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  emitWorkspaceChange();
  return nextState;
}

export function updateWorkspaceState(updater: (current: WorkspaceState) => WorkspaceState) {
  return saveWorkspaceState(updater(ensureWorkspaceStateLoaded()));
}

export function clearWorkspaceState() {
  cachedWorkspaceState = createDefaultWorkspaceState();
  hasLoadedWorkspaceState = true;
  window.localStorage.removeItem(STORAGE_KEY);
  emitWorkspaceChange();
  return cachedWorkspaceState;
}

export function subscribeWorkspaceState(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cachedWorkspaceState = normalizeSerializedWorkspaceState(event.newValue);
      hasLoadedWorkspaceState = true;
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}
