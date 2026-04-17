# Speaker Frame Registry

Status: active
Owner: Codex
Started: 2026-04-17
Parent issue: `#34`
Active child issue: `#35`
Draft PR: `#36`

## Objective

Fix story speaker resolution so each dialogue line chooses exactly one winning `speakerId` across mixed `CharacterCutin`, `character` / `Character`, and `charslot` tags.

## Scope

- replace the parser's single active speaker token with an active frame registry
- support deterministic precedence across cutin, character, and charslot frames
- preserve the existing `speakerId` public contract and `observedOperators` behavior
- add regression tests for the Fumizuki sample and mixed upstream frame scenes
- update product docs to describe the new parser behavior

## Constraints

- do not run `npm run content:update` in this iteration
- keep `speakerId` normalization unchanged
- keep alias persistence and `observedOperators` limited to `char_*` speakers
- end with `npm run verify`

## Tasks

- [x] add active frame registry state to the story parser
- [x] implement `CharacterCutin`, `character` / `Character`, and `charslot` open/close/update rules
- [x] resolve a single winning frame per dialogue line with deterministic priority and recency rules
- [x] add parser regression tests for mixed frame scenarios
- [x] refresh product/docs wording for the frame registry model

## Verification

- `node --test tests/content/story-parser.test.mjs`
- `npm run content:build-index`
- `npm run harness:test`
- `npm run content:check`
- `npm run verify`

## Decision Log

- 2026-04-17: Treat cutin, character, and charslot sources as simultaneously active frame registries instead of mutually exclusive tags.
- 2026-04-17: Skip `content:update` for this iteration and rely on parser tests plus repository verification.
- 2026-04-17: Rebuild generated story details with `npm run content:build-index` only, reusing the existing vendor and portrait caches instead of running the full `content:update` pipeline.
