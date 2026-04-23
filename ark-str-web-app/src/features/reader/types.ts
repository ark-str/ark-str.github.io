export type ReaderLocale = "cn" | "en" | "jp" | "kr" | "tw";

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
  nickName: string;
  lastVisitedGroup: LastVisitedGroup | null;
  lastVisitedStory: LastVisitedStory | null;
};
