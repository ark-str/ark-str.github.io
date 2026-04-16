# Frontend

## Intent

The interface should feel editorial, deliberate, and product-specific rather than like a framework starter.

## Rules

- Keep the current bootstrap phase to one route until the product spec explicitly expands it.
- Use CSS variables for color, spacing, and typography tokens.
- Prefer warm, readable surfaces and high-contrast information blocks over generic dashboard chrome.
- Avoid remote assets entirely.
- Design for both desktop and mobile from the first pass.
- Keep interactions obvious, testable, and local-first.

## Current UI Contract

- hero that explains the root-first bootstrap state
- locally persisted bootstrap preferences
- visible dependency graph for the next harness issues
- no framework starter copy, remote links, or vendor branding

## Anti-Patterns

- generic placeholder copy
- dark-mode-only styling
- default starter typography
- hiding business logic inside large JSX files
