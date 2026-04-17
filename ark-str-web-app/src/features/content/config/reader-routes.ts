import type { ContentIndex, ReaderLocale } from "@/features/content/types";

export function getReaderLocaleHref(locale: ReaderLocale) {
  return `/reader/${locale}`;
}

export function getReaderGroupHref(locale: ReaderLocale, groupId: string) {
  return `/reader/${locale}/${groupId}`;
}

export function getReaderStoryHref(locale: ReaderLocale, groupId: string, storyId: string) {
  return `/reader/${locale}/${groupId}/${storyId}`;
}

export function findGroupEntry(index: ContentIndex, locale: ReaderLocale, groupId: string) {
  return index.groups.find((group) => group.server === locale && group.groupId === groupId) ?? null;
}

export function findStoryEntry(
  index: ContentIndex,
  locale: ReaderLocale,
  groupId: string,
  storyId: string,
) {
  return (
    index.stories.find(
      (story) =>
        story.server === locale && story.groupId === groupId && story.storyId === storyId,
    ) ?? null
  );
}

export function buildLocaleSwitchHref(
  index: ContentIndex,
  targetLocale: ReaderLocale,
  currentGroupId?: string | null,
  currentStoryId?: string | null,
) {
  if (currentGroupId && currentStoryId) {
    if (findStoryEntry(index, targetLocale, currentGroupId, currentStoryId)) {
      return getReaderStoryHref(targetLocale, currentGroupId, currentStoryId);
    }
  }

  if (currentGroupId) {
    if (findGroupEntry(index, targetLocale, currentGroupId)) {
      return getReaderGroupHref(targetLocale, currentGroupId);
    }
  }

  return getReaderLocaleHref(targetLocale);
}
