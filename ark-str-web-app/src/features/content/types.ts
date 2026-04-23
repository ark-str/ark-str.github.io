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
  backgroundImageId: string | null;
  backgroundImageAspect: "square" | "wide" | null;
  backgroundImagePath: string | null;
  storyCount: number;
  totalVisibleCharacterCount: number;
  estimatedMinutes: number;
};

export type ContentStorylineItemRole = "primary" | "reference";

export type ContentStorylineItem = {
  groupId: string;
  storySetId: string | null;
  locationId: string | null;
  locationType: string | null;
  role: ContentStorylineItemRole;
  sortKey: number;
  displayTitle: string;
};

export type ContentStorylineEntry = {
  server: ReaderLocale;
  storylineId: string;
  title: string;
  storylineType: string | null;
  sortKey: number;
  isSynthetic: boolean;
  primaryGroupCount: number;
  referenceCount: number;
  totalVisibleCharacterCount: number;
  estimatedMinutes: number;
  items: ContentStorylineItem[];
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
  visibleCharacterCount: number;
  estimatedMinutes: number;
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
  storylines: ContentStorylineEntry[];
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

export type AssetManifest = {
  portraits: Record<string, string>;
  backgrounds: Record<string, string>;
  groupBackgrounds: Record<string, string>;
};

export type DialogueBlock = {
  type: "dialogue";
  speakerName: string;
  speakerId: string | null;
  isRemote: boolean;
  text: string;
};

export type BackgroundBlock = {
  type: "background";
  backgroundId: string;
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
};

export type StoryBlock =
  | DialogueBlock
  | NarrationBlock
  | SceneBreakBlock
  | BackgroundBlock
  | ChoiceBlock;

export type ObservedOperator = {
  speakerId: string;
  aliases: string[];
};

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
  observedOperators: ObservedOperator[];
};

export type ReaderLocaleArchive = {
  locale: ReaderLocale;
  label: string;
  description: string;
  groupCount: number;
  storyCount: number;
  totalVisibleCharacterCount: number;
  featuredStory: {
    storyId: string;
    groupId: string;
    title: string;
  } | null;
  recommendationCollections: ReaderHomeRecommendationCollection[];
};

export type ReaderHomeRecommendationItem = {
  groupId: string;
  title: string;
  storyCount: number;
  totalVisibleCharacterCount: number;
  estimatedMinutes: number;
  backgroundImagePath: string | null;
  isAvailable: boolean;
};

export type ReaderHomeRecommendationCollection = {
  collectionId: string;
  items: ReaderHomeRecommendationItem[];
};

export type ReaderHomeModel = {
  locales: ReaderLocaleArchive[];
};
