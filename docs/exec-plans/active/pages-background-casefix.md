# Pages Background Casefix

## Objective

Finish the Pages deployment fix by making generated background filenames and tracked background assets use the same lowercase paths on macOS and Linux.

## Scope

- normalize generated background public filenames to lowercase
- make generated background manifest paths and `content:check` share the same filename rule
- rename tracked files under `ark-str-web-app/public/generated/backgrounds/` through case-safe temp paths
- rerun `npm run verify`
- redeploy GitHub Pages after merge

## Constraints

- keep runtime background lookup keys unchanged
- keep the fix limited to generated background artifacts and verification glue
- finish with `npm run verify`

## Tasks

- add a shared background filename normalization helper in the content pipeline
- use the helper when generating background manifest paths
- use the helper when validating generated background files
- add a regression test for mixed-case background IDs
- rename tracked public background assets to lowercase where needed
- rerun `npm run content:update`
- rerun `npm run verify`

## Verification

- `git ls-files ark-str-web-app/public/generated/backgrounds`
- `npm run verify`

## Decision Log

- background manifest keys remain the original background IDs, but bundled background filenames are normalized to lowercase
- the stale portrait-rename active plan is removed because that iteration has already merged
