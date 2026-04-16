"use client";

import { startTransition, useSyncExternalStore } from "react";
import {
  formatSavedAt,
  getChecklistProgress,
  toggleChecklistItem,
  toggleResourceSelection,
  updateGoal,
  updateNotes,
} from "@/features/harness/service/harness-state";
import {
  clearWorkspaceState,
  getWorkspaceServerSnapshot,
  getWorkspaceSnapshot,
  saveWorkspaceState,
  subscribeWorkspaceState,
  updateWorkspaceState,
} from "@/features/harness/repo/local-storage-workspace-repo";
import {
  createDemoWorkspaceState,
  withSavedTimestamp,
} from "@/features/harness/repo/workspace-state";
import type { WorkspaceState } from "@/features/harness/types";

export function useHarnessWorkspace() {
  const workspace = useSyncExternalStore(
    subscribeWorkspaceState,
    getWorkspaceSnapshot,
    getWorkspaceServerSnapshot,
  );

  const persist = (updater: (current: WorkspaceState) => WorkspaceState) => {
    updateWorkspaceState((current) => withSavedTimestamp(updater(current)));
  };

  return {
    workspace,
    savedLabel: formatSavedAt(workspace.lastSavedAt),
    progress: getChecklistProgress(workspace),
    setGoal: (goal: string) => persist((current) => updateGoal(current, goal)),
    setNotes: (notes: string) => persist((current) => updateNotes(current, notes)),
    toggleChecklist: (itemId: string) => persist((current) => toggleChecklistItem(current, itemId)),
    toggleResource: (resourceId: string) =>
      persist((current) => toggleResourceSelection(current, resourceId)),
    seedDemo: () =>
      startTransition(() => {
        saveWorkspaceState(withSavedTimestamp(createDemoWorkspaceState()));
      }),
    reset: () =>
      startTransition(() => {
        clearWorkspaceState();
      }),
  };
}
