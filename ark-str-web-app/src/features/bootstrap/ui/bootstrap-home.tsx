"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, Boxes, LibraryBig, ScrollText } from "lucide-react";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ContentReadinessSnapshot, ReaderHomeModel } from "@/features/content/types";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";

const landingPillars = [
  {
    title: "Canonical locale routes",
    detail: "이제 리더는 `cn/en/jp/kr/tw` 경로를 기준으로 직접 진입합니다.",
    icon: LibraryBig,
  },
  {
    title: "Generated story bodies",
    detail: "스토리 본문은 `public/generated/content/stories/` 아래의 bundled JSON만 읽습니다.",
    icon: ScrollText,
  },
  {
    title: "Reader session restore",
    detail: "최근 읽은 스토리와 선호 locale은 reader session repo를 통해 복원됩니다.",
    icon: BookOpenText,
  },
  {
    title: "Index-backed navigation",
    detail: "홈과 리더 탐색은 모두 generated index contract를 기준으로 구성됩니다.",
    icon: Boxes,
  },
];

function buildStoryHref(locale: string, groupId: string, storyId: string) {
  return `/reader/${locale}/${groupId}/${storyId}`;
}

export function BootstrapHome({
  homeModel,
  readiness,
}: {
  homeModel: ReaderHomeModel;
  readiness: ContentReadinessSnapshot;
}) {
  const { isHydrated, reset, state } = useReaderSession();
  const preferredLocaleArchive =
    homeModel.locales.find((locale) => locale.locale === state.preferredLocale) ?? homeModel.locales[0] ?? null;
  const continueHref = state.lastVisitedStory
    ? buildStoryHref(
        state.lastVisitedStory.locale,
        state.lastVisitedStory.groupId,
        state.lastVisitedStory.storyId,
      )
    : preferredLocaleArchive?.featuredStory
      ? buildStoryHref(
          preferredLocaleArchive.locale,
          preferredLocaleArchive.featuredStory.groupId,
          preferredLocaleArchive.featuredStory.storyId,
        )
      : `/reader/${state.preferredLocale}`;
  const archiveHref = `/reader/${state.preferredLocale}`;

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
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <Card className="overflow-hidden bg-[var(--surface)]/94 backdrop-blur">
            <CardHeader className="gap-4 pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="accent">Reader shell</Badge>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Editorial archive surface
                </p>
              </div>
              <CardTitle className="max-w-4xl text-4xl leading-tight md:text-5xl">
                명일방주 스토리를 그룹 단위로 탐색하고, 마지막 읽기 지점으로 바로 복귀하는 읽기 표면입니다.
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-8 md:text-lg">
                상단 floating app bar를 기준으로 홈, 아카이브, 그룹, 스토리 레이아웃을 한 흐름으로
                묶습니다. story 페이지에서는 배경이 고정되고, 본문 카드만 앞으로 스크롤됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Continue
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {state.lastVisitedStory ? "Resume last story" : "Open featured story"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                    reader session이 있다면 마지막으로 읽던 URL로, 없다면 현재 locale의 대표 스토리로 이동합니다.
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Scope
                  </p>
                  <p className="mt-2 text-lg font-semibold">Body-first reader</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                    summary는 아직 생성되지 않았으므로, 하단 section에서 explicit empty state로만 노출합니다.
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Locale set
                  </p>
                  <p className="mt-2 text-lg font-semibold">cn / en / jp / kr / tw</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                    `bili`는 vendor 소스에는 남겨두되, 공개 앱 탐색과 URL에서는 제외합니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
                  data-testid="continue-reading-link"
                  href={continueHref}
                >
                  Continue reading
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className={cn(buttonVariants({ variant: "default", size: "lg" }))}
                  data-testid="open-locale-archive-link"
                  href={archiveHref}
                >
                  Open locale archive
                </Link>
              </div>

              <div
                className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--panel)] p-5"
                data-testid="last-visited-story"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Last visited
                </p>
                {state.lastVisitedStory ? (
                  <div className="mt-3 space-y-1">
                    <p className="text-lg font-semibold text-[var(--text)]">
                      {state.lastVisitedStory.title}
                    </p>
                    <p className="text-sm leading-6 text-[var(--text-muted)]">
                      {state.lastVisitedStory.locale} / {state.lastVisitedStory.groupId} /{" "}
                      {state.lastVisitedStory.storyId}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                    아직 읽은 스토리가 없습니다. 아래 locale archive 카드에서 바로 시작할 수 있습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)]/95" data-testid="readiness-panel">
            <CardHeader>
              <Badge variant="default" className="w-fit">
                Generated readiness
              </Badge>
              <CardTitle className="text-2xl">Current content contract</CardTitle>
              <CardDescription>
                리더는 아래 generated artifacts를 기준으로 탐색과 본문 렌더를 구성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="uppercase tracking-[0.14em] text-[var(--text-muted)]">Vendor servers</dt>
                  <dd className="mt-1 text-base font-semibold">
                    <span data-testid="server-count">{readiness.serverCount}</span>
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.14em] text-[var(--text-muted)]">Reader stories</dt>
                  <dd className="mt-1 text-base font-semibold">
                    <span data-testid="story-count">{readiness.storyCount}</span>
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.14em] text-[var(--text-muted)]">Missing summaries</dt>
                  <dd className="mt-1 text-base font-semibold">
                    <span data-testid="summary-missing-count">{readiness.summaryMissingCount}</span>
                  </dd>
                </div>
              </dl>
              <Separator />
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Build snapshot
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                  {readiness.generatedAt
                    ? `Generated at ${readiness.generatedAt}. story detail JSON과 summary 상태, 그룹 통계를 같이 읽어 리더를 구성합니다.`
                    : "Generated content가 아직 없습니다. content:update를 먼저 실행해야 합니다."}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      }
      testId="bootstrap-shell"
    >
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-[var(--surface)]/92">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Locale archives
              </p>
              <CardTitle className="text-2xl">Open a reading route</CardTitle>
              <CardDescription>
                locale archive는 group overview와 story deep link의 출발점입니다.
              </CardDescription>
            </div>
            <button
              className={cn(buttonVariants({ variant: "ghost" }))}
              data-testid="reset-session-button"
              disabled={!isHydrated}
              onClick={reset}
              type="button"
            >
              Reset session
            </button>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {homeModel.locales.map((locale) => (
              <article
                key={locale.locale}
                className="flex h-full flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4"
              >
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {locale.locale}
                  </p>
                  <h3 className="font-[var(--font-display)] text-2xl text-[var(--text)]">
                    {locale.label}
                  </h3>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    {locale.description}
                  </p>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-1 text-sm text-[var(--text-muted)]">
                    <span>{locale.groupCount} groups</span>
                    <span>{locale.storyCount} stories</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                      href={`/reader/${locale.locale}`}
                    >
                      Open archive
                    </Link>
                    {locale.featuredStory ? (
                      <Link
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                        href={buildStoryHref(
                          locale.locale,
                          locale.featuredStory.groupId,
                          locale.featuredStory.storyId,
                        )}
                      >
                        Featured story
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/92">
          <CardHeader>
            <Badge variant="default" className="w-fit">
              Reader shell pillars
            </Badge>
            <CardTitle className="text-2xl">What this issue actually opens</CardTitle>
            <CardDescription>
              이 단계는 summary와 character unlock이 아니라, 그룹 개요와 본문을 읽을 수 있는 shell을 여는 단계입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3">
              {landingPillars.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)]">
                      <step.icon className="h-4 w-4 text-[var(--accent)]" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        0{index + 1}
                      </p>
                      <h3 className="text-base font-semibold text-[var(--text)]">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">{step.detail}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </ReaderPageFrame>
  );
}
