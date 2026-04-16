import type { ObservedOperator, ReaderLocale } from "@/features/content/types";
import type { CharacterObservationsState } from "@/features/characters/types";

export function mergeObservedOperators(
  state: CharacterObservationsState,
  locale: ReaderLocale,
  observedOperators: ObservedOperator[],
): CharacterObservationsState {
  if (observedOperators.length === 0) {
    return state;
  }

  const currentLocaleState = state.locales[locale] ?? {};
  const nextLocaleState = { ...currentLocaleState };

  for (const observedOperator of observedOperators) {
    const currentAliases = nextLocaleState[observedOperator.operatorId]?.aliases ?? [];
    nextLocaleState[observedOperator.operatorId] = {
      aliases: [
        ...new Set(
          [...currentAliases, ...observedOperator.aliases].filter(
            (value) => typeof value === "string" && value.trim().length > 0,
          ),
        ),
      ].sort((left, right) => left.localeCompare(right)),
    };
  }

  return {
    locales: {
      ...state.locales,
      [locale]: nextLocaleState,
    },
  };
}
