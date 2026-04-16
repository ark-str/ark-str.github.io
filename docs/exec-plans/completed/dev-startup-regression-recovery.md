# Dev Startup Regression Recovery

Status: completed
Owner: Codex
Started: 2026-04-16
Parent issue: `#12`
Active child issue: `#13`
Draft PR: `#14`

## Objective

Restore fast local `next dev` startup after the generated-loader regression while preserving export-safe reader routes and full-corpus development.

## Scope

- stop mirroring full story payloads into `ark-str-web-app/src/generated/content/`
- keep exact-path metadata in the app for export-safe reader loads
- isolate export/verify build output from the default dev cache
- refresh docs and iteration records to match the new runtime/build contract

## Constraints

- keep `ark-str-web-app/public/generated/content/` as the published bundled content contract
- keep canonical reader locales limited to `cn`, `en`, `jp`, `kr`, and `tw`
- keep full-corpus development as the default `next dev` mode
- do not change summary generation, character unlock extraction, or portrait integration scope

## Issue And PR Dependency Graph

- `#13 generated-loader-dev-regression`
  - depends on: none
  - PR: `#14`

## Commit Policy

- first milestone: scaffold the active plan and iteration metadata
- second milestone: remove app-side story mirrors and isolate export cache output
- final milestone: refresh docs, review fixes, and iteration closeout

Commit format:

- `milestone(issue-<n>): scaffold`
- `milestone(issue-<n>): core`
- `chore(issue-<n>): ...`
- `fix(issue-<n>): ...`

## Tasks

- [x] add the regression-recovery active plan and child issue metadata
- [x] remove `src/generated/content/stories/**` from the app-side generated contract
- [x] switch the app to exact-path reads from `public/generated/content/`
- [x] separate export/verify cache output from the default dev cache
- [x] refresh docs and iteration records after verification

## Verification

- `npm run content:update`
- `npm run harness:test`
- `npm --prefix ark-str-web-app run verify`
- `npm --prefix ark-str-web-app run dev -- --hostname 127.0.0.1 --port 3010`
- `npm run verify`

## Decision Log

- 2026-04-16: Treat this as a post-closeout regression recovery iteration, not a product-scope expansion.
- 2026-04-16: Keep full-corpus development as the default mode and remove the regression instead of introducing a sample-only dev path.
- 2026-04-16: Separate `.next-dev` and `.next-export` so local development no longer inherits the heavy export cache.
