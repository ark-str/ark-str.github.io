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
import { getReaderStoryHref } from "@/features/content/config/reader-routes";
import type {
  ContentGroupEntry,
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
      className="flex h-20 w-16 shrink-0 items-start justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)]"
      data-testid="speaker-portrait-slot"
    >
      {portraitPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${speakerName} portrait`}
          className="block h-full w-full object-cover object-top"
          data-testid="speaker-portrait-image"
          height={80}
          src={portraitPath}
          width={64}
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

function collectBackgroundSequenceFromBlocks(blocks: StoryBlock[], accumulator: string[] = []) {
  for (const block of blocks) {
    if (block.type === "background") {
      accumulator.push(block.backgroundId);
      continue;
    }

    if (block.type === "choice") {
      for (const option of block.options) {
        collectBackgroundSequenceFromBlocks(option.blocks, accumulator);
      }
    }
  }

  return accumulator;
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
            className="absolute inset-0 h-full w-full scale-105 object-cover object-center blur-xl"
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
      className={`rounded-[var(--radius-lg)] border p-4 ${
        isActive
          ? "border-[var(--accent)] bg-[var(--accent-soft)]/70"
          : "border-[var(--border)] bg-[var(--surface)]/90"
      }`}
      data-active={isActive ? "true" : "false"}
      data-background-id={backgroundId}
      data-testid="background-block"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Background shift
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--text)]">{backgroundId}</p>
        </div>
        <div className="flex items-center gap-2">
          {backgroundPath ? <Badge variant="default">Backdrop ready</Badge> : null}
          {isActive ? <Badge variant="accent">Active</Badge> : null}
        </div>
      </div>
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
      className="fixed bottom-6 right-6 z-40 h-12 rounded-full px-4"
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
              className={`grid gap-4 rounded-[var(--radius-lg)] border bg-[var(--surface)]/94 p-4 shadow-[var(--shadow-sm)] md:grid-cols-[72px_minmax(0,1fr)] ${
                block.isRemote
                  ? "border-[var(--accent)] border-dashed"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <ReaderPortraitSlot
                  portraitPath={block.speakerId ? (portraitPaths[block.speakerId] ?? null) : null}
                  speakerName={block.speakerName}
                />
                <div className="pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Dialogue
                    </p>
                    {block.isRemote ? (
                      <Badge variant="accent" className="text-[10px] uppercase tracking-[0.18em]">
                        Wireless link
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">{block.speakerName}</h3>
                </div>
              </div>
              <p className="max-w-[72ch] whitespace-pre-wrap text-base leading-8 text-[var(--text)]">
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
              <p className="max-w-[72ch] whitespace-pre-wrap font-[var(--font-display)] text-lg leading-8 text-[var(--text)]">
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
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Doctor choice
              </p>
              <h3 className="text-2xl font-semibold text-[var(--text)]">Available responses</h3>
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
  appBar,
  backgroundPaths,
  detail,
  group,
  locale,
  portraitPaths,
  story,
  summaryAvailable,
  siblingStories,
}: {
  appBar: FloatingAppBarModel;
  locale: ReaderLocale;
  group: ContentGroupEntry;
  story: ContentStoryIndexEntry;
  detail: StoryDetail | null;
  backgroundPaths: Record<string, string>;
  portraitPaths: Record<string, string>;
  siblingStories: ContentStoryIndexEntry[];
  summaryAvailable: boolean;
}) {
  const isBodyAvailable = story.bodyAvailable && detail;
  const backgroundSequence = useMemo(
    () => (detail ? collectBackgroundSequenceFromBlocks(detail.blocks) : []),
    [detail],
  );
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string | null>(null);
  const activeBackgroundId = useMemo(() => {
    if (selectedBackgroundId && backgroundSequence.includes(selectedBackgroundId)) {
      return selectedBackgroundId;
    }

    return backgroundSequence[0] ?? null;
  }, [backgroundSequence, selectedBackgroundId]);
  const handleBackgroundVisible = useCallback((backgroundId: string) => {
    setSelectedBackgroundId(backgroundId);
  }, []);
  const activeBackgroundPath = activeBackgroundId ? (backgroundPaths[activeBackgroundId] ?? null) : null;

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
            <h1 className="font-[var(--font-display)] text-4xl leading-tight md:text-5xl">
              {story.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
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

      <section className="relative z-10 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
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
                  <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
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

        <div className="grid gap-6">
          <section className="grid gap-4">
            {isBodyAvailable ? (
              <StoryBodyRenderer
                activeBackgroundId={activeBackgroundId}
                backgroundPaths={backgroundPaths}
                blocks={detail.blocks}
                onBackgroundVisible={handleBackgroundVisible}
                portraitPaths={portraitPaths}
              />
            ) : (
              <Card className="bg-[var(--surface)]/90">
                <CardContent className="pt-6 text-sm leading-7 text-[var(--text-muted)]">
                  이 스토리는 generated body JSON이 아직 준비되지 않았습니다. source manifest에는
                  등록되어 있지만 본문 파일이 비어 있거나 미해결 상태입니다.
                </CardContent>
              </Card>
            )}
          </section>

          <section className="xl:col-span-2" data-testid="story-summary-section">
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
                    summary contract is marked available, but summary rendering is not implemented in
                    this issue.
                  </p>
                ) : (
                  <div
                    className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4 text-sm leading-7 text-[var(--text-muted)]"
                    data-testid="summary-empty-state"
                  >
                    이 스토리의 summary는 아직 생성되지 않았습니다. 후속 파이프라인 이슈에서
                    summary와 character unlock fact가 추가됩니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </section>

      <StoryFloatingTopButton />
    </ReaderPageFrame>
  );
}
