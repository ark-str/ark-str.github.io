# Group Page UI Refresh

## Objective

Refresh reader group overview pages so the page reads as a visual story set hub instead of a metadata-heavy index.

## Scope

- Move title and Stories/chars/time metrics onto the hero image, center-bottom aligned.
- Remove group overview/type badges from the hero.
- Add a horizontal storyline flow section under the hero using the current group's primary storyline.
- Include both primary group and reference items in the flow, with the current group highlighted.
- Use the storyline title as the flow heading and mark reference items with an up-right cue.
- Bound oversized storyline flows to the current group's neighborhood so synthetic operator pages do not render hundreds of cards.
- Simplify story cards by removing the explicit `Open story` CTA and body readiness copy.
- Hide internal story identifiers from story cards.

## Constraints

- Keep runtime assets bundled.
- Reuse existing generated content schema.
- Preserve static export and smoke coverage.

## Verification

- `npm run app:typecheck`
- `npm run app:lint`
- `npm run verify`

## Decision Log

- The flow section uses the current group's primary storyline as the previous/next context.
- Synthetic and other oversized storylines use a 24-card window around the current group for static export size and runtime performance.
- Story cards remain navigable by making the full card a link.
