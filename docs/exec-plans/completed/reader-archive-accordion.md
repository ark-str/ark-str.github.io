# Reader Archive Accordion Layout

## Objective

Refresh locale archive pages so storyline groups are collapsed grid cards and expanded content is a compact chronological list.

## Scope

- render `/reader/[locale]` storyline sections as collapsed cards in a responsive grid
- use native details/summary disclosure without client state
- render primary groups and flow references in `storyline.items` order
- show primary group rows with name, stories, chars, and estimated reading time
- show flow references as thinner title-only rows
- sort `오퍼레이터 서사` as the final storyline

## Constraints

- keep the page as a server component
- do not add localStorage or route changes
- keep group and reference rows as direct links to existing group routes
- preserve bundled static content and gh-pages export behavior

## Tasks

- update generated storyline sort order for synthetic storylines
- rebuild generated content index
- refactor locale archive UI
- update smoke and content tests
- update frontend/design docs and latest iteration record

## Verification

- `npm run content:build-index`
- `npm run content:check`
- `npm run verify`
- `codex review --base main`
