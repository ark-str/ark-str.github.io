# Speaker Portrait And SpeakerId

Status: completed
Owner: Codex
Started: 2026-04-16
Parent issue: `#28`
Active child issue: `#29`
Draft PR: `#30`

## Objective

Rename vendor sources to match their upstream project names, simplify dialogue identity to a single `speakerId`, download the upstream portrait repo into a tool-managed cache, and render bundled operator portraits in the reader without runtime image guessing.

## Scope

- rename `vendor/ArknightsData` to `vendor/ArknightsGamedata`
- replace the portrait placeholder with a tool-managed `vendor/ArknightsResource` sparse-checkout cache
- generate `speakerId` instead of `speakerToken`, `operatorId`, and `portraitKey`
- copy only referenced `avatar/ASSISTANT/<speakerId>.png` files into bundled assets
- render bundled portraits in reader dialogue rows while preserving empty slots for missing portraits

## Constraints

- only `char_` tokens count as portrait-capable speakers
- portrait cache initialization must stay build-time only and must not introduce runtime network access
- only referenced ASSISTANT portraits are bundled into `public/generated/`
- missing portraits are normal and must keep empty reserved layout slots instead of triggering image guesses or 404s
- reader persistence remains local-first and uses `localStorage` only through feature repo layers

## Issue And PR Dependency Graph

- `#29 speaker-portrait-speakerid`
  - depends on: none
  - PR: `#30`

## Commit Policy

- first milestone: scaffold vendor rename and `speakerId` contract
- second milestone: add portrait cache extraction and reader rendering
- final milestone: docs, verify, and review closeout

Commit format:

- `milestone(issue-<n>): scaffold`
- `milestone(issue-<n>): core`
- `feat(issue-<n>): ...`
- `fix(issue-<n>): ...`
- `chore(issue-<n>): ...`

## Tasks

- [x] rename vendor paths to `vendor/ArknightsGamedata` and `vendor/ArknightsResource`
- [x] replace dialogue-level speaker metadata with a single `speakerId`
- [x] add a portrait cache download step and copy only referenced ASSISTANT portraits into bundled assets
- [x] render bundled reader portraits while preserving empty slots for missing images
- [x] update tests, generated artifacts, and docs for the `speakerId` and portrait cache contract

## Verification

- `npm run content:sync`
- `npm run content:portraits`
- `npm run content:update`
- `npm run content:check`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- 2026-04-16: Portrait input moved from a planned submodule to a tool-managed sparse checkout under `vendor/ArknightsResource` so the repo only downloads files when needed.
- 2026-04-16: Dialogue blocks now expose a single `speakerId`, derived from `Character(...)` tags by stripping `#/$` suffixes and keeping the first three `_`-delimited segments.
- 2026-04-16: Only referenced `avatar/ASSISTANT/<speakerId>.png` files are copied into bundled assets, and reader portrait slots remain reserved even when a portrait is absent.
- 2026-04-16: Root verification passed after regenerating story content, bundled portraits, and exported-site smoke coverage against the `speakerId` contract.
