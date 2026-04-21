# Negative Focus Speaker Fix

## Objective

Fix story speaker resolution so visual-only negative-focus frames do not attach portraits to unrelated dialogue.

## Scope

- make `priority < 0` frames ineligible for dialogue speaker selection
- suppress speaker-name fallback while any active frame exists
- keep `priority >= 0` cutin, character, and charslot resolution unchanged
- rebuild generated story details with `content:build-index`
- finish with `npm run verify`

## Constraints

- do not run full `content:update`
- keep the `speakerId` public contract unchanged
- keep alias persistence and `observedOperators` limited to `char_*` speakers

## Tasks

- add parser regression coverage for the `act12side` tourist/Chen fixture
- update charslot neutral-focus expectations to avoid picking an arbitrary slot speaker
- update product docs for visual-only negative-focus frames
- regenerate generated story detail artifacts with `content:build-index`

## Verification

- `node --test tests/content/story-parser.test.mjs`
- `npm run content:build-index`
- `npm run content:check`
- `npm run verify`

## Decision Log

- `focus < 0` means the frame can remain visible, but it is not an eligible dialogue speaker.
- Existing speaker-name bindings are only reused after active frames are cleared.
