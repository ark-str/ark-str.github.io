"use client";

import { useCallback, useEffect, useEffectEvent, useId, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, ChevronDown, NotebookPen, X } from "lucide-react";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getGroupStories } from "@/features/content/config/content-index-selectors";
import {
  resolveRuntimePublicPath,
  useAssetManifest,
  useContentIndex,
  useStoryDetail,
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
import { interpolateStoryText } from "@/features/reader/service/interpolate-story-text";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";
import { useStoryNotes } from "@/features/notes/runtime/story-notes-context";
import { cn } from "@/lib/utils";

function formatMetric(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function StoryClassificationBadges({
  compact = false,
  phaseTone = "auto",
  story,
}: {
  compact?: boolean;
  phaseTone?: "accent" | "auto";
  story: ContentStoryIndexEntry;
}) {
  const storyCode = story.storyCode?.trim();
  const avgTag = story.avgTag?.trim();
  const badgeClassName = compact ? "px-2 py-0.5 text-[10px] tracking-[0.12em]" : undefined;
  const phaseVariant = phaseTone === "accent" || avgTag === "브릿지" ? "accent" : "default";

  return (
    <>
      {storyCode ? (
        <Badge className={badgeClassName} data-testid="story-stage-badge" variant="contrast">
          {storyCode}
        </Badge>
      ) : null}
      {avgTag ? (
        <Badge
          className={badgeClassName}
          data-testid="story-phase-badge"
          variant={phaseVariant}
        >
          {avgTag}
        </Badge>
      ) : null}
    </>
  );
}

function StoryMetricBadge({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <Badge
      className={cn("normal-case tracking-[0.08em]", compact && "px-2 py-0.5 text-[10px]")}
      data-testid="story-metric-badge"
      variant="default"
    >
      {children}
    </Badge>
  );
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
      className="relative flex h-24 w-20 shrink-0 items-start justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)]"
      data-testid="speaker-portrait-slot"
    >
      {portraitPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${speakerName} portrait`}
          className="absolute left-1/2 top-0 block h-[calc(200%+4px)] w-auto max-w-none -translate-x-1/2 object-contain object-top"
          data-testid="speaker-portrait-image"
          height={192}
          src={portraitPath}
          width={160}
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

function findFirstBackgroundBlock(
  blocks: StoryBlock[],
): { backgroundId: string | null } | null {
  for (const block of blocks) {
    if (block.type === "background") {
      return { backgroundId: block.backgroundId };
    }

    if (block.type === "choice") {
      for (const option of block.options) {
        const optionBackground = findFirstBackgroundBlock(option.blocks);
        if (optionBackground) {
          return optionBackground;
        }
      }
    }
  }

  return null;
}

function findFirstBackgroundId(blocks: StoryBlock[]): string | null {
  return findFirstBackgroundBlock(blocks)?.backgroundId ?? null;
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
      if (block.backgroundId) {
        backgroundIds.add(block.backgroundId);
      }
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
            className="absolute inset-0 h-full w-full object-cover object-center"
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
  backgroundId: string | null;
  backgroundPath: string | null;
  isActive: boolean;
  onVisible: (backgroundId: string | null) => void;
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

  if (!backgroundId) {
    return (
      <span
        ref={markerRef}
        aria-hidden="true"
        className="block h-px"
        data-testid="background-clear"
      />
    );
  }

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

function StoryNoteDock({
  groupId,
  groupTitle,
  locale,
  storyId,
  storyTitle,
}: {
  groupId: string;
  groupTitle: string;
  locale: ReaderLocale;
  storyId: string;
  storyTitle: string;
}) {
  const { isHydrated, setStoryNote, state } = useStoryNotes();
  const [isOpen, setIsOpen] = useState(false);
  const note = state.notes[storyId] ?? null;
  const hasNote = Boolean(note);
  const noteText = note?.text ?? "";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleTextChange = (text: string) => {
    setStoryNote({
      groupId,
      groupTitle,
      locale,
      storyId,
      storyTitle,
      text,
    });
  };

  return (
    <>
      <Button
        aria-label="스토리 메모 열기"
        className={cn(
          "fixed bottom-[calc(var(--space-6)+2.75rem)] right-6 z-40 h-11 w-11 rounded-[var(--radius-md)] p-0",
          hasNote && "border-[var(--accent)] text-[var(--accent-strong)]",
        )}
        data-has-note={hasNote ? "true" : "false"}
        data-testid="story-note-open-button"
        disabled={!isHydrated}
        onClick={() => setIsOpen(true)}
        variant="subtle"
      >
        <NotebookPen className="h-4 w-4" />
      </Button>

      {isOpen ? (
        <div data-testid="story-note-layer">
          <button
            aria-label="스토리 메모 닫기"
            className="fixed inset-0 z-[60] cursor-default bg-[color-mix(in_srgb,var(--bg)_56%,transparent)]"
            data-testid="story-note-backdrop"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <aside
            aria-label="스토리 메모"
            className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[82vh] flex-col rounded-t-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[28rem] md:rounded-none md:border-y-0 md:border-l md:border-r-0"
            data-testid="story-note-panel"
          >
            <div className="mx-auto mt-3 h-1 w-12 rounded-[999px] bg-[var(--border)] md:hidden" />
            <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                  Memo
                </p>
                <h2 className="mt-1 truncate text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                  {storyTitle}
                </h2>
                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{groupTitle}</p>
              </div>
              <Button
                aria-label="스토리 메모 닫기"
                className="h-9 w-9 shrink-0 rounded-[var(--radius-sm)]"
                data-testid="story-note-close-button"
                onClick={() => setIsOpen(false)}
                size="icon"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-4">
              <Textarea
                autoFocus
                className="min-h-[18rem] flex-1 resize-none rounded-[var(--radius-md)] shadow-none"
                data-testid="story-note-textarea"
                onChange={(event) => handleTextChange(event.target.value)}
                placeholder="이 story에 남길 메모"
                value={noteText}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function StoryBottomNavigation({
  locale,
  nextStory,
  previousStory,
}: {
  locale: ReaderLocale;
  nextStory: ContentStoryIndexEntry | null;
  previousStory: ContentStoryIndexEntry | null;
}) {
  const itemClassName =
    "flex min-h-14 items-center px-5 py-4 text-sm font-semibold tracking-[-0.01em] transition duration-[var(--motion-fast)] ease-out";
  const activeClassName =
    "text-[var(--text)] hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)]";
  const disabledClassName = "text-[var(--text-muted)] opacity-45";

  return (
    <nav
      aria-label="Story navigation"
      className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]/94 shadow-[var(--shadow-sm)]"
      data-testid="story-bottom-nav"
    >
      {previousStory ? (
        <Link
          aria-label={`이전 스토리: ${previousStory.title}`}
          className={cn(itemClassName, activeClassName, "justify-start")}
          data-testid="story-previous-link"
          href={getReaderStoryHref(locale, previousStory.groupId, previousStory.storyId)}
        >
          ‹ 이동
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={cn(itemClassName, disabledClassName, "justify-start")}
          data-testid="story-previous-disabled"
        >
          ‹ 이동
        </span>
      )}
      <span aria-hidden="true" className="my-3 w-px bg-[var(--border)]" />
      {nextStory ? (
        <Link
          aria-label={`다음 스토리: ${nextStory.title}`}
          className={cn(itemClassName, activeClassName, "justify-end text-right")}
          data-testid="story-next-link"
          href={getReaderStoryHref(locale, nextStory.groupId, nextStory.storyId)}
        >
          다음 ›
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={cn(itemClassName, disabledClassName, "justify-end text-right")}
          data-testid="story-next-disabled"
        >
          다음 ›
        </span>
      )}
    </nav>
  );
}

function StorySummaryCard({ summaryText }: { summaryText: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }

    const syncContentHeight = () => {
      setContentHeight(node.scrollHeight);
    };

    syncContentHeight();
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(syncContentHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [summaryText]);

  if (!summaryText) {
    return null;
  }

  return (
    <section className="relative z-10" data-testid="story-summary-section">
      <Card className="overflow-hidden bg-[var(--surface)]/96 shadow-[var(--shadow-sm)]">
        <CardHeader className="p-0">
          <button
            aria-controls={contentId}
            aria-expanded={isOpen}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            data-testid="story-summary-toggle"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            <Badge className="w-fit uppercase tracking-[0.16em]" variant="default">
              SUMMARY
            </Badge>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ease-out",
                isOpen && "rotate-180",
              )}
            />
          </button>
        </CardHeader>
        <div
          aria-hidden={!isOpen}
          className={cn(
            "overflow-hidden transition-[max-height] duration-300 ease-out",
            !isOpen && "pointer-events-none",
          )}
          data-state={isOpen ? "open" : "closed"}
          data-testid="story-summary-panel"
          id={contentId}
          style={{
            maxHeight: isOpen ? `${contentHeight}px` : "0px",
            visibility: isOpen ? "visible" : "hidden",
          }}
        >
          <div ref={contentRef}>
            <CardContent className="px-5 pb-5 pt-0">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">
                {summaryText}
              </p>
            </CardContent>
          </div>
        </div>
      </Card>
    </section>
  );
}

function StoryBlocks({
  activeBackgroundId,
  backgroundPaths,
  blocks,
  nickName,
  onBackgroundVisible,
  portraitPaths,
}: {
  activeBackgroundId: string | null;
  backgroundPaths: Record<string, string>;
  blocks: StoryBlock[];
  nickName: string;
  onBackgroundVisible: (backgroundId: string | null) => void;
  portraitPaths: Record<string, string>;
}) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "dialogue") {
          const speakerName = interpolateStoryText(block.speakerName, { nickName });
          const dialogueText = interpolateStoryText(block.text, { nickName });

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
                  speakerName={speakerName}
                />
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                      {speakerName}
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
                {dialogueText}
              </p>
            </article>
          );
        }

        if (block.type === "narration") {
          const narrationText = interpolateStoryText(block.text, { nickName });

          return (
            <article
              key={`narration-${index}`}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)]/95 p-5 shadow-[var(--shadow-sm)]"
            >
              <p className="whitespace-pre-wrap text-[1.02rem] leading-8 text-[var(--text)]">
                {narrationText}
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
              backgroundPath={block.backgroundId ? (backgroundPaths[block.backgroundId] ?? null) : null}
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
                  <p className="text-sm font-semibold text-[var(--accent)]">
                    {interpolateStoryText(option.label, { nickName })}
                  </p>
                  {option.blocks.length > 0 ? (
                    <div className="mt-3 grid gap-3">
                      <StoryBlocks
                        activeBackgroundId={activeBackgroundId}
                        backgroundPaths={backgroundPaths}
                        blocks={option.blocks}
                        nickName={nickName}
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
  nickName,
  onBackgroundVisible,
  portraitPaths,
}: {
  activeBackgroundId: string | null;
  backgroundPaths: Record<string, string>;
  blocks: StoryBlock[];
  nickName: string;
  onBackgroundVisible: (backgroundId: string | null) => void;
  portraitPaths: Record<string, string>;
}) {
  return (
    <div className="grid gap-4" data-testid="story-body">
      <StoryBlocks
        activeBackgroundId={activeBackgroundId}
        backgroundPaths={backgroundPaths}
        blocks={blocks}
        nickName={nickName}
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
  const { state: readerSessionState } = useReaderSession();
  const indexState = useContentIndex();
  const assetState = useAssetManifest();
  const index = indexState.data;
  const group = index ? findGroupEntry(index, locale, groupId) : null;
  const story = index ? findStoryEntry(index, locale, groupId, storyId) : null;
  const siblingStories = index ? getGroupStories(index, locale, groupId) : [];
  const currentStoryIndex = siblingStories.findIndex((entry) => entry.storyId === storyId);
  const previousStory = currentStoryIndex > 0 ? siblingStories[currentStoryIndex - 1] : null;
  const nextStory =
    currentStoryIndex >= 0 && currentStoryIndex < siblingStories.length - 1
      ? siblingStories[currentStoryIndex + 1]
      : null;
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
  const isIndexLoading = indexState.status === "loading" || indexState.status === "idle";
  const isBodyLoading =
    Boolean(story?.bodyAvailable) &&
    (detailState.status === "loading" || detailState.status === "idle" || assetState.status === "loading" || assetState.status === "idle");
  const isBodyAvailable = Boolean(story?.bodyAvailable && detail && assetState.status === "ready");
  const initialBackgroundId = useMemo(() => (detail ? findFirstBackgroundId(detail.blocks) : null), [detail]);
  const [activeBackground, setActiveBackground] = useState<{
    storyId: string;
    backgroundId: string | null | undefined;
  }>({
    storyId,
    backgroundId: undefined,
  });
  const activeBackgroundId =
    activeBackground.storyId === storyId
      ? activeBackground.backgroundId === undefined
        ? initialBackgroundId
        : activeBackground.backgroundId
      : initialBackgroundId;

  const handleBackgroundVisible = useCallback((backgroundId: string | null) => {
    setActiveBackground((current) => {
      if (current.storyId === storyId && current.backgroundId === backgroundId) {
        return current;
      }

      return {
        storyId,
        backgroundId,
      };
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
            <StoryClassificationBadges story={story} />
          </div>
          <div className="space-y-2">
            <h1 className="break-words font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-0.03em] [overflow-wrap:anywhere] md:text-5xl">
              {story.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2" data-testid="story-header-metrics">
            <StoryMetricBadge>{formatMetric(story.visibleCharacterCount)} chars</StoryMetricBadge>
            <StoryMetricBadge>약 {formatMetric(story.estimatedMinutes)}분</StoryMetricBadge>
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
        <StorySummaryCard key={story.storyId} summaryText={detail?.summaryText ?? null} />

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden self-start xl:sticky xl:top-[calc(var(--app-bar-height,7rem)+var(--space-4))] xl:block">
            <Card
              className="flex max-h-[calc(100vh-var(--app-bar-height,7rem)-var(--space-8))] flex-col bg-[var(--surface)]/96"
              data-testid="story-sibling-nav"
            >
              <CardHeader className="shrink-0">
                <CardTitle className="break-words leading-tight [overflow-wrap:anywhere]">
                  {group.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2" data-testid="story-group-metrics">
                  <StoryMetricBadge compact>{formatMetric(group.storyCount)} stories</StoryMetricBadge>
                  <StoryMetricBadge compact>
                    {formatMetric(group.totalVisibleCharacterCount)} chars
                  </StoryMetricBadge>
                  <StoryMetricBadge compact>약 {formatMetric(group.estimatedMinutes)}분</StoryMetricBadge>
                </div>
              </CardHeader>
              <CardContent className="min-h-0 overflow-y-auto px-4 pb-4 pr-3" data-testid="story-sibling-list">
                <div className="grid gap-2 pr-1">
                  {siblingStories.map((entry) => (
                    <Link
                      key={entry.storyId}
                      className={cn(
                        "grid gap-2 rounded-[var(--radius-md)] border px-3 py-3 text-sm transition duration-[var(--motion-fast)] ease-out",
                        entry.storyId === story.storyId
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                          : "border-[var(--border)] bg-[var(--panel)]/90 text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]",
                      )}
                      data-testid="story-sibling-card"
                      href={getReaderStoryHref(locale, entry.groupId, entry.storyId)}
                    >
                      <span className="block font-semibold leading-5">{entry.title}</span>
                      <span className="flex flex-wrap gap-1.5" data-testid="story-sibling-classification">
                        <StoryClassificationBadges compact phaseTone="accent" story={entry} />
                      </span>
                      <span className="flex flex-wrap gap-1.5" data-testid="story-sibling-metrics">
                        <StoryMetricBadge compact>
                          {formatMetric(entry.visibleCharacterCount)} chars
                        </StoryMetricBadge>
                        <StoryMetricBadge compact>약 {formatMetric(entry.estimatedMinutes)}분</StoryMetricBadge>
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="grid gap-4">
            {isBodyAvailable && detail ? (
              <StoryBodyRenderer
                activeBackgroundId={activeBackgroundId}
                backgroundPaths={backgroundPaths}
                blocks={detail.blocks}
                nickName={readerSessionState.nickName}
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

        <StoryBottomNavigation locale={locale} nextStory={nextStory} previousStory={previousStory} />
      </section>

      <StoryFloatingTopButton />
      <StoryNoteDock
        groupId={story.groupId}
        groupTitle={group.title}
        locale={locale}
        storyId={story.storyId}
        storyTitle={story.title}
      />
    </ReaderPageFrame>
  );
}
