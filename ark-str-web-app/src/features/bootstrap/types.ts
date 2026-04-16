export type ReaderLocale = "ko-KR" | "en-US" | "ja-JP";

export type ReaderBootstrapState = {
  preferredLocale: ReaderLocale;
  onboardingAccepted: boolean;
  note: string;
};
