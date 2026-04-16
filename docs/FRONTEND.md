# Frontend

## Intent

The app should feel editorial, deliberate, and product-specific rather than like a framework starter.

## Rules

- The runnable interface lives entirely in `ark-str-web-app/`.
- Use CSS variables for color, spacing, and typography tokens.
- Prefer warm, readable surfaces and high-contrast information blocks over generic dashboard chrome.
- Avoid remote assets entirely.
- Design for both desktop and mobile from the first pass.
- Keep interactions obvious, testable, and local-first.

## Current UI Contract

- bootstrap home shell inside `ark-str-web-app`
- locally persisted bootstrap preferences
- visible dependency graph for the next harness issues
- no framework starter copy, remote links, or vendor branding

## Anti-Patterns

- generic placeholder copy
- dark-mode-only styling
- default starter typography
- leaking root harness concerns into app UI
