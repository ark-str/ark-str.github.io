import type { ChecklistItem, ResourceManifestItem } from "@/features/harness/types";

export const STORAGE_KEY = "ark-str:harness-workspace:v1";
export const WORKSPACE_VERSION = 1;

export const resourceManifest: ResourceManifestItem[] = [
  {
    id: "hero-copy",
    label: "Hero Copy Block",
    kind: "copy",
    description: "Primary landing-page message and product framing live in source control.",
    location: "src/features/harness/ui/harness-dashboard.tsx",
  },
  {
    id: "color-system",
    label: "Color Tokens",
    kind: "token",
    description: "The visual system is defined through CSS variables, not remote design tokens.",
    location: "src/app/globals.css",
  },
  {
    id: "layout-ornaments",
    label: "Layout Ornaments",
    kind: "media",
    description: "The page atmosphere is built with gradients and CSS shapes bundled with the app.",
    location: "src/features/harness/ui/harness-dashboard.module.css",
  },
  {
    id: "verification-flow",
    label: "Verification Flow",
    kind: "qa",
    description: "Mechanical checks and the Codex iteration harness are stored as local scripts.",
    location: "scripts/harness/",
  },
];

export const checklistItems: ChecklistItem[] = [
  {
    id: "bundled-only",
    label: "Bundled resources only",
    outcome: "No runtime fetches, CDNs, or Google Fonts remain in the app.",
  },
  {
    id: "local-persistence",
    label: "State persists locally",
    outcome: "Goal, notes, and checklist survive refresh through localStorage.",
  },
  {
    id: "mobile-ready",
    label: "Mobile-ready layout",
    outcome: "The single page stays readable on narrow screens.",
  },
  {
    id: "mechanical-verification",
    label: "Mechanical verification passes",
    outcome: "guards, typecheck, lint, and build are green.",
  },
];

export const defaultGoal =
  "Ship a self-contained single-page experience that an autonomous agent can extend safely.";

export const demoNotes = [
  "Replace starter defaults with product-specific copy and structure.",
  "Keep resource ownership visible inside the repository.",
  "Make verification one command so an agent can close the loop alone.",
].join("\n");
