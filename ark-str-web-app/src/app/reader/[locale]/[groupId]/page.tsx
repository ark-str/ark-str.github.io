import { notFound } from "next/navigation";
import { isReaderLocale } from "@/features/content/config/canonical-reader-locales";
import { getReaderGroupStaticParams } from "@/features/content/service/read-content-index";
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

  return <ReaderGroupOverview groupId={groupId} locale={locale} />;
}
