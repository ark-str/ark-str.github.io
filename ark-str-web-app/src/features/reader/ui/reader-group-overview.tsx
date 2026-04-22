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

function getGroupHeroImageClassName(backgroundImageAspect: ContentGroupEntry["backgroundImageAspect"]) {
  return backgroundImageAspect === "square"
    ? "h-full w-full object-contain object-center p-8"
    : "h-full w-full object-cover object-center";
}

type GroupWithAssets = ContentGroupEntry & {
  backgroundImageHref: string | null;
};

export function ReaderGroupOverview({
  appBar,
  group,
  locale,
  stories,
}: {
  appBar: FloatingAppBarModel;
  group: GroupWithAssets;
  locale: ReaderLocale;
  stories: ContentStoryIndexEntry[];
}) {
  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section>
          <Card className="overflow-hidden border-[var(--border)] bg-[var(--surface)]/92 shadow-[var(--shadow-sm)]">
            <div
              className="relative aspect-[16/7] min-h-52 overflow-hidden bg-[var(--surface-muted)]"
              data-testid="group-hero-image"
            >
              {group.backgroundImageHref ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    aria-hidden="true"
                    className={getGroupHeroImageClassName(group.backgroundImageAspect)}
                    src={group.backgroundImageHref}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)]/88 via-[var(--surface)]/12 to-transparent" />
                </>
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_42%),linear-gradient(135deg,var(--surface-muted),var(--panel))]" />
              )}
            </div>
            <CardContent className="grid gap-5 p-5 md:p-7">
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent" className="w-fit">
                    Group overview
                  </Badge>
                  <Badge variant="default">{group.entryType ?? "GROUP"}</Badge>
                  {group.actType ? <Badge variant="default">{group.actType}</Badge> : null}
                </div>
                <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
                  {group.title}
                </h1>
              </div>
              <div className="grid gap-3 md:grid-cols-3" data-testid="group-stats">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Stories
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--text)]">
                    {formatMetric(group.storyCount)}
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Characters
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--text)]">
                    {formatMetric(group.totalVisibleCharacterCount)}
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Reading Time
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--text)]">
                    약 {formatMetric(group.estimatedMinutes)}분
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
