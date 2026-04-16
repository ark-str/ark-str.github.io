import type { ReaderLocale } from "@/features/content/types";

export type CharacterObservationRecord = {
  aliases: string[];
};

export type CharacterObservationLocaleMap = Record<string, CharacterObservationRecord>;

export type CharacterObservationsState = {
  locales: Partial<Record<ReaderLocale, CharacterObservationLocaleMap>>;
};
