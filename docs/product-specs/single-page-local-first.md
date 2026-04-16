# Single-Page Local-First Harness

## Objective

Create a single-page Next.js application that doubles as:

- a usable starter UI for future web-page work
- a reference implementation for bundled resources + `localStorage`
- a target the autonomous harness can iteratively improve

## Constraints

- Next.js App Router
- one route
- bundled resources only
- no remote runtime requests
- persistence via `localStorage`
- mobile and desktop layouts supported

## Functional Requirements

- Show the current product constraints clearly.
- Display a bundled resource manifest from source-controlled data.
- Provide editable workspace fields for an iteration goal and notes.
- Provide a persistent checklist that survives refresh.
- Offer reset and demo-seed actions.

## Non-Functional Requirements

- Build succeeds offline once dependencies are installed.
- All persisted state is versioned and normalized.
- Repository structure remains easy for an agent to inspect.
