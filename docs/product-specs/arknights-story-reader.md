# Arknights Story Reader

Status: active
Phase: reader visual refresh

## Product Goal

Build a web application that makes Arknights story content easier to read, summarize, and browse while keeping bundled story reading local-first by default.

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
- vendor-provided summaries are imported ahead of time from localized `gamedata/story/[uc]info/` text files
- summary readiness is tracked in the generated summary manifest so missing summaries remain visible to guards without runtime network access

## Runtime Constraints

- App Router only
- bundled resources only
- no runtime external fetches except the user-initiated Google AI Studio story summary call after the user stores an API key locally
- local storage only for mutable user state
- Google AI Studio API keys are browser-local preferences and are excluded from backup export JSON
- repository root owns the harness and `ark-str-web-app/` owns the runnable app

## Current Phase

This phase keeps the recovered reader shell and Pages deployment path stable while upgrading the information architecture and reading surface. It keeps:

- canonical locale URLs at `/reader/[locale]`, `/reader/[locale]/[groupId]`, and `/reader/[locale]/[groupId]/[storyId]`
- generated story detail files under `public/generated/content/stories/`
- metadata-only app-internal generated loaders under `src/generated/content/` for exact-path export-safe reads
- first-pass body rendering for dialogue, multiline dialogue, sticker narration, background changes, scene images, scene breaks, and Doctor choice branches
- dialogue-level `speakerId` as the shared visual lookup key for `Character(...)`, `character(...)`, and `charslot(...)` tags
- `char_` speaker IDs are canonicalized to the first three `_`-delimited segments, while non-`char` speaker IDs keep their stripped raw token for visual portrait lookup
- `[name="..."]` and `[multiline(name="...")]` script tags are both normalized as dialogue, using the currently focused visual frame for portrait lookup
- mixed `CharacterCutin`, `character` / `Character`, and `charslot` tags can coexist, and each dialogue line chooses exactly one winning eligible speaker frame by highest priority then most recent update
- `character(...)` scene updates clear stale `charslot(...)` frames so slot-based portraits do not leak into later character-driven scenes
- `focus < 0`, neutral `charslot` frames, and focus-only `charslot` updates stay visible but do not create new fallback aliases; speaker-name fallback after active frames clear is limited to confirmed fresh-frame `char_` operator aliases, while non-operator portraits require an explicit active visual frame
- `Sticker(text="...")` tags are normalized into narration with escaped line breaks decoded and bracketed labels preserved so theater/location title cards remain readable in the linear story flow
- `Background(image="...")` and `Image(image="...")` tags are normalized into explicit background blocks, no-image clear tags emit `backgroundId: null` markers only when there is an active backdrop state to clear, adjacent duplicate background IDs are coalesced, and bundled `ArknightsResource/avgs/bg/` or direct `ArknightsResource/avgs/` images are used when available
- `CharacterCutin` winning frames are presented as remote radio communication in the reader
- `npm run content:portraits` or `npm run content:update` can refresh the blobless `vendor/ArknightsResource/` media cache from `ArknightsResource/`, materialize only referenced `avgs/npcs/` portraits plus `avgs/bg/` and direct `avgs/` story images, and copy them into bundled app assets
- portrait selection uses the basename-sorted first matching `avgs/npcs` file for each referenced `speakerId`
- background selection uses the exact `image` key first and otherwise the basename-sorted first matching `avgs/bg` file for each referenced background ID
- reader portraits render from bundled optimized `public/generated/portraits/speakers/<speakerId>.webp` assets with top-aligned full-body crops
- reader backgrounds render from bundled optimized `public/generated/backgrounds/<backgroundId>.webp` assets inline with the story body
- generated group artwork renders from bundled optimized `public/generated/group-backgrounds/<groupId>.webp` assets
- generated JSON is minified and heavy story body files are loaded by client runtime fetches from bundled `public/generated/content/` paths so exported route HTML/RSC payloads stay small
- `public/generated/content/assets.json` is the runtime lookup for portraits, backgrounds, and group backgrounds, mirrored into `src/generated/content/assets.json` for integrity checks
- story-level `observedOperators` arrays embedded in generated story detail JSON remain limited to `char_` speaker IDs for alias persistence
- local storage reader-session restore for preferred locale and last visited story
- local storage reader nickname capture on the home screen; story rendering replaces `{@nickname}` and `{@nickName}` tokens at runtime and falls back to an empty string when no nickname is set
- local storage story notes keyed by `storyId`, shared across localized versions of the same story, saved on every text edit, and deleted when the note is cleared
- local storage read-progress markers keyed by `storyId`, shared across localized versions of the same story, toggled from story pages and shown on group story cards
- story pages include top and bottom action rows under the title and under the story body for read toggling and one-shot AI summary generation; AI summaries use a speaker-aware transcript of rendered story text, show HTTP response codes for API response failures, render Markdown output in a consistent characters/key-events/final-summary format, share the same transient state between the top and bottom widgets, are not persisted, and show a settings action when no Google AI Studio API key is saved
- `/settings` stores the reader name and Google AI Studio API key with a Google AI Studio link, a public/shared-device warning, and an animated collapsible issuance guide; it exports/imports local user data as JSON with dismissible status alerts, resets notes or read-progress markers, and opens the repository GitHub issue form in a new tab for bug reports and feature requests
- backup JSON includes reader session, app theme, story notes, read progress, and character observations; it intentionally excludes Google AI Studio API keys and transient AI summary results
- locale-scoped story search indexes generated into bundled static JSON so `/search?q=...` can deep-link into current-language full-story text search without runtime network access
- home renders an ARK STR onboarding surface with a clean centered nickname input, two-line continue-reading action that shows the target story title, full-bleed square-edged localized service copy using the accent-colored app icon, generously separated curated recommendation groups, and selected-locale group/story/character-count statistics
- all reader frame pages include a maintainer footer ending with `토루` plus a new-tab Issue link that wraps to a centered second row when space is tight
- locale-scoped character alias observation storage under `ark-str:character-observations:v1`
- generated story detail JSON embeds localized `summaryText` from vendor `[uc]info` files when available, and the summary manifest marks those stories as `ready`
- a fixed top app bar shared by home, locale archive, group, and story pages; it uses separate browser and transparent app chrome icons, matched compact home/theme/dropdown control heights and radii, icon breadcrumb separators, icon-only theme control, mobile wrapping, and scroll-down hide / scroll-up reveal behavior
- the app bar includes a note icon between locale and theme controls that opens a `/notes` overview of saved story notes with links back to the last edited story route
- the app bar includes a search icon between locale and notes controls that opens `/search`, where the current locale's story index is loaded once and then searched as the query changes
- the app bar includes a settings icon to the right of the theme toggle, and the group breadcrumb is rendered as the same bordered compact control on group and story pages
- app chrome, reader status, notes, search, and common metric labels are localized from the configured reader UI locale, and the document language is synchronized client-side after persisted locale restore
- the `/notes` overview renders saved notes as editable grid cards with story sidebar-style stage/phase badges, story return links, last-edited timestamps, and stable in-place editing while text is being cleared
- the `/search` overview supports `/search?q=<query>` deep links, a centered 500px desktop search input, debounced URL replacement while typing, highlighted matching story lines, grid story cards that route back to the matched story, and scroll-driven incremental rendering for broad one-character queries
- stage and operation phase badges share one design across notes, search, group story cards, story headers, and story side navigation
- loading generated content, story bodies, notes hydration, and search indexes uses loading indicators rather than visible loading sentences
- locale archives remove redundant helper copy from the header, keep the Storylines stats card right-aligned on mobile, and group story sets by generated storyline metadata in initially collapsed grid cards with height-only 300ms disclosure animation that remain one main-grid cell whether closed or open before routing into dedicated group overview pages
- expanded regular storyline archive sections render `STORY_SET` primary groups and `BEFORE` / `AFTER` flow references in the same sorted one-column list; `NONE/NONE` review groups are `오퍼레이터 서사`, unmatched event groups are `미분류`, and `오퍼레이터 서사` is sorted last and rendered as a bottom section outside the main grid with an internal group grid
- synthetic storyline names such as uncategorized and operator narratives are translated through UI copy instead of leaking the generated Korean labels into other locales
- generated group and story metrics for total visible characters and estimated reading time
- generated group-level images copied into `public/generated/group-backgrounds/`; manually curated `assets/group-backgrounds/<groupId>.png` files override inferred `ArknightsResource` sources, MAINLINE groups prefer square artwork, and ACTIVITY groups prefer wide atmospheric images
- locale archive primary group cards render generated group artwork with a dark overlay, white titles, and compact Stories/chars/time metric badges
- group overview pages place a mobile-safe wrapping title and Stories/chars/time metrics over the hero image, expose the named current storyline as horizontal group/reference cards, bound oversized storylines to the current group neighborhood, mark reference cards with an up-right cue, and make each story card itself the story link without visible internal story IDs
- story pages keep the global archive feel, but only story pages add a dynamic fixed background backdrop sourced from in-flow `background` blocks
- story pages keep `background` blocks in the flow as scroll markers with bundled preview images shown uncropped while the fixed backdrop follows the last background or clear marker above the viewport midpoint in both scroll directions
- story-page backdrop swaps are immediate; cross-fade state is intentionally omitted to keep the reader surface predictable
- story-page fixed backdrops and fixed app chrome avoid blur/backdrop-filter effects to prevent scroll-time compositor flicker
- story pages place desktop-only group story navigation on the left with viewport-constrained internal scrolling, hide that navigation on mobile, provide bottom previous/next story navigation inside the current group, and keep a floating scroll-to-top action at the lower right
- story pages expose a fixed lower-right note button above the floating top button; its editor opens as a right sidebar on wide screens and a bottom sheet on mobile, omits a drag handle, and closes on browser back before route navigation
- story pages place a spoiler-safe summary card immediately below the route title; it starts collapsed, keeps only the `SUMMARY` badge and disclosure icon in the header, and expands with a height-only animation to reveal the generated summary text
- story route headers avoid raw vendor source paths and redundant group-count copy, while group/story metadata is rendered as compact wrapping badges and sidebar phase badges use matching accent tones
- global horizontal and vertical scrollbar tracks/corners are transparent so local scroll regions do not add heavy chrome
- dialogue cards preserve the original text-first card layout and only enlarge available speaker portraits with a 2x top-cropped render inside the existing portrait slot
- Doctor choice normalization no longer renders a nested "Shared response" section; predicates that reference every option are treated as post-choice continuation
- gh-pages-safe static export under the `https://ark-str.github.io/` Pages root path
- isolated `.next-dev` and `.next-export` caches so `npm run verify` does not degrade the next `npm run dev` startup
- export-size checks run after static export to keep `ark-str-web-app/.next-export` and generated assets within the committed budget
- a manual GitHub Actions Pages workflow that rebuilds, verifies, and publishes `ark-str-web-app/.next-export`
- the visual system uses a sans-first type stack and a more restrained radius scale while keeping the archive background mood
