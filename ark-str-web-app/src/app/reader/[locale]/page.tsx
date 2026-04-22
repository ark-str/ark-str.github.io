import { notFound } from "next/navigation";
import {
  CANONICAL_READER_LOCALES,
  isReaderLocale,
} from "@/features/content/config/canonical-reader-locales";
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

  return <ReaderLocaleArchive locale={locale} />;
}
