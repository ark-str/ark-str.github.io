# Objective

Update the shared app bar chrome so it behaves like a fixed top application bar with icon-first controls and scroll-direction visibility.

# Scope

- Use the bundled `ark_str_icon.png` as the home control and browser tab icon.
- Replace textual breadcrumb separators with an icon while keeping the existing breadcrumb layout.
- Remove rounded floating treatment from the app bar and pin it to the top edge.
- Keep mobile wrapping support for two-line app bar layouts.
- Hide the app bar on downward scroll and reveal it on upward scroll.
- Update smoke coverage and product/design docs.

# Constraints

- Runtime assets remain bundled in the repository and app public asset graph.
- Browser-only scroll behavior stays in the client app bar component.
- The fixed app bar must not obscure route content.
- Existing app bar navigation semantics remain accessible.

# Tasks

- Copied the provided icon into the app public asset root.
- Added base-path-safe public asset path handling.
- Updated `FloatingAppBar` and `ReaderPageFrame` for fixed top chrome and scroll visibility.
- Updated Next metadata icons.
- Extended smoke coverage for icon, fixed chrome, and scroll behavior.
- Updated frontend and design-system docs.

# Verification

- `npm run app:typecheck`
- `npm run app:lint`
- `npm run app:export:ghpages`
- `npm run smoke`
- `npm run verify`
- `codex review --base main`

# Decision Log

- Use a measured `--app-bar-height` CSS variable so fixed chrome can wrap on mobile without covering content.
- Keep the app bar layout structure intact; only the outer chrome and icon treatments changed.
- Reveal the hidden app bar on focus capture so keyboard users do not tab into visually hidden controls.
