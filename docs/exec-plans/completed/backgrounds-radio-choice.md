# Backgrounds, Radio Cutins, and Choice Cleanup

Status: completed
Owner: Codex
Started: 2026-04-17
Parent issue: `#37`
Completed child issue: `#38`
Merged PR: `#39`

## Objective

Expand the reader pipeline and UI so story backgrounds are bundled and rendered, `CharacterCutin` dialogue is clearly marked as remote radio communication, and Doctor choice normalization stops exposing placeholder fallback copy or nested shared-response sections.

## Scope

- parse `Background(image="...")` into generated story blocks
- bundle only referenced background PNGs from `ArknightsResource/avgs/bg`
- render background blocks in the reader with fixed, bundled asset paths
- mark cutin-driven dialogue as radio communication in generated data and UI
- remove `sharedBlocks` from choice normalization and treat all-option predicates as post-choice continuation
- refresh docs to describe the new reader/media contract

## Constraints

- keep runtime assets bundled only
- keep `speakerId` normalization and alias persistence rules unchanged
- continue limiting `observedOperators` to `char_*` speakers
- regenerate assets through the existing build-index path instead of a full vendor resync
- end with `npm run verify`

## Tasks

- [x] retire the previous active plan and update product docs for the new phase
- [x] add background parsing plus cutin-radio metadata to the story parser
- [x] extend generated media extraction to copy referenced background PNGs alongside speaker portraits
- [x] update reader loaders, types, and UI for backgrounds, radio badges, and simplified choice rendering
- [x] rebuild generated artifacts, verify, and close the harness PR flow

## Verification

- `node --test tests/content/story-parser.test.mjs`
- `npm run content:build-index`
- `npm run content:check`
- `npm run verify`

## Decision Log

- 2026-04-17: Treat all-option `Predicate` blocks as continuation blocks rendered after the choice instead of a nested `sharedBlocks` section.
- 2026-04-17: `CharacterCutin` wins a dialogue line only when it wins normal frame precedence; when it does, the line is marked as remote radio communication.
- 2026-04-17: Background images are bundled from `ArknightsResource/avgs/bg` and only copied when referenced by generated story details.
