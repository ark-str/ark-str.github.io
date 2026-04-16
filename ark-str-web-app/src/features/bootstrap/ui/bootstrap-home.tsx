"use client";

import { AVAILABLE_LOCALES } from "@/features/bootstrap/config/default-bootstrap-state";
import { useBootstrapState } from "@/features/bootstrap/runtime/use-bootstrap-state";

const dependencySteps = [
  {
    title: "Root bootstrap",
    detail: "fresh Next.js app, root harness docs, guards, and smoke restored",
  },
  {
    title: "Content pipeline",
    detail: "vendor sources, generated JSON DB, summary status manifest, and asset extraction",
  },
  {
    title: "Reader shell",
    detail: "story navigation, dialogue rendering, branch choices, and character unlock flow",
  },
  {
    title: "Review and merge",
    detail: "issue-based PRs, review loops, final verify, and default-branch evaluation",
  },
];

export function BootstrapHome() {
  const { isHydrated, reset, setNote, setOnboardingAccepted, setPreferredLocale, state } =
    useBootstrapState();

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 text-[var(--ink)] md:px-8 lg:px-12"
      data-testid="bootstrap-shell"
    >
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[var(--shadow)] backdrop-blur">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent-strong)]">
            Root-First Bootstrap
          </p>
          <h1
            className="max-w-3xl text-4xl leading-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Arknights story reader를 위한 단일 루트 하네스 환경을 다시 세우는 중입니다.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
            지금 단계는 실제 스토리 데이터 연동 전의 bootstrap 단계입니다. 루트에 앱, 문서,
            가드, 테스트, 하네스를 다시 고정하고 다음 child issue들이 같은 기준에서 병렬로
            진행될 수 있게 바닥을 맞추고 있습니다.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Runtime</p>
              <p className="mt-2 text-lg font-semibold">Bundled only</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                원격 폰트, API, CDN 없이 정적 자산만 사용합니다.
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">State</p>
              <p className="mt-2 text-lg font-semibold">localStorage</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                사용자 진행도와 선호도만 로컬에서 관리합니다.
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Harness</p>
              <p className="mt-2 text-lg font-semibold">Issue DAG</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                이슈별 브랜치와 PR로 검증 가능한 단위를 만듭니다.
              </p>
            </article>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[var(--line)] bg-[#102433] p-6 text-[#f4ede0] shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d4c1a4]">
            Working Session
          </p>
          <dl className="mt-5 grid gap-4">
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-[#d4c1a4]">Issue</dt>
              <dd className="mt-1 text-lg font-semibold">#2 Root bootstrap</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-[#d4c1a4]">Pull Request</dt>
              <dd className="mt-1 text-lg font-semibold">#3 Draft</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-[#d4c1a4]">Hydration</dt>
              <dd className="mt-1 text-lg font-semibold">
                {isHydrated ? "Recovered from local storage" : "Loading persisted state"}
              </dd>
            </div>
          </dl>
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4c1a4]">
              Next dependency edge
            </p>
            <p className="mt-2 text-sm leading-7 text-[#f4ede0]/84">
              `content-pipeline-foundation`은 이 bootstrap PR이 merge된 뒤에만 시작합니다.
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[2rem] border border-[var(--line)] bg-white/72 p-6 shadow-[var(--shadow)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Persisted Bootstrap Preferences
              </p>
              <h2
                className="mt-2 text-2xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                다음 이터레이션에 넘길 로컬 선호도
              </h2>
            </div>
            <button
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              data-testid="reset-preferences-button"
              disabled={!isHydrated}
              onClick={reset}
              type="button"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Preferred locale</span>
              <select
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
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
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Operator note</span>
              <textarea
                className="min-h-32 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                data-testid="note-input"
                disabled={!isHydrated}
                onChange={(event) => setNote(event.target.value)}
                placeholder="이 브랜치에서 이어서 처리할 제약이나 메모를 남기세요."
                value={state.note}
              />
            </label>

            <label className="flex items-center gap-3 rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel)] px-4 py-4">
              <input
                checked={state.onboardingAccepted}
                data-testid="onboarding-toggle"
                disabled={!isHydrated}
                onChange={(event) => setOnboardingAccepted(event.target.checked)}
                type="checkbox"
              />
              <span className="text-sm leading-6 text-[var(--ink)]">
                루트 하네스 구조가 앱보다 우선이라는 점을 이해했고, 다음 이슈들은 이 구조를
                유지한 채 확장합니다.
              </span>
            </label>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Planned Dependency Graph
          </p>
          <ol className="mt-5 grid gap-3">
            {dependencySteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-[1.5rem] border border-[var(--line)] bg-white/78 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  Step {index + 1}
                </p>
                <p className="mt-1 text-lg font-semibold">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.detail}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}
