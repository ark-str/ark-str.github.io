import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentGroupEntry, ContentStoryIndexEntry, ReaderLocale } from "@/features/content/types";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";

function ReaderRouteShell({
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

export function ReaderLocaleArchive({
  groups,
  locale,
}: {
  locale: ReaderLocale;
  groups: Array<
    ContentGroupEntry & {
      stories: ContentStoryIndexEntry[];
    }
  >;
}) {
  return (
    <ReaderRouteShell
      description="Generated index contract를 기준으로 그룹과 대표 story deep link를 바로 열 수 있습니다."
      eyebrow="Locale archive"
      locale={locale}
      title="Browse story groups"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.groupId} className="bg-[var(--surface)]/95">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {group.entryType ?? "GROUP"}
              </p>
              <CardTitle className="font-[var(--font-display)] text-3xl">{group.title}</CardTitle>
              <CardDescription>
                {group.storyCount} stories{group.actType ? ` · ${group.actType}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  First story
                </p>
                {group.stories[0] ? (
                  <>
                    <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                      {group.stories[0].title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                      {group.stories[0].storyCode ?? group.stories[0].storyId}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    아직 연결된 story가 없습니다.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {group.stories[0] ? (
                  <Link
                    className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] shadow-[var(--shadow-sm)] transition duration-[var(--motion-fast)] ease-out hover:-translate-y-px hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                    href={`/reader/${locale}/${group.groupId}/${group.stories[0].storyId}`}
                  >
                    Open first story
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </ReaderRouteShell>
  );
}
