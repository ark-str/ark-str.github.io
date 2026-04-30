# Reader Settings And AI Summary

## Objective

Add story read progress, a settings page, transient AI story summaries, translated synthetic storyline labels, and the requested Behemoth recommendation ordering.

## Scope

- Add `act31side` to the Behemoth recommendation collection between `main_13` and `act34side`.
- Translate synthetic storyline titles through UI copy.
- Make group breadcrumbs bordered controls on both group and story routes.
- Add story action rows for read toggling and Google AI Studio summaries.
- Add `/settings` for name, API key, backup/restore, reset controls, and GitHub issue routing.
- Include read progress and notes in backup import/export while excluding the API key.
- Polish settings status alerts, the API key guide disclosure, the AI summary prompt shape, and the global maintainer footer.

## Constraints

- Keep mutable state in feature repo/runtime layers over `localStorage`.
- Keep the Google AI Studio call as the only runtime fetch exception.
- Do not persist AI summary output.
- Keep API key out of backup JSON.

## Tasks

- [x] Add read-progress feature storage and provider.
- [x] Extend preferences, notes, and reader session contexts for settings import/restore.
- [x] Add AI summary runtime and Settings UI.
- [x] Update reader/group/archive/app bar UI.
- [x] Update guards and docs for the narrow remote exceptions.
- [x] Add smoke coverage and run verification.
- [x] Restore export success status as a dismissible alert.
- [x] Require stable AI summary sections for characters, key events, and final summary.
- [x] Move maintainer credit into the shared page frame footer with a new-tab Issue link.

## Verification

- `npm run verify`

## Decision Log

- Read progress is keyed by canonical `storyId` so localized versions share the same marker.
- Google AI Studio API keys are stored as local user configuration but are excluded from exported backups.
- AI summaries are transient UI output and are not persisted or backed up.
- Settings status messages are allowed for export/import/reset, but must be dismissible.
- Maintainer credit is shared page chrome rather than home-only content.
