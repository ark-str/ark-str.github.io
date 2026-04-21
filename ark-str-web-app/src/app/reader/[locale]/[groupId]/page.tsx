import { notFound } from "next/navigation";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
  isReaderLocale,
} from "@/features/content/config/canonical-reader-locales";
import {
  buildLocaleSwitchHref,
  findGroupEntry,
  getGroupStories,
  getReaderGroupStaticParams,
  getReaderLocaleHref,
  readContentIndex,
} from "@/features/content/service/read-content-index";
import { ReaderGroupOverview } from "@/features/reader/ui/reader-group-overview";

export const dynamicParams = false;

export function generateStaticParams() {
  return getReaderGroupStaticParams();
}

export default async function ReaderGroupPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string }>;
}) {
  const { groupId, locale } = await params;

  if (!isReaderLocale(locale)) {
    notFound();
  }

  const index = readContentIndex();
  const group = findGroupEntry(index, locale, groupId);
  if (!group) {
    notFound();
  }

  const stories = getGroupStories(index, locale, groupId);

  return (
    <ReaderGroupOverview
      appBar={{
        currentLocale: locale,
        localeOptions: CANONICAL_READER_LOCALES.map((targetLocale) => ({
          locale: targetLocale,
          label: READER_LOCALE_LABELS[targetLocale].label,
          href: buildLocaleSwitchHref(index, targetLocale, groupId),
        })),
        storyRootHref: getReaderLocaleHref(locale),
        groupCrumb: {
          label: group.title,
          href: null,
        },
        storySelect: null,
      }}
      group={group}
      locale={locale}
      stories={stories}
    />
  );
}
