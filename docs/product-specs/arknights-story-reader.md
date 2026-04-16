# Arknights Story Reader

Status: active
Phase: manual Pages deployment enablement

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
- runtime reads only bundled assets generated into `ark-str-web-app/public/generated/`
- summaries and unlock facts are produced ahead of time through scripts
- already-summarized stories must be tracked so unchanged stories are skipped

## Runtime Constraints

- App Router only
- bundled resources only
- no runtime external fetches
- local storage only for mutable user state
- repository root owns the harness and `ark-str-web-app/` owns the runnable app

## Current Phase

This phase keeps the recovered reader shell stable while adding a repeatable manual GitHub Pages deployment path. It keeps:

- canonical locale URLs at `/reader/[locale]` and `/reader/[locale]/[groupId]/[storyId]`
- generated story detail files under `public/generated/content/stories/`
- metadata-only app-internal generated loaders under `src/generated/content/` for exact-path export-safe reads
- first-pass body rendering for dialogue, narration, scene breaks, and Doctor choice branches
- local storage reader-session restore for preferred locale and last visited story
- explicit empty summary state until the summary-generation issue lands
- gh-pages-safe static export under the `/ark-str/` base path
- isolated `.next-dev` and `.next-export` caches so `npm run verify` does not degrade the next `npm run dev` startup
- a manual GitHub Actions Pages workflow that rebuilds, verifies, and publishes `ark-str-web-app/out`
