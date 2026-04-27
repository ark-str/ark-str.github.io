"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
} from "@/features/content/config/canonical-reader-locales";
import { getReaderStoryHref } from "@/features/content/config/reader-routes";
import { useSearchIndex } from "@/features/content/runtime/use-public-content";
import type { ContentSearchStoryEntry, ReaderLocale } from "@/features/content/types";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";
import {
  INITIAL_VISIBLE_SEARCH_RESULT_COUNT,
  SEARCH_QUERY_URL_DEBOUNCE_MS,
  SEARCH_RESULT_INCREMENT,
  normalizeSearchQuery,
  prepareSearchStories,
  searchStories,
} from "@/features/search/service/search-stories";
import type { SearchMatchRange, StorySearchResult } from "@/features/search/types";

function createSearchAppBar(): FloatingAppBarModel {
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

function formatMetric(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function createSearchHref(query: string) {
  const normalizedQuery = normalizeSearchQuery(query);
  if (normalizedQuery.length === 0) {
    return "/search";
  }

  const params = new URLSearchParams({ q: normalizedQuery });
  return `/search?${params.toString()}`;
}

function HighlightedText({
  matchRanges,
  text,
}: {
  matchRanges: SearchMatchRange[];
  text: string;
}) {
  if (matchRanges.length === 0) {
    return <>{text}</>;
  }

  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const range of matchRanges) {
    if (range.start > cursor) {
      parts.push(text.slice(cursor, range.start));
    }

    parts.push(
      <mark
        className="rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-0.5 font-semibold text-[var(--accent-strong)]"
        data-testid="search-result-highlight"
        key={`${range.start}-${range.end}`}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}

function SearchResultCard({
  locale,
  result,
}: {
  locale: ReaderLocale;
  result: StorySearchResult<ContentSearchStoryEntry>;
}) {
  const storyHref = getReaderStoryHref(locale, result.story.groupId, result.story.storyId);

  return (
    <Link
      className="group block"
      data-testid="search-result-card"
      href={storyHref}
    >
      <Card className="bg-[var(--surface)]/94 transition duration-[var(--motion-fast)] ease-out group-hover:-translate-y-px group-hover:border-[var(--accent)] group-hover:shadow-[var(--shadow-sm)]">
        <CardHeader className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="grid min-w-0 gap-3">
            <div className="flex flex-wrap gap-1.5" data-testid="search-result-classification">
              {result.story.storyCode ? (
                <Badge className="px-2 py-0.5 text-[10px]" data-testid="search-result-stage-badge" variant="contrast">
                  {result.story.storyCode}
                </Badge>
              ) : null}
              {result.story.avgTag ? (
                <Badge className="px-2 py-0.5 text-[10px]" data-testid="search-result-phase-badge" variant="accent">
                  {result.story.avgTag}
                </Badge>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <CardTitle className="break-words text-2xl [overflow-wrap:anywhere]">
                {result.story.title}
              </CardTitle>
              <p className="break-words text-sm text-[var(--text-muted)]">
                {result.story.groupTitle}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] md:justify-end">
            <span className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
              {formatMetric(result.story.visibleCharacterCount)} chars
            </span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
              약 {formatMetric(result.story.estimatedMinutes)}분
            </span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[var(--accent-strong)]" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <p
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm leading-7 text-[var(--text)]"
            data-testid="search-result-line"
          >
            <HighlightedText matchRanges={result.matchRanges} text={result.line} />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SearchOverview() {
  const appBar = createSearchAppBar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const { state: readerSessionState } = useReaderSession();
  const locale = readerSessionState.preferredLocale;
  const [inputState, setInputState] = useState({
    sourceQuery: urlQuery,
    value: urlQuery,
  });
  const inputValue = inputState.sourceQuery === urlQuery ? inputState.value : urlQuery;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const indexState = useSearchIndex(locale);
  const query = normalizeSearchQuery(inputValue);
  const preparedStories = useMemo(
    () => (indexState.data ? prepareSearchStories(indexState.data.stories) : []),
    [indexState.data],
  );
  const results = useMemo(
    () => searchStories(preparedStories, query),
    [preparedStories, query],
  );
  const resultSetKey = `${locale}\u0000${query}\u0000${results.length}`;
  const [visibleResultState, setVisibleResultState] = useState({
    count: INITIAL_VISIBLE_SEARCH_RESULT_COUNT,
    resultSetKey,
  });
  const visibleResultCount =
    visibleResultState.resultSetKey === resultSetKey
      ? visibleResultState.count
      : INITIAL_VISIBLE_SEARCH_RESULT_COUNT;
  const visibleResults = results.slice(0, visibleResultCount);
  const hasMoreResults = visibleResultCount < results.length;
  const localeLabel = READER_LOCALE_LABELS[locale].label;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextHref = createSearchHref(inputValue);
      const nextQuery = normalizeSearchQuery(inputValue);
      if (nextQuery !== urlQuery) {
        router.replace(nextHref, { scroll: false });
      }
    }, SEARCH_QUERY_URL_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [inputValue, router, urlQuery]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreResults) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleResultState((current) => {
            const currentCount =
              current.resultSetKey === resultSetKey
                ? current.count
                : INITIAL_VISIBLE_SEARCH_RESULT_COUNT;

            return {
              count: Math.min(currentCount + SEARCH_RESULT_INCREMENT, results.length),
              resultSetKey,
            };
          });
        }
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreResults, resultSetKey, results.length, visibleResultCount]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.replace(createSearchHref(inputValue), { scroll: false });
  };

  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section className="relative z-10 grid gap-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
              <Search aria-hidden="true" className="h-5 w-5 text-[var(--accent-strong)]" />
            </span>
            <div className="min-w-0">
              <h1 className="font-[var(--font-display)] text-3xl font-semibold leading-tight tracking-[-0.03em] text-[var(--text)] md:text-4xl">
                검색
              </h1>
            </div>
          </div>
          <form className="relative" data-testid="search-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="story-search-input">
              스토리 검색
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              autoComplete="off"
              autoFocus
              className="h-14 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]/92 px-11 text-base font-semibold text-[var(--text)] shadow-[var(--shadow-sm)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
              data-testid="search-input"
              id="story-search-input"
              onChange={(event) =>
                setInputState({
                  sourceQuery: urlQuery,
                  value: event.target.value,
                })
              }
              placeholder={`${localeLabel} 스토리 검색`}
              type="search"
              value={inputValue}
            />
          </form>
        </section>
      }
      testId="search-shell"
    >
      <section className="relative z-10 grid gap-4" data-testid="search-overview">
        {query.length === 0 ? (
          <Card className="bg-[var(--surface)]/94" data-testid="search-empty-state">
            <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
              검색어를 입력하면 현재 언어의 모든 스토리에서 찾아봅니다.
            </CardContent>
          </Card>
        ) : indexState.status === "loading" ? (
          <Card className="bg-[var(--surface)]/94" data-testid="search-loading-state">
            <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
              {localeLabel} 검색 인덱스를 불러오는 중입니다.
            </CardContent>
          </Card>
        ) : indexState.status === "error" ? (
          <Card className="bg-[var(--surface)]/94" data-testid="search-error-state">
            <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
              검색 인덱스를 불러오지 못했습니다.
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card className="bg-[var(--surface)]/94" data-testid="search-no-results-state">
            <CardContent className="px-5 py-6 text-sm leading-7 text-[var(--text-muted)]">
              일치하는 스토리가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <>
            <div
              className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]"
              data-testid="search-results-summary"
            >
              <span>
                <strong className="font-semibold text-[var(--text)]" data-testid="search-results-count">
                  {formatMetric(results.length)}
                </strong>
                개 스토리
              </span>
              <span>{localeLabel}</span>
            </div>
            <div className="grid gap-4" data-testid="search-results-list">
              {visibleResults.map((result) => (
                <SearchResultCard
                  key={result.story.storyId}
                  locale={locale}
                  result={result}
                />
              ))}
            </div>
            {hasMoreResults ? (
              <div
                className="py-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
                data-testid="search-results-sentinel"
                ref={loadMoreRef}
              >
                더 불러오는 중
              </div>
            ) : null}
          </>
        )}
      </section>
    </ReaderPageFrame>
  );
}
