"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingStateCard } from "@/components/ui/loading-indicator";
import { StoryClassificationBadges } from "@/components/ui/story-classification-badges";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
} from "@/features/content/config/canonical-reader-locales";
import {
  buildLocaleSwitchHref,
  findGroupEntry,
  getReaderGroupHref,
  getReaderLocaleHref,
  getReaderStoryHref,
} from "@/features/content/config/reader-routes";
import {
  getGroupStories,
  getLocaleGroups,
  getLocaleStorylines,
} from "@/features/content/config/content-index-selectors";
import type {
  ContentGroupEntry,
  ContentIndex,
  ContentStorylineItem,
  ContentStorylineItemRole,
  ReaderLocale,
} from "@/features/content/types";
import { getUiCopy } from "@/features/i18n/config/ui-copy";
import { formatUiMinutes, formatUiNumber } from "@/features/i18n/service/format-ui";
import { useReadProgress } from "@/features/read-progress/runtime/read-progress-context";
import { resolveRuntimePublicPath, useContentIndex } from "@/features/content/runtime/use-public-content";
import { cn } from "@/lib/utils";

const GROUP_FLOW_ITEM_LIMIT = 24;

function getGroupHeroImageClassName(backgroundImageAspect: ContentGroupEntry["backgroundImageAspect"]) {
  return backgroundImageAspect === "square"
    ? "h-full w-full object-contain object-center p-8"
    : "h-full w-full object-cover object-center";
}

function getFlowCardImageClassName(backgroundImageAspect: ContentGroupEntry["backgroundImageAspect"]) {
  return backgroundImageAspect === "square"
    ? "absolute inset-0 h-full w-full object-contain object-center p-5 opacity-75 blur-[0.5px]"
    : "absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-70 blur-[1px]";
}

type GroupWithAssets = ContentGroupEntry & {
  backgroundImageHref: string | null;
};

type GroupFlowItem = {
  backgroundImageAspect: ContentGroupEntry["backgroundImageAspect"];
  backgroundImageHref: string | null;
  displayTitle: string;
  groupId: string;
  href: string;
  isCurrent: boolean;
  itemKey: string;
  role: ContentStorylineItemRole;
};

function selectGroupFlowItems(items: ContentStorylineItem[], currentGroupId: string): ContentStorylineItem[] {
  if (items.length <= GROUP_FLOW_ITEM_LIMIT) {
    return items;
  }

  const currentIndex = items.findIndex((item) => item.groupId === currentGroupId);
  if (currentIndex < 0) {
    return items.slice(0, GROUP_FLOW_ITEM_LIMIT);
  }

  const beforeCount = Math.floor((GROUP_FLOW_ITEM_LIMIT - 1) / 2);
  const start = Math.max(0, Math.min(currentIndex - beforeCount, items.length - GROUP_FLOW_ITEM_LIMIT));

  return items.slice(start, start + GROUP_FLOW_ITEM_LIMIT);
}

function createGroupAppBar({
  group,
  groupId,
  index,
  locale,
}: {
  group: ContentGroupEntry | null;
  groupId: string;
  index: ContentIndex | null;
  locale: ReaderLocale;
}): FloatingAppBarModel {
  return {
    currentLocale: locale,
    groupCrumb: {
      href: getReaderGroupHref(locale, group?.groupId ?? groupId),
      label: group?.title ?? groupId,
    },
    localeOptions: CANONICAL_READER_LOCALES.map((targetLocale) => ({
      href: index
        ? buildLocaleSwitchHref(index, targetLocale, groupId)
        : getReaderLocaleHref(targetLocale),
      label: READER_LOCALE_LABELS[targetLocale].label,
      locale: targetLocale,
    })),
    storyRootHref: getReaderLocaleHref(locale),
    storySelect: null,
  };
}

function buildGroupFlowItems({
  group,
  groupId,
  groupsById,
  locale,
  primaryItems,
}: {
  group: ContentGroupEntry;
  groupId: string;
  groupsById: Map<string, ContentGroupEntry>;
  locale: ReaderLocale;
  primaryItems: ContentStorylineItem[] | null;
}): GroupFlowItem[] {
  const selectedStorylineItems = primaryItems
    ? selectGroupFlowItems(primaryItems, groupId)
    : [
        {
          displayTitle: group.title,
          groupId,
          locationId: null,
          locationType: null,
          role: "primary" as const,
          sortKey: 0,
          storySetId: null,
        },
      ];

  return selectedStorylineItems.flatMap((item, index) => {
    const itemGroup = groupsById.get(item.groupId);
    if (!itemGroup) {
      return [];
    }

    return [
      {
        backgroundImageAspect: itemGroup.backgroundImageAspect,
        backgroundImageHref: resolveRuntimePublicPath(itemGroup.backgroundImagePath),
        displayTitle: item.displayTitle || itemGroup.title,
        groupId: item.groupId,
        href: getReaderGroupHref(locale, item.groupId),
        isCurrent: item.groupId === groupId,
        itemKey: `${item.locationId ?? item.storySetId ?? item.groupId}:${item.role}:${index}`,
        role: item.role,
      },
    ];
  });
}

function ReaderGroupStatus({
  appBar,
  isLoading = false,
  message,
}: {
  appBar: FloatingAppBarModel;
  isLoading?: boolean;
  message: string;
}) {
  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section>
          {isLoading ? (
            <LoadingStateCard className="bg-[var(--surface)]/90" label={message} />
          ) : (
            <Card className="bg-[var(--surface)]/90">
              <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
                {message}
              </CardContent>
            </Card>
          )}
        </section>
      }
      testId="group-shell"
    >
      <span />
    </ReaderPageFrame>
  );
}

export function ReaderGroupOverview({ groupId, locale }: { groupId: string; locale: ReaderLocale }) {
  const indexState = useContentIndex();
  const readProgress = useReadProgress();
  const index = indexState.data;
  const group = index ? findGroupEntry(index, locale, groupId) : null;
  const appBar = createGroupAppBar({ group, groupId, index, locale });
  const copy = getUiCopy(locale);

  if (indexState.status === "loading" || indexState.status === "idle") {
    return <ReaderGroupStatus appBar={appBar} isLoading message={copy.status.contentIndexLoading} />;
  }

  if (indexState.status === "error") {
    return (
      <ReaderGroupStatus
        appBar={appBar}
        message={copy.status.contentIndexError(indexState.error.message)}
      />
    );
  }

  if (!index || !group) {
    return <ReaderGroupStatus appBar={appBar} message={copy.group.missing} />;
  }

  const stories = getGroupStories(index, locale, groupId);
  const groupsById = new Map(getLocaleGroups(index, locale).map((item) => [item.groupId, item]));
  const primaryStoryline =
    getLocaleStorylines(index, locale).find((storyline) =>
      storyline.items.some((item) => item.role === "primary" && item.groupId === groupId),
    ) ?? null;
  const groupWithAssets: GroupWithAssets = {
    ...group,
    backgroundImageHref: resolveRuntimePublicPath(group.backgroundImagePath),
  };
  const groupFlowItems = buildGroupFlowItems({
    group,
    groupId,
    groupsById,
    locale,
    primaryItems: primaryStoryline?.items ?? null,
  });
  const storylineTitle = primaryStoryline
    ? copy.archive.syntheticTitles[primaryStoryline.storylineId] ?? primaryStoryline.title
    : group.title;

  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section>
          <Card className="overflow-hidden border-[var(--border)] bg-[var(--surface)]/92 shadow-[var(--shadow-sm)]">
            <div
              className="relative flex h-72 items-end justify-center overflow-hidden bg-[var(--surface-muted)] md:aspect-[16/7] md:h-auto md:min-h-72"
              data-testid="group-hero-image"
            >
              {groupWithAssets.backgroundImageHref ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    aria-hidden="true"
                    className={getGroupHeroImageClassName(groupWithAssets.backgroundImageAspect)}
                    decoding="async"
                    src={groupWithAssets.backgroundImageHref}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
                </>
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_42%),linear-gradient(135deg,black,color-mix(in_srgb,var(--text)_18%,black))]" />
              )}
              <div className="absolute inset-x-0 bottom-0 z-10 grid justify-items-center gap-4 px-5 pb-7 pt-20 text-center text-white md:px-8 md:pb-9">
                <h1
                  className="max-w-[min(100%,64rem)] break-words px-2 font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-0.04em] [overflow-wrap:anywhere] md:text-6xl"
                  data-testid="group-hero-title"
                >
                  {group.title}
                </h1>
                <div
                  className="flex flex-wrap justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  data-testid="group-stats"
                >
                  <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
                    {formatUiNumber(locale, group.storyCount)} {copy.common.stories}
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
                    {formatUiNumber(locale, group.totalVisibleCharacterCount)} {copy.common.chars}
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
                    {formatUiMinutes(locale, group.estimatedMinutes)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>
      }
      testId="group-shell"
    >
      <section className="grid gap-3" data-testid="group-flow-nav">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {storylineTitle}
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            {formatUiNumber(locale, groupFlowItems.length)} {copy.common.groups}
          </span>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 py-2 md:mx-0 md:px-2" data-testid="group-flow-scroll">
          {groupFlowItems.map((item) => (
            <Link
              key={item.itemKey}
              aria-current={item.isCurrent ? "page" : undefined}
              className={cn(
                "group relative grid h-28 w-56 shrink-0 content-end overflow-hidden rounded-[var(--radius-md)] border bg-black/80 p-4 text-white shadow-[var(--shadow-sm)] transition duration-[var(--motion-fast)] ease-out hover:-translate-y-px hover:border-[var(--accent)]",
                item.isCurrent
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/35"
                  : "border-white/10",
              )}
              data-current={item.isCurrent ? "true" : "false"}
              data-group-id={item.groupId}
              data-role={item.role}
              data-testid="group-flow-card"
              href={item.href}
            >
              {item.backgroundImageHref ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    aria-hidden="true"
                    className={getFlowCardImageClassName(item.backgroundImageAspect)}
                    data-testid="group-flow-card-image"
                    decoding="async"
                    loading="lazy"
                    src={item.backgroundImageHref}
                  />
                  <span className="absolute inset-0 bg-black/36" aria-hidden="true" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/34 to-black/10" aria-hidden="true" />
                </>
              ) : (
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--accent)_30%,transparent),transparent_42%),linear-gradient(135deg,black,color-mix(in_srgb,var(--text)_18%,black))]" />
              )}
              <span
                className="relative z-10 inline-flex items-center gap-1.5 text-base font-semibold leading-6 text-white drop-shadow-md"
                data-testid="group-flow-card-title"
              >
                {item.displayTitle}
                {item.role === "reference" ? <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /> : null}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {stories.map((story) => {
          const isRead = readProgress.isHydrated && readProgress.isStoryRead(story.storyId);

          return (
            <Link
              key={story.storyId}
              className="group block"
              data-read={isRead ? "true" : "false"}
              data-testid="group-story-card"
              href={getReaderStoryHref(locale, story.groupId, story.storyId)}
            >
              <Card className="bg-[var(--surface)]/94 transition duration-[var(--motion-fast)] ease-out group-hover:-translate-y-px group-hover:border-[var(--accent)] group-hover:shadow-[var(--shadow-sm)]">
                <CardHeader className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StoryClassificationBadges
                        avgTag={story.avgTag}
                        storyCode={story.storyCode}
                        testId="group-story-classification"
                      />
                      {isRead ? (
                        <Badge
                          className="px-2 py-0.5 text-[10px] tracking-[0.12em]"
                          data-testid="group-story-read-badge"
                          variant="accent"
                        >
                          {copy.storyActions.readBadge}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="grid gap-1">
                      <CardTitle className="text-3xl">{story.title}</CardTitle>
                    </div>
                  </div>
                  <div
                    className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] md:justify-end"
                    data-testid="group-story-metrics"
                  >
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5">
                      {formatUiNumber(locale, story.visibleCharacterCount)} {copy.common.chars}
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5">
                      {formatUiMinutes(locale, story.estimatedMinutes)}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </section>
    </ReaderPageFrame>
  );
}
