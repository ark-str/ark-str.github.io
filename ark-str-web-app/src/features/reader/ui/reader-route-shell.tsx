import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";
import type { ReaderLocale } from "@/features/content/types";

export function ReaderRouteShell({
  locale,
  eyebrow,
  title,
  description,
  children,
}: {
  locale: ReaderLocale;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-8 text-[var(--text)] md:px-8 lg:px-12"
      data-testid="reader-shell"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="accent">{eyebrow}</Badge>
          <h1 className="font-[var(--font-display)] text-4xl leading-tight md:text-5xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
            {description}
          </p>
        </div>
        <Card className="min-w-44 bg-[var(--surface)]/94">
          <CardContent className="px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Locale archive
            </p>
            <p className="mt-2 text-lg font-semibold">{READER_LOCALE_LABELS[locale].label}</p>
            <Link className="mt-3 inline-block text-sm text-[var(--accent)]" href="/">
              Back to home
            </Link>
          </CardContent>
        </Card>
      </div>

      {children}
    </main>
  );
}
