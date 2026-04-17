# Pages Portrait Casefix

## Objective

Fix GitHub Pages deployment by making generated portrait filenames case-stable across macOS and Linux.

## Scope

- normalize generated portrait public filenames to a single case-stable form
- make generated manifest paths and content checks use the same normalization rule
- add a regression test for mixed-case `speakerId` keys
- regenerate generated artifacts and redeploy Pages

## Constraints

- keep runtime speaker lookup keys unchanged
- keep runtime assets bundled only
- finish with `npm run verify`

## Tasks

- add a shared portrait filename normalization helper in the content pipeline
- use the helper when generating portrait manifest paths
- use the helper when validating generated portrait files
- cover mixed-case speaker IDs in `tests/content/lib.test.mjs`
- rerun `npm run content:update`
- rerun `npm run verify`

## Verification

- `npm run content:update`
- `npm run verify`

## Decision Log

- manifest keys remain original `speakerId` strings, but the bundled portrait filenames are normalized to lowercase
- content validation resolves portrait files from manifest paths instead of reconstructing `${speakerId}.png`
