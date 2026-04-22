import { notFound } from "next/navigation";
import { isReaderLocale } from "@/features/content/config/canonical-reader-locales";
import { getReaderStoryStaticParams } from "@/features/content/service/read-content-index";
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

  return <ReaderStoryShell groupId={groupId} locale={locale} storyId={storyId} />;
}
