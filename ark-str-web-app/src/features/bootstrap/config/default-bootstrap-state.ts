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
    description: "요약과 점진 해금 UX의 기본 검증 대상",
  },
  {
    code: "en-US",
    label: "English",
    description: "원문 기준 정규화와 요약 파이프라인의 기준 로케일",
  },
  {
    code: "ja-JP",
    label: "日本語",
    description: "향후 다국어 검증을 위한 보조 로케일",
  },
];

export const DEFAULT_BOOTSTRAP_STATE: ReaderBootstrapState = {
  preferredLocale: "ko-KR",
  onboardingAccepted: false,
  note: "",
};
