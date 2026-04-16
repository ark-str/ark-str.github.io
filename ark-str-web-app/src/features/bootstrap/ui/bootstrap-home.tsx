"use client";

import {
  BookOpenText,
  Boxes,
  MoonStar,
  Palette,
  ScrollText,
  ShieldCheck,
  SunMedium,
  SunMoon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AVAILABLE_LOCALES } from "@/features/bootstrap/config/default-bootstrap-state";
import { useBootstrapState } from "@/features/bootstrap/runtime/use-bootstrap-state";
import type { ContentReadinessSnapshot } from "@/features/content/types";
import { useAppPreferences } from "@/features/preferences/runtime/app-preferences-context";

const foundationPillars = [
  {
    title: "Vendor attachment",
    detail: "ArknightsData submodule에서 서버 루트와 excel 테이블 구조를 안정적으로 읽습니다.",
    icon: Palette,
  },
  {
    title: "Normalized index",
    detail: "story review와 stage 정보를 앱 전용 group/story 인덱스로 정규화합니다.",
    icon: Boxes,
  },
  {
    title: "Status manifests",
    detail: "source hash와 summary readiness를 story 단위 manifest로 추적합니다.",
    icon: ScrollText,
  },
  {
    title: "Integrity checks",
    detail: "generated output이 vendor source와 어긋나면 verify에서 바로 실패시킵니다.",
    icon: ShieldCheck,
  },
];

export function BootstrapHome({ readiness }: { readiness: ContentReadinessSnapshot }) {
  const { isHydrated, reset, setNote, setOnboardingAccepted, setPreferredLocale, state } =
    useBootstrapState();
  const {
    isHydrated: isThemeHydrated,
    state: { theme },
    toggleTheme,
  } = useAppPreferences();
  const isDarkTheme = theme === "dark";

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 text-[var(--text)] md:px-8 lg:px-12"
      data-testid="bootstrap-shell"
    >
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <Card className="overflow-hidden bg-[var(--surface)]/94 backdrop-blur">
          <CardHeader className="gap-4 pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="accent">Content Pipeline Foundation</Badge>
              <Button
                aria-label="Toggle theme"
                className="min-w-36 justify-between"
                data-testid="theme-toggle"
                disabled={!isThemeHydrated}
                onClick={toggleTheme}
                variant="subtle"
              >
                <span className="inline-flex items-center gap-2">
                  {isDarkTheme ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                  Theme
                </span>
                <span className="text-xs uppercase tracking-[0.18em]" data-testid="theme-value">
                  {theme}
                </span>
              </Button>
            </div>
            <CardTitle className="max-w-4xl text-4xl leading-tight md:text-5xl">
              Arknights vendor 데이터를 읽을 수 있는 첫 번째 generated content contract를 세우는 중입니다.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-8 md:text-lg">
              지금 단계는 upstream game data를 `vendor/ArknightsData`에서 읽어, 앱이
              소비할 수 있는 정규화 index와 상태 manifest를 `public/generated/content`로
              내보내는 작업입니다. Reader와 Character unlock은 이 계약 위에서만
              구현됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Runtime
                </p>
                <p className="mt-2 text-lg font-semibold">Bundled only</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                  런타임은 generated JSON만 읽고, 외부 GitHub 데이터는 build-time에만 사용합니다.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  State
                </p>
                <p className="mt-2 text-lg font-semibold">Local-first</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                  테마, 읽기 진행도, 언락 상태는 feature repo를 거쳐 localStorage에만 저장합니다.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Data flow
                </p>
                <p className="mt-2 text-lg font-semibold">Vendor → Generated</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                  `story_review_table`, `stage_table`, `story_table`을 읽어 앱 전용 인덱스로 정규화합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/92">
          <CardHeader>
            <Badge variant="contrast" className="w-fit">
              Working Session
            </Badge>
            <CardTitle className="text-2xl">Content readiness snapshot</CardTitle>
            <CardDescription>
              generated content는 현재 phase의 유일한 runtime 입력입니다. 이 숫자들은
              build-time 파이프라인 산출물을 기준으로 계산됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-4 text-sm" data-testid="readiness-panel">
              <div>
                <dt className="uppercase tracking-[0.18em] text-[var(--text-muted)]">Servers</dt>
                <dd className="mt-1 text-base font-semibold">
                  <span data-testid="server-count">{readiness.serverCount}</span>
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-[var(--text-muted)]">Stories</dt>
                <dd className="mt-1 text-base font-semibold">
                  <span data-testid="story-count">{readiness.storyCount}</span>
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-[var(--text-muted)]">Missing summaries</dt>
                <dd className="mt-1 text-base font-semibold">
                  <span data-testid="summary-missing-count">{readiness.summaryMissingCount}</span>
                </dd>
              </div>
            </dl>
            <Separator />
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Build snapshot
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                {readiness.generatedAt
                  ? `Generated at ${readiness.generatedAt}. reader-shell은 이 index contract가 안정화된 뒤에만 시작합니다.`
                  : "Generated content가 아직 없습니다. content:update를 먼저 실행해야 합니다."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-[var(--surface)]/92">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Persisted Bootstrap Preferences
              </p>
              <CardTitle className="text-2xl">
                다음 이터레이션에 넘길 로컬 선호도
              </CardTitle>
              <CardDescription>
                locale, note, onboarding 상태는 bootstrap feature repo를 통해 저장됩니다.
              </CardDescription>
            </div>
            <Button
              data-testid="reset-preferences-button"
              disabled={!isHydrated}
              onClick={reset}
              variant="ghost"
            >
              Reset
            </Button>
          </CardHeader>

          <CardContent className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--text)]">Preferred locale</span>
              <Select
                data-testid="locale-select"
                disabled={!isHydrated}
                onChange={(event) => setPreferredLocale(event.target.value as (typeof AVAILABLE_LOCALES)[number]["code"])}
                value={state.preferredLocale}
              >
                {AVAILABLE_LOCALES.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.label} · {locale.description}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--text)]">Operator note</span>
              <Textarea
                data-testid="note-input"
                disabled={!isHydrated}
                onChange={(event) => setNote(event.target.value)}
                placeholder="이 브랜치에서 이어서 처리할 제약이나 메모를 남기세요."
                value={state.note}
              />
            </label>

            <label className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] px-4 py-4">
              <Checkbox
                checked={state.onboardingAccepted}
                data-testid="onboarding-toggle"
                disabled={!isHydrated}
                onChange={(event) => setOnboardingAccepted(event.target.checked)}
              />
              <span className="text-sm leading-6 text-[var(--text)]">
                루트 하네스 구조가 앱보다 우선이라는 점을 이해했고, 다음 이슈들은 이 구조를
                유지한 채 확장합니다.
              </span>
            </label>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/92">
          <CardHeader>
            <Badge variant="default" className="w-fit">
              Pipeline pillars
            </Badge>
            <CardTitle className="text-2xl">Reader가 기대는 generated 계약</CardTitle>
            <CardDescription>
              이 foundation 이슈가 끝나면 다음 구현은 아래 네 축을 입력으로 재사용합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3">
              {foundationPillars.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--accent-strong)]">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                        Pillar {index + 1}
                      </p>
                      <p className="mt-1 text-lg font-semibold">{step.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
              <div className="flex items-center gap-2 text-[var(--accent-strong)]">
                <SunMoon className="h-4 w-4" />
                <p className="text-sm font-semibold">Theme persistence contract</p>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                light/dark 토글은 app-owned preference repo를 통해 저장되고, content
                readiness는 generated manifest에서 읽습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-[var(--surface)]/92">
        <CardHeader>
          <Badge variant="default" className="w-fit">
            Product direction
          </Badge>
          <CardTitle className="text-2xl">What this pipeline unlocks next</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-strong)]">
              <BookOpenText className="h-4 w-4" />
              <p className="font-semibold">Readable story flow</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              스토리 본문은 이 이슈에서 구현하지 않지만, 이후 Reader는 정규화된 story index를
              기준으로 탐색 구조를 만듭니다.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-strong)]">
              <Boxes className="h-4 w-4" />
              <p className="font-semibold">Composable surfaces</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              Home, Reader, Characters는 같은 UI 언어를 공유하고, generated content
              contract는 모든 페이지가 같은 인덱스를 참조하게 만듭니다.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-strong)]">
              <ShieldCheck className="h-4 w-4" />
              <p className="font-semibold">Mechanical consistency</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              디자인 원칙은 기억에 기대지 않고 docs, tokens, primitives, guards로 고정합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
