export type ReaderLocale = "cn" | "en" | "jp" | "kr" | "tw";

export type ContentReadinessSnapshot = {
  serverCount: number;
  storyCount: number;
  summaryMissingCount: number;
  generatedAt: string | null;
};

export type ContentVendorSummary = {
  server: string;
  groupCount: number;
  storyCount: number;
  inputHashes: Record<string, string>;
};

export type ContentGroupEntry = {
  server: ReaderLocale;
  groupId: string;
  title: string;
  entryType: string | null;
  actType: string | null;
  startTime: number | null;
  endTime: number | null;
  storyCount: number;
};

export type ContentStoryIndexEntry = {
  server: ReaderLocale;
  storyId: string;
  groupId: string;
  stageId: string | null;
  title: string;
  sortKey: number;
  sourcePath: string;
  sourceHash: string;
  sourceExists: boolean;
  sourceBasis: "file" | "metadata";
  storyCode: string | null;
  avgTag: string | null;
  bodyPath: string | null;
  bodyAvailable: boolean;
};

export type ContentIndex = {
  generatedAt: string;
  vendor: {
    source: string;
    submodulePath: string;
    submoduleSha: string | null;
    servers: ContentVendorSummary[];
  };
  groups: ContentGroupEntry[];
  stories: ContentStoryIndexEntry[];
};

export type SummaryManifestEntry = {
  server: ReaderLocale;
  storyId: string;
  sourceHash: string;
  status: "missing" | "ready" | "stale";
};

export type SummaryManifest = {
  generatedAt: string;
  vendor: {
    submoduleSha: string | null;
  };
  items: SummaryManifestEntry[];
};

export type DialogueBlock = {
  type: "dialogue";
  speakerName: string;
  text: string;
  portraitKey: string | null;
};

export type NarrationBlock = {
  type: "narration";
  text: string;
};

export type SceneBreakBlock = {
  type: "sceneBreak";
};

export type ChoiceOption = {
  value: string;
  label: string;
  blocks: StoryBlock[];
};

export type ChoiceBlock = {
  type: "choice";
  options: ChoiceOption[];
  sharedBlocks: StoryBlock[];
};

export type StoryBlock = DialogueBlock | NarrationBlock | SceneBreakBlock | ChoiceBlock;

export type StoryDetail = {
  server: ReaderLocale;
  storyId: string;
  groupId: string;
  stageId: string | null;
  title: string;
  storyCode: string | null;
  avgTag: string | null;
  sourcePath: string;
  sourceHash: string;
  bodyAvailable: boolean;
  blocks: StoryBlock[];
};

export type ReaderLocaleArchive = {
  locale: ReaderLocale;
  label: string;
  description: string;
  groupCount: number;
  storyCount: number;
  featuredStory: {
    storyId: string;
    groupId: string;
    title: string;
  } | null;
};

export type ReaderHomeModel = {
  locales: ReaderLocaleArchive[];
};
