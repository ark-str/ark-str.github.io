import type { ReadProgressState } from "@/features/read-progress/types";

export function setStoryReadState(
  state: ReadProgressState,
  storyId: string,
  isRead: boolean,
): ReadProgressState {
  const normalizedStoryId = storyId.trim().slice(0, 240);
  if (normalizedStoryId.length === 0) {
    return state;
  }

  if (!isRead) {
    if (!state.readStories[normalizedStoryId]) {
      return state;
    }

    const readStories = { ...state.readStories };
    delete readStories[normalizedStoryId];

    return {
      readStories,
    };
  }

  return {
    readStories: {
      ...state.readStories,
      [normalizedStoryId]: {
        storyId: normalizedStoryId,
        readAt: new Date().toISOString(),
      },
    },
  };
}
