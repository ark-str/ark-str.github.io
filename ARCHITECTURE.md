# Architecture

This project intentionally uses a narrow, root-first structure that the harness can inspect without extra workspace indirection.

## Product Shape

- Single Next.js application in the repository root
- App Router under `src/app`
- No backend
- No remote runtime dependencies
- User state persisted to `localStorage`
- Future external game data handled through build-time vendor sources under `vendor/`

## Source Layout

- `src/app/` - route shell, metadata, and global styles only
- `src/features/` - product features with explicit layer boundaries
- `scripts/guards/` - mechanical repository rules
- `scripts/harness/` - verification and autonomous iteration entry points
- `scripts/content/` - build-time content synchronization and generation entry points
- `tests/` - harness unit tests and browser smoke tests
- `docs/` - repository-local source of truth
- `vendor/` - indirect GitHub-backed data sources
- `public/generated/` - generated static assets consumed at runtime

## Feature Layers

Each feature follows this dependency direction:

`types -> config -> repo/service -> runtime -> ui`

Allowed imports inside a feature:

- `types` can import nothing from the same feature.
- `config` can import `types`.
- `repo` can import `types` and `config`.
- `service` can import `types` and `config`.
- `runtime` can import `types`, `config`, `repo`, and `service`.
- `ui` can import `types`, `config`, `service`, and `runtime`.

Disallowed patterns:

- `ui` importing `repo`
- `service` importing `runtime` or `ui`
- ad-hoc `localStorage` access outside `repo` and `runtime`
- remote resources from component code
- moving the application into nested workspaces or sub-app packages

## Runtime Boundary

- Server components render the static shell and pass control to client UI.
- Browser APIs live in client files only.
- `localStorage` access is wrapped by `repo` functions.
- Persisted state normalization happens in `service` before values reach the UI.
- Generated story data is read from local JSON assets, never from runtime network calls.

## Why This Exists

The structure mirrors the OpenAI harness-engineering guidance:

- repository knowledge is the system of record
- agent legibility matters more than cleverness
- invariants should be enforced mechanically

See `docs/references/openai-harness-notes.md` for the source summary and links.
