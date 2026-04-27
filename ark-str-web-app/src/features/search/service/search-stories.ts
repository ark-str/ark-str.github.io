import type { ContentSearchStoryEntry } from "@/features/content/types";
import type { SearchMatchRange, SearchPreparedStory, StorySearchResult } from "@/features/search/types";

export const INITIAL_VISIBLE_SEARCH_RESULT_COUNT = 40;
export const SEARCH_RESULT_INCREMENT = 40;
export const SEARCH_QUERY_URL_DEBOUNCE_MS = 250;

export function normalizeSearchQuery(value: string) {
  return value.trim();
}

export function prepareSearchStories(stories: ContentSearchStoryEntry[]): SearchPreparedStory<ContentSearchStoryEntry>[] {
  return stories.map((story) => ({
    story,
    textLower: story.text.toLocaleLowerCase(),
  }));
}

export function getSearchMatchRanges(value: string, query: string): SearchMatchRange[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (normalizedQuery.length === 0) {
    return [];
  }

  const valueLower = value.toLocaleLowerCase();
  const queryLower = normalizedQuery.toLocaleLowerCase();
  const ranges: SearchMatchRange[] = [];
  let searchIndex = 0;

  while (searchIndex < valueLower.length) {
    const matchIndex = valueLower.indexOf(queryLower, searchIndex);
    if (matchIndex === -1) {
      break;
    }

    ranges.push({
      end: matchIndex + normalizedQuery.length,
      start: matchIndex,
    });
    searchIndex = matchIndex + Math.max(1, queryLower.length);
  }

  return ranges;
}

function getMatchedLine(text: string, matchIndex: number) {
  const lineStart = text.lastIndexOf("\n", matchIndex) + 1;
  const rawLineEnd = text.indexOf("\n", matchIndex);
  const lineEnd = rawLineEnd === -1 ? text.length : rawLineEnd;

  return text.slice(lineStart, lineEnd);
}

export function searchStories(
  preparedStories: SearchPreparedStory<ContentSearchStoryEntry>[],
  query: string,
): StorySearchResult<ContentSearchStoryEntry>[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (normalizedQuery.length === 0) {
    return [];
  }

  const queryLower = normalizedQuery.toLocaleLowerCase();
  const results: StorySearchResult<ContentSearchStoryEntry>[] = [];

  for (const preparedStory of preparedStories) {
    const matchIndex = preparedStory.textLower.indexOf(queryLower);
    if (matchIndex === -1) {
      continue;
    }

    const line = getMatchedLine(preparedStory.story.text, matchIndex);
    results.push({
      line,
      matchRanges: getSearchMatchRanges(line, normalizedQuery),
      story: preparedStory.story,
    });
  }

  return results;
}
