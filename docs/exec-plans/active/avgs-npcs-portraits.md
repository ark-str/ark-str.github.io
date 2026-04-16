# Avgs Npcs Portraits

Status: active
Owner: Codex
Started: 2026-04-16
Parent issue: `#31`
Active child issue: `#32`
Branch: `codex-avgs-npcs-portraits-issue-32`

## Objective

Switch reader portraits from `ArknightsResource/avatar/ASSISTANT/` to `ArknightsResource/avgs/npcs/`, broaden `speakerId` into a visual speaker key for all dialogue speakers, keep alias persistence limited to `char_` operators, and render tall full-body images with a top-aligned crop in the reader.

## Scope

- sparse-download `avgs/npcs/` into the tool-managed portrait cache and bundle only referenced portraits
- treat `Character(...)`, `character(...)`, and `charslot(...)` as speaker-bearing tags during story parsing
- use `char_` canonical IDs and stripped raw IDs as `speakerId` values for portrait lookup
- render bundled portraits in `public/generated/portraits/speakers/` with top-aligned cropping
- keep `observedOperators` and the character observation ledger limited to `char_` speaker IDs

## Constraints

- runtime stays bundled-only with no remote image requests
- portrait selection must use the basename-sorted first matching file for each referenced `speakerId`
- missing portraits remain valid and must preserve the dialogue slot layout
- generated story assets and exported reader routes must remain gh-pages-safe

## Tasks

- [ ] update portrait cache logic and generated output paths for `avgs/npcs`
- [ ] extend parser speaker resolution to cover `charslot(...)` and non-`char` speaker visuals
- [ ] keep alias observation persistence limited to `char_` speaker IDs
- [ ] update reader portrait rendering to use top-aligned crops
- [ ] refresh tests, generated artifacts, and docs

## Verification

- `npm run content:portraits`
- `npm run content:update`
- `npm run content:check`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- 2026-04-16: `speakerId` becomes the shared visual lookup key for all dialogue speakers, while alias storage remains `char_`-only.
- 2026-04-16: portrait selection will use the basename-sorted first file matching a referenced `speakerId`.
