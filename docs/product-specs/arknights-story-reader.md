# Arknights Story Reader

Status: active
Phase: visual speaker portraits and npc portrait coverage

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
- persist discovered facts, observed operator aliases, and progress in `localStorage`

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

This phase keeps the recovered reader shell and Pages deployment path stable while broadening story portraits to all visual speakers. It keeps:

- canonical locale URLs at `/reader/[locale]` and `/reader/[locale]/[groupId]/[storyId]`
- generated story detail files under `public/generated/content/stories/`
- metadata-only app-internal generated loaders under `src/generated/content/` for exact-path export-safe reads
- first-pass body rendering for dialogue, narration, scene breaks, and Doctor choice branches
- dialogue-level `speakerId` as the shared visual lookup key for `Character(...)`, `character(...)`, and `charslot(...)` tags
- `char_` speaker IDs are canonicalized to the first three `_`-delimited segments, while non-`char` speaker IDs keep their stripped raw token for visual portrait lookup
- `npm run content:portraits` or `npm run content:update` can refresh the blobless `vendor/ArknightsResource/` portrait cache from `ArknightsResource/`, materialize only referenced `avgs/npcs/` portraits, and copy them into bundled app assets
- portrait selection uses the basename-sorted first matching `avgs/npcs` file for each referenced `speakerId`
- reader portraits render from bundled `public/generated/portraits/speakers/<speakerId>.png` assets with top-aligned full-body crops
- story-level `observedOperators` arrays embedded in generated story detail JSON remain limited to `char_` speaker IDs for alias persistence
- local storage reader-session restore for preferred locale and last visited story
- locale-scoped character alias observation storage under `ark-str:character-observations:v1`
- explicit empty summary state until the summary-generation issue lands
- gh-pages-safe static export under the `/ark-str/` base path
- isolated `.next-dev` and `.next-export` caches so `npm run verify` does not degrade the next `npm run dev` startup
- a manual GitHub Actions Pages workflow that rebuilds, verifies, and publishes `ark-str-web-app/out`
