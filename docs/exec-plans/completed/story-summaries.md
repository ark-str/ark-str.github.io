# Story Summaries

## Objective

Render vendor-provided story summaries in the reader without adding runtime network access.

## Scope

- Import localized `gamedata/story/[uc]info/` text into generated story detail JSON.
- Mark summary manifest entries `ready` when a non-empty summary is bundled.
- Replace the placeholder bottom summary section with a collapsed summary card directly under the story title.

## Constraints

- Keep story bodies loaded from bundled `public/generated/content/stories/` JSON.
- Do not add remote APIs, fonts, images, analytics, or CDN dependencies.
- Keep summary disclosure state local to the page and closed by default.

## Tasks

- [x] Add summary path resolution and text normalization to the content pipeline.
- [x] Add `summaryText` to the `StoryDetail` contract and generated story payloads.
- [x] Add content guards and tests for summary readiness.
- [x] Render the story summary card with height-only disclosure.
- [x] Complete full verification.

## Verification

- `npm run content:build-index`
- `npm run content:check`
- `npm run harness:test`
- `npm run verify`

## Decision Log

- 2026-04-24: Store summaries in story detail JSON instead of creating a separate summary fetch, because story pages already load the detail payload and summaries are small.
- 2026-04-24: Hide the summary card entirely when no summary exists, avoiding the previous empty-state copy and keeping spoiler prevention simple.
- 2026-04-24: Use measured `max-height` disclosure instead of grid-row collapse after smoke testing showed residual closed height in Chromium.
