# Arknights Story Reader

Status: active
Phase: root bootstrap

## Product Goal

Build a web application that makes Arknights story content easier to read, summarize, and browse without requiring runtime network access.

## Main Pages

- Home / onboarding
- Reader
- Character information

## Reader Expectations

- organize navigation by locale, narrative grouping, and stage or story
- show dialogue with speaker portrait, name, and line text
- show Doctor choice branches with their resulting dialogue
- include story summaries alongside the raw script

## Character Information Expectations

- start empty for a new user
- unlock facts progressively as the user reads stories
- persist discovered facts and progress in `localStorage`

## Data and Pipeline Expectations

- upstream raw data comes from GitHub-managed sources under `vendor/`
- runtime reads only bundled assets generated into `public/generated/`
- summaries and unlock facts are produced ahead of time through scripts
- already-summarized stories must be tracked so unchanged stories are skipped

## Runtime Constraints

- App Router only
- bundled resources only
- no runtime external fetches
- local storage only for mutable user state
- root-first repository layout so the harness can operate from the repo root

## Current Bootstrap Phase

This issue does not implement the full reader yet. It only establishes:

- a fresh root-level Next.js app
- root-level docs, scripts, and tests
- a local-first bootstrap shell that proves the persistence and verification path
- the issue and PR dependency plan for follow-up reader work
