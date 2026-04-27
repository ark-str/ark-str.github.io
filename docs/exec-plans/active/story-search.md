# Story Search

## Objective

Add current-locale full-story text search with `/search?q=...` deep links, app-bar entry, highlighted matching lines, and story-card navigation.

## Scope

- generate bundled locale search indexes from parsed story blocks
- add `/search` route and search UI under the app feature layer
- support debounced immediate search and URL replacement while typing
- incrementally render broad result sets on scroll
- update product/frontend/design docs and smoke coverage

## Constraints

- no runtime network calls beyond bundled generated JSON
- no external virtualization/search dependency
- keep browser-only search behavior inside client feature UI/runtime code
- keep GitHub Pages `/ark-str/` export compatibility

## Tasks

- [x] branch from `main` for the search iteration
- [x] add generated search index support to the content pipeline
- [x] add search index integrity checks
- [x] add app runtime fetch hook for locale search indexes
- [x] add app-bar search control and `/search` page
- [x] add debounced URL sync, highlighted results, and scroll-driven result loading
- [x] update docs and smoke coverage
- [x] run `npm run verify`

## Verification

- `npm run content:build-index`
- `npm run app:typecheck`
- `npm run app:lint`
- `npm run verify`

## Decision Log

- 2026-04-27: Search scope is current selected locale, not all locales at once.
- 2026-04-27: Use locale JSON indexes because fetching every story detail at search time would require hundreds of MiB of browser reads.
- 2026-04-27: Allow one-character queries such as `W`; render results incrementally on scroll rather than blocking the query.
