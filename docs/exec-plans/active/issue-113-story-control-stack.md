# Issue 113 - Story Control Stack

## Objective

Unify story-page read controls, AI summary, generated summary, and previous/next navigation into one repeated top/bottom layout, then mark a story read automatically when the lower layout is reached.

## Scope

- Render the same story control stack above and below the story body.
- Keep AI summary output transient and shared between both stacks.
- Keep generated summary disclosure state shared between both stacks.
- Auto-mark the current story read when the bottom stack enters the viewport.
- Replace the browser tab icon with a rounded-square ARK STR icon from local assets.
- Update smoke coverage and docs.

## Constraints

- Keep mutable read progress in the read-progress runtime over `localStorage`.
- Use `setStoryRead(storyId, true)` for automatic read completion, not toggle behavior.
- Do not add remote assets or runtime dependencies.
- Keep app chrome icon and browser metadata icon separate.

## Tasks

- [x] Create GitHub issue #113 and branch from `main`.
- [ ] Update story shell layout and automatic read behavior.
- [ ] Regenerate rounded local browser icon assets.
- [ ] Update docs and smoke tests.
- [ ] Run `npm run verify`.
- [ ] Commit, push the issue branch, and open a PR.

## Verification

- `npm run verify`

## Decision Log

- The bottom control stack entering the viewport is the automatic read threshold.
- Manual read toggling remains available; only automatic completion is one-way.
