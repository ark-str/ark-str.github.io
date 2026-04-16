# Architecture

This project intentionally separates the repository harness from the runnable web application.

## Product Shape

- Root repository acts as the project harness and orchestration layer
- Independent Next.js application lives in `ark-str-web-app/`
- App Router under `ark-str-web-app/src/app`
- No backend
- No remote runtime dependencies
- User state persisted to `localStorage`
- Future external game data handled through build-time vendor sources under `vendor/`

## Source Layout

- `ark-str-web-app/src/app/` - route shell, metadata, and global styles only
- `ark-str-web-app/src/components/ui/` - shared UI primitives and design-system building blocks
- `ark-str-web-app/src/features/` - product features with explicit layer boundaries
- `ark-str-web-app/src/generated/content/` - app-internal generated loader layer mirrored from the published content artifacts
- `ark-str-web-app/public/generated/` - generated static assets consumed at runtime
- `scripts/guards/` - mechanical repository rules
- `scripts/harness/` - verification and autonomous iteration entry points
- `scripts/content/` - build-time content synchronization and generation entry points
- `tests/` - root harness unit tests and browser smoke tests
- `docs/` - repository-local source of truth
- `vendor/` - indirect GitHub-backed data sources

## Feature Layers

Each app feature follows this dependency direction:

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
- moving harness logic into `ark-str-web-app/`
- hard-coded runtime colors outside `ark-str-web-app/src/app/globals.css`

## Runtime Boundary

- Server components render the static shell and pass control to client UI.
- Browser APIs live in client files only.
- `localStorage` access is wrapped by `repo` functions.
- Persisted state normalization happens in `service` before values reach the UI.
- Published story assets live under `ark-str-web-app/public/generated/`, and the app consumes mirrored generated loaders under `ark-str-web-app/src/generated/content/` so export builds do not scan `public/` directly.
- Theme state is owned by the preferences feature and applied through semantic CSS variables.

## Why This Exists

The structure mirrors the OpenAI harness-engineering guidance:

- repository knowledge is the system of record
- agent legibility matters more than cleverness
- invariants should be enforced mechanically

See `docs/references/openai-harness-notes.md` for the source summary and links.
