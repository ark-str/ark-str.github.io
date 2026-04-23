# Home Landing Redesign

Status: completed
Issue: #92
Branch: `issue-92-home-landing`

## Objective

Replace the current technical readiness home screen with an ARK STR landing page that introduces the service, captures the reader nickname, surfaces curated recommendations, and shows locale-aware content statistics.

## Scope

- Persist a local nickname through the reader session repository.
- Replace `{@nickname}` and `{@nickName}` story text tokens at runtime.
- Render localized home copy, curated group recommendations, selected-locale statistics, and footer credit.
- Keep all assets local and reuse generated group background images.
- Update product, frontend, design-system, and iteration docs.

## Constraints

- Do not edit generated story JSON for nickname replacement.
- Keep browser-only storage access inside repo/runtime layers.
- Keep hard-coded colors out of component code.
- Preserve static export and `/ark-str/` base path behavior.
- Recommendations link to group overview routes when the selected locale includes the group; otherwise render a disabled missing-state card.

## Tasks

- Extend `ReaderSessionState` with `nickName` and normalize legacy persisted state.
- Add home model fields for locale statistics and curated recommendations.
- Rebuild `BootstrapHome` around hero, service intro, recommendations, stats, and footer.
- Add story text interpolation for dialogue, narration, and choice labels.
- Add smoke assertions for home sections, localized stats/copy, nickname persistence, and story token replacement.
- Refresh docs and generated latest iteration summary.

## Verification

- `npm run app:typecheck`
- `npm run app:lint`
- `npm run smoke`
- `npm run verify`

## Decision Log

- Nickname is stored in the existing reader session state because it affects reader behavior, not only onboarding.
- Runtime text interpolation is preferred over generated content mutation so the user can update the nickname without rebuilding content.
- Home statistics follow the currently selected reader locale, matching the app bar language selection.

## Outcome

- Home now renders the localized ARK STR landing surface with a clean nickname hero, continue CTA with target story title, full-bleed square-edged service copy using the accent-colored app icon, spacious curated recommendations, locale statistics, and maintainer footer.
- `{@nickname}` and `{@nickName}` story tokens are replaced during story rendering from the persisted nickname.
- Smoke coverage locks nickname persistence, localized home content, recommendation sections, and token replacement.
- `npm run verify` passed on branch `issue-92-home-landing`.
