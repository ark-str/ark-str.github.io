"use client";

import Link from "next/link";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { DisclosureCard } from "@/components/ui/disclosure-card";
import { LoadingStateCard } from "@/components/ui/loading-indicator";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
} from "@/features/content/config/canonical-reader-locales";
import { getReaderGroupHref, getReaderLocaleHref } from "@/features/content/config/reader-routes";
import {
  getGroupStories,
  getLocaleGroups,
  getLocaleStorylines,
} from "@/features/content/config/content-index-selectors";
import type {
  ContentGroupEntry,
  ContentStoryIndexEntry,
  ContentStorylineEntry,
  ContentStorylineItem,
  ReaderLocale,
} from "@/features/content/types";
import { getUiCopy } from "@/features/i18n/config/ui-copy";
import { formatUiMinutes, formatUiNumber } from "@/features/i18n/service/format-ui";
import { resolveRuntimePublicPath, useContentIndex } from "@/features/content/runtime/use-public-content";

type ArchiveGroup = ContentGroupEntry & {
  backgroundImageHref: string | null;
  stories: ContentStoryIndexEntry[];
};

type ArchiveStorylineItem = ContentStorylineItem & {
  group: ArchiveGroup;
};

const OPERATOR_STORYLINE_ID = "synthetic_operator_narratives";

function getArchiveCardBackgroundClassName(backgroundImageAspect: ContentGroupEntry["backgroundImageAspect"]) {
  const sharedClassName =
    "absolute inset-0 h-full w-full transition duration-[var(--motion-fast)] ease-out group-hover:opacity-[0.78]";

  return backgroundImageAspect === "square"
    ? `${sharedClassName} object-contain p-5 opacity-75 blur-[0.5px]`
    : `${sharedClassName} scale-105 object-cover opacity-70 blur-[1px]`;
}

function createArchiveAppBar(locale: ReaderLocale): FloatingAppBarModel {
  return {
    currentLocale: locale,
    groupCrumb: null,
    localeOptions: CANONICAL_READER_LOCALES.map((targetLocale) => ({
      href: getReaderLocaleHref(targetLocale),
      label: READER_LOCALE_LABELS[targetLocale].label,
      locale: targetLocale,
    })),
    storyRootHref: getReaderLocaleHref(locale),
    storySelect: null,
  };
}

export function ReaderLocaleArchive({ locale }: { locale: ReaderLocale }) {
  const indexState = useContentIndex();
  const appBar = createArchiveAppBar(locale);
  const copy = getUiCopy(locale);
  const index = indexState.data;
  const groups: ArchiveGroup[] = index
    ? getLocaleGroups(index, locale).map((group) => ({
        ...group,
        backgroundImageHref: resolveRuntimePublicPath(group.backgroundImagePath),
        stories: getGroupStories(index, locale, group.groupId),
      }))
    : [];
  const storylines: ContentStorylineEntry[] = index ? getLocaleStorylines(index, locale) : [];
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
          {storyline.isSynthetic ? copy.archive.generated : copy.archive.storyline}
        </Badge>
        {storyline.storylineType ? <Badge variant="default">{storyline.storylineType}</Badge> : null}
      </div>
      <div className="space-y-2">
        <CardTitle className="text-2xl">
          {copy.archive.syntheticTitles[storyline.storylineId] ?? storyline.title}
        </CardTitle>
        <CardDescription>
          <span className="block">
            {formatUiNumber(locale, storyline.primaryGroupCount)} {copy.common.groups} ·{" "}
            {formatUiNumber(locale, storyline.referenceCount)} {copy.archive.references}
          </span>
          <span className="mt-1 block">
            {formatUiNumber(locale, storyline.totalVisibleCharacterCount)} {copy.common.chars} ·{" "}
            {formatUiMinutes(locale, storyline.estimatedMinutes)}
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
          className="group relative grid min-h-28 content-start gap-0 overflow-hidden rounded-[var(--radius-md)] border border-white/10 bg-black/80 p-5 text-white transition duration-[var(--motion-fast)] ease-out hover:-translate-y-px hover:border-[var(--accent)] hover:shadow-[var(--shadow-sm)]"
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
              <span className="absolute inset-0 bg-black/36" aria-hidden="true" />
              <span className="absolute inset-0 bg-gradient-to-br from-black/78 via-black/34 to-black/10" aria-hidden="true" />
            </>
          ) : null}
          <span
            className="relative z-10 mb-4 text-base font-semibold leading-6 text-white drop-shadow-md"
            data-testid="storyline-primary-card-title"
          >
            {item.group.title}
          </span>
          <span
            className="relative z-10 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white/80"
            data-testid="storyline-primary-card-metrics"
          >
            <span className="inline-flex h-6 items-center rounded-full border border-white/15 bg-black/35 px-2.5">
              {formatUiNumber(locale, item.group.storyCount)} {copy.common.stories}
            </span>
            <span className="inline-flex h-6 items-center rounded-full border border-white/15 bg-black/35 px-2.5">
              {formatUiNumber(locale, item.group.totalVisibleCharacterCount)} {copy.common.chars}
            </span>
            <span className="inline-flex h-6 items-center rounded-full border border-white/15 bg-black/35 px-2.5">
              {formatUiMinutes(locale, item.group.estimatedMinutes)}
            </span>
          </span>
        </Link>
      );
    });

  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-2">
            <Badge variant="accent" className="w-fit">
              {copy.archive.localeArchive}
            </Badge>
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
              {READER_LOCALE_LABELS[locale].label}
            </h1>
          </div>
          <Card
            className="min-w-48 justify-self-end bg-[var(--surface)]/90"
            data-testid="archive-storylines-card"
          >
            <CardContent className="px-5 py-4 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {copy.archive.storylines}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{archiveStorylines.length}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {formatUiNumber(locale, groups.length)} {copy.common.groups}
              </p>
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

      {indexState.status === "loading" || indexState.status === "idle" ? (
        <LoadingStateCard className="bg-[var(--surface)]/90" label={copy.status.contentIndexLoading} />
      ) : null}

      {indexState.status === "error" ? (
        <Card className="border-[var(--danger-border)] bg-[var(--surface)]/90">
          <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
            {copy.status.contentIndexError(indexState.error.message)}
          </CardContent>
        </Card>
      ) : null}
    </ReaderPageFrame>
  );
}
