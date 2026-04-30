"use client";

import { ArrowUpRight } from "lucide-react";
import { getUiCopy } from "@/features/i18n/config/ui-copy";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";
import { GITHUB_ISSUE_URL } from "@/lib/external-links";

export function ReaderPageFooter() {
  const { state } = useReaderSession();
  const copy = getUiCopy(state.preferredLocale);

  return (
    <footer
      className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
      data-testid="site-footer"
    >
      <span>{copy.footer.maintainer}</span>
      <a
        aria-label={copy.footer.issueAria}
        className="inline-flex items-center justify-center gap-1 text-[var(--text-muted)] transition duration-[var(--motion-fast)] ease-out hover:text-[var(--accent-strong)]"
        data-testid="site-footer-issue-link"
        href={GITHUB_ISSUE_URL}
        rel="noreferrer"
        target="_blank"
      >
        {copy.footer.issue}
        <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
      </a>
    </footer>
  );
}
