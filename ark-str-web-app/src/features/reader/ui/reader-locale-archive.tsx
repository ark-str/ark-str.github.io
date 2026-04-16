import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReaderRouteShell } from "@/features/reader/ui/reader-route-shell";
import type { ContentGroupEntry, ContentStoryIndexEntry, ReaderLocale } from "@/features/content/types";

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
