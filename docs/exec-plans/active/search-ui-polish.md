# Search UI Polish

## Objective

Refine the search page layout and align story classification/loading UI across reader surfaces.

## Scope

- Center the search input at a 500px desktop width.
- Render search results in the same minimum-width grid language as notes.
- Share story stage and phase badge styling across search, notes, group, and story surfaces.
- Replace visible loading strings with reusable loading indicators.
- Update smoke coverage for the changed UI contract.

## Constraints

- Keep runtime assets bundled and local.
- Keep interactive search behavior inside client feature UI.
- Do not add external UI dependencies.

## Tasks

- [x] Create a dedicated branch from `main`.
- [x] Add shared story classification and loading UI primitives.
- [x] Update search, notes, archive, group, and story UI surfaces.
- [x] Update docs and smoke assertions.
- [x] Run `npm run verify`.
- [x] Commit, open PR, and merge.

## Verification

- `npm run app:typecheck`
- `npm run app:lint`
- `npm run verify`

## Decision Log

- Use a centered 500px search input on non-mobile viewports.
- Use the notes overview grid width for search results: `minmax(min(100%, 34rem), 1fr)`.
- Use `contrast` for stage badges and `accent` for all operation phase/bridge badges.
- Keep loading labels available through `aria-label` while removing visible loading text.
