import Link from "next/link";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";
import { getReaderGroupHref } from "@/features/content/config/reader-routes";
import type { ContentGroupEntry, ContentStoryIndexEntry, ReaderLocale } from "@/features/content/types";

export function ReaderLocaleArchive({
  appBar,
  groups,
  locale,
}: {
  appBar: FloatingAppBarModel;
  locale: ReaderLocale;
  groups: Array<
    ContentGroupEntry & {
      stories: ContentStoryIndexEntry[];
    }
  >;
}) {
  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="accent" className="w-fit">
              Locale archive
            </Badge>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight md:text-5xl">
              {READER_LOCALE_LABELS[locale].label}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
              locale archive는 group overview와 story reader의 출발점입니다.
            </p>
          </div>
          <Card className="min-w-48 bg-[var(--surface)]/90">
            <CardContent className="px-5 py-4 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Groups</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{groups.length}</p>
            </CardContent>
          </Card>
        </section>
      }
      testId="reader-shell"
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
                  Group preview
                </p>
                {group.stories[0] ? (
                  <>
                    <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                      {group.stories[0].title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                      {group.totalVisibleCharacterCount.toLocaleString("ko-KR")} chars · 약{" "}
                      {group.estimatedMinutes.toLocaleString("ko-KR")}분
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    아직 연결된 story가 없습니다.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] shadow-[var(--shadow-sm)] transition duration-[var(--motion-fast)] ease-out hover:-translate-y-px hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                  href={getReaderGroupHref(locale, group.groupId)}
                >
                  Open group
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </ReaderPageFrame>
  );
}
