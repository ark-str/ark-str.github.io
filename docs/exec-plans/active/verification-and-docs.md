# Verification And Docs

Status: active
Owner: Codex
Started: 2026-04-16
Parent issue: `#1`
Active child issue: `#10`
Draft PR: create after scaffold commit

## Objective

Close the current reader-shell iteration by removing the remaining verification gaps, making reader routes gh-pages export-safe, and syncing repository docs and harness artifacts to the merged state.

## Scope

- replace direct `public/generated/content/` file reads with an app-internal generated loader layer
- make canonical reader routes work under static export and gh-pages base paths
- move root/app verification to exported-site smoke coverage
- refresh stale execution plans, product docs, reliability notes, and iteration records

## Constraints

- keep `public/generated/content/` as the published bundled content contract
- do not implement summary generation, character unlock extraction, or portrait asset integration
- keep mutable browser state in `localStorage`
- keep canonical locale routes limited to `cn`, `en`, `jp`, `kr`, and `tw`

## Issue And PR Dependency Graph

- `#10 verification-and-docs`
  - depends on: `#8`
  - PR: create after first scaffold commit

## Commit Policy

- first milestone: plan lifecycle and export-safe scaffold
- second milestone: generated loader layer, static params, and exported smoke
- final milestone: docs sync, review fixes, and iteration closeout

Commit format:

- `milestone(issue-<n>): scaffold`
- `milestone(issue-<n>): core`
- `chore(issue-<n>): ...`
- `fix(issue-<n>): ...`

## Tasks

- [ ] move `reader-shell` to `completed/` and open this active closeout plan
- [ ] generate app-internal content loaders so reader routes stop scanning `public/generated/content/`
- [ ] switch the app and smoke tests to gh-pages-friendly static export output
- [ ] refresh docs and iteration artifacts to match the merged reader-shell state

## Verification

- `npm run content:update`
- `npm run content:check`
- `npm run harness:test`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- 2026-04-16: Keep `public/generated/content/` as the published asset contract, but move app reads to `src/generated/content/`.
- 2026-04-16: Treat this issue as the final closeout child for parent issue `#1`.
