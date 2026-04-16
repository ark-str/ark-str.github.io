import { DEFAULT_BOOTSTRAP_STATE } from "@/features/bootstrap/config/default-bootstrap-state";
import type { ReaderBootstrapState } from "@/features/bootstrap/types";

export function normalizeBootstrapState(raw: unknown): ReaderBootstrapState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_BOOTSTRAP_STATE;
  }

  const candidate = raw as Partial<ReaderBootstrapState>;

  return {
    preferredLocale:
      candidate.preferredLocale === "ko-KR" ||
      candidate.preferredLocale === "en-US" ||
      candidate.preferredLocale === "ja-JP"
        ? candidate.preferredLocale
        : DEFAULT_BOOTSTRAP_STATE.preferredLocale,
    onboardingAccepted:
      typeof candidate.onboardingAccepted === "boolean"
        ? candidate.onboardingAccepted
        : DEFAULT_BOOTSTRAP_STATE.onboardingAccepted,
    note: typeof candidate.note === "string" ? candidate.note : DEFAULT_BOOTSTRAP_STATE.note,
  };
}
