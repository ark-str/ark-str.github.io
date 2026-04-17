import type { ReaderLocale } from "@/features/content/types";

export type AppChromeLocaleOption = {
  locale: ReaderLocale;
  label: string;
  href: string | null;
};

export type AppChromeStoryOption = {
  storyId: string;
  label: string;
  href: string;
};

export type AppChromeCrumb = {
  label: string;
  href: string | null;
};

export type FloatingAppBarModel = {
  currentLocale: ReaderLocale | null;
  localeOptions: AppChromeLocaleOption[];
  storyRootHref: string | null;
  groupCrumb: AppChromeCrumb | null;
  storySelect:
    | {
        currentStoryId: string;
        options: AppChromeStoryOption[];
      }
    | null;
};
