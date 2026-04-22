"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { persistCharacterObservations } from "@/features/characters/runtime/persist-character-observations";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
} from "@/features/content/config/canonical-reader-locales";
import {
  buildLocaleSwitchHref,
  findGroupEntry,
  findStoryEntry,
  getReaderGroupHref,
  getReaderLocaleHref,
  getReaderStoryHref,
} from "@/features/content/config/reader-routes";
import {
  findSummaryEntry,
  getGroupStories,
} from "@/features/content/config/content-index-selectors";
import {
  resolveRuntimePublicPath,
  useAssetManifest,
  useContentIndex,
  useStoryDetail,
  useSummaryManifest,
} from "@/features/content/runtime/use-public-content";
import type {
  AssetManifest,
  ContentGroupEntry,
  ContentIndex,
  ContentStoryIndexEntry,
  ReaderLocale,
  StoryBlock,
  StoryDetail,
} from "@/features/content/types";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";

function formatMetric(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function ReaderPortraitSlot({
  portraitPath,
  speakerName,
}: {
  portraitPath: string | null;
  speakerName: string;
}) {
  return (
    <div
      className="flex h-24 w-20 shrink-0 items-start justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)]"
      data-testid="speaker-portrait-slot"
    >
      {portraitPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${speakerName} portrait`}
          className="block h-full w-full object-cover object-top"
          data-testid="speaker-portrait-image"
          height={96}
          src={portraitPath}
          width={80}
        />
      ) : null}
    </div>
  );
}

function ReaderVisitTracker({
  groupId,
  locale,
  storyId,
  title,
}: {
  locale: ReaderLocale;
  groupId: string;
  storyId: string;
  title: string;
}) {
  const { isHydrated, setLastVisitedStory } = useReaderSession();
  const syncVisit = useEffectEvent(() => {
    setLastVisitedStory({
      locale,
      groupId,
      storyId,
      title,
    });
  });

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    syncVisit();
  }, [groupId, isHydrated, locale, storyId, title]);

  return null;
}

function CharacterObservationTracker({
  locale,
  detail,
}: {
  locale: ReaderLocale;
  detail: StoryDetail | null;
}) {
  const syncObservations = useEffectEvent(() => {
    if (!detail || detail.observedOperators.length === 0) {
      return;
    }

    persistCharacterObservations(locale, detail.observedOperators);
  });

  useEffect(() => {
    syncObservations();
  }, [detail, locale]);

  return null;
}

function findFirstBackgroundId(blocks: StoryBlock[]): string | null {
  for (const block of blocks) {
    if (block.type === "background") {
      return block.backgroundId;
    }

    if (block.type === "choice") {
      for (const option of block.options) {
        const optionBackgroundId = findFirstBackgroundId(option.blocks);
        if (optionBackgroundId) {
          return optionBackgroundId;
        }
      }
    }
  }

  return null;
}

function collectSpeakerIds(blocks: StoryBlock[], speakerIds: Set<string>) {
  for (const block of blocks) {
    if (block.type === "dialogue") {
      if (block.speakerId) {
        speakerIds.add(block.speakerId);
      }
      continue;
    }

    if (block.type === "choice") {
      for (const option of block.options) {
        collectSpeakerIds(option.blocks, speakerIds);
      }
    }
  }
}

function collectBackgroundIds(blocks: StoryBlock[], backgroundIds: Set<string>) {
  for (const block of blocks) {
    if (block.type === "background") {
      backgroundIds.add(block.backgroundId);
      continue;
    }

    if (block.type === "choice") {
      for (const option of block.options) {
        collectBackgroundIds(option.blocks, backgroundIds);
      }
    }
  }
}

function createPathLookup(ids: Set<string>, manifestLookup: Record<string, string>) {
  return Object.fromEntries(
    [...ids].sort((left, right) => left.localeCompare(right)).flatMap((id) => {
      const resolvedPath = resolveRuntimePublicPath(manifestLookup[id] ?? null);
      return resolvedPath ? [[id, resolvedPath]] : [];
    }),
  );
}

function createStoryPortraitPaths(detail: StoryDetail | null, assetManifest: AssetManifest | null) {
  if (!detail || !assetManifest) {
    return {};
  }

  const speakerIds = new Set<string>();
  collectSpeakerIds(detail.blocks, speakerIds);
  return createPathLookup(speakerIds, assetManifest.portraits);
}

function createStoryBackgroundPaths(detail: StoryDetail | null, assetManifest: AssetManifest | null) {
  if (!detail || !assetManifest) {
    return {};
  }

  const backgroundIds = new Set<string>();
  collectBackgroundIds(detail.blocks, backgroundIds);
  return createPathLookup(backgroundIds, assetManifest.backgrounds);
}

function createStoryAppBar({
  group,
  groupId,
  index,
  locale,
  siblingStories,
  story,
  storyId,
}: {
  group: ContentGroupEntry | null;
  groupId: string;
  index: ContentIndex | null;
  locale: ReaderLocale;
  siblingStories: ContentStoryIndexEntry[];
  story: ContentStoryIndexEntry | null;
  storyId: string;
}): FloatingAppBarModel {
  return {
    currentLocale: locale,
    groupCrumb: {
      href: group ? getReaderGroupHref(locale, group.groupId) : null,
      label: group?.title ?? groupId,
    },
    localeOptions: CANONICAL_READER_LOCALES.map((targetLocale) => ({
      href: index
        ? buildLocaleSwitchHref(index, targetLocale, groupId, storyId)
        : getReaderLocaleHref(targetLocale),
      label: READER_LOCALE_LABELS[targetLocale].label,
      locale: targetLocale,
    })),
    storyRootHref: getReaderLocaleHref(locale),
    storySelect: story
      ? {
          currentStoryId: story.storyId,
          options: siblingStories.map((entry) => ({
            href: getReaderStoryHref(locale, entry.groupId, entry.storyId),
            label: entry.title,
            storyId: entry.storyId,
          })),
        }
      : null,
  };
}

function ReaderStoryStatus({
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
        <section className="relative z-10">
          <Card className="bg-[var(--surface)]/90">
            <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
              {message}
            </CardContent>
          </Card>
        </section>
      }
      testId="reader-shell"
    >
      <span />
    </ReaderPageFrame>
  );
}

function StoryBackdrop({ backgroundPath }: { backgroundPath: string | null }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" data-testid="story-backdrop">
      {backgroundPath ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center blur-xl"
            data-testid="story-backdrop-image"
            src={backgroundPath}
          />
          <div className="story-backdrop-overlay absolute inset-0" />
          <div className="story-backdrop-highlight absolute inset-0" />
        </>
      ) : null}
    </div>
  );
}

function StoryBackgroundMarker({
  backgroundId,
  backgroundPath,
  isActive,
  onVisible,
}: {
  backgroundId: string;
  backgroundPath: string | null;
  isActive: boolean;
  onVisible: (backgroundId: string) => void;
}) {
  const markerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = markerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onVisible(backgroundId);
          }
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -62% 0px",
        threshold: 0,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [backgroundId, onVisible]);

  return (
    <article
      ref={markerRef}
      className={`overflow-hidden rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-sm)] ${
        isActive
          ? "border-[var(--accent)] bg-[var(--surface)]/96"
          : "border-[var(--border)] bg-[var(--surface)]/92"
      }`}
      data-active={isActive ? "true" : "false"}
      data-background-id={backgroundId}
      data-testid="background-block"
    >
      {backgroundPath ? (
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${backgroundId} background preview`}
            className="max-h-[22rem] w-full object-contain object-center"
            data-testid="background-preview-image"
            src={backgroundPath}
          />
        </div>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/60 px-4 py-5 text-sm text-[var(--text-muted)]">
          {backgroundId}
        </div>
      )}
    </article>
  );
}

function StoryFloatingTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 720);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      className="fixed bottom-6 right-6 z-40 h-11 rounded-[var(--radius-md)] px-4"
      data-testid="scroll-top-button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      variant="accent"
    >
      <ArrowUp className="h-4 w-4" />
      Top
    </Button>
  );
}

function StoryBlocks({
  activeBackgroundId,
  backgroundPaths,
  blocks,
  onBackgroundVisible,
  portraitPaths,
}: {
  activeBackgroundId: string | null;
  backgroundPaths: Record<string, string>;
  blocks: StoryBlock[];
  onBackgroundVisible: (backgroundId: string) => void;
  portraitPaths: Record<string, string>;
}) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "dialogue") {
          return (
            <article
              key={`dialogue-${index}`}
              className={`flex flex-col gap-4 rounded-[var(--radius-lg)] border bg-[var(--surface)]/94 p-4 shadow-[var(--shadow-sm)] ${
                block.isRemote
                  ? "border-[var(--accent)] border-dashed"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <ReaderPortraitSlot
                  portraitPath={block.speakerId ? (portraitPaths[block.speakerId] ?? null) : null}
                  speakerName={block.speakerName}
                />
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                      {block.speakerName}
                    </h3>
                    {block.isRemote ? (
                      <Badge variant="accent" className="text-[10px] uppercase tracking-[0.14em]">
                        Wireless link
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-[1.02rem] leading-8 text-[var(--text)]">
                {block.text}
              </p>
            </article>
          );
        }

        if (block.type === "narration") {
          return (
            <article
              key={`narration-${index}`}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)]/95 p-5 shadow-[var(--shadow-sm)]"
            >
              <p className="whitespace-pre-wrap text-[1.02rem] leading-8 text-[var(--text)]">
                {block.text}
              </p>
            </article>
          );
        }

        if (block.type === "sceneBreak") {
          return (
            <div key={`scene-break-${index}`} className="flex items-center gap-4 py-1">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Scene break
              </span>
              <Separator className="flex-1" />
            </div>
          );
        }

        if (block.type === "background") {
          return (
            <StoryBackgroundMarker
              key={`background-${index}`}
              backgroundId={block.backgroundId}
              backgroundPath={backgroundPaths[block.backgroundId] ?? null}
              isActive={activeBackgroundId === block.backgroundId}
              onVisible={onBackgroundVisible}
            />
          );
        }

        return (
          <article
            key={`choice-${index}`}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]/96 p-5 shadow-[var(--shadow-sm)]"
            data-testid="choice-block"
          >
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                Doctor choice
              </p>
              <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text)]">
                Available responses
              </h3>
            </div>
            <div className="mt-5 grid gap-4">
              {block.options.map((option) => (
                <section
                  key={option.value}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4"
                >
                  <p className="text-sm font-semibold text-[var(--accent)]">{option.label}</p>
                  {option.blocks.length > 0 ? (
                    <div className="mt-3 grid gap-3">
                      <StoryBlocks
                        activeBackgroundId={activeBackgroundId}
                        backgroundPaths={backgroundPaths}
                        blocks={option.blocks}
                        onBackgroundVisible={onBackgroundVisible}
                        portraitPaths={portraitPaths}
                      />
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        );
      })}
    </>
  );
}

function StoryBodyRenderer({
  activeBackgroundId,
  backgroundPaths,
  blocks,
  onBackgroundVisible,
  portraitPaths,
}: {
  activeBackgroundId: string | null;
  backgroundPaths: Record<string, string>;
  blocks: StoryBlock[];
  onBackgroundVisible: (backgroundId: string) => void;
  portraitPaths: Record<string, string>;
}) {
  return (
    <div className="grid gap-4" data-testid="story-body">
      <StoryBlocks
        activeBackgroundId={activeBackgroundId}
        backgroundPaths={backgroundPaths}
        blocks={blocks}
        onBackgroundVisible={onBackgroundVisible}
        portraitPaths={portraitPaths}
      />
    </div>
  );
}

export function ReaderStoryShell({
  groupId,
  locale,
  storyId,
}: {
  groupId: string;
  locale: ReaderLocale;
  storyId: string;
}) {
  const indexState = useContentIndex();
  const summaryState = useSummaryManifest();
  const assetState = useAssetManifest();
  const index = indexState.data;
  const group = index ? findGroupEntry(index, locale, groupId) : null;
  const story = index ? findStoryEntry(index, locale, groupId, storyId) : null;
  const siblingStories = index ? getGroupStories(index, locale, groupId) : [];
  const storyBodyPath = story?.bodyAvailable ? story.bodyPath : null;
  const detailState = useStoryDetail(storyBodyPath);
  const detail = detailState.data;
  const appBar = createStoryAppBar({
    group,
    groupId,
    index,
    locale,
    siblingStories,
    story,
    storyId,
  });
  const portraitPaths = useMemo(
    () => createStoryPortraitPaths(detail, assetState.data),
    [assetState.data, detail],
  );
  const backgroundPaths = useMemo(
    () => createStoryBackgroundPaths(detail, assetState.data),
    [assetState.data, detail],
  );
  const summaryAvailable =
    findSummaryEntry(summaryState.data, locale, storyId)?.status === "ready";

  const isIndexLoading = indexState.status === "loading" || indexState.status === "idle";
  const isBodyLoading =
    Boolean(story?.bodyAvailable) &&
    (detailState.status === "loading" || detailState.status === "idle" || assetState.status === "loading" || assetState.status === "idle");
  const isBodyAvailable = Boolean(story?.bodyAvailable && detail);
  const initialBackgroundId = useMemo(() => (detail ? findFirstBackgroundId(detail.blocks) : null), [detail]);
  const [activeBackground, setActiveBackground] = useState<{
    storyId: string;
    backgroundId: string | null;
  }>({
    storyId,
    backgroundId: initialBackgroundId,
  });
  const activeBackgroundId =
    activeBackground.storyId === storyId
      ? activeBackground.backgroundId ?? initialBackgroundId
      : initialBackgroundId;

  const handleBackgroundVisible = useCallback((backgroundId: string) => {
    setActiveBackground({
      storyId,
      backgroundId,
    });
  }, [storyId]);
  const activeBackgroundPath = activeBackgroundId ? (backgroundPaths[activeBackgroundId] ?? null) : null;

  if (isIndexLoading) {
    return <ReaderStoryStatus appBar={appBar} message="generated content index를 불러오는 중입니다." />;
  }

  if (indexState.status === "error") {
    return (
      <ReaderStoryStatus
        appBar={appBar}
        message={`generated content index를 불러오지 못했습니다: ${indexState.error.message}`}
      />
    );
  }

  if (!index || !group || !story) {
    return <ReaderStoryStatus appBar={appBar} message="요청한 story를 찾을 수 없습니다." />;
  }

  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {story.storyCode ? <Badge variant="default">{story.storyCode}</Badge> : null}
            {story.avgTag ? <Badge variant="default">{story.avgTag}</Badge> : null}
            <Badge variant="default">{story.storyId}</Badge>
          </div>
          <div className="space-y-2">
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
              {story.title}
            </h1>
            <p className="max-w-5xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
              {story.sourcePath}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span>{formatMetric(story.visibleCharacterCount)} chars</span>
            <span>약 {formatMetric(story.estimatedMinutes)}분</span>
            <span>{group.storyCount} stories in {group.title}</span>
          </div>
        </section>
      }
      testId="reader-shell"
    >
      <ReaderVisitTracker
        groupId={story.groupId}
        locale={locale}
        storyId={story.storyId}
        title={story.title}
      />
      <CharacterObservationTracker detail={detail} locale={locale} />
      <StoryBackdrop backgroundPath={activeBackgroundPath} />

      <section className="relative z-10 grid gap-6">
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="grid gap-4 self-start xl:sticky xl:top-28">
            <Card className="bg-[var(--surface)]/90 backdrop-blur-sm">
              <CardHeader>
                <Badge variant="default" className="w-fit">
                  Group
                </Badge>
                <CardTitle>{group.title}</CardTitle>
                <CardDescription>
                  {group.storyCount} stories · {formatMetric(group.totalVisibleCharacterCount)} chars · 약{" "}
                  {formatMetric(group.estimatedMinutes)}분
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {siblingStories.map((entry) => (
                  <Link
                    key={entry.storyId}
                    className={`rounded-[var(--radius-md)] border px-3 py-3 text-sm transition duration-[var(--motion-fast)] ease-out ${
                      entry.storyId === story.storyId
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        : "border-[var(--border)] bg-[var(--panel)]/90 text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]"
                    }`}
                    href={getReaderStoryHref(locale, entry.groupId, entry.storyId)}
                  >
                    <span className="block font-semibold">{entry.title}</span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {entry.storyCode ?? entry.storyId}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--text-muted)]">
                      {formatMetric(entry.visibleCharacterCount)} chars · 약{" "}
                      {formatMetric(entry.estimatedMinutes)}분
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>

          <section className="grid gap-4">
            {isBodyAvailable && detail ? (
              <StoryBodyRenderer
                activeBackgroundId={activeBackgroundId}
                backgroundPaths={backgroundPaths}
                blocks={detail.blocks}
                onBackgroundVisible={handleBackgroundVisible}
                portraitPaths={portraitPaths}
              />
            ) : isBodyLoading ? (
              <Card className="bg-[var(--surface)]/90">
                <CardContent className="pt-6 text-sm leading-7 text-[var(--text-muted)]">
                  generated story body와 asset manifest를 불러오는 중입니다.
                </CardContent>
              </Card>
            ) : detailState.status === "error" ? (
              <Card className="bg-[var(--surface)]/90">
                <CardContent className="pt-6 text-sm leading-7 text-[var(--text-muted)]">
                  generated story body를 불러오지 못했습니다: {detailState.error.message}
                </CardContent>
              </Card>
            ) : assetState.status === "error" ? (
              <Card className="bg-[var(--surface)]/90">
                <CardContent className="pt-6 text-sm leading-7 text-[var(--text-muted)]">
                  generated asset manifest를 불러오지 못했습니다: {assetState.error.message}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[var(--surface)]/90">
                <CardContent className="pt-6 text-sm leading-7 text-[var(--text-muted)]">
                  이 스토리는 generated body JSON이 아직 준비되지 않았습니다. source manifest에는
                  등록되어 있지만 본문 파일이 비어 있거나 미해결 상태입니다.
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        <section data-testid="story-summary-section">
          <Card className="bg-[var(--surface)]/92 backdrop-blur-sm">
            <CardHeader>
              <Badge variant="default" className="w-fit">
                Summary
              </Badge>
              <CardTitle>Story summary</CardTitle>
              <CardDescription>
                summary는 스토리 본문 아래 전체폭 영역에서 제공합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryAvailable ? (
                <p className="text-sm leading-7 text-[var(--text)]">
                  summary contract is marked available, but summary rendering is not implemented in this
                  issue.
                </p>
              ) : (
                <div
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4 text-sm leading-7 text-[var(--text-muted)]"
                  data-testid="summary-empty-state"
                >
                  이 스토리의 summary는 아직 생성되지 않았습니다. 후속 파이프라인 이슈에서 summary와
                  character unlock fact가 추가됩니다.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </section>

      <StoryFloatingTopButton />
    </ReaderPageFrame>
  );
}
