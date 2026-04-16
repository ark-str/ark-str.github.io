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
    description: "업스트림 기준 원문 서버",
  },
  en: {
    label: "English",
    description: "정규화와 summary 기준 로케일",
  },
  jp: {
    label: "日本語",
    description: "일본어 텍스트 검수 대상",
  },
  kr: {
    label: "한국어",
    description: "현재 홈과 리더의 기본 진입 로케일",
  },
  tw: {
    label: "繁體中文",
    description: "번체 중국어 텍스트 검수 대상",
  },
};

export function isReaderLocale(value: string): value is ReaderLocale {
  return CANONICAL_READER_LOCALES.includes(value as ReaderLocale);
}
