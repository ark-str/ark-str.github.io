"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, MoonStar, SunMedium } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAppPreferences } from "@/features/preferences/runtime/app-preferences-context";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";
import type { ReaderLocale } from "@/features/content/types";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { appIconPath } from "@/lib/public-path";

type FloatingAppBarProps = {
  model: FloatingAppBarModel;
};

export function FloatingAppBar({ model }: FloatingAppBarProps) {
  const router = useRouter();
  const appBarRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const { isHydrated: isThemeHydrated, state: preferencesState, toggleTheme } = useAppPreferences();
  const { isHydrated: isSessionHydrated, setPreferredLocale, state: readerState } = useReaderSession();

  const currentLocale = model.currentLocale ?? readerState.preferredLocale;
  const storyRootHref = model.storyRootHref ?? `/reader/${readerState.preferredLocale}`;
  const isDarkTheme = preferencesState.theme === "dark";

  useEffect(() => {
    const updateAppBarHeight = () => {
      const appBarHeight = appBarRef.current?.getBoundingClientRect().height ?? 0;
      if (appBarHeight > 0) {
        document.documentElement.style.setProperty("--app-bar-height", `${appBarHeight}px`);
      }
    };

    updateAppBarHeight();
    window.addEventListener("resize", updateAppBarHeight);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && appBarRef.current
        ? new ResizeObserver(updateAppBarHeight)
        : null;
    if (appBarRef.current) {
      resizeObserver?.observe(appBarRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateAppBarHeight);
      resizeObserver?.disconnect();
      document.documentElement.style.removeProperty("--app-bar-height");
    };
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const updateVisibility = () => {
      animationFrameRef.current = null;
      const nextScrollY = window.scrollY;
      const scrollDelta = nextScrollY - lastScrollYRef.current;

      if (nextScrollY <= 24) {
        setIsHidden(false);
      } else if (scrollDelta > 8) {
        setIsHidden(true);
      } else if (scrollDelta < -8) {
        setIsHidden(false);
      }

      lastScrollYRef.current = nextScrollY;
    };

    const handleScroll = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateVisibility);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
      ref={appBarRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/98 shadow-[var(--shadow-md)] transition-transform duration-[var(--motion-base)] ease-out",
        isHidden ? "-translate-y-full" : "translate-y-0",
      )}
      data-hidden={isHidden ? "true" : "false"}
      data-testid="floating-app-bar"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-3 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            aria-label="홈"
            className={cn(buttonVariants({ size: "icon", variant: "ghost" }), "h-10 w-10")}
            href="/"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              aria-hidden="true"
              className="h-7 w-7 rounded-[var(--radius-sm)] object-cover"
              data-testid="app-home-icon"
              height={28}
              src={appIconPath}
              width={28}
            />
          </Link>
          <Link className={cn(buttonVariants({ size: "sm", variant: "subtle" }))} href={storyRootHref}>
            스토리
          </Link>
          {model.groupCrumb ? (
            <>
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 text-[var(--text-muted)]"
                data-testid="breadcrumb-separator-icon"
              />
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
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 text-[var(--text-muted)]"
                data-testid="breadcrumb-separator-icon"
              />
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
            aria-label={isDarkTheme ? "라이트 테마로 변경" : "다크 테마로 변경"}
            className={cn(buttonVariants({ size: "icon", variant: "subtle" }), "h-10 w-10")}
            data-testid="theme-toggle"
            disabled={!isThemeHydrated}
            onClick={toggleTheme}
            type="button"
          >
            {isDarkTheme ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
