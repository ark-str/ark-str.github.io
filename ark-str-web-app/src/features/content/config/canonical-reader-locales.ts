import type { ReaderLocale } from "@/features/content/types";

export const CANONICAL_READER_LOCALES: ReaderLocale[] = ["cn", "en", "jp", "kr", "tw"];

export const READER_LOCALE_LABELS: Record<
  ReaderLocale,
  {
    label: string;
    description: string;
  }
> = {
  cn: {
    label: "简体中文",
    description: "Upstream baseline source server",
  },
  en: {
    label: "English",
    description: "Normalization and summary baseline locale",
  },
  jp: {
    label: "日本語",
    description: "Japanese text review target",
  },
  kr: {
    label: "한국어",
    description: "Default entry locale for the home and reader surfaces",
  },
  tw: {
    label: "繁體中文",
    description: "Traditional Chinese text review target",
  },
};

export function isReaderLocale(value: string): value is ReaderLocale {
  return CANONICAL_READER_LOCALES.includes(value as ReaderLocale);
}
