"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { AlertTriangle, ArrowUpRight, Bug, ChevronDown, Download, Settings, Upload, X } from "lucide-react";
import { ReaderPageFrame } from "@/components/layout/reader-page-frame";
import type { FloatingAppBarModel } from "@/components/layout/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
} from "@/features/content/config/canonical-reader-locales";
import { getUiCopy } from "@/features/i18n/config/ui-copy";
import { useStoryNotes } from "@/features/notes/runtime/story-notes-context";
import { useAppPreferences } from "@/features/preferences/runtime/app-preferences-context";
import { useReadProgress } from "@/features/read-progress/runtime/read-progress-context";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";
import {
  createLocalUserDataBackupJson,
  parseUserDataBackupJson,
  persistRestoredCharacterObservations,
} from "@/features/settings/runtime/user-data-backup-actions";
import { GITHUB_ISSUE_URL, GOOGLE_AI_STUDIO_API_KEY_URL } from "@/lib/external-links";
import { cn } from "@/lib/utils";

function createSettingsAppBar(): FloatingAppBarModel {
  return {
    currentLocale: null,
    groupCrumb: null,
    localeOptions: CANONICAL_READER_LOCALES.map((locale) => ({
      href: null,
      label: READER_LOCALE_LABELS[locale].label,
      locale,
    })),
    storyRootHref: null,
    storySelect: null,
  };
}

function SettingsStatus({
  dismissLabel,
  message,
  onDismiss,
}: {
  dismissLabel: string;
  message: string;
  onDismiss: () => void;
}) {
  return (
    <Card className="bg-[var(--surface)]/94" data-testid="settings-status">
      <CardContent className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-[var(--accent-strong)]">
        <span>{message}</span>
        <Button
          aria-label={dismissLabel}
          className="h-8 w-8 shrink-0 rounded-[var(--radius-sm)]"
          data-testid="settings-status-dismiss"
          onClick={onDismiss}
          size="icon"
          variant="ghost"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ApiKeyIssueGuide({
  items,
  title,
}: {
  items: string[];
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }

    const syncContentHeight = () => {
      setContentHeight(node.scrollHeight);
    };

    syncContentHeight();
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(syncContentHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [items]);

  return (
    <div
      className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--panel)]"
      data-testid="settings-api-key-guide"
    >
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-xs font-semibold text-[var(--text)]"
        data-testid="settings-api-key-guide-toggle"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{title}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ease-out",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        aria-hidden={!isOpen}
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-out",
          !isOpen && "pointer-events-none",
        )}
        data-state={isOpen ? "open" : "closed"}
        data-testid="settings-api-key-guide-panel"
        id={contentId}
        style={{
          maxHeight: isOpen ? `${contentHeight}px` : "0px",
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        <div ref={contentRef}>
          <ol className="grid list-decimal gap-1 px-4 pb-3 pl-8 text-xs leading-6 text-[var(--text-muted)]">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function SettingsOverview() {
  const appBar = createSettingsAppBar();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerSession = useReaderSession();
  const appPreferences = useAppPreferences();
  const storyNotes = useStoryNotes();
  const readProgress = useReadProgress();
  const locale = readerSession.state.preferredLocale;
  const copy = getUiCopy(locale);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleExport = () => {
    const backupJson = createLocalUserDataBackupJson({
      appPreferences: appPreferences.state,
      readProgress: readProgress.state,
      readerSession: readerSession.state,
      storyNotes: storyNotes.state,
    });
    const blob = new Blob([backupJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ark-str-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage(copy.settings.exportSuccess);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    try {
      const restored = parseUserDataBackupJson(await file.text());

      readerSession.replaceReaderSession(restored.readerSession);
      appPreferences.replaceAppPreferences({
        ...restored.appPreferences,
        googleAiStudioApiKey: appPreferences.state.googleAiStudioApiKey,
      });
      storyNotes.replaceStoryNotes(restored.storyNotes);
      readProgress.replaceReadProgress(restored.readProgress);
      persistRestoredCharacterObservations(restored.characterObservations);
      setStatusMessage(copy.settings.importSuccess);
    } catch {
      setStatusMessage(copy.settings.importInvalid);
    }
  };

  const handleResetNotes = () => {
    if (!window.confirm(copy.settings.confirmResetNotes)) {
      return;
    }

    storyNotes.resetStoryNotes();
    setStatusMessage(copy.settings.resetSuccess);
  };

  const handleResetReadProgress = () => {
    if (!window.confirm(copy.settings.confirmResetReadProgress)) {
      return;
    }

    readProgress.resetReadProgress();
    setStatusMessage(copy.settings.resetSuccess);
  };

  return (
    <ReaderPageFrame
      appBar={appBar}
      header={
        <section className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
              <Settings aria-hidden="true" className="h-5 w-5 text-[var(--accent-strong)]" />
            </span>
            <div className="min-w-0">
              <h1 className="font-[var(--font-display)] text-3xl font-semibold leading-tight tracking-[-0.03em] text-[var(--text)] md:text-4xl">
                {copy.settings.title}
              </h1>
            </div>
          </div>
        </section>
      }
      testId="settings-shell"
    >
      <section className="relative z-10 grid gap-4" data-testid="settings-overview">
        {statusMessage ? (
          <SettingsStatus
            dismissLabel={copy.settings.dismissStatus}
            message={statusMessage}
            onDismiss={() => setStatusMessage(null)}
          />
        ) : null}

        <Card className="bg-[var(--surface)]/94">
          <CardHeader>
            <CardTitle>{copy.settings.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-[var(--text)]">
              {copy.settings.nameLabel}
              <Input
                data-testid="settings-name-input"
                disabled={!readerSession.isHydrated}
                onChange={(event) => readerSession.setNickName(event.target.value)}
                placeholder={copy.settings.namePlaceholder}
                value={readerSession.state.nickName}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[var(--text)]">
              <span className="flex flex-wrap items-center gap-2">
                <span>{copy.settings.apiKeyLabel}</span>
                <a
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-strong)] transition duration-[var(--motion-fast)] ease-out hover:text-[var(--accent)]"
                  data-testid="settings-api-key-link"
                  href={GOOGLE_AI_STUDIO_API_KEY_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  {copy.settings.apiKeyLink}
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              </span>
              <Input
                autoComplete="off"
                data-testid="settings-api-key-input"
                disabled={!appPreferences.isHydrated}
                onChange={(event) => appPreferences.setGoogleAiStudioApiKey(event.target.value)}
                placeholder={copy.settings.apiKeyPlaceholder}
                type="password"
                value={appPreferences.state.googleAiStudioApiKey}
              />
            </label>
            <div className="grid gap-1">
              <p className="text-xs leading-6 text-[var(--text-muted)]">{copy.settings.apiKeyHelp}</p>
              <p
                className="text-xs font-semibold leading-6 text-[var(--warning)]"
                data-testid="settings-api-key-warning"
              >
                {copy.settings.apiKeyWarning}
              </p>
              <ApiKeyIssueGuide
                items={copy.settings.apiKeyIssueGuide}
                title={copy.settings.apiKeyIssueGuideTitle}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/94">
          <CardHeader>
            <CardTitle>{copy.settings.backupTitle}</CardTitle>
            <CardDescription>{copy.settings.backupDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button data-testid="settings-export-button" onClick={handleExport} variant="subtle">
              <Download aria-hidden="true" className="h-4 w-4" />
              {copy.settings.exportData}
            </Button>
            <Button
              data-testid="settings-import-button"
              onClick={() => fileInputRef.current?.click()}
              variant="subtle"
            >
              <Upload aria-hidden="true" className="h-4 w-4" />
              {copy.settings.importData}
            </Button>
            <input
              ref={fileInputRef}
              accept="application/json"
              className="hidden"
              data-testid="settings-import-input"
              onChange={handleImport}
              type="file"
            />
          </CardContent>
        </Card>

        <Card className="border-[var(--warning)] bg-[var(--surface)]/94">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle aria-hidden="true" className="h-4 w-4 text-[var(--warning)]" />
              <CardTitle>{copy.settings.dangerTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button data-testid="settings-reset-notes-button" onClick={handleResetNotes} variant="subtle">
              {copy.settings.resetNotes}
            </Button>
            <Button
              data-testid="settings-reset-read-progress-button"
              onClick={handleResetReadProgress}
              variant="subtle"
            >
              {copy.settings.resetReadProgress}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/94">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5 py-5">
            <p className="text-sm leading-6 text-[var(--text-muted)]">{copy.settings.issueDescription}</p>
            <a
              className={cn(buttonVariants({ variant: "subtle" }), "h-11")}
              data-testid="settings-issue-link"
              href={GITHUB_ISSUE_URL}
              rel="noreferrer"
              target="_blank"
            >
              <Bug aria-hidden="true" className="h-4 w-4" />
              {copy.settings.issueLink}
            </a>
          </CardContent>
        </Card>
      </section>
    </ReaderPageFrame>
  );
}
