import { notFound } from "next/navigation";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
  isReaderLocale,
} from "@/features/content/config/canonical-reader-locales";
import {
  buildLocaleSwitchHref,
  findGroupEntry,
  findStoryEntry,
  findSummaryEntry,
  getGroupStories,
  getReaderGroupHref,
  getReaderLocaleHref,
  getReaderStoryStaticParams,
  getReaderStoryHref,
  readStoryBackgroundPaths,
  readContentIndex,
  readStoryPortraitPaths,
  readStoryDetail,
  readSummaryManifest,
} from "@/features/content/service/read-content-index";
import { ReaderStoryShell } from "@/features/reader/ui/reader-story-shell";

export const dynamicParams = false;

export function generateStaticParams() {
  return getReaderStoryStaticParams();
}

export default async function ReaderStoryPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string; storyId: string }>;
}) {
  const { groupId, locale, storyId } = await params;

  if (!isReaderLocale(locale)) {
    notFound();
  }

  const index = readContentIndex();
  if (!index) {
    notFound();
  }

  const group = findGroupEntry(index, locale, groupId);
  const story = findStoryEntry(index, locale, groupId, storyId);

  if (!group || !story) {
    notFound();
  }

  const detail = story.bodyAvailable ? await readStoryDetail(locale, storyId) : null;
  const backgroundPaths = readStoryBackgroundPaths(detail);
  const portraitPaths = readStoryPortraitPaths(detail);
  const summaryEntry = findSummaryEntry(readSummaryManifest(), locale, storyId);
  const siblingStories = getGroupStories(index, locale, groupId);

  return (
    <ReaderStoryShell
      appBar={{
        currentLocale: locale,
        localeOptions: CANONICAL_READER_LOCALES.map((targetLocale) => ({
          locale: targetLocale,
          label: READER_LOCALE_LABELS[targetLocale].label,
          href: buildLocaleSwitchHref(index, targetLocale, groupId, storyId),
        })),
        storyRootHref: getReaderLocaleHref(locale),
        groupCrumb: {
          label: group.title,
          href: getReaderGroupHref(locale, groupId),
        },
        storySelect: {
          currentStoryId: story.storyId,
          options: siblingStories.map((entry) => ({
            storyId: entry.storyId,
            label: [entry.storyCode, entry.title, entry.avgTag].filter(Boolean).join(" · "),
            href: getReaderStoryHref(locale, entry.groupId, entry.storyId),
          })),
        },
      }}
      detail={detail}
      backgroundPaths={backgroundPaths}
      group={group}
      locale={locale}
      portraitPaths={portraitPaths}
      siblingStories={siblingStories}
      story={story}
      summaryAvailable={summaryEntry?.status === "ready"}
    />
  );
}
