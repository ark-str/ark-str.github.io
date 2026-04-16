import fs from "node:fs";
import path from "node:path";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";
import type {
  ContentGroupEntry,
  ContentIndex,
  ContentStoryIndexEntry,
  ReaderHomeModel,
  ReaderLocale,
  StoryDetail,
  SummaryManifest,
  SummaryManifestEntry,
} from "@/features/content/types";
import {
  contentIndex,
  getPortraitPathForSpeakerId,
  getStoryDetailPath,
  summaryManifest,
} from "@/generated/content/registry";

function getConfiguredBasePath() {
  const configuredBasePath = process.env.ARK_STR_BASE_PATH?.trim() ?? "";
  return configuredBasePath.length > 0
    ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";
}

function getPublishedStoryDetailPath(relativePath: string) {
  return path.join(process.cwd(), "public", "generated", "content", relativePath);
}

export function readContentIndex(): ContentIndex {
  return contentIndex as ContentIndex;
}

export function readSummaryManifest(): SummaryManifest {
  return summaryManifest as SummaryManifest;
}

export function readPortraitPathForSpeakerId(speakerId: string | null): string | null {
  if (!speakerId) {
    return null;
  }

  const portraitPath = getPortraitPathForSpeakerId(speakerId);
  if (!portraitPath) {
    return null;
  }

  return `${getConfiguredBasePath()}${portraitPath}`;
}

export function readStoryPortraitPaths(detail: StoryDetail | null): Record<string, string> {
  if (!detail) {
    return {};
  }

  return Object.fromEntries(
    detail.observedOperators.flatMap((observedOperator) => {
      const portraitPath = readPortraitPathForSpeakerId(observedOperator.speakerId);
      return portraitPath ? [[observedOperator.speakerId, portraitPath]] : [];
    }),
  );
}

export function getLocaleGroups(index: ContentIndex, locale: ReaderLocale): ContentGroupEntry[] {
  return index.groups.filter((group) => group.server === locale);
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

export function findGroupEntry(
  index: ContentIndex,
  locale: ReaderLocale,
  groupId: string,
): ContentGroupEntry | null {
  return index.groups.find((group) => group.server === locale && group.groupId === groupId) ?? null;
}

export function findStoryEntry(
  index: ContentIndex,
  locale: ReaderLocale,
  groupId: string,
  storyId: string,
): ContentStoryIndexEntry | null {
  return (
    index.stories.find(
      (story) =>
        story.server === locale && story.groupId === groupId && story.storyId === storyId,
    ) ?? null
  );
}

export async function readStoryDetail(
  locale: ReaderLocale,
  storyId: string,
): Promise<StoryDetail | null> {
  const storyDetailPath = getStoryDetailPath(locale, storyId);

  if (!storyDetailPath) {
    return null;
  }

  try {
    return JSON.parse(
      fs.readFileSync(getPublishedStoryDetailPath(storyDetailPath), "utf8"),
    ) as StoryDetail;
  } catch {
    return null;
  }
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

export function readReaderHomeModel(): ReaderHomeModel {
  const index = readContentIndex();

  return {
    locales: Object.entries(READER_LOCALE_LABELS).map(([locale, metadata]) => {
      const localeStories = getLocaleStories(index, locale as ReaderLocale);
      const localeGroups = getLocaleGroups(index, locale as ReaderLocale);
      const featuredStory = localeStories[0]
        ? {
            storyId: localeStories[0].storyId,
            groupId: localeStories[0].groupId,
            title: localeStories[0].title,
          }
        : null;

      return {
        locale: locale as ReaderLocale,
        label: metadata.label,
        description: metadata.description,
        groupCount: localeGroups.length,
        storyCount: localeStories.length,
        featuredStory,
      };
    }),
  };
}

export function getReaderLocaleStaticParams(): Array<{ locale: ReaderLocale }> {
  return Object.keys(READER_LOCALE_LABELS).map((locale) => ({ locale: locale as ReaderLocale }));
}

export function getReaderStoryStaticParams(): Array<{
  locale: ReaderLocale;
  groupId: string;
  storyId: string;
}> {
  return readContentIndex().stories.map((story) => ({
    locale: story.server,
    groupId: story.groupId,
    storyId: story.storyId,
  }));
}
