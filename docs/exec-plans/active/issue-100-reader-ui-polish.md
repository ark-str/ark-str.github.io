# Issue 100 - Reader UI Polish

## Objective

Refine the locale archive header and story reading surface so navigation and portrait rendering are clearer on desktop and mobile.

## Scope

- Remove the locale archive helper sentence and keep the Storylines stats card right-aligned on mobile.
- Render story dialogue portraits without an inner border, filling the portrait slot with a 2x top-aligned crop.
- Add previous/next story navigation at the bottom of the story page.
- Update frontend/design docs and smoke coverage for the changed UI contract.

## Constraints

- Keep assets local and bundled.
- Keep browser behavior in feature UI/runtime code.
- Do not mix this work into PR #99; track it separately under issue #100.

## Tasks

- Update reader archive and story shell components.
- Add deterministic smoke assertions for archive header alignment, portrait cropping, and bottom story navigation.
- Refresh frontend/design-system/product spec wording.

## Verification

- `npm run verify`

## Decision Log

- Use the current group story order for previous/next navigation.
- Treat "2x portrait" as a 200% image crop inside a stable slot, not a 2x card-size increase.
