import { DEFAULT_CHARACTER_OBSERVATIONS_STATE } from "@/features/characters/config/default-character-observations-state";
import type { CharacterObservationLocaleMap, CharacterObservationsState } from "@/features/characters/types";

function normalizeAliasList(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return [...new Set(raw.filter((value): value is string => typeof value === "string" && value.trim().length > 0))];
}

function normalizeLocaleEntries(raw: unknown): CharacterObservationLocaleMap {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(raw).flatMap(([operatorId, value]) => {
      if (typeof operatorId !== "string" || operatorId.length === 0 || !value || typeof value !== "object") {
        return [];
      }

      const aliases = normalizeAliasList((value as { aliases?: unknown }).aliases);
      return aliases.length > 0 ? [[operatorId, { aliases }]] : [];
    }),
  );
}

export function normalizeCharacterObservationsState(raw: unknown): CharacterObservationsState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_CHARACTER_OBSERVATIONS_STATE;
  }

  const locales = (raw as { locales?: unknown }).locales;
  if (!locales || typeof locales !== "object") {
    return DEFAULT_CHARACTER_OBSERVATIONS_STATE;
  }

  return {
    locales: {
      cn: normalizeLocaleEntries((locales as Record<string, unknown>).cn),
      en: normalizeLocaleEntries((locales as Record<string, unknown>).en),
      jp: normalizeLocaleEntries((locales as Record<string, unknown>).jp),
      kr: normalizeLocaleEntries((locales as Record<string, unknown>).kr),
      tw: normalizeLocaleEntries((locales as Record<string, unknown>).tw),
    },
  };
}
