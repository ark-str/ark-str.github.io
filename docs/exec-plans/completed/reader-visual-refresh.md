# Reader Visual Refresh

## Objective

Refine the reader surface so in-flow background cards show real previews, story backdrops fade between active images, and the shared chrome feels more modern and visually consistent.

## Scope

- add bundled image previews to background marker cards in story flow
- change story backdrop swaps to a fade transition
- tighten typography and radius tokens toward a sans-first, less rounded system
- align floating app bar and shared reader surfaces to the updated tokens

## Constraints

- keep the existing archive background mood on non-story routes
- keep dynamic media backgrounds limited to story routes
- keep background blocks in the story flow instead of replacing them with backdrop-only behavior
- do not introduce remote fonts or assets

## Tasks

- update global design tokens and shared primitives for the sans-first, restrained chrome direction
- refresh the floating app bar and shared reader surfaces to use the new token scale
- add background card image previews while preserving marker metadata
- implement cross-fade story backdrop transitions instead of instant swaps
- update design-system and frontend docs to describe the refined contract

## Verification

- `npm --prefix ark-str-web-app run verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- background cards keep their inline role and show the same bundled image that powers the story backdrop
- backdrop transitions use CSS opacity/transform fades rather than a hard image swap
- typography is unified around a local sans stack instead of the earlier serif/sans split
- radius scale is reduced globally rather than only flattening the story route
