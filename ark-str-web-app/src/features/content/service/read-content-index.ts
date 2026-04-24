import fs from "node:fs";
import path from "node:path";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";
import type {
  ContentIndex,
  ReaderHomeModel,
  ReaderLocale,
  StoryBlock,
  StoryDetail,
  SummaryManifest,
} from "@/features/content/types";
import {
  getLocaleGroups,
  getLocaleStories,
} from "@/features/content/config/content-index-selectors";
import {
  getBackgroundPathForBackgroundId,
  contentIndex,
  getPortraitPathForSpeakerId,
  getStoryDetailPath,
  summaryManifest,
} from "@/generated/content/registry";
export {
  findSummaryEntry,
  getGroupStories,
  getLocaleGroups,
  getLocaleStories,
  getLocaleStorylines,
} from "@/features/content/config/content-index-selectors";
export {
  buildLocaleSwitchHref,
  findGroupEntry,
  findStoryEntry,
  getReaderGroupHref,
  getReaderLocaleHref,
  getReaderStoryHref,
} from "@/features/content/config/reader-routes";

const homeRecommendationGroups = [
  {
    collectionId: "terra_notes",
    groupIds: ["main_7", "act18d0", "act8mini", "act33side", "main_14"],
  },
  {
    collectionId: "ancient_archive",
    groupIds: ["act17side", "act25side", "act15mini", "main_14", "act34side", "main_15", "act42side"],
  },
  {
    collectionId: "explore_behemoth",
    groupIds: ["act23side", "main_13", "act34side", "act46side"],
  },
  {
    collectionId: "explore_beast_lords",
    groupIds: ["act5d0", "act12d0", "act27side", "act35side", "act37side", "act38side"],
  },
];

function getConfiguredBasePath() {
  const configuredBasePath = process.env.ARK_STR_BASE_PATH?.trim() ?? "";
  return configuredBasePath.length > 0
    ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";
}

function getPublishedStoryDetailPath(relativePath: string) {
  return path.join(process.cwd(), "public", "generated", "content", relativePath);
}

export function resolvePublicAssetPath(publicPath: string | null): string | null {
  if (!publicPath) {
    return null;
  }

  return `${getConfiguredBasePath()}${publicPath}`;
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

  return resolvePublicAssetPath(portraitPath);
}

export function readBackgroundPathForBackgroundId(backgroundId: string | null): string | null {
  if (!backgroundId) {
    return null;
  }

  const backgroundPath = getBackgroundPathForBackgroundId(backgroundId);
  if (!backgroundPath) {
    return null;
  }

  return resolvePublicAssetPath(backgroundPath);
}

export function readStoryPortraitPaths(detail: StoryDetail | null): Record<string, string> {
  if (!detail) {
    return {};
  }

  const speakerIds = new Set<string>();

  const collectSpeakerIdsFromBlocks = (blocks: StoryBlock[]) => {
    for (const block of blocks) {
      if (block.type === "dialogue") {
        if (block.speakerId) {
          speakerIds.add(block.speakerId);
        }
        continue;
      }

      if (block.type === "choice") {
        for (const option of block.options) {
          collectSpeakerIdsFromBlocks(option.blocks);
        }
      }
    }
  };

  collectSpeakerIdsFromBlocks(detail.blocks);

  return Object.fromEntries(
    [...speakerIds].sort((left, right) => left.localeCompare(right)).flatMap((speakerId) => {
      const portraitPath = readPortraitPathForSpeakerId(speakerId);
      return portraitPath ? [[speakerId, portraitPath]] : [];
    }),
  );
}

export function readStoryBackgroundPaths(detail: StoryDetail | null): Record<string, string> {
  if (!detail) {
    return {};
  }

  const backgroundIds = new Set<string>();

  const collectBackgroundIdsFromBlocks = (blocks: StoryBlock[]) => {
    for (const block of blocks) {
      if (block.type === "background") {
        if (block.backgroundId) {
          backgroundIds.add(block.backgroundId);
        }
        continue;
      }

      if (block.type === "choice") {
        for (const option of block.options) {
          collectBackgroundIdsFromBlocks(option.blocks);
        }
      }
    }
  };

  collectBackgroundIdsFromBlocks(detail.blocks);

  return Object.fromEntries(
    [...backgroundIds].sort((left, right) => left.localeCompare(right)).flatMap((backgroundId) => {
      const backgroundPath = readBackgroundPathForBackgroundId(backgroundId);
      return backgroundPath ? [[backgroundId, backgroundPath]] : [];
    }),
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

export function readReaderHomeModel(): ReaderHomeModel {
  const index = readContentIndex();
  const krGroups = getLocaleGroups(index, "kr");

  return {
    locales: Object.entries(READER_LOCALE_LABELS).map(([locale, metadata]) => {
      const readerLocale = locale as ReaderLocale;
      const localeStories = getLocaleStories(index, readerLocale);
      const localeGroups = getLocaleGroups(index, readerLocale);
      const featuredStory = localeStories[0]
        ? {
            storyId: localeStories[0].storyId,
            groupId: localeStories[0].groupId,
            title: localeStories[0].title,
          }
        : null;
      const totalVisibleCharacterCount = localeGroups.reduce(
        (sum, group) => sum + group.totalVisibleCharacterCount,
        0,
      );
      const recommendationCollections = homeRecommendationGroups.map((collection) => ({
        collectionId: collection.collectionId,
        items: collection.groupIds.map((groupId) => {
          const group = localeGroups.find((item) => item.groupId === groupId) ?? null;
          const fallbackGroup = krGroups.find((item) => item.groupId === groupId) ?? null;

          return {
            groupId,
            title: group?.title ?? fallbackGroup?.title ?? groupId,
            storyCount: group?.storyCount ?? fallbackGroup?.storyCount ?? 0,
            totalVisibleCharacterCount:
              group?.totalVisibleCharacterCount ?? fallbackGroup?.totalVisibleCharacterCount ?? 0,
            estimatedMinutes: group?.estimatedMinutes ?? fallbackGroup?.estimatedMinutes ?? 0,
            backgroundImagePath: resolvePublicAssetPath(
              group?.backgroundImagePath ?? fallbackGroup?.backgroundImagePath ?? null,
            ),
            isAvailable: Boolean(group),
          };
        }),
      }));

      return {
        locale: readerLocale,
        label: metadata.label,
        description: metadata.description,
        groupCount: localeGroups.length,
        storyCount: localeStories.length,
        totalVisibleCharacterCount,
        featuredStory,
        recommendationCollections,
      };
    }),
  };
}

export function getReaderLocaleStaticParams(): Array<{ locale: ReaderLocale }> {
  return Object.keys(READER_LOCALE_LABELS).map((locale) => ({ locale: locale as ReaderLocale }));
}

export function getReaderGroupStaticParams(): Array<{
  locale: ReaderLocale;
  groupId: string;
}> {
  return readContentIndex().groups.map((group) => ({
    locale: group.server,
    groupId: group.groupId,
  }));
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
