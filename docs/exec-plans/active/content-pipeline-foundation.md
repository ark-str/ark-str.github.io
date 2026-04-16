# Content Pipeline Foundation

Status: active
Owner: Codex
Started: 2026-04-16
Parent issue: `#1`
Active child issue: `#6`
Draft PR: `#7`

## Objective

Establish the first real content pipeline foundation for the Arknights story reader so the repository can sync upstream vendor data, build a normalized generated content index, and track source and summary readiness before reader features expand.

## Scope

- attach `vendor/ArknightsData` as the upstream Git submodule
- build a normalized generated content index from vendor data
- emit source and summary status manifests under `ark-str-web-app/public/generated/content/`
- extend root verification with content integrity checks
- expose generated readiness counts through the bootstrap home shell

## Constraints

- no runtime external fetches
- local storage only for mutable browser state
- root repository remains harness-only
- full story parsing and summary generation are out of scope for this issue

## Issue And PR Dependency Graph

- `#6 content-pipeline-foundation`
  - depends on: `#2`
  - PR: `#7`
- `reader-shell`
  - depends on: `#6`, `#4`
  - PR: create after prerequisites merge
- `verification-and-docs`
  - depends on: `#6`, `reader-shell`
  - PR: create after prerequisites merge

## Commit Policy

- first milestone: source attachment and plan/docs scaffold
- second milestone: generated index, manifests, app readiness, and integrity checks
- final milestone: verification and review fixups

Commit format:

- `milestone(issue-<n>): scaffold`
- `milestone(issue-<n>): core`
- `feat(issue-<n>): ...`
- `fix(issue-<n>): ...`
- `chore(issue-<n>): ...`

## Tasks

- [x] attach `vendor/ArknightsData` as a real Git submodule
- [x] generate `index.json`, `source-manifest.json`, and `summary-manifest.json`
- [x] add `content:check` and include it in root verify
- [x] surface generated readiness counts in the bootstrap shell
- [x] update the parent issue and stale design-system plan state

## Verification

- `npm run content:update`
- `npm run content:check`
- `npm run harness:test`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- 2026-04-16: Treat upstream locale roots (`bili`, `cn`, `en`, `jp`, `kr`, `tw`) as the server scope for the initial index.
- 2026-04-16: Use `story_review_table.json`, `story_review_meta_table.json`, `stage_table.json`, and `story_table.json` as the first-stage source set.
- 2026-04-16: Defer full story parsing and summary generation to later child issues.
- 2026-04-16: Root verification passed after adding content integrity checks and generated readiness rendering.
