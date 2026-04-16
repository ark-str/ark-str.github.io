export type CharacterObservationLocale = "cn" | "en" | "jp" | "kr" | "tw";

export type CharacterObservationRecord = {
  aliases: string[];
};

export type CharacterObservationLocaleMap = Record<string, CharacterObservationRecord>;

export type CharacterObservationsState = {
  locales: Partial<Record<CharacterObservationLocale, CharacterObservationLocaleMap>>;
};
