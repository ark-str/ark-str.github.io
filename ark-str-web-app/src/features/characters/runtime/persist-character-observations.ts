"use client";

import type { ObservedOperator, ReaderLocale } from "@/features/content/types";
import {
  readPersistedCharacterObservationsState,
  writePersistedCharacterObservationsState,
} from "@/features/characters/repo/local-storage-character-observations-store";
import { mergeObservedOperators } from "@/features/characters/service/merge-observed-operators";
import { normalizeCharacterObservationsState } from "@/features/characters/service/normalize-character-observations-state";

export function persistCharacterObservations(
  locale: ReaderLocale,
  observedOperators: ObservedOperator[],
) {
  const operatorObservations = observedOperators.filter((observedOperator) =>
    observedOperator.speakerId.startsWith("char_"),
  );

  if (operatorObservations.length === 0) {
    return;
  }

  const currentState = normalizeCharacterObservationsState(readPersistedCharacterObservationsState());
  const nextState = mergeObservedOperators(currentState, locale, operatorObservations);
  writePersistedCharacterObservationsState(nextState);
}
