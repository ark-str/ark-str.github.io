import { checklistItems, resourceManifest } from "@/features/harness/config/resource-manifest";
import type { WorkspaceState } from "@/features/harness/types";

export function toggleChecklistItem(state: WorkspaceState, itemId: string): WorkspaceState {
  return {
    ...state,
    checklist: {
      ...state.checklist,
      [itemId]: !state.checklist[itemId],
    },
  };
}

export function toggleResourceSelection(state: WorkspaceState, resourceId: string): WorkspaceState {
  const selected = new Set(state.selectedResourceIds);

  if (selected.has(resourceId)) {
    selected.delete(resourceId);
  } else {
    selected.add(resourceId);
  }

  return {
    ...state,
    selectedResourceIds: resourceManifest
      .map((item) => item.id)
      .filter((itemId) => selected.has(itemId)),
  };
}

export function updateGoal(state: WorkspaceState, goal: string): WorkspaceState {
  return {
    ...state,
    goal,
  };
}

export function updateNotes(state: WorkspaceState, notes: string): WorkspaceState {
  return {
    ...state,
    notes,
  };
}

export function getChecklistProgress(state: WorkspaceState) {
  const completed = checklistItems.filter((item) => state.checklist[item.id]).length;
  return {
    completed,
    total: checklistItems.length,
  };
}

export function formatSavedAt(isoString: string | null) {
  if (!isoString) {
    return "Not saved yet";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.valueOf())) {
    return "Saved timestamp unavailable";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
