"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, NotebookText } from "lucide-react";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
} from "@/features/content/config/canonical-reader-locales";
import {
  findStoryEntry,
  getReaderStoryHref,
} from "@/features/content/config/reader-routes";
import { useContentIndex } from "@/features/content/runtime/use-public-content";
import type { ContentStoryIndexEntry } from "@/features/content/types";
import { useStoryNotes } from "@/features/notes/runtime/story-notes-context";
import type { StoryNoteEntry } from "@/features/notes/types";

function createNotesAppBar(): FloatingAppBarModel {
  return {
    currentLocale: null,
    groupCrumb: null,
    localeOptions: CANONICAL_READER_LOCALES.map((locale) => ({
      href: null,
      label: READER_LOCALE_LABELS[locale].label,
      locale,
    })),
    storyRootHref: null,
    storySelect: null,
  };
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function sortNotes(notes: Record<string, StoryNoteEntry>) {
  return Object.values(notes).sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

function NoteOverviewCard({
  note,
  setStoryNote,
  storyEntry,
}: {
  note: StoryNoteEntry;
  setStoryNote: ReturnType<typeof useStoryNotes>["setStoryNote"];
  storyEntry: ContentStoryIndexEntry | null;
}) {
  const [draftText, setDraftText] = useState(note.text);
  const storyHref = storyEntry ? getReaderStoryHref(note.locale, storyEntry.groupId, storyEntry.storyId) : null;

  const saveText = (text: string) => {
    setStoryNote({
      groupId: note.groupId,
      groupTitle: note.groupTitle,
      locale: note.locale,
      storyId: note.storyId,
      storyTitle: note.storyTitle,
      text,
    });
  };

  const handleTextChange = (text: string) => {
    setDraftText(text);
    if (text.trim().length > 0) {
      saveText(text);
    }
  };

  const handleTextBlur = () => {
    if (draftText.trim().length === 0) {
      saveText(draftText);
    }
  };

  return (
    <article
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]/94 shadow-[var(--shadow-sm)]"
      data-testid="note-card"
    >
      <CardHeader
        className="flex-row items-start justify-between gap-4 px-5 py-4"
        data-testid="note-card-header"
      >
        <div className="grid min-w-0 gap-1" data-testid="note-title-block">
          <CardTitle className="break-words text-xl [overflow-wrap:anywhere] md:text-2xl">
            {note.storyTitle}
          </CardTitle>
          <p className="break-words text-sm text-[var(--text-muted)]" data-testid="note-group-title">
            {note.groupTitle}
          </p>
          {storyEntry?.storyCode || storyEntry?.avgTag ? (
            <div className="mt-1 flex flex-wrap gap-1.5" data-testid="note-classification-badges">
              {storyEntry.storyCode ? (
                <Badge
                  className="px-2 py-0.5 text-[10px] tracking-[0.12em]"
                  data-testid="note-stage-badge"
                  variant="contrast"
                >
                  {storyEntry.storyCode}
                </Badge>
              ) : null}
              {storyEntry.avgTag ? (
                <Badge
                  className="px-2 py-0.5 text-[10px] tracking-[0.12em]"
                  data-testid="note-phase-badge"
                  variant="accent"
                >
                  {storyEntry.avgTag}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="shrink-0">
          {storyHref ? (
            <Link
              className="inline-flex h-9 w-fit items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-xs font-semibold text-[var(--text)] shadow-[var(--shadow-sm)] transition duration-[var(--motion-fast)] ease-out hover:border-[var(--accent)] hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)]"
              data-testid="note-story-link"
              href={storyHref}
            >
              스토리로 이동
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex h-9 w-fit items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text-muted)] opacity-60"
              data-testid="note-story-link-disabled"
            >
              스토리로 이동
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 px-5 pb-5">
        <Textarea
          aria-label={`${note.storyTitle} 메모 수정`}
          className="min-h-36 resize-y rounded-[var(--radius-md)] shadow-none"
          data-testid="note-card-textarea"
          onBlur={handleTextBlur}
          onChange={(event) => handleTextChange(event.target.value)}
          value={draftText}
        />
        <p className="justify-self-end text-xs text-[var(--text-muted)]" data-testid="note-updated-at">
          {formatUpdatedAt(note.updatedAt)}
        </p>
      </CardContent>
    </article>
  );
}

export function NotesOverview() {
  const appBar = createNotesAppBar();
  const { isHydrated, setStoryNote, state } = useStoryNotes();
  const indexState = useContentIndex();
  const notes = sortNotes(state.notes);

  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
              <NotebookText aria-hidden="true" className="h-5 w-5 text-[var(--accent-strong)]" />
            </span>
            <div className="min-w-0">
              <h1 className="font-[var(--font-display)] text-3xl font-semibold leading-tight tracking-[-0.03em] text-[var(--text)] md:text-4xl">
                메모
              </h1>
            </div>
          </div>
        </section>
      }
      testId="notes-shell"
    >
      <section className="relative z-10 grid gap-4" data-testid="notes-overview">
        {!isHydrated ? (
          <Card className="bg-[var(--surface)]/94">
            <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
              메모를 불러오는 중입니다.
            </CardContent>
          </Card>
        ) : notes.length === 0 ? (
          <Card className="bg-[var(--surface)]/94" data-testid="notes-empty-state">
            <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
              아직 작성한 메모가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div
            className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,34rem),1fr))] gap-4"
            data-testid="notes-list"
          >
            {notes.map((note) => {
              const storyEntry =
                indexState.data && findStoryEntry(indexState.data, note.locale, note.groupId, note.storyId);

              return (
                <NoteOverviewCard
                  key={note.storyId}
                  note={note}
                  setStoryNote={setStoryNote}
                  storyEntry={storyEntry || null}
                />
              );
            })}
          </div>
        )}
      </section>
    </ReaderPageFrame>
  );
}
