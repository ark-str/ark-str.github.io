import Link from "next/link";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReaderLocale } from "@/features/content/types";
import type { ContentGroupEntry, ContentStoryIndexEntry } from "@/features/content/types";
import { getReaderStoryHref } from "@/features/content/config/reader-routes";

function formatMetric(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function ReaderGroupOverview({
  appBar,
  group,
  locale,
  stories,
}: {
  appBar: FloatingAppBarModel;
  group: ContentGroupEntry;
  locale: ReaderLocale;
  stories: ContentStoryIndexEntry[];
}) {
  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section className="grid gap-5">
          <div className="space-y-3">
            <Badge variant="accent" className="w-fit">
              Group overview
            </Badge>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight md:text-5xl">
              {group.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
              {group.entryType ?? "GROUP"}
              {group.actType ? ` · ${group.actType}` : ""}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3" data-testid="group-stats">
            <Card className="bg-[var(--surface)]/90">
              <CardHeader className="pb-3">
                <CardDescription>Stories</CardDescription>
                <CardTitle className="text-3xl">{formatMetric(group.storyCount)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-[var(--surface)]/90">
              <CardHeader className="pb-3">
                <CardDescription>Total visible characters</CardDescription>
                <CardTitle className="text-3xl">
                  {formatMetric(group.totalVisibleCharacterCount)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-[var(--surface)]/90">
              <CardHeader className="pb-3">
                <CardDescription>Estimated reading time</CardDescription>
                <CardTitle className="text-3xl">
                  약 {formatMetric(group.estimatedMinutes)}분
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </section>
      }
      testId="group-shell"
    >
      <section className="grid gap-4">
        {stories.map((story) => (
          <Card key={story.storyId} className="bg-[var(--surface)]/94">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                {story.storyCode ? <Badge variant="default">{story.storyCode}</Badge> : null}
                {story.avgTag ? <Badge variant="default">{story.avgTag}</Badge> : null}
              </div>
              <CardTitle className="text-3xl">{story.title}</CardTitle>
              <CardDescription>{story.stageId ?? story.storyId}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="grid gap-2 text-sm text-[var(--text-muted)] md:grid-cols-3">
                <span>{formatMetric(story.visibleCharacterCount)} chars</span>
                <span>약 {formatMetric(story.estimatedMinutes)}분</span>
                <span>{story.bodyAvailable ? "Bundled body ready" : "Body pending"}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] shadow-[var(--shadow-sm)] transition duration-[var(--motion-fast)] ease-out hover:-translate-y-px hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                  href={getReaderStoryHref(locale, story.groupId, story.storyId)}
                >
                  Open story
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </ReaderPageFrame>
  );
}
