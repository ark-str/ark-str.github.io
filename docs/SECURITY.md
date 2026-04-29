# Security

## Current Threat Model

This application is intentionally local-first and low-trust:

- bundled resources only
- no remote APIs by default
- no server-side secret management
- local persistence only for non-sensitive reader preferences, progress, and observed operator aliases

The one runtime network exception is a user-initiated Google AI Studio Gemini summary request from the story page. It only runs after the user saves an API key in Settings and clicks the AI summary button. The key is stored in browser `localStorage` because this app has no backend, but it is treated as user-managed local configuration, shown with a public/shared-device warning, excluded from backup JSON, and never bundled or sent anywhere except the Google Gemini API request.

## Rules

- Do not store application-owned secrets, tokens, or credentials in `localStorage`; the user-provided Google AI Studio API key is the narrow documented exception and must be excluded from backup exports.
- Treat persisted `localStorage` data as untrusted input and normalize it before use.
- Keep external network calls out of runtime code except the documented Google AI Studio summary request.
- Do not embed third-party scripts.
- Restrict upstream GitHub access to build-time or operator-triggered pipeline scripts under `scripts/content/`.

## Practical Guardrails

- `scripts/guards/check-constraints.mjs` rejects remote resource patterns inside `ark-str-web-app` and allowlists only the Gemini summary endpoint, the Google AI Studio API key page link, and the GitHub issue link.
- `scripts/guards/check-design-system.mjs` keeps runtime colors centralized in the token source.
- `ark-str-web-app/src/features/*/repo/` owns browser persistence.
- `ark-str-web-app/src/features/*/service/` normalizes persisted shapes before UI consumption.
