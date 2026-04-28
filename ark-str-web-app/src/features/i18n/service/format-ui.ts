import { UI_INTL_LOCALES, getUiCopy } from "@/features/i18n/config/ui-copy";
import type { ReaderLocale } from "@/features/content/types";

export function formatUiNumber(locale: ReaderLocale, value: number): string {
  return new Intl.NumberFormat(UI_INTL_LOCALES[locale]).format(value);
}

export function formatUiDateTime(locale: ReaderLocale, value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(UI_INTL_LOCALES[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatUiMinutes(locale: ReaderLocale, minutes: number): string {
  return getUiCopy(locale).common.aboutMinutes(formatUiNumber(locale, minutes));
}
