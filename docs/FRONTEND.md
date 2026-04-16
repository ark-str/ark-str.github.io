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
- reader session persistence for preferred locale and last visited story
- app-level light/dark theme toggle persisted through the preferences feature
- canonical locale archive routes and direct story deep links
- first-pass story body rendering sourced from bundled story detail JSON
- a generated-content readiness panel and explicit summary empty state sourced from bundled JSON
- gh-pages-safe reader routes rendered from exported static files under the `/ark-str/` base path
- no framework starter copy, remote links, or vendor branding
- reader shell must use shared UI primitives instead of one-off styled markup

## Anti-Patterns

- generic placeholder copy
- dark-mode-only styling
- default starter typography
- leaking root harness concerns into app UI
