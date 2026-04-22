import { notFound } from "next/navigation";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
  isReaderLocale,
} from "@/features/content/config/canonical-reader-locales";
import {
  buildLocaleSwitchHref,
  getGroupStories,
  getReaderLocaleHref,
  getLocaleGroups,
  getLocaleStorylines,
  readContentIndex,
  resolvePublicAssetPath,
} from "@/features/content/service/read-content-index";
import { ReaderLocaleArchive } from "@/features/reader/ui/reader-locale-archive";

export const dynamicParams = false;

export function generateStaticParams() {
  return CANONICAL_READER_LOCALES.map((locale) => ({ locale }));
}

export default async function ReaderLocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isReaderLocale(locale)) {
    notFound();
  }

  const index = readContentIndex();
  if (!index) {
    notFound();
  }

  const groups = getLocaleGroups(index, locale).map((group) => ({
    ...group,
    backgroundImageHref: resolvePublicAssetPath(group.backgroundImagePath),
    stories: getGroupStories(index, locale, group.groupId),
  }));
  const storylines = getLocaleStorylines(index, locale);

  return (
    <ReaderLocaleArchive
      appBar={{
        currentLocale: locale,
        localeOptions: CANONICAL_READER_LOCALES.map((targetLocale) => ({
          locale: targetLocale,
          label: READER_LOCALE_LABELS[targetLocale].label,
          href: buildLocaleSwitchHref(index, targetLocale),
        })),
        storyRootHref: getReaderLocaleHref(locale),
        groupCrumb: null,
        storySelect: null,
      }}
      groups={groups}
      locale={locale}
      storylines={storylines}
    />
  );
}
