# Reader IA and Layout Refresh

## Objective

Refresh the reader information architecture and page layout so navigation feels app-like instead of shell-like.

## Scope

- add a shared floating app bar across home, archive, group, and story routes
- add `/reader/[locale]/[groupId]` group overview routes
- add generated reading metrics for groups and stories
- move story summary to a full-width section below the body
- add story-only scroll-driven dynamic backdrops while keeping background blocks in flow
- add a floating top button on story pages

## Constraints

- keep runtime bundled-only and local-storage-only
- keep background dynamics limited to story routes; all other routes retain the current archive background
- keep background story blocks visible in the reading flow
- keep summary generation itself out of scope

## Tasks

- extend generated content index with visible character counts and estimated minutes
- add app-bar navigation models for home, locale archive, group, and story routes
- add group overview route and UI
- refactor story shell into left nav + main body + bottom summary + dynamic backdrop
- update smoke coverage and docs

## Verification

- `npm run content:update`
- `npm run content:check`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`

## Decision Log

- group becomes a first-class route under `/reader/[locale]/[groupId]`
- story backgrounds remain in the flow, but only story pages get a fixed dynamic backdrop
- reading time uses generated visible character counts, not runtime estimation
