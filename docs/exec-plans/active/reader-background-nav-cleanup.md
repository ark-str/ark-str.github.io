# Reader background and navigation cleanup

## Goal

Fix story-reader chrome navigation and simplify story background behavior for issue #62 under parent #61.

## Issue DAG

- #61 parent iteration: Simplify reader navigation and story background behavior
- #62 child issue: Fix reader story chrome and static backdrop behavior
- Dependencies: none

## Scope

- Make the app bar Story link always target the locale archive.
- Keep the group crumb targeting the current group overview.
- Move the base gradient to a fixed viewport layer so only foreground content scrolls.
- Remove story backdrop cross-fade state and CSS.
- Drive story backdrop selection directly from visible background blocks via IntersectionObserver.
- Update stale frontend/product/design docs and smoke coverage.

## Validation

- `npm run app:verify`
- `npm run verify`
