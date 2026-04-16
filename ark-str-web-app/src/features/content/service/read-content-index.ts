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

function getGeneratedPath(fileName: string) {
  return path.join(process.cwd(), "public", "generated", "content", fileName);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function readContentIndex(): ContentIndex | null {
  const indexPath = getGeneratedPath("index.json");

  if (!fs.existsSync(indexPath)) {
    return null;
  }

  try {
    return readJson<ContentIndex>(indexPath);
  } catch {
    return null;
  }
}

export function readSummaryManifest(): SummaryManifest | null {
  const summaryManifestPath = getGeneratedPath(path.join("status", "summary-manifest.json"));

  if (!fs.existsSync(summaryManifestPath)) {
    return null;
  }

  try {
    return readJson<SummaryManifest>(summaryManifestPath);
  } catch {
    return null;
  }
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

export function readStoryDetail(
  locale: ReaderLocale,
  storyId: string,
): StoryDetail | null {
  const detailPath = getGeneratedPath(path.join("stories", locale, `${storyId}.json`));

  if (!fs.existsSync(detailPath)) {
    return null;
  }

  try {
    return readJson<StoryDetail>(detailPath);
  } catch {
    return null;
  }
}

export function findSummaryEntry(
  summaryManifest: SummaryManifest | null,
  locale: ReaderLocale,
  storyId: string,
): SummaryManifestEntry | null {
  if (!summaryManifest) {
    return null;
  }

  return (
    summaryManifest.items.find((item) => item.server === locale && item.storyId === storyId) ?? null
  );
}

export function readReaderHomeModel(): ReaderHomeModel {
  const index = readContentIndex();

  if (!index) {
    return { locales: [] };
  }

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
