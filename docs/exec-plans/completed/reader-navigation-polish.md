# Reader Navigation Polish

## Objective

Improve reader navigation polish for mobile group titles, app-bar icon loading, and story-page metadata presentation.

## Scope

- Fix long group titles on narrow `/reader/[locale]/[groupId]` screens so they wrap instead of clipping.
- Reduce app-bar home icon flicker by serving a smaller bundled icon and align its hit area with the theme toggle.
- Remove story-header source path and group story-count copy from `/reader/[locale]/[groupId]/[storyId]`.
- Convert story-page group metrics and sibling-story metadata into wrapping badges.
- Hide the sibling-story navigation card on mobile, and make it viewport-height constrained with internal scrolling on desktop.
- Keep story cards link-only without visible internal story IDs while showing bridge/stage/pre/post labels.
- Make horizontal and vertical scrollbar tracks/corners transparent while keeping a subtle local thumb.

## Constraints

- Keep all assets local and bundled.
- Keep shared primitives under `ark-str-web-app/src/components/ui/`.
- Do not move browser-only behavior into server components.
- Preserve the existing generated content contract.

## Tasks

- Update the group overview hero title wrapping and test coverage.
- Resize the public app icon and tune app-bar control sizing.
- Update the story shell header, sibling navigation card, and sibling story card badges.
- Update smoke tests for story header cleanup, mobile-hidden navigation, desktop internal scrolling, and badge metadata.
- Update global scrollbar styling and smoke coverage for horizontal and vertical transparent tracks.
- Update frontend/design/product docs and latest iteration notes.

## Verification

- Run `npm run app:typecheck`.
- Run `npm run app:lint`.
- Run `npm run smoke`.
- Run `npm run verify`.
- Run `codex review --base main` before PR merge.

## Decision Log

- 2026-04-23: Treat this as a UI-only iteration; generated content and route contracts stay unchanged.
- 2026-04-23: Mobile group hero overflow was caused by `aspect-ratio` plus `min-height`; mobile now uses fixed hero height and desktop keeps the 16:7 ratio.
- 2026-04-23: `npm run verify` passed on `issue-88-reader-layout-refinements`.
