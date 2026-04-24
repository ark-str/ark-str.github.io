# Issue 100 - Reader UI Polish

## Objective

Refine the locale archive header and story reading surface so navigation and portrait rendering are clearer on desktop and mobile.

## Scope

- Remove the locale archive helper sentence and keep the Storylines stats card right-aligned on mobile.
- Render story dialogue portraits as card-wide background layers with a 2x top-aligned crop.
- Add previous/next story navigation at the bottom of the story page.
- Update frontend/design docs and smoke coverage for the changed UI contract.

## Constraints

- Keep assets local and bundled.
- Keep browser behavior in feature UI/runtime code.
- Keep issue #100 separate, but merge PR #99's summary branch into this branch before final review so the summary UI is not accidentally dropped.

## Tasks

- Update reader archive and story shell components.
- Add deterministic smoke assertions for archive header alignment, portrait cropping, and bottom story navigation.
- Refresh frontend/design-system/product spec wording.

## Verification

- `npm run verify`

## Decision Log

- Use the current group story order for previous/next navigation.
- Treat "2x portrait" as a 200% card-wide image backdrop, not a small profile slot.
- Merge PR #99 before finalizing issue #100 because both changes touch the story reader shell.
