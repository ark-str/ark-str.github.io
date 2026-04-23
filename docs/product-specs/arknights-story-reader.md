# Arknights Story Reader

Status: active
Phase: reader visual refresh

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

This phase keeps the recovered reader shell and Pages deployment path stable while upgrading the information architecture and reading surface. It keeps:

- canonical locale URLs at `/reader/[locale]`, `/reader/[locale]/[groupId]`, and `/reader/[locale]/[groupId]/[storyId]`
- generated story detail files under `public/generated/content/stories/`
- metadata-only app-internal generated loaders under `src/generated/content/` for exact-path export-safe reads
- first-pass body rendering for dialogue, narration, background changes, scene breaks, and Doctor choice branches
- dialogue-level `speakerId` as the shared visual lookup key for `Character(...)`, `character(...)`, and `charslot(...)` tags
- `char_` speaker IDs are canonicalized to the first three `_`-delimited segments, while non-`char` speaker IDs keep their stripped raw token for visual portrait lookup
- mixed `CharacterCutin`, `character` / `Character`, and `charslot` tags can coexist, and each dialogue line chooses exactly one winning eligible speaker frame by highest priority then most recent update
- `focus < 0` and neutral `charslot` frames stay visible but are not eligible dialogue speakers; while any frame is active, speaker-name bindings are only reused after those frames clear
- `Background(image="...")` tags are normalized into explicit background blocks and use bundled `ArknightsResource/avgs/bg/` images when available
- `CharacterCutin` winning frames are presented as remote radio communication in the reader
- `npm run content:portraits` or `npm run content:update` can refresh the blobless `vendor/ArknightsResource/` media cache from `ArknightsResource/`, materialize only referenced `avgs/npcs/` portraits and `avgs/bg/` backgrounds, and copy them into bundled app assets
- portrait selection uses the basename-sorted first matching `avgs/npcs` file for each referenced `speakerId`
- background selection uses the exact `image` key first and otherwise the basename-sorted first matching `avgs/bg` file for each referenced background ID
- reader portraits render from bundled optimized `public/generated/portraits/speakers/<speakerId>.webp` assets with top-aligned full-body crops
- reader backgrounds render from bundled optimized `public/generated/backgrounds/<backgroundId>.webp` assets inline with the story body
- generated group artwork renders from bundled optimized `public/generated/group-backgrounds/<groupId>.webp` assets
- generated JSON is minified and heavy story body files are loaded by client runtime fetches from bundled `public/generated/content/` paths so exported route HTML/RSC payloads stay small
- `public/generated/content/assets.json` is the runtime lookup for portraits, backgrounds, and group backgrounds, mirrored into `src/generated/content/assets.json` for integrity checks
- story-level `observedOperators` arrays embedded in generated story detail JSON remain limited to `char_` speaker IDs for alias persistence
- local storage reader-session restore for preferred locale and last visited story
- locale-scoped character alias observation storage under `ark-str:character-observations:v1`
- explicit empty summary state until the summary-generation issue lands, rendered below the story body instead of in a side rail
- a floating rounded app bar shared by home, locale archive, group, and story pages
- locale archives group story sets by generated storyline metadata in initially collapsed grid cards with height-only 300ms disclosure animation that remain one main-grid cell whether closed or open before routing into dedicated group overview pages
- expanded regular storyline archive sections render `STORY_SET` primary groups and `BEFORE` / `AFTER` flow references in the same sorted one-column list; `NONE/NONE` review groups are `오퍼레이터 서사`, unmatched event groups are `미분류`, and `오퍼레이터 서사` is sorted last and rendered as a bottom section outside the main grid with an internal group grid
- generated group and story metrics for total visible characters and estimated reading time
- generated group-level images copied into `public/generated/group-backgrounds/`; manually curated `assets/group-backgrounds/<groupId>.png` files override inferred `ArknightsResource` sources, MAINLINE groups prefer square artwork, and ACTIVITY groups prefer wide atmospheric images
- locale archive primary group cards render generated group artwork with a dark overlay, white titles, and compact Stories/chars/time metric badges
- group overview pages place the title and Stories/chars/time metrics over the hero image, expose the named current storyline as horizontal group/reference cards, bound oversized storylines to the current group neighborhood, mark reference cards with an up-right cue, and make each story card itself the story link without visible internal story IDs
- story pages keep the global archive feel, but only story pages add a dynamic fixed background backdrop sourced from in-flow `background` blocks
- story pages keep `background` blocks in the flow as scroll markers with bundled preview images shown uncropped while the backdrop updates from IntersectionObserver visibility
- story-page backdrop swaps are immediate; cross-fade state is intentionally omitted to keep the reader surface predictable
- story-page fixed backdrops and floating app chrome avoid blur/backdrop-filter effects to prevent scroll-time compositor flicker
- story pages place group story navigation on the left and a floating scroll-to-top action at the lower right
- dialogue cards use a portrait-plus-header layout that gives the spoken text the full card width instead of a narrow side-by-side split
- Doctor choice normalization no longer renders a nested "Shared response" section; predicates that reference every option are treated as post-choice continuation
- gh-pages-safe static export under the `/ark-str/` base path
- isolated `.next-dev` and `.next-export` caches so `npm run verify` does not degrade the next `npm run dev` startup
- export-size checks run after static export to keep `ark-str-web-app/.next-export` and generated assets within the committed budget
- a manual GitHub Actions Pages workflow that rebuilds, verifies, and publishes `ark-str-web-app/out`
- the visual system uses a sans-first type stack and a more restrained radius scale while keeping the archive background mood
