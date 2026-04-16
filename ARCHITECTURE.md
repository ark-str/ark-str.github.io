# Architecture

This project intentionally uses a narrow, agent-legible structure.

## Product Shape

- Single-page Next.js application
- App Router under `src/app`
- No backend
- No remote runtime dependencies
- User state persisted to `localStorage`

## Source Layout

- `src/app/` - route shell, metadata, and global styles only
- `src/features/harness/` - business feature for the single-page workspace
- `scripts/guards/` - mechanical repository rules
- `scripts/harness/` - verification and autonomous iteration entry points
- `docs/` - repository-local source of truth

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

## Runtime Boundary

- Server components render static shell and pass control to client UI.
- Browser APIs live in client files only.
- `localStorage` access is wrapped by `repo` functions.
- Data shape normalization happens in `service` before state reaches the UI.

## Why This Exists

The structure mirrors the OpenAI harness-engineering guidance:

- repository knowledge is the system of record
- agent legibility matters more than cleverness
- invariants should be enforced mechanically

See `docs/references/openai-harness-notes.md` for the source summary and links.
