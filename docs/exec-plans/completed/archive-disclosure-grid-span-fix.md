# Archive Disclosure Grid Span Fix

## Objective

Keep regular storyline disclosure cards inside the locale archive grid in both closed and open states, while keeping only `오퍼레이터 서사` in the separate bottom section.

## Scope

- Remove default open-state column spanning from the shared disclosure primitive.
- Restore regular storyline expanded contents to a simple one-column list.
- Keep operator narrative expanded contents as the only multi-column grid.
- Add smoke coverage for regular storyline grid placement and list layout after opening.

## Constraints

- Do not change content indexing or generated assets.
- Keep `오퍼레이터 서사` outside the main storyline grid.
- Preserve the 300ms panel open/close animation.
- End with `npm run verify` and PR review.

## Tasks

- [x] Patch `DisclosureCard` default layout classes.
- [x] Patch `ReaderLocaleArchive` regular and operator section content layouts.
- [x] Extend smoke test assertions for regular list layout and operator grid layout.
- [x] Update GitHub issue metadata, relevant docs, and iteration report.
- [x] Verify the corrected layout locally.

## Verification

- `npm run app:typecheck`
- `npm run app:lint`
- `npm run verify`
- `codex review --base main`

## Decision Log

- 2026-04-22: Only the synthetic operator narrative section should leave the main grid; regular storyline cards must remain one grid cell when expanded.
- 2026-04-22: Regular storyline expanded contents must stay as a simple list; only the operator narrative bottom section uses an internal grid.
