import { notFound } from "next/navigation";
import { isReaderLocale } from "@/features/content/config/canonical-reader-locales";
import {
  findGroupEntry,
  findStoryEntry,
  findSummaryEntry,
  getGroupStories,
  readContentIndex,
  readStoryDetail,
  readSummaryManifest,
} from "@/features/content/service/read-content-index";
import { ReaderStoryShell } from "@/features/reader/ui/reader-story-shell";

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

  const detail = story.bodyAvailable ? readStoryDetail(locale, storyId) : null;
  const summaryEntry = findSummaryEntry(readSummaryManifest(), locale, storyId);

  return (
    <ReaderStoryShell
      detail={detail}
      group={group}
      locale={locale}
      siblingStories={getGroupStories(index, locale, groupId)}
      story={story}
      summaryAvailable={summaryEntry?.status === "ready"}
    />
  );
}
