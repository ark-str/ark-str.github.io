# Storyline Archive Indexing

## Objective

Group locale archive pages by Arknights storyline metadata instead of rendering a flat group list.

## Scope

- derive storyline sections from `stage_table.json`
- render `/reader/[locale]` by storyline section
- show `STORY_SET` entries as primary group cards
- show `BEFORE` and `AFTER` entries as flow reference links
- place `NONE/NONE` groups under `오퍼레이터 서사`
- place unmatched activity groups under `미분류`

## Constraints

- keep runtime data bundled in generated JSON
- do not add new routes
- preserve existing group and story deep links
- keep generated story payloads out of `src/generated/content/`

## Tasks

- add a pure storyline-index builder in `scripts/content/`
- include `storylines` in generated `index.json`
- extend content checks and unit coverage for primary/reference/synthetic rules
- update locale archive UI and smoke coverage
- update product/frontend/design docs and latest iteration record

## Verification

- `npm run content:build-index`
- `npm run content:check`
- `npm run verify`
- `codex review --base main`

## Decision Log

- `STORY_SET` is the only primary storyline membership.
- `BEFORE` and `AFTER` are hyperlink-style references.
- `NONE/NONE` story review groups are operator narratives.
- Unmatched non-operator groups are intentionally visible under `미분류`.
