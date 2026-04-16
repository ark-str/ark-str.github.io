import { notFound } from "next/navigation";
import { isReaderLocale } from "@/features/content/config/canonical-reader-locales";
import { ReaderRouteShell } from "@/features/reader/ui/reader-route-shell";

export default async function ReaderStoryPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string; storyId: string }>;
}) {
  const { groupId, locale, storyId } = await params;

  if (!isReaderLocale(locale)) {
    notFound();
  }

  return (
    <ReaderRouteShell
      description={`Story route scaffold for ${groupId}/${storyId}. The next milestone will bind generated story detail JSON here.`}
      locale={locale}
      title="Story reader"
    />
  );
}
