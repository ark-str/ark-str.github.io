# Design System

This project follows an editorial archive design system for an Arknights story reader.

## Intent

- make long-form story reading calm and legible
- feel like a curated archive rather than a generic dashboard
- keep the rules inspectable by agents through docs, tokens, primitives, and guards

## Scope

This v1 design system includes:

- `Components` - shared UI primitives and product-facing patterns
- `Voice & Tone` - how onboarding, empty states, and summary copy should read
- `Source code` - implemented tokens and primitives in the nested app

This v1 does not include:

- Figma or other designer kit deliverables
- a separate brand site or marketing system

## Foundations

- visual tone: editorial archive
- typography: sans-first, with display and body tokens kept in the same modern family
- surface language: restrained radii and compact chrome instead of pill-heavy cards
- archive surfaces: locale archive pages use height-only animated collapsed storyline grid cards that keep their grid cell when expanded, simple regular storyline item lists, thinner flow-reference links, generated group image washes, and a separate bottom operator narrative grid section
- home surface: onboarding uses a clean centered nickname capture hero, a two-line continue action that previews the target story title, full-bleed square-edged editorial service copy with an accent-colored app icon, widely separated image-backed recommendation cards, locale-aware statistics, and a restrained maintainer footer
- group imagery: manually curated `assets/group-backgrounds/<groupId>.png` files override inferred sources; generated output is optimized WebP, MAINLINE images are treated as square contained title art, and ACTIVITY images are treated as wide atmospheric backgrounds
- app chrome: the shared app bar is fixed to the top edge, uses separate browser and app chrome icons, keeps home/theme/dropdown/notes controls aligned to the same compact height and radius as the Story button, keeps breadcrumb separators icon-only, and hides on downward scroll so long-form reading gets more vertical space
- story surfaces: dynamic story backdrops switch behind the content from intersecting background blocks without blur/backdrop-filter effects, in-flow background cards keep uncropped optimized WebP previews, spoiler-safe summary cards sit under the title with height-only disclosure, dialogue cards keep the original text-first card layout while speaker portraits render as 2x top-cropped images inside the existing portrait slot, desktop sibling navigation uses compact wrapping badges with matching accent phase tones, a fixed lower-right note button opens a desktop sidebar or mobile bottom sheet, and bottom story navigation provides previous/next movement inside the current group
- implementation base: shadcn-style shared primitives customized for this project
- theme strategy: light and dark from the start
- scrollbars: transparent tracks and corners for both axes, with subdued local thumbs
- runtime rule: no remote fonts, assets, or scripts

## Where It Lives

- tokens: `docs/design-system/tokens.md`
- component inventory: `docs/design-system/components.md`
- content and UI copy rules: `docs/design-system/content-style.md`
- source primitives: `ark-str-web-app/src/components/ui/`
- runtime token source: `ark-str-web-app/src/app/globals.css`

## Enforcement

- shared UI primitives belong in `ark-str-web-app/src/components/ui/`
- feature-specific composition belongs in `ark-str-web-app/src/features/*/ui/`
- hard-coded runtime colors outside `ark-str-web-app/src/app/globals.css` fail `npm run design-system:check`
