import {
  checklistItems,
  defaultGoal,
  demoNotes,
  resourceManifest,
  WORKSPACE_VERSION,
} from "@/features/harness/config/resource-manifest";
import type { WorkspaceState } from "@/features/harness/types";

function createChecklistState() {
  return Object.fromEntries(checklistItems.map((item) => [item.id, false]));
}

function buildDefaultWorkspaceState(): WorkspaceState {
  return {
    version: WORKSPACE_VERSION,
    goal: defaultGoal,
    notes: "",
    selectedResourceIds: resourceManifest.map((item) => item.id),
    checklist: createChecklistState(),
    lastSavedAt: null,
  };
}

export const SERVER_WORKSPACE_SNAPSHOT = buildDefaultWorkspaceState();

export function createDefaultWorkspaceState(): WorkspaceState {
  return buildDefaultWorkspaceState();
}

export function createDemoWorkspaceState(): WorkspaceState {
  return {
    ...buildDefaultWorkspaceState(),
    notes: demoNotes,
  };
}

export function normalizeWorkspaceState(value: unknown): WorkspaceState {
  const defaults = createDefaultWorkspaceState();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const candidate = value as Partial<WorkspaceState>;
  const checklist = createChecklistState();

  if (candidate.checklist && typeof candidate.checklist === "object") {
    for (const item of checklistItems) {
      checklist[item.id] = candidate.checklist[item.id] === true;
    }
  }

  const hasSelectedResourceIds = Array.isArray(candidate.selectedResourceIds);
  const selectedSet = new Set(hasSelectedResourceIds ? candidate.selectedResourceIds : []);
  const selectedResourceIds = hasSelectedResourceIds
    ? resourceManifest.map((item) => item.id).filter((resourceId) => selectedSet.has(resourceId))
    : defaults.selectedResourceIds;

  return {
    version: WORKSPACE_VERSION,
    goal: typeof candidate.goal === "string" ? candidate.goal : defaults.goal,
    notes: typeof candidate.notes === "string" ? candidate.notes : defaults.notes,
    selectedResourceIds,
    checklist,
    lastSavedAt:
      typeof candidate.lastSavedAt === "string" ? candidate.lastSavedAt : defaults.lastSavedAt,
  };
}

export function withSavedTimestamp(state: WorkspaceState): WorkspaceState {
  return {
    ...state,
    lastSavedAt: new Date().toISOString(),
  };
}
