# Frontend

## Intent

The app should feel editorial, deliberate, and product-specific rather than like a framework starter.

## Rules

- The runnable interface lives entirely in `ark-str-web-app/`.
- Use CSS variables for color, spacing, and typography tokens.
- Use semantic tokens rather than page-level hard-coded colors.
- Prefer warm, readable surfaces and high-contrast information blocks over generic dashboard chrome.
- Avoid remote assets entirely; the only remote runtime call is the user-triggered Google AI Studio text summary request.
- Design for both desktop and mobile from the first pass.
- Keep interactions obvious, testable, and local-first.
- Shared primitives belong in `ark-str-web-app/src/components/ui/`.
- Detailed token and component guidance lives in `docs/design-system/README.md`.

## Current UI Contract

- reader-focused home shell inside `ark-str-web-app`
- reader session persistence for preferred locale, reader nickname, and last visited story
- home renders a localized ARK STR landing surface with a clean centered nickname prompt, two-line continue action showing the target story title, full-bleed square-edged service introduction using the accent-colored app icon, generously separated curated recommendation collections, and selected-locale statistics
- app-level light/dark theme toggle persisted through the preferences feature
- settings live at `/settings` and expose reader name, Google AI Studio API key with a public/shared-device warning, a Google AI Studio API key link, an animated collapsible key issuance guide, dismissible JSON backup/restore/reset status alerts, note/read-progress resets, and a GitHub issue link that opens in a new tab
- read progress is toggled from story action rows, stored by `storyId`, shared across locales, and shown on group story cards; AI summary widgets render Markdown, use a stable character/key-events/final-summary response format, and share one transient story-level result between the top and bottom action rows
- every reader frame page ends with a maintainer footer and a new-tab Issue link that wraps to a centered second row on narrow screens
- story-level notes persisted locally by `storyId`, shared across localized versions of the same story, saved as text changes, and removed from the notes list when cleared
- the notes overview renders editable grid cards with enough minimum column width for comfortable note editing, keeps story sidebar-style stage and phase badges such as 작전 전/후 or 브릿지 visible, and does not unmount a card while its textarea is being cleared
- story note sidebars and bottom sheets use localized controls, omit fake mobile drag handles, and consume browser back while open so back closes the note editor before route navigation
- app chrome, note/search UI, reader status, and metric labels resolve from the configured reader UI locale instead of embedding Korean-only strings in feature components
- the search overview loads the current locale's bundled search index, keeps the search input centered at a 500px desktop width, supports `/search?q=...` deep links, runs debounced immediate search while typing, highlights the matched line in grid result cards, and incrementally renders broad result sets as the user scrolls
- story stage badges and 작전 전/후 or 브릿지 phase badges use one shared visual treatment across search, notes, group story cards, story headers, and story side navigation
- data loading states use a compact loading indicator instead of visible loading sentences, while empty and error states remain text based
- canonical locale archive routes, group overview routes, and direct story deep links
- locale archives remove helper copy from the route header, keep the Storylines stats card right-aligned on mobile, and render generated storyline sections as collapsed grid cards with 300ms height-only disclosure animation; regular storyline cards stay inside the main grid as single cells whether closed or open, expanded regular sections keep a simple one-column list, and operator narratives sit in a separate bottom section with an internal grid
- locale archive disclosure toggles use a centered icon primitive instead of text glyphs so the control remains visually centered across browser font stacks
- locale archive primary group cards use the same dark image treatment as group-flow cards, with white titles and Stories/chars/time metrics rendered as compact pill badges
- first-pass story body rendering sourced from bundled story detail JSON
- story text rendering replaces `{@nickname}` and `{@nickName}` from the local reader nickname, using an empty string when unset
- a restrained fixed top app bar shared by home, archive, group, and story routes without backdrop-filter effects; it keeps browser metadata on the black-background icon, uses a separate transparent app chrome icon for the home control, and keeps home/theme buttons, dropdowns, and group text aligned to the same compact height/radius/text scale as the Story button
- the app bar includes an icon-only notes control between locale and theme, routing to a notes overview where saved notes link back to their last edited story route
- the app bar includes an icon-only search control between locale and notes, routing to `/search`
- the app bar includes an icon-only settings control to the right of the theme toggle, and group breadcrumbs use the same bordered compact control on group and story routes
- story pages with a spoiler-safe collapsible summary card directly under the title, desktop-only left-side group navigation, main reading column, bottom previous/next story navigation, and a floating top button
- story pages include a fixed lower-right note button above the floating top button that opens a right sidebar on desktop and a bottom sheet on mobile
- group overview pages render wrapping titles and Stories/chars/time metrics over the generated hero image, then show the named current storyline as horizontally scrollable group/reference cards before simplified story cards; oversized storylines are bounded to the current group neighborhood, reference cards carry an up-right cue, and story cards avoid exposing internal story IDs
- story route headers avoid raw vendor paths and group-count copy; the desktop sibling-story navigation card is viewport-constrained with internal scrolling, wraps story metadata as badges, and renders bridge/pre/post phase badges with the same accent tone
- horizontal and vertical scrollbar tracks/corners are transparent, with only a subtle local thumb for scroll affordance
- story-only dynamic backdrops driven directly by intersecting bundled background blocks without fixed-layer blur, while non-story pages keep the archive base background
- in-flow background blocks keep their own bundled image previews without cropping and still drive the fixed story backdrop
- story backdrop swaps on story pages happen immediately without cross-fade state
- the UI uses a sans-first type system and a tighter radius scale for more consistent modern chrome
- dialogue cards keep the original text-first card layout while speaker portraits render as 2x top-cropped images inside the existing portrait slot
- a generated-content readiness panel and vendor `[uc]info` story summaries sourced from bundled story detail JSON
- gh-pages-safe reader routes rendered from exported static files under the `/ark-str/` base path
- reader route shells should avoid embedding full story payloads in server-rendered props; archive, group, story detail, and asset lookups load from bundled generated JSON at runtime
- generated story media should use local optimized WebP assets referenced through the generated asset manifest, not direct vendor paths
- no framework starter copy or vendor branding; the Settings GitHub issue link is the documented remote-link exception
- reader shell must use shared UI primitives instead of one-off styled markup

## Anti-Patterns

- generic placeholder copy
- dark-mode-only styling
- default starter typography
- leaking root harness concerns into app UI
