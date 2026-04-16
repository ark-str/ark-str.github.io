# Harness Root + Nested App Rebootstrap

Status: active
Owner: Codex
Started: 2026-04-16
Parent issue: `#1`
Active child issue: `#2`
Draft PR: `#3`

## Objective

Rebootstrap the repository so the root contains only harness concerns and the runnable Next.js application lives independently in `ark-str-web-app/`.

## Scope

- clear the pre-existing mixed structure
- scaffold a fresh nested Next.js app under `ark-str-web-app/`
- restore root-level docs, scripts, and tests as harness-only assets
- replace starter defaults with a local-first bootstrap shell inside the nested app
- document the next issue and PR dependency graph

## Constraints

- no workspaces
- no remote runtime assets
- local storage only for mutable browser state
- GitHub-backed harness flow remains the required iteration mechanism

## Issue And PR Dependency Graph

- `#2 root-bootstrap`
  - depends on: none
  - PR: `#3`
- `content-pipeline-foundation`
  - depends on: `#2`
  - PR: create after `#3` merges
- `reader-shell`
  - depends on: `#2`, `content-pipeline-foundation`
  - PR: create after prerequisites merge
- `verification-and-docs`
  - depends on: `content-pipeline-foundation`, `reader-shell`
  - PR: create after prerequisites merge

## Commit Policy

- first milestone: scaffold or structural reset
- second milestone: core behavior working
- final milestone: verification and review fixups

Commit format:

- `milestone(issue-<n>): scaffold`
- `milestone(issue-<n>): core`
- `feat(issue-<n>): ...`
- `fix(issue-<n>): ...`
- `chore(issue-<n>): ...`

## Tasks

- [x] scaffold fresh nested app
- [x] restore root harness docs and scripts
- [x] replace nested app starter defaults with bootstrap shell
- [x] retarget verify pipeline and smoke gate to `ark-str-web-app`
- [x] document post-bootstrap dependency order

## Verification

- `npm run guards:all`
- `npm run harness:test`
- `npm run verify`

## Decision Log

- 2026-04-16: Keep all harness settings and entrypoints in the repository root.
- 2026-04-16: Use a nested `ark-str-web-app` package instead of a root app so the harness and the runnable product stay separated.
- 2026-04-16: Open the issue branch and draft PR before destructive filesystem changes.
- 2026-04-16: Link root harness scripts to the app with `npm --prefix ark-str-web-app ...` instead of workspaces.
