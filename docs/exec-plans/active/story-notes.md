# Story Notes

## Objective

Add local-first story notes that can be edited while reading and reviewed from the global app chrome.

## Scope

- Store one note per `storyId`, shared across localized versions of the same story.
- Add a fixed lower-right story note button above the Top button that opens a desktop sidebar or mobile bottom sheet.
- Keep the mobile bottom sheet chrome honest by omitting a drag handle unless drag behavior exists.
- Make browser back close an open note sidebar or bottom sheet before normal route navigation.
- Add a notes icon to the app bar and a `/notes` editable grid overview with story return links.
- Keep note UI labels localized through the configured reader UI locale.
- Update product/frontend/design docs and smoke coverage.

## Constraints

- Persist mutable note text only through the notes repository over `localStorage`.
- Keep browser-only behavior in client runtime/UI code.
- Do not add remote services, assets, or dependencies.

## Tasks

- Add notes feature storage, normalization, runtime context, and overview UI.
- Wire the story reader note dock and global app bar note link.
- Wire note panel history state so popstate closes the panel.
- Extend smoke coverage for persistence, shared `storyId` notes, responsive panel layout, and overview navigation.

## Verification

- `npm run verify`

## Decision Log

- Use `storyId` as the note identity so localized versions of the same story share one note.
- Use the last edited route context for the `/notes` story return link.
- Treat blank note text as deletion.
- Reuse the current URL with a history-state marker for an open story note panel so browser back can close the panel without changing routes.
