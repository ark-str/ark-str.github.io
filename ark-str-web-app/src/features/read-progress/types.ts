export type ReadStoryEntry = {
  storyId: string;
  readAt: string;
};

export type ReadProgressState = {
  readStories: Record<string, ReadStoryEntry>;
};
