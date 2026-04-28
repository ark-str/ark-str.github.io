"use client";

import { useEffect } from "react";
import { getUiDocumentLang } from "@/features/i18n/config/ui-copy";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";

export function UiLocaleDocumentSync() {
  const { state } = useReaderSession();

  useEffect(() => {
    document.documentElement.lang = getUiDocumentLang(state.preferredLocale);
  }, [state.preferredLocale]);

  return null;
}
