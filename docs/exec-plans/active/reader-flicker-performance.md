# Reader Flicker Performance

Status: active
Issue: #84
Branch: `issue-84-reader-flicker-performance`

## Objective

Remove disclosure fade flicker and reduce story-page scroll flicker across Safari and Chromium browsers.

## Scope

- Remove opacity fade from storyline disclosure panels while keeping the 300ms height animation.
- Remove high-cost blur and backdrop-filter effects from sticky/fixed reader chrome.
- Prevent duplicate active-background state updates while scrolling.
- Add smoke coverage for the relevant CSS performance contracts.

## Constraints

- Keep dynamic story backdrops and in-flow background preview cards.
- Do not change generated content or content pipeline outputs.
- Keep runtime resources local and bundled.

## Tasks

- Update `DisclosureCard` to animate only layout rows and border state.
- Update floating app bar and story surfaces to avoid backdrop-filter and fixed-image filter usage.
- Dedupe story active-background state updates by story/background id.
- Update smoke tests to assert no opacity disclosure transition, app-bar backdrop filter, or backdrop image filter.

## Verification

- `npm run app:typecheck`
- `npm run app:lint`
- `npm run smoke`
- `npm run verify`

## Decision Log

- Treat the flicker as a whole-page compositing issue because the user observed it in Chrome and on the app bar, not only in Safari or only on the backdrop image.
