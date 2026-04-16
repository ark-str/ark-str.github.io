import { notFound } from "next/navigation";
import { isReaderLocale } from "@/features/content/config/canonical-reader-locales";
import { ReaderRouteShell } from "@/features/reader/ui/reader-route-shell";

export default async function ReaderLocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isReaderLocale(locale)) {
    notFound();
  }

  return (
    <ReaderRouteShell
      description="Canonical locale archive navigation will be rendered here from the generated index contract."
      locale={locale}
      title="Locale archive"
    />
  );
}
