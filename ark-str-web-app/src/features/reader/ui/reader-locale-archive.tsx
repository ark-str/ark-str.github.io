import Link from "next/link";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";
import { getReaderGroupHref } from "@/features/content/config/reader-routes";
import type {
  ContentGroupEntry,
  ContentStoryIndexEntry,
  ContentStorylineEntry,
  ContentStorylineItem,
  ReaderLocale,
} from "@/features/content/types";

type ArchiveGroup = ContentGroupEntry & {
  stories: ContentStoryIndexEntry[];
};

type ArchiveStorylineItem = ContentStorylineItem & {
  group: ArchiveGroup;
};

function formatMetric(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function getReferenceLabel(locationType: string | null) {
  if (locationType === "BEFORE") {
    return "Before";
  }

  if (locationType === "AFTER") {
    return "After";
  }

  return "Reference";
}

export function ReaderLocaleArchive({
  appBar,
  groups,
  locale,
  storylines,
}: {
  appBar: FloatingAppBarModel;
  locale: ReaderLocale;
  groups: ArchiveGroup[];
  storylines: ContentStorylineEntry[];
}) {
  const groupsById = new Map(groups.map((group) => [group.groupId, group]));
  const archiveStorylines = storylines
    .map((storyline) => ({
      ...storyline,
      items: storyline.items.flatMap((item): ArchiveStorylineItem[] => {
        const group = groupsById.get(item.groupId);
        return group ? [{ ...item, group }] : [];
      }),
    }))
    .filter((storyline) => storyline.items.length > 0);

  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="accent" className="w-fit">
              Locale archive
            </Badge>
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
              {READER_LOCALE_LABELS[locale].label}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
              locale archive는 group overview와 story reader의 출발점입니다.
            </p>
          </div>
          <Card className="min-w-48 bg-[var(--surface)]/90">
            <CardContent className="px-5 py-4 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Storylines
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{archiveStorylines.length}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{groups.length} groups</p>
            </CardContent>
          </Card>
        </section>
      }
      testId="reader-shell"
    >
      <section className="grid gap-6">
        {archiveStorylines.map((storyline) => {
          const primaryItems = storyline.items.filter((item) => item.role === "primary");
          const referenceItems = storyline.items.filter((item) => item.role === "reference");

          return (
            <Card
              key={storyline.storylineId}
              className="bg-[var(--surface)]/95"
              data-storyline-id={storyline.storylineId}
              data-testid="storyline-section"
            >
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={storyline.isSynthetic ? "default" : "accent"} className="w-fit">
                  {storyline.isSynthetic ? "Generated" : "Storyline"}
                </Badge>
                {storyline.storylineType ? <Badge variant="default">{storyline.storylineType}</Badge> : null}
              </div>
              <CardTitle className="text-3xl">{storyline.title}</CardTitle>
              <CardDescription>
                {primaryItems.length} groups · {referenceItems.length} flow references ·{" "}
                {formatMetric(storyline.totalVisibleCharacterCount)} chars · 약{" "}
                {formatMetric(storyline.estimatedMinutes)}분
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {primaryItems.map((item) => (
                  <Card
                    key={`${storyline.storylineId}:${item.groupId}`}
                    className="bg-[var(--panel)]"
                    data-group-id={item.groupId}
                    data-testid="storyline-primary-card"
                  >
                    <CardHeader>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {item.group.entryType ?? "GROUP"}
                      </p>
                      <CardTitle className="text-2xl">{item.group.title}</CardTitle>
                      <CardDescription>
                        {item.group.storyCount} stories{item.group.actType ? ` · ${item.group.actType}` : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          Group preview
                        </p>
                        {item.group.stories[0] ? (
                          <>
                            <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                              {item.group.stories[0].title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                              {formatMetric(item.group.totalVisibleCharacterCount)} chars · 약{" "}
                              {formatMetric(item.group.estimatedMinutes)}분
                            </p>
                          </>
                        ) : (
                          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                            아직 연결된 story가 없습니다.
                          </p>
                        )}
                      </div>
                      <Link
                        className="inline-flex w-fit items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] shadow-[var(--shadow-sm)] transition duration-[var(--motion-fast)] ease-out hover:-translate-y-px hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                        href={getReaderGroupHref(locale, item.group.groupId)}
                      >
                        Open group
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {referenceItems.length > 0 ? (
                <div
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                  data-testid="storyline-reference-list"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Flow references
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {referenceItems.map((item) => (
                      <Link
                        key={`${storyline.storylineId}:${item.locationId ?? item.groupId}:${item.groupId}`}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition duration-[var(--motion-fast)] ease-out hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                        data-testid="storyline-reference-link"
                        href={getReaderGroupHref(locale, item.group.groupId)}
                      >
                        <Badge variant="default">{getReferenceLabel(item.locationType)}</Badge>
                        <span>{item.displayTitle}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
          );
        })}
      </section>
    </ReaderPageFrame>
  );
}
