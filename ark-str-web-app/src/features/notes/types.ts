export type StoryNoteLocale = "cn" | "en" | "jp" | "kr" | "tw";

export type StoryNoteEntry = {
  storyId: string;
  locale: StoryNoteLocale;
  groupId: string;
  storyTitle: string;
  groupTitle: string;
  text: string;
  updatedAt: string;
};

export type StoryNotesState = {
  notes: Record<string, StoryNoteEntry>;
};

export type StoryNoteDraft = {
  storyId: string;
  locale: StoryNoteLocale;
  groupId: string;
  storyTitle: string;
  groupTitle: string;
  text: string;
};
