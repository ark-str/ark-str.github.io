import type { ReaderSessionState } from "@/features/reader/types";

export const READER_SESSION_STORAGE_KEY = "ark-str:reader-session:v1";

export const DEFAULT_READER_SESSION_STATE: ReaderSessionState = {
  preferredLocale: "kr",
  lastVisitedGroup: null,
  lastVisitedStory: null,
};
