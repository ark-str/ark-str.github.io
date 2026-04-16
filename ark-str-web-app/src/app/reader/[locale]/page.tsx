import { notFound } from "next/navigation";
import { isReaderLocale } from "@/features/content/config/canonical-reader-locales";
import {
  getGroupStories,
  getReaderLocaleStaticParams,
  getLocaleGroups,
  readContentIndex,
} from "@/features/content/service/read-content-index";
import { ReaderLocaleArchive } from "@/features/reader/ui/reader-locale-archive";

export const dynamicParams = false;

export function generateStaticParams() {
  return getReaderLocaleStaticParams();
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
    stories: getGroupStories(index, locale, group.groupId),
  }));

  return (
    <ReaderLocaleArchive groups={groups} locale={locale} />
  );
}
