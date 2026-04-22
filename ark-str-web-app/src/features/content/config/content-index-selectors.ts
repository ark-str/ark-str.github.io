import type {
  ContentGroupEntry,
  ContentIndex,
  ContentStoryIndexEntry,
  ContentStorylineEntry,
  ReaderLocale,
  SummaryManifest,
  SummaryManifestEntry,
} from "@/features/content/types";

export function getLocaleGroups(index: ContentIndex, locale: ReaderLocale): ContentGroupEntry[] {
  return index.groups.filter((group) => group.server === locale);
}

export function getLocaleStorylines(index: ContentIndex, locale: ReaderLocale): ContentStorylineEntry[] {
  return index.storylines.filter((storyline) => storyline.server === locale);
}

export function getLocaleStories(index: ContentIndex, locale: ReaderLocale): ContentStoryIndexEntry[] {
  return index.stories.filter((story) => story.server === locale);
}

export function getGroupStories(
  index: ContentIndex,
  locale: ReaderLocale,
  groupId: string,
): ContentStoryIndexEntry[] {
  return index.stories.filter((story) => story.server === locale && story.groupId === groupId);
}

export function findSummaryEntry(
  summaryManifestValue: SummaryManifest | null,
  locale: ReaderLocale,
  storyId: string,
): SummaryManifestEntry | null {
  if (!summaryManifestValue) {
    return null;
  }

  return (
    summaryManifestValue.items.find((item) => item.server === locale && item.storyId === storyId) ?? null
  );
}
