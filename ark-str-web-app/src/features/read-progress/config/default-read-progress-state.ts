import type { ReadProgressState } from "@/features/read-progress/types";

export const READ_PROGRESS_STORAGE_KEY = "ark-str:read-progress:v1";

export const DEFAULT_READ_PROGRESS_STATE: ReadProgressState = {
  readStories: {},
};
