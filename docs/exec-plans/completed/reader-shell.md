# Reader Shell

Status: completed
Owner: Codex
Started: 2026-04-16
Parent issue: `#1`
Active child issue: `#8`
Draft PR: `#9`

## Objective

Implement the first real reader shell so users can open canonical locale story URLs, browse generated group and story navigation, and read first-pass story bodies without runtime network access.

## Scope

- add reader routes for canonical locales `cn`, `en`, `jp`, `kr`, and `tw`
- extend the content pipeline so it emits per-story detail files under `public/generated/content/stories/`
- parse raw story text into first-pass dialogue, narration, scene break, and choice blocks
- add a reader session store that restores preferred locale and the last visited story
- turn the home shell into a real entry point for continuing reading and opening locale archives

## Constraints

- no runtime external fetches
- keep mutable browser state in `localStorage`
- exclude `bili` from public routes and navigation
- do not implement summary generation or character unlock extraction in this issue

## Issue And PR Dependency Graph

- `#8 reader-shell`
  - depends on: `#4`, `#6`
  - PR: `#9`
- `verification-and-docs`
  - depends on: `#8`
  - PR: create after prerequisites merge

## Commit Policy

- first milestone: reader plan, route scaffold, and session model
- second milestone: story detail generation, routes, and reader UI
- final milestone: verification and review fixups

Commit format:

- `milestone(issue-<n>): scaffold`
- `milestone(issue-<n>): core`
- `feat(issue-<n>): ...`
- `fix(issue-<n>): ...`
- `chore(issue-<n>): ...`

## Tasks

- [x] add a canonical locale reader session store and migrate locale preference defaults
- [x] emit story detail JSON files and augment the generated index with reader body paths
- [x] add `/reader/[locale]` and `/reader/[locale]/[groupId]/[storyId]` routes
- [x] render first-pass story bodies including dialogue, narration, and Doctor choice branches
- [x] update smoke coverage for direct reader URLs and session restore

## Verification

- `npm run content:update`
- `npm run content:check`
- `npm run harness:test`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- 2026-04-16: Use canonical locale route params `cn`, `en`, `jp`, `kr`, and `tw`; keep `bili` out of public URLs.
- 2026-04-16: Render summary as an explicit empty state until the summary-generation issue lands.
- 2026-04-16: Parse choice blocks from raw story files by pairing `Decision` and subsequent `Predicate` sections.
- 2026-04-16: Keep reader routes dynamic for now; full gh-pages export compatibility stays with the later verification-and-docs issue.
- 2026-04-16: Root verification passed on the branch after adding reader session restore, story detail generation, and browser smoke coverage.
