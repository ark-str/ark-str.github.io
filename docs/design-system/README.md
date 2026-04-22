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
- archive surfaces: locale archive pages use animated collapsed storyline grid cards, compact chronological item grids, thinner flow-reference links, and a separate bottom operator narrative section
- story surfaces: dynamic story backdrops switch behind the content from intersecting background blocks while in-flow background cards keep uncropped image previews and dialogue cards prioritize body-first reading layouts
- implementation base: shadcn-style shared primitives customized for this project
- theme strategy: light and dark from the start
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
