"use client";

import { useEffect, useEffectEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { persistCharacterObservations } from "@/features/characters/runtime/persist-character-observations";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";
import type {
  ContentGroupEntry,
  ContentStoryIndexEntry,
  ReaderLocale,
  StoryBlock,
  StoryDetail,
} from "@/features/content/types";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";

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
        // The reader ships fully bundled PNG portraits; plain img keeps exported Pages output simple.
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

function ReaderRouteShell({
  locale,
  eyebrow,
  title,
  description,
  children,
}: {
  locale: ReaderLocale;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-8 text-[var(--text)] md:px-8 lg:px-12"
      data-testid="reader-shell"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="accent">{eyebrow}</Badge>
          <h1 className="font-[var(--font-display)] text-4xl leading-tight md:text-5xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
            {description}
          </p>
        </div>
        <Card className="min-w-44 bg-[var(--surface)]/94">
          <CardContent className="px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Locale archive
            </p>
            <p className="mt-2 text-lg font-semibold">{READER_LOCALE_LABELS[locale].label}</p>
            <Link className="mt-3 inline-block text-sm text-[var(--accent)]" href="/">
              Back to home
            </Link>
          </CardContent>
        </Card>
      </div>

      {children}
    </main>
  );
}

function ReaderVisitTracker({
  locale,
  storyId,
  groupId,
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

function StoryBlocks({
  blocks,
  portraitPaths,
}: {
  blocks: StoryBlock[];
  portraitPaths: Record<string, string>;
}) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "dialogue") {
          return (
            <article
              key={`dialogue-${index}`}
              className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]/95 p-4 md:grid-cols-[72px_minmax(0,1fr)]"
            >
              <div className="flex items-start gap-3">
                <ReaderPortraitSlot
                  portraitPath={block.speakerId ? (portraitPaths[block.speakerId] ?? null) : null}
                  speakerName={block.speakerName}
                />
                <div className="pt-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Dialogue
                  </p>
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
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5"
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

        return (
          <article
            key={`choice-${index}`}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]/96 p-5"
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
                  <div className="mt-3 grid gap-3">
                    {option.blocks.length > 0 ? (
                      <StoryBlocks blocks={option.blocks} portraitPaths={portraitPaths} />
                    ) : (
                      <p className="text-sm leading-6 text-[var(--text-muted)]">
                        이 선택지에 매핑된 후속 대사가 아직 정규화되지 않았습니다.
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>
            {block.sharedBlocks.length > 0 ? (
              <section className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Shared response
                </p>
                <div className="mt-3 grid gap-3">
                  <StoryBlocks blocks={block.sharedBlocks} portraitPaths={portraitPaths} />
                </div>
              </section>
            ) : null}
          </article>
        );
      })}
    </>
  );
}

function StoryBodyRenderer({
  blocks,
  portraitPaths,
}: {
  blocks: StoryBlock[];
  portraitPaths: Record<string, string>;
}) {
  return (
    <div className="grid gap-4" data-testid="story-body">
      <StoryBlocks blocks={blocks} portraitPaths={portraitPaths} />
    </div>
  );
}

export function ReaderStoryShell({
  detail,
  group,
  locale,
  portraitPaths,
  story,
  summaryAvailable,
  siblingStories,
}: {
  locale: ReaderLocale;
  group: ContentGroupEntry;
  story: ContentStoryIndexEntry;
  detail: StoryDetail | null;
  portraitPaths: Record<string, string>;
  siblingStories: ContentStoryIndexEntry[];
  summaryAvailable: boolean;
}) {
  const isBodyAvailable = story.bodyAvailable && detail;

  return (
    <ReaderRouteShell
      description="왼쪽 탐색, 중앙 본문, 오른쪽 summary rail의 기본 구조를 reader-shell 단계에서 먼저 엽니다."
      eyebrow="Story route"
      locale={locale}
      title={story.title}
    >
      <ReaderVisitTracker
        groupId={story.groupId}
        locale={locale}
        storyId={story.storyId}
        title={story.title}
      />
      <CharacterObservationTracker detail={detail} locale={locale} />

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="grid gap-4">
          <Card className="bg-[var(--surface)]/94">
            <CardHeader>
              <Badge variant="default" className="w-fit">
                Group
              </Badge>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>
                {group.storyCount} stories in this archive group.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {siblingStories.map((entry) => (
                <Link
                  key={entry.storyId}
                  className={`rounded-[var(--radius-md)] border px-3 py-3 text-sm transition duration-[var(--motion-fast)] ease-out ${
                    entry.storyId === story.storyId
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      : "border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]"
                  }`}
                  href={`/reader/${locale}/${entry.groupId}/${entry.storyId}`}
                >
                  <span className="block font-semibold">{entry.title}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {entry.storyCode ?? entry.storyId}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="grid gap-4">
          <Card className="bg-[var(--surface)]/95">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                {story.storyCode ? <Badge variant="default">{story.storyCode}</Badge> : null}
                <Badge variant="default">{story.storyId}</Badge>
              </div>
              <CardTitle className="font-[var(--font-display)] text-4xl">{story.title}</CardTitle>
              <CardDescription>
                {story.avgTag ? `${story.avgTag} · ` : ""}
                {story.sourcePath}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isBodyAvailable ? (
                <StoryBodyRenderer blocks={detail.blocks} portraitPaths={portraitPaths} />
              ) : (
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 text-sm leading-7 text-[var(--text-muted)]">
                  이 스토리는 generated body JSON이 아직 준비되지 않았습니다. source manifest에는
                  등록되어 있지만 본문 파일이 비어 있거나 미해결 상태입니다.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="grid gap-4">
          <Card className="bg-[var(--surface)]/94">
            <CardHeader>
              <Badge variant="default" className="w-fit">
                Summary
              </Badge>
              <CardTitle>Story summary rail</CardTitle>
              <CardDescription>
                summary generation issue가 열리기 전까지는 explicit empty state를 유지합니다.
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
        </aside>
      </section>
    </ReaderRouteShell>
  );
}
