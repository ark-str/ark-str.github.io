# Root-First Rebootstrap

Status: active
Owner: Codex
Started: 2026-04-16
Parent issue: `#1`
Active child issue: `#2`
Draft PR: `#3`

## Objective

Rebootstrap the repository into a fresh root-level Next.js application while preserving the harness, docs, guards, and tests in the repository root.

## Scope

- clear the pre-existing mixed structure
- scaffold a fresh root Next.js app
- restore root-level docs, scripts, and tests
- replace starter defaults with a local-first bootstrap shell
- document the next issue and PR dependency graph

## Constraints

- no workspaces or nested app packages
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

- [x] scaffold fresh root app
- [x] restore harness docs and scripts
- [x] replace starter defaults with bootstrap shell
- [x] restore verify pipeline and smoke gate
- [x] document post-bootstrap dependency order

## Verification

- `npm run guards:all`
- `npm run harness:test`
- `npm run verify`

## Decision Log

- 2026-04-16: Keep all harness settings and entrypoints in the repository root.
- 2026-04-16: Use a single root Next.js app instead of workspaces so root-bound harness scripts stay reliable.
- 2026-04-16: Open the issue branch and draft PR before destructive filesystem changes.
