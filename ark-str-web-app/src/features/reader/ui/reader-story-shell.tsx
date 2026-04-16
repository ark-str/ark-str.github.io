import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReaderRouteShell } from "@/features/reader/ui/reader-route-shell";
import { ReaderVisitTracker } from "@/features/reader/ui/reader-visit-tracker";
import { StoryBodyRenderer } from "@/features/reader/ui/story-body-renderer";
import type {
  ContentGroupEntry,
  ContentStoryIndexEntry,
  ReaderLocale,
  StoryDetail,
} from "@/features/content/types";

export function ReaderStoryShell({
  detail,
  group,
  locale,
  story,
  summaryAvailable,
  siblingStories,
}: {
  locale: ReaderLocale;
  group: ContentGroupEntry;
  story: ContentStoryIndexEntry;
  detail: StoryDetail | null;
  siblingStories: ContentStoryIndexEntry[];
  summaryAvailable: boolean;
}) {
  const isBodyAvailable = story.bodyAvailable && detail;

  return (
    <ReaderRouteShell
      description="왼쪽 탐색, 중앙 본문, 오른쪽 summary rail의 기본 구조를 reader-shell 단계에서 먼저 엽니다."
      eyebrow="Story route"
      locale={locale}
      title={story.title}
    >
      <ReaderVisitTracker
        story={{
          locale,
          groupId: story.groupId,
          storyId: story.storyId,
          title: story.title,
        }}
      />

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="grid gap-4">
          <Card className="bg-[var(--surface)]/94">
            <CardHeader>
              <Badge variant="default" className="w-fit">
                Group
              </Badge>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>
                {group.storyCount} stories in this archive group.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {siblingStories.map((entry) => (
                <Link
                  key={entry.storyId}
                  className={`rounded-[var(--radius-md)] border px-3 py-3 text-sm transition duration-[var(--motion-fast)] ease-out ${
                    entry.storyId === story.storyId
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      : "border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]"
                  }`}
                  href={`/reader/${locale}/${entry.groupId}/${entry.storyId}`}
                >
                  <span className="block font-semibold">{entry.title}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {entry.storyCode ?? entry.storyId}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="grid gap-4">
          <Card className="bg-[var(--surface)]/95">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                {story.storyCode ? <Badge variant="default">{story.storyCode}</Badge> : null}
                <Badge variant="default">{story.storyId}</Badge>
              </div>
              <CardTitle className="font-[var(--font-display)] text-4xl">{story.title}</CardTitle>
              <CardDescription>
                {story.avgTag ? `${story.avgTag} · ` : ""}
                {story.sourcePath}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isBodyAvailable ? (
                <StoryBodyRenderer blocks={detail.blocks} />
              ) : (
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 text-sm leading-7 text-[var(--text-muted)]">
                  이 스토리는 generated body JSON이 아직 준비되지 않았습니다. source manifest에는
                  등록되어 있지만 본문 파일이 비어 있거나 미해결 상태입니다.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="grid gap-4">
          <Card className="bg-[var(--surface)]/94">
            <CardHeader>
              <Badge variant="default" className="w-fit">
                Summary
              </Badge>
              <CardTitle>Story summary rail</CardTitle>
              <CardDescription>
                summary generation issue가 열리기 전까지는 explicit empty state를 유지합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryAvailable ? (
                <p className="text-sm leading-7 text-[var(--text)]">
                  summary contract is marked available, but summary rendering is not implemented in
                  this issue.
                </p>
              ) : (
                <div
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4 text-sm leading-7 text-[var(--text-muted)]"
                  data-testid="summary-empty-state"
                >
                  이 스토리의 summary는 아직 생성되지 않았습니다. 후속 파이프라인 이슈에서
                  summary와 character unlock fact가 추가됩니다.
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </section>
    </ReaderRouteShell>
  );
}
