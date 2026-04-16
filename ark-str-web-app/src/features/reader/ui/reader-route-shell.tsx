import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";
import type { ReaderLocale } from "@/features/content/types";

export function ReaderRouteShell({
  locale,
  title,
  description,
  children,
}: {
  locale: ReaderLocale;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="accent">Reader shell</Badge>
          <h1 className="font-[var(--font-display)] text-4xl leading-tight text-[var(--text)] md:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
            {description}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-right shadow-[var(--shadow-sm)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Locale</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text)]">
            {READER_LOCALE_LABELS[locale].label}
          </p>
        </div>
      </div>

      <Card className="bg-[var(--surface)]/95">
        <CardHeader>
          <CardTitle>Archive route is live</CardTitle>
          <CardDescription>
            This route is now reserved for canonical locale story browsing. The next milestone
            fills it with generated navigation and story detail rendering.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] shadow-[var(--shadow-sm)] transition duration-[var(--motion-fast)] ease-out hover:-translate-y-px hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
            href="/"
          >
            Back to home
          </Link>
          <span className="text-sm text-[var(--text-muted)]">
            Selected locale route: <code>{locale}</code>
          </span>
        </CardContent>
      </Card>

      {children}
    </main>
  );
}
