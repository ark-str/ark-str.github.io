"use client";

import Link from "next/link";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { resolveRuntimePublicPath, useContentIndex } from "@/features/content/runtime/use-public-content";
import { cn } from "@/lib/utils";

const GROUP_FLOW_ITEM_LIMIT = 24;

function formatMetric(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

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

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.25 11.75 11.5 4.5m0 0H5.75m5.75 0v5.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
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
      href: null,
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
  message,
}: {
  appBar: FloatingAppBarModel;
  message: string;
}) {
  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section>
          <Card className="bg-[var(--surface)]/90">
            <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
              {message}
            </CardContent>
          </Card>
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
  const index = indexState.data;
  const group = index ? findGroupEntry(index, locale, groupId) : null;
  const appBar = createGroupAppBar({ group, groupId, index, locale });

  if (indexState.status === "loading" || indexState.status === "idle") {
    return <ReaderGroupStatus appBar={appBar} message="generated content index를 불러오는 중입니다." />;
  }

  if (indexState.status === "error") {
    return (
      <ReaderGroupStatus
        appBar={appBar}
        message={`generated content index를 불러오지 못했습니다: ${indexState.error.message}`}
      />
    );
  }

  if (!index || !group) {
    return <ReaderGroupStatus appBar={appBar} message="요청한 story group을 찾을 수 없습니다." />;
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
  const storylineTitle = primaryStoryline?.title ?? group.title;

  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section>
          <Card className="overflow-hidden border-[var(--border)] bg-[var(--surface)]/92 shadow-[var(--shadow-sm)]">
            <div
              className="relative flex aspect-[16/7] min-h-72 items-end justify-center overflow-hidden bg-[var(--surface-muted)]"
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
                <h1 className="max-w-4xl font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">
                  {group.title}
                </h1>
                <div
                  className="flex flex-wrap justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  data-testid="group-stats"
                >
                  <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
                    {formatMetric(group.storyCount)} Stories
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
                    {formatMetric(group.totalVisibleCharacterCount)} chars
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
                    약 {formatMetric(group.estimatedMinutes)}분
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
            {formatMetric(groupFlowItems.length)} groups
          </span>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 py-2 md:mx-0 md:px-2">
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
                {item.role === "reference" ? <ArrowUpRightIcon /> : null}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {stories.map((story) => (
          <Link
            key={story.storyId}
            className="group block"
            data-testid="group-story-card"
            href={getReaderStoryHref(locale, story.groupId, story.storyId)}
          >
            <Card className="bg-[var(--surface)]/94 transition duration-[var(--motion-fast)] ease-out group-hover:-translate-y-px group-hover:border-[var(--accent)] group-hover:shadow-[var(--shadow-sm)]">
              <CardHeader className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {story.storyCode ? <Badge variant="default">{story.storyCode}</Badge> : null}
                    {story.avgTag ? <Badge variant="default">{story.avgTag}</Badge> : null}
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
                    {formatMetric(story.visibleCharacterCount)} chars
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5">
                    약 {formatMetric(story.estimatedMinutes)}분
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </ReaderPageFrame>
  );
}
