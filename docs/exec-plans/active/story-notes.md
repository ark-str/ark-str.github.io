# Story Notes

## Objective

Add local-first story notes that can be edited while reading and reviewed from the global app chrome.

## Scope

- Store one note per `storyId`, shared across localized versions of the same story.
- Add a fixed lower-right story note button above the Top button that opens a desktop sidebar or mobile bottom sheet.
- Add a notes icon to the app bar and a `/notes` editable grid overview with story return links.
- Update product/frontend/design docs and smoke coverage.

## Constraints

- Persist mutable note text only through the notes repository over `localStorage`.
- Keep browser-only behavior in client runtime/UI code.
- Do not add remote services, assets, or dependencies.

## Tasks

- Add notes feature storage, normalization, runtime context, and overview UI.
- Wire the story reader note dock and global app bar note link.
- Extend smoke coverage for persistence, shared `storyId` notes, responsive panel layout, and overview navigation.

## Verification

- `npm run verify`

## Decision Log

- Use `storyId` as the note identity so localized versions of the same story share one note.
- Use the last edited route context for the `/notes` story return link.
- Treat blank note text as deletion.
