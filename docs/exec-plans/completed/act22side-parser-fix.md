# Act22side Parser Fix

## Objective

Fix story speaker resolution so `act22side` multiline dialogue keeps its speaker portrait while stale portraits do not leak after visual frames are cleared.

Status: completed
Parent issue: `#96`
Completed child issue: `#96`
Merged PR: pending

## Scope

- parse `[multiline(name="...")]` and `[multiline(name="...",end=true)]` as dialogue, not narration
- keep `charslot(...)` focus resolution for multiline dialogue
- clear stale `charslot(...)` frames when `character(...)` scene state takes over
- limit speaker-name fallback to canonical `char_` operator IDs after active frames are cleared
- rebuild generated story detail artifacts with `content:build-index`
- finish with `npm run verify`

## Constraints

- do not run full `content:update`
- keep the public dialogue `speakerId` contract unchanged
- keep alias persistence and `observedOperators` limited to `char_*` speakers
- preserve missing portraits for unknown speakers instead of reusing the last visible NPC frame

## Tasks

- add parser regression coverage for `level_act22side_02_beg` multiline Fisher dialogue
- add parser regression coverage for `level_act22side_01_beg` multiline Finn dialogue with `end=true`
- add parser regression coverage for `level_act22side_st01` stale patrol and whispered dialogue cases
- update product docs for multiline dialogue and non-operator fallback rules
- regenerate generated story detail artifacts with `content:build-index`

## Verification

- `node --test tests/content/story-parser.test.mjs`
- `npm run content:build-index`
- `npm run content:check`
- `npm run verify`

## Decision Log

- `multiline` is dialogue syntax when it contains a `name` attribute, so it must use the same focused speaker resolver as `name`.
- Non-operator names such as NPC labels are not stable enough for cross-scene fallback; they need an explicit active visual frame.
- Operator aliases remain safe to reuse through canonical `char_` speaker IDs because they feed the existing alias ledger.
