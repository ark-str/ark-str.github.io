import {
  readPersistedCharacterObservationsState,
  writePersistedCharacterObservationsState,
} from "@/features/characters/repo/local-storage-character-observations-store";
import { normalizeCharacterObservationsState } from "@/features/characters/service/normalize-character-observations-state";
import type { CharacterObservationsState } from "@/features/characters/types";
import { normalizeStoryNotesState } from "@/features/notes/service/normalize-story-notes-state";
import type { StoryNotesState } from "@/features/notes/types";
import { normalizeAppPreferencesState } from "@/features/preferences/service/normalize-preferences-state";
import type { AppPreferencesState, AppTheme } from "@/features/preferences/types";
import { normalizeReadProgressState } from "@/features/read-progress/service/normalize-read-progress-state";
import type { ReadProgressState } from "@/features/read-progress/types";
import { normalizeReaderSessionState } from "@/features/reader/service/normalize-reader-session-state";
import type { ReaderSessionState } from "@/features/reader/types";

type UserDataBackup = {
  version: 1;
  exportedAt: string;
  appPreferences: {
    theme: AppTheme;
  };
  characterObservations: CharacterObservationsState;
  readProgress: ReadProgressState;
  readerSession: ReaderSessionState;
  storyNotes: StoryNotesState;
};

type RestoredUserData = {
  appPreferences: AppPreferencesState;
  characterObservations: CharacterObservationsState;
  readProgress: ReadProgressState;
  readerSession: ReaderSessionState;
  storyNotes: StoryNotesState;
};

function createUserDataBackupJson({
  appPreferences,
  characterObservations,
  readProgress,
  readerSession,
  storyNotes,
}: RestoredUserData): string {
  const backup: UserDataBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appPreferences: {
      theme: normalizeAppPreferencesState(appPreferences).theme,
    },
    characterObservations: normalizeCharacterObservationsState(characterObservations),
    readProgress: normalizeReadProgressState(readProgress),
    readerSession: normalizeReaderSessionState(readerSession),
    storyNotes: normalizeStoryNotesState(storyNotes),
  };

  return JSON.stringify(backup, null, 2);
}

export function createLocalUserDataBackupJson({
  appPreferences,
  readProgress,
  readerSession,
  storyNotes,
}: Omit<RestoredUserData, "characterObservations">) {
  return createUserDataBackupJson({
    appPreferences,
    characterObservations: normalizeCharacterObservationsState(readPersistedCharacterObservationsState()),
    readProgress,
    readerSession,
    storyNotes,
  });
}

export function parseUserDataBackupJson(text: string): RestoredUserData {
  const parsed: unknown = JSON.parse(text);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid backup payload.");
  }

  const candidate = parsed as Partial<UserDataBackup>;
  if (candidate.version !== 1) {
    throw new Error("Unsupported backup version.");
  }

  return {
    appPreferences: normalizeAppPreferencesState({
      googleAiStudioApiKey: "",
      theme: candidate.appPreferences?.theme,
    }),
    characterObservations: normalizeCharacterObservationsState(candidate.characterObservations),
    readProgress: normalizeReadProgressState(candidate.readProgress),
    readerSession: normalizeReaderSessionState(candidate.readerSession),
    storyNotes: normalizeStoryNotesState(candidate.storyNotes),
  };
}

export function persistRestoredCharacterObservations(restored: RestoredUserData["characterObservations"]) {
  writePersistedCharacterObservationsState(restored);
}
