import Link from "next/link";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { DisclosureCard } from "@/components/ui/disclosure-card";
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
  backgroundImageHref: string | null;
  stories: ContentStoryIndexEntry[];
};

type ArchiveStorylineItem = ContentStorylineItem & {
  group: ArchiveGroup;
};

const OPERATOR_STORYLINE_ID = "synthetic_operator_narratives";

function formatMetric(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function getArchiveCardBackgroundClassName(backgroundImageAspect: ContentGroupEntry["backgroundImageAspect"]) {
  const sharedClassName =
    "absolute inset-0 h-full w-full transition duration-[var(--motion-fast)] ease-out group-hover:opacity-[0.38]";

  return backgroundImageAspect === "square"
    ? `${sharedClassName} object-contain p-5 opacity-[0.34] blur-[1px]`
    : `${sharedClassName} scale-105 object-cover opacity-[0.28] blur-[2px]`;
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
  const mainStorylines = archiveStorylines.filter(
    (storyline) => storyline.storylineId !== OPERATOR_STORYLINE_ID,
  );
  const operatorStoryline =
    archiveStorylines.find((storyline) => storyline.storylineId === OPERATOR_STORYLINE_ID) ?? null;

  const renderStorylineSummary = (storyline: (typeof archiveStorylines)[number]) => (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={storyline.isSynthetic ? "default" : "accent"} className="w-fit">
          {storyline.isSynthetic ? "Generated" : "Storyline"}
        </Badge>
        {storyline.storylineType ? <Badge variant="default">{storyline.storylineType}</Badge> : null}
      </div>
      <div className="space-y-2">
        <CardTitle className="text-2xl">{storyline.title}</CardTitle>
        <CardDescription>
          <span className="block">
            {storyline.primaryGroupCount} groups · {storyline.referenceCount} references
          </span>
          <span className="mt-1 block">
            {formatMetric(storyline.totalVisibleCharacterCount)} chars · 약{" "}
            {formatMetric(storyline.estimatedMinutes)}분
          </span>
        </CardDescription>
      </div>
    </div>
  );

  const renderStorylineItems = (storyline: (typeof archiveStorylines)[number]) =>
    storyline.items.map((item) => {
      const href = getReaderGroupHref(locale, item.group.groupId);

      if (item.role === "reference") {
        return (
          <Link
            key={`${storyline.storylineId}:${item.locationId ?? item.groupId}:${item.groupId}`}
            className="block rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] transition duration-[var(--motion-fast)] ease-out hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
            data-testid="storyline-reference-link"
            href={href}
          >
            {item.displayTitle}
          </Link>
        );
      }

      return (
        <Link
          key={`${storyline.storylineId}:${item.groupId}`}
          className="group relative grid min-h-28 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] p-4 text-[var(--text)] transition duration-[var(--motion-fast)] ease-out hover:-translate-y-px hover:border-[var(--accent)] hover:shadow-[var(--shadow-sm)]"
          data-group-id={item.groupId}
          data-testid="storyline-primary-card"
          href={href}
        >
          {item.group.backgroundImageHref ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                aria-hidden="true"
                className={getArchiveCardBackgroundClassName(item.group.backgroundImageAspect)}
                data-testid="storyline-primary-card-background"
                decoding="async"
                loading="lazy"
                src={item.group.backgroundImageHref}
              />
              <span className="absolute inset-0 bg-[var(--panel)]/72" aria-hidden="true" />
              <span className="absolute inset-0 bg-gradient-to-br from-[var(--panel)]/92 via-[var(--panel)]/60 to-[var(--accent-soft)]/35" aria-hidden="true" />
            </>
          ) : null}
          <span className="relative z-10 text-base font-semibold leading-6">{item.group.title}</span>
          <span className="relative z-10 grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:grid-cols-3 sm:gap-2">
            <span>{formatMetric(item.group.storyCount)} stories</span>
            <span>{formatMetric(item.group.totalVisibleCharacterCount)} chars</span>
            <span>약 {formatMetric(item.group.estimatedMinutes)}분</span>
          </span>
        </Link>
      );
    });

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
      <section className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="storyline-grid">
        {mainStorylines.map((storyline) => {
          return (
            <DisclosureCard
              key={storyline.storylineId}
              contentTestId="storyline-item-list"
              data-storyline-id={storyline.storylineId}
              data-testid="storyline-section"
              panelTestId="storyline-panel"
              summary={renderStorylineSummary(storyline)}
              toggleTestId="storyline-toggle"
            >
              {renderStorylineItems(storyline)}
            </DisclosureCard>
          );
        })}
      </section>

      {operatorStoryline ? (
        <section className="mt-2" data-testid="operator-storyline-section">
          <DisclosureCard
            contentClassName="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            contentTestId="storyline-item-grid"
            data-storyline-id={operatorStoryline.storylineId}
            data-testid="storyline-section"
            panelTestId="storyline-panel"
            summary={renderStorylineSummary(operatorStoryline)}
            toggleTestId="storyline-toggle"
          >
            {renderStorylineItems(operatorStoryline)}
          </DisclosureCard>
        </section>
      ) : null}
    </ReaderPageFrame>
  );
}
