# Frontend

## Intent

The app should feel editorial, deliberate, and product-specific rather than like a framework starter.

## Rules

- The runnable interface lives entirely in `ark-str-web-app/`.
- Use CSS variables for color, spacing, and typography tokens.
- Use semantic tokens rather than page-level hard-coded colors.
- Prefer warm, readable surfaces and high-contrast information blocks over generic dashboard chrome.
- Avoid remote assets entirely.
- Design for both desktop and mobile from the first pass.
- Keep interactions obvious, testable, and local-first.
- Shared primitives belong in `ark-str-web-app/src/components/ui/`.
- Detailed token and component guidance lives in `docs/design-system/README.md`.

## Current UI Contract

- reader-focused home shell inside `ark-str-web-app`
- reader session persistence for preferred locale, reader nickname, and last visited story
- home renders a localized ARK STR landing surface with a clean centered nickname prompt, two-line continue action showing the target story title, full-bleed square-edged service introduction using the accent-colored app icon, generously separated curated recommendation collections, selected-locale statistics, and maintainer credit
- app-level light/dark theme toggle persisted through the preferences feature
- canonical locale archive routes, group overview routes, and direct story deep links
- locale archives remove helper copy from the route header, keep the Storylines stats card right-aligned on mobile, and render generated storyline sections as collapsed grid cards with 300ms height-only disclosure animation; regular storyline cards stay inside the main grid as single cells whether closed or open, expanded regular sections keep a simple one-column list, and operator narratives sit in a separate bottom section with an internal grid
- locale archive primary group cards use the same dark image treatment as group-flow cards, with white titles and Stories/chars/time metrics rendered as compact pill badges
- first-pass story body rendering sourced from bundled story detail JSON
- story text rendering replaces `{@nickname}` and `{@nickName}` from the local reader nickname, using an empty string when unset
- a restrained fixed top app bar shared by home, archive, group, and story routes without backdrop-filter effects; it keeps browser metadata on the black-background icon, uses a separate transparent app chrome icon for the home control, and keeps home/theme buttons, dropdowns, and group text aligned to the same compact height/radius/text scale as the Story button
- story pages with desktop-only left-side group navigation, main reading column, bottom summary section, bottom previous/next story navigation, and a floating top button
- group overview pages render wrapping titles and Stories/chars/time metrics over the generated hero image, then show the named current storyline as horizontally scrollable group/reference cards before simplified story cards; oversized storylines are bounded to the current group neighborhood, reference cards carry an up-right cue, and story cards avoid exposing internal story IDs
- story route headers avoid raw vendor paths and group-count copy; the desktop sibling-story navigation card is viewport-constrained with internal scrolling, wraps story metadata as badges, and renders bridge/pre/post phase badges with the same accent tone
- horizontal and vertical scrollbar tracks/corners are transparent, with only a subtle local thumb for scroll affordance
- story-only dynamic backdrops driven directly by intersecting bundled background blocks without fixed-layer blur, while non-story pages keep the archive base background
- in-flow background blocks keep their own bundled image previews without cropping and still drive the fixed story backdrop
- story backdrop swaps on story pages happen immediately without cross-fade state
- the UI uses a sans-first type system and a tighter radius scale for more consistent modern chrome
- dialogue cards prioritize a vertical reading layout with borderless 2x top-cropped portraits and speaker meta in the header, while the body text spans the full card width
- a generated-content readiness panel and explicit summary empty state sourced from bundled JSON
- gh-pages-safe reader routes rendered from exported static files under the `/ark-str/` base path
- reader route shells should avoid embedding full story payloads in server-rendered props; archive, group, story detail, and asset lookups load from bundled generated JSON at runtime
- generated story media should use local optimized WebP assets referenced through the generated asset manifest, not direct vendor paths
- no framework starter copy, remote links, or vendor branding
- reader shell must use shared UI primitives instead of one-off styled markup

## Anti-Patterns

- generic placeholder copy
- dark-mode-only styling
- default starter typography
- leaking root harness concerns into app UI
