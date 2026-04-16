# Security

## Current Threat Model

This application is intentionally local-first and low-trust:

- bundled resources only
- no remote APIs
- no secret management in the browser
- local persistence only for non-sensitive user drafts

## Rules

- Never store secrets, tokens, or credentials in `localStorage`.
- Treat persisted `localStorage` data as untrusted input and normalize it before use.
- Keep all external network calls out of runtime code.
- Do not embed third-party scripts.

## Practical Guardrails

- `scripts/guards/check-constraints.mjs` rejects remote resource patterns.
- runtime state is normalized through `service/harness-state.ts`.
