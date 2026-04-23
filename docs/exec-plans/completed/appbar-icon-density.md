# App Bar Icon Density

## Objective

Separate browser and app chrome icon treatments, tighten app bar text density, and align story sidebar phase badge colors.

## Scope

- Keep browser metadata icons on `/ark_str_icon.png`.
- Add `/ark_str_app_icon.png` with transparent background for app chrome.
- Use the transparent icon in the home button with the same button style as the theme toggle, while keeping both controls the same height as the Story button.
- Keep app bar dropdown and group crumb text at the 12px small-button scale, and align app bar control heights/radii.
- Render sidebar phase badges for bridge/pre/post operation with the same accent tone.

## Constraints

- Keep assets bundled and local.
- Do not mutate `assets/ark_str_icon.png`.
- Preserve route and generated content contracts.

## Tasks

- Generate the transparent app chrome icon from the existing source icon.
- Split public-path exports for browser and app chrome icons.
- Update app bar icon usage, sizing, theme-aware icon color, text density, height, and border radius.
- Update story classification badge rendering for sidebar phase badges.
- Add smoke coverage for icon separation, app bar sizing/text density, and phase badge styling.

## Verification

- Run `npm run app:typecheck`.
- Run `npm run app:lint`.
- Run `npm run smoke`.
- Run `npm run verify`.
- Run `codex review --base main` before PR merge.

## Decision Log

- 2026-04-23: Use a transparent white-glyph PNG for app chrome and invert it only in light theme with CSS filter.
- 2026-04-23: Keep app-bar dropdowns at 12px after comparing 10px and 11px; 10px was too small.
- 2026-04-23: Align home/theme/dropdown controls to the Story button height and `radius-sm`.
