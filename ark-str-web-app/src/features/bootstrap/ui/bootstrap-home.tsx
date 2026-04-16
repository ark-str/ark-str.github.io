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
import { useAppPreferences } from "@/features/preferences/runtime/app-preferences-context";

const foundationPillars = [
  {
    title: "Semantic tokens",
    detail: "색상, 타이포, 간격, 반경, 그림자를 역할 중심 토큰으로 고정합니다.",
    icon: Palette,
  },
  {
    title: "Shared primitives",
    detail: "공용 UI는 shadcn 기반 프리미티브에서 시작하고 feature UI는 이를 조합합니다.",
    icon: Boxes,
  },
  {
    title: "Voice and tone",
    detail: "UI 카피와 요약문은 차분한 기록 보관소 톤을 유지합니다.",
    icon: ScrollText,
  },
  {
    title: "Guardrails",
    detail: "토큰 바깥의 하드코딩 색상과 구조 드리프트는 가드로 막습니다.",
    icon: ShieldCheck,
  },
];

export function BootstrapHome() {
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
              <Badge variant="accent">Design System Foundation</Badge>
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
              읽기 중심의 Arknights story archive를 위한 시각 언어를 세우는 중입니다.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-8 md:text-lg">
              지금 단계는 Reader 기능을 확장하기 전에 토큰, 테마, 공용 프리미티브, 보이스
              앤 톤, 가드를 한 번에 고정하는 작업입니다. 이후 스토리 본문과 인물정보는 이
              기준 위에서만 구현됩니다.
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
                  원격 폰트, API, CDN 없이 저장소 안 자산만 사용합니다.
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
                  Tone
                </p>
                <p className="mt-2 text-lg font-semibold">Editorial archive</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                  문학적 읽기 경험과 기록 보관소 같은 구조감을 함께 가져갑니다.
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
            <CardTitle className="text-2xl">Issue #4 / PR #5</CardTitle>
            <CardDescription>
              디자인 시스템 foundation 이슈는 현재 bootstrap shell을 새 시각 규칙으로
              재구성하고, 이후 Reader와 Characters가 재사용할 기반을 만듭니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="uppercase tracking-[0.18em] text-[var(--text-muted)]">Hydration</dt>
                <dd className="mt-1 text-base font-semibold">
                  {isHydrated ? "Recovered from local storage" : "Loading persisted state"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-[var(--text-muted)]">Theme</dt>
                <dd className="mt-1 text-base font-semibold">
                  Light and dark archive themes share the same semantic tokens.
                </dd>
              </div>
            </dl>
            <Separator />
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Dependency note
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                `reader-shell`은 `content-pipeline-foundation`과 `design-system-foundation`이
                모두 merge된 뒤에만 시작합니다.
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
              Design pillars
            </Badge>
            <CardTitle className="text-2xl">Reader가 기대는 공용 언어</CardTitle>
            <CardDescription>
              이 foundation 이슈가 끝나면 다음 구현은 아래 네 축만 재사용합니다.
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
                light/dark 토글은 app-owned preference repo를 통해 저장되며, malformed 값은
                안전하게 기본 light theme으로 복구됩니다.
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
          <CardTitle className="text-2xl">What this design system optimizes for</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-strong)]">
              <BookOpenText className="h-4 w-4" />
              <p className="font-semibold">Readable story flow</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              대사와 서술의 구분, line length, 정보 위계는 긴 스크립트를 편하게 읽기 위한
              기준으로 맞춥니다.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-strong)]">
              <Boxes className="h-4 w-4" />
              <p className="font-semibold">Composable surfaces</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              Home, Reader, Characters는 같은 card, rail, badge, divider 언어를 공유해야
              합니다.
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
