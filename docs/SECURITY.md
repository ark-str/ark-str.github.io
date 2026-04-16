# Security

## Current Threat Model

This application is intentionally local-first and low-trust:

- bundled resources only
- no remote APIs
- no secret management in the browser
- local persistence only for non-sensitive reader preferences and progress

## Rules

- Never store secrets, tokens, or credentials in `localStorage`.
- Treat persisted `localStorage` data as untrusted input and normalize it before use.
- Keep all external network calls out of runtime code.
- Do not embed third-party scripts.
- Restrict upstream GitHub access to build-time or operator-triggered pipeline scripts under `scripts/content/`.

## Practical Guardrails

- `scripts/guards/check-constraints.mjs` rejects remote resource patterns inside `ark-str-web-app`.
- `ark-str-web-app/src/features/*/repo/` owns browser persistence.
- `ark-str-web-app/src/features/*/service/` normalizes persisted shapes before UI consumption.
