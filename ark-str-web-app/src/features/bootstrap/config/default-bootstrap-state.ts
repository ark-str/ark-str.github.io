import type { ReaderBootstrapState, ReaderLocale } from "@/features/bootstrap/types";

export const BOOTSTRAP_STORAGE_KEY = "ark-str:reader-bootstrap:v1";

export const AVAILABLE_LOCALES: Array<{
  code: ReaderLocale;
  label: string;
  description: string;
}> = [
  {
    code: "ko-KR",
    label: "한국어",
    description: "Baseline validation target for summaries and progressive unlock UX",
  },
  {
    code: "en-US",
    label: "English",
    description: "Source-language baseline for normalization and summary pipelines",
  },
  {
    code: "ja-JP",
    label: "日本語",
    description: "Secondary locale for future multilingual validation",
  },
];

export const DEFAULT_BOOTSTRAP_STATE: ReaderBootstrapState = {
  preferredLocale: "ko-KR",
  onboardingAccepted: false,
  note: "",
};
