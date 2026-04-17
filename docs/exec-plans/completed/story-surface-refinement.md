# Story Surface Refinement

## Objective

Refine the story reading surface so backdrop transitions feel gradual, background marker cards show full preview images, and dialogue cards read more naturally across the wider story column.

## Scope

- change story-page backdrop swaps to a 0.5 second cross-fade
- widen the story reading surface so it tracks more closely with the floating app bar width
- keep background blocks in the story flow, but remove the extra marker chrome and show uncropped preview images
- rework dialogue cards into a portrait-plus-header layout with full-width body text

## Constraints

- keep story-only dynamic backdrops limited to story pages
- keep non-story pages on the archive base background
- do not remove background blocks from the story flow
- keep runtime assets bundled only and finish with `npm run verify`

## Tasks

- replace the current backdrop swap timing with an explicit 500ms fade
- move summary back to a full-width section beneath the story/content row
- remove `Background shift`, `Preview ready`, and `Active` labels from background markers
- render bundled background previews with `object-contain`
- simplify dialogue cards so the portrait and speaker metadata sit in the header and the text uses the full card width
- update reader-facing docs and the iteration summary to match the new contract

## Verification

- `npm run verify`

## Decision Log

- backdrop transitions now use a slower 500ms cross-fade instead of the earlier quick swap
- background markers keep a subtle active border but no longer render explanatory status text
- preview images preserve their full aspect ratio even if that introduces letterboxing within the card
- the story reading surface now uses a separate full-width summary row under the main content grid
