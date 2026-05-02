"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  LibraryBig,
} from "lucide-react";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { appChromeIconPath } from "@/lib/public-path";
import { getUiCopy, type UiCopy } from "@/features/i18n/config/ui-copy";
import { formatUiNumber } from "@/features/i18n/service/format-ui";
import type {
  ContentReadinessSnapshot,
  ReaderHomeModel,
  ReaderHomeRecommendationCollection,
  ReaderHomeRecommendationItem,
  ReaderLocale,
} from "@/features/content/types";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";

function buildStoryHref(
  locale: ReaderLocale,
  groupId: string,
  storyId: string,
) {
  return `/reader/${locale}/${groupId}/${storyId}`;
}

function buildGroupHref(locale: ReaderLocale, groupId: string) {
  return `/reader/${locale}/${groupId}`;
}

function RecommendationItemCard({
  copy,
  item,
  locale,
}: {
  copy: UiCopy["home"];
  item: ReaderHomeRecommendationItem;
  locale: ReaderLocale;
}) {
  const content = (
    <>
      {item.backgroundImagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src={item.backgroundImagePath}
        />
      ) : null}
      <div className="absolute inset-0 bg-(--image-overlay)" />
      <div className="relative z-10 flex min-h-40 flex-col justify-between gap-5 p-5 text-(--image-text)">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-balance text-xl font-semibold leading-tight tracking-[-0.03em] [font-family:var(--font-display)]">
              {item.title}
            </h3>
            {item.isAvailable ? (
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" />
            ) : null}
          </div>
          {!item.isAvailable ? (
            <Badge className="border-(--image-muted) bg-transparent text-(--image-muted)">
              {copy.missing}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-(--image-muted)">
          <span className="rounded-sm border border-(--image-muted) px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
            {formatUiNumber(locale, item.storyCount)} {copy.stories}
          </span>
          <span className="rounded-sm border border-(--image-muted) px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
            {formatUiNumber(locale, item.totalVisibleCharacterCount)} {copy.chars}
          </span>
          <span className="rounded-sm border border-(--image-muted) px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
            {formatUiNumber(locale, item.estimatedMinutes)} {copy.minutes}
          </span>
        </div>
      </div>
    </>
  );

  if (!item.isAvailable) {
    return (
      <article className="relative overflow-hidden rounded-lg border border-(--border) opacity-70">
        {content}
      </article>
    );
  }

  return (
    <Link
      className="relative overflow-hidden rounded-lg border border-(--border) shadow-(--shadow-sm) transition duration-(--motion-fast) ease-out hover:-translate-y-1 hover:border-(--accent) hover:shadow-(--shadow-md)"
      href={buildGroupHref(locale, item.groupId)}
    >
      {content}
    </Link>
  );
}

function RecommendationCollection({
  collection,
  copy,
  locale,
}: {
  collection: ReaderHomeRecommendationCollection;
  copy: UiCopy["home"];
  locale: ReaderLocale;
}) {
  return (
    <section
      className="grid gap-4"
      data-testid="home-recommendation-collection"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground [font-family:var(--font-display)]">
          {(copy.collections as Record<string, string>)[
            collection.collectionId
          ] ?? collection.collectionId}
        </h3>
        <Badge variant="default">
          {formatUiNumber(locale, collection.items.length)} {copy.trails}
        </Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {collection.items.map((item) => (
          <RecommendationItemCard
            key={item.groupId}
            copy={copy}
            item={item}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--panel) p-5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--text-muted)">
        {label}
      </dt>
      <dd className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground [font-family:var(--font-display)]">
        {value}
      </dd>
    </div>
  );
}

export function BootstrapHome({
  homeModel,
  readiness,
}: {
  homeModel: ReaderHomeModel;
  readiness: ContentReadinessSnapshot;
}) {
  const { isHydrated, setNickName, state } = useReaderSession();
  const currentLocale = state.preferredLocale;
  const copy = getUiCopy(currentLocale).home;
  const currentArchive =
    homeModel.locales.find((locale) => locale.locale === currentLocale) ??
    homeModel.locales[0] ??
    null;
  const archiveHref = `/reader/${currentLocale}`;
  const continueHref = state.lastVisitedStory
    ? buildStoryHref(
        state.lastVisitedStory.locale,
        state.lastVisitedStory.groupId,
        state.lastVisitedStory.storyId,
      )
    : currentArchive?.featuredStory
      ? buildStoryHref(
          currentArchive.locale,
          currentArchive.featuredStory.groupId,
          currentArchive.featuredStory.storyId,
        )
      : archiveHref;
  const continueStoryTitle =
    state.lastVisitedStory?.title ??
    currentArchive?.featuredStory?.title ??
    currentArchive?.label ??
    currentLocale;

  return (
    <ReaderPageFrame
      appBar={{
        currentLocale: null,
        localeOptions: homeModel.locales.map((locale) => ({
          locale: locale.locale,
          label: locale.label,
          href: null,
        })),
        storyRootHref: archiveHref,
        groupCrumb: null,
        storySelect: null,
      }}
      header={
        <section
          className="relative flex min-h-136 items-center justify-center overflow-hidden"
          data-testid="home-hero"
        >
          <div className="relative z-10 mx-auto grid w-full max-w-xl justify-items-center gap-5 px-4 text-center">
            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.05em] text-foreground [font-family:var(--font-display)] md:text-6xl">
              {copy.namePrompt}
            </h1>
            <input
              className="h-14 w-full rounded-md border border-(--border) bg-(--surface)/86 px-4 text-center text-xl font-semibold tracking-[-0.02em] text-foreground shadow-(--shadow-sm) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--ring)"
              data-testid="nickname-input"
              disabled={!isHydrated}
              maxLength={24}
              onChange={(event) => setNickName(event.target.value)}
              placeholder={copy.namePlaceholder}
              value={state.nickName}
            />
            <Link
              className={cn(
                buttonVariants({ variant: "accent", size: "lg" }),
                "h-auto min-h-16 min-w-60 flex-col gap-1 px-7 py-4",
              )}
              data-testid="continue-reading-link"
              href={continueHref}
            >
              <span className="inline-flex items-center gap-2">
                {copy.continueReading}
                <ArrowRight className="h-4 w-4" />
              </span>
              <span className="max-w-52 truncate text-xs font-semibold opacity-80">
                {continueStoryTitle}
              </span>
            </Link>
          </div>
        </section>
      }
      testId="bootstrap-shell"
    >
      <section className="grid gap-6">
        <Card
          className="home-full-bleed relative overflow-hidden rounded-none border-x-0 bg-(--surface)/94"
          data-testid="service-intro-section"
        >
          <CardContent className="grid justify-items-center gap-5 px-5 py-10 text-center md:px-8 lg:px-12">
            <div className="grid justify-items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm border border-(--border) bg-(--panel)">
                <span
                  aria-hidden="true"
                  className="h-11 w-11 bg-(--accent)"
                  data-testid="service-intro-icon"
                  style={{
                    WebkitMask: `url(${appChromeIconPath}) center / contain no-repeat`,
                    mask: `url(${appChromeIconPath}) center / contain no-repeat`,
                  }}
                />
              </span>
              <h2 className="text-4xl font-semibold tracking-[-0.05em] text-foreground [font-family:var(--font-display)]">
                {copy.serviceTitle}
              </h2>
            </div>
            <p className="max-w-3xl text-lg leading-9 text-(--text-muted)">
              {copy.serviceIntro}
            </p>
          </CardContent>
        </Card>

        <Card className="mt-32 bg-(--surface)/94" data-testid="home-recommendations">
          <CardHeader className="gap-3">
            <div className="flex items-center gap-3">
              <LibraryBig className="h-5 w-5 text-(--accent)" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--accent-strong)">
                {copy.recommendationEyebrow}
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-8">
            {currentArchive?.recommendationCollections.map((collection) => (
              <RecommendationCollection
                key={collection.collectionId}
                collection={collection}
                copy={copy}
                locale={currentArchive.locale}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="bg-(--surface)/94" data-testid="readiness-panel">
          <CardHeader className="gap-3">
            <div className="flex items-center gap-3">
              <ChartNoAxesColumnIncreasing className="h-5 w-5 text-(--accent)" />
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.2em] text-(--accent-strong)">
                {copy.statsTitle}
              </CardTitle>
            </div>
            <CardDescription>
              {copy.generatedAt}
              {readiness.generatedAt ? ` · ${readiness.generatedAt}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 md:grid-cols-3">
              <StatCard
                label={copy.groups}
                value={formatUiNumber(currentLocale, currentArchive?.groupCount ?? 0)}
              />
              <StatCard
                label={copy.stories}
                value={formatUiNumber(currentLocale, currentArchive?.storyCount ?? 0)}
              />
              <StatCard
                label={copy.chars}
                value={formatUiNumber(currentLocale, currentArchive?.totalVisibleCharacterCount ?? 0)}
              />
            </dl>
            <div className="sr-only">
              <span data-testid="server-count">{readiness.serverCount}</span>
              <span data-testid="story-count">
                {currentArchive?.storyCount ?? 0}
              </span>
              <span data-testid="summary-missing-count">
                {readiness.summaryMissingCount}
              </span>
            </div>
          </CardContent>
        </Card>

      </section>
    </ReaderPageFrame>
  );
}
