"use client";

import type { ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, MoonStar, SunMedium } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAppPreferences } from "@/features/preferences/runtime/app-preferences-context";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";
import type { ReaderLocale } from "@/features/content/types";
import type { FloatingAppBarModel } from "@/components/layout/types";

type FloatingAppBarProps = {
  model: FloatingAppBarModel;
};

export function FloatingAppBar({ model }: FloatingAppBarProps) {
  const router = useRouter();
  const { isHydrated: isThemeHydrated, state: preferencesState, toggleTheme } = useAppPreferences();
  const { isHydrated: isSessionHydrated, setPreferredLocale, state: readerState } = useReaderSession();

  const currentLocale = model.currentLocale ?? readerState.preferredLocale;
  const storyRootHref = model.storyRootHref ?? `/reader/${readerState.preferredLocale}`;
  const isDarkTheme = preferencesState.theme === "dark";

  const handleLocaleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as ReaderLocale;
    const target = model.localeOptions.find((option) => option.locale === nextLocale) ?? null;

    setPreferredLocale(nextLocale);
    if (target?.href) {
      router.push(target.href);
    }
  };

  const handleStoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const target = model.storySelect?.options.find((option) => option.storyId === event.target.value) ?? null;
    if (target) {
      router.push(target.href);
    }
  };

  return (
    <div
      className="sticky top-4 z-40 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]/96 px-4 py-3 shadow-[var(--shadow-md)]"
      data-testid="floating-app-bar"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link className={cn(buttonVariants({ size: "sm", variant: "subtle" }))} href="/">
            <Home className="h-4 w-4" />
            홈
          </Link>
          <Link className={cn(buttonVariants({ size: "sm", variant: "subtle" }))} href={storyRootHref}>
            스토리
          </Link>
          {model.groupCrumb ? (
            <>
              <span className="px-1 text-sm text-[var(--text-muted)]">&gt;</span>
              {model.groupCrumb.href ? (
                <Link
                  className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "max-w-[18rem] truncate")}
                  href={model.groupCrumb.href}
                >
                  {model.groupCrumb.label}
                </Link>
              ) : (
                <span className="px-3 text-sm font-semibold text-[var(--text)]">
                  {model.groupCrumb.label}
                </span>
              )}
            </>
          ) : null}
          {model.storySelect ? (
            <>
              <span className="px-1 text-sm text-[var(--text-muted)]">&gt;</span>
              <div className="min-w-[15rem] flex-1 lg:min-w-[20rem]">
                <Select
                  className="h-10 rounded-[var(--radius-md)] bg-[var(--surface)]/92 py-0 text-sm shadow-none"
                  data-testid="chrome-story-select"
                  onChange={handleStoryChange}
                  value={model.storySelect.currentStoryId}
                >
                  {model.storySelect.options.map((option) => (
                    <option key={option.storyId} value={option.storyId}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="min-w-[10rem]">
            <Select
              className="h-10 rounded-[var(--radius-md)] bg-[var(--surface)]/92 py-0 text-sm shadow-none"
              data-testid="locale-select"
              disabled={!isSessionHydrated}
              onChange={handleLocaleChange}
              value={currentLocale}
            >
              {model.localeOptions.map((option) => (
                <option key={option.locale} value={option.locale}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <button
            aria-label="Toggle theme"
            className={cn(buttonVariants({ size: "sm", variant: "subtle" }), "min-w-28 justify-between")}
            data-testid="theme-toggle"
            disabled={!isThemeHydrated}
            onClick={toggleTheme}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              {isDarkTheme ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
              Theme
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em]">{preferencesState.theme}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
