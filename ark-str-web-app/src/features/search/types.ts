export type SearchPreparedStory<TStory> = {
  story: TStory;
  textLower: string;
};

export type SearchMatchRange = {
  end: number;
  start: number;
};

export type StorySearchResult<TStory> = {
  line: string;
  matchRanges: SearchMatchRange[];
  story: TStory;
};
