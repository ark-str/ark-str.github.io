import type { ReaderLocale } from "@/features/content/types";

export type LastVisitedGroup = {
  locale: ReaderLocale;
  groupId: string;
};

export type LastVisitedStory = LastVisitedGroup & {
  storyId: string;
  title: string;
};

export type ReaderSessionState = {
  preferredLocale: ReaderLocale;
  lastVisitedGroup: LastVisitedGroup | null;
  lastVisitedStory: LastVisitedStory | null;
};
