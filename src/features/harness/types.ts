export type ResourceKind = "copy" | "token" | "media" | "qa";

export type ResourceManifestItem = {
  id: string;
  label: string;
  kind: ResourceKind;
  description: string;
  location: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  outcome: string;
};

export type WorkspaceState = {
  version: number;
  goal: string;
  notes: string;
  selectedResourceIds: string[];
  checklist: Record<string, boolean>;
  lastSavedAt: string | null;
};
