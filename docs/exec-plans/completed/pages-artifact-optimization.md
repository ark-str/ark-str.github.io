# Pages Artifact Optimization

Status: completed
Issue: #82
Branch: `issue-82-pages-artifact-optimization`

## Goal

Reduce GitHub Pages artifact size and initial static export payload without removing locales, story groups, or direct story deep links.

## Dependency Plan

This iteration has one implementation issue and no child issue dependencies. If follow-up work is split later, the dependency order should be:

1. content pipeline media transformation and manifest contract
2. reader runtime data loading
3. export-size guard and verification docs

## Implementation Plan

- Keep all current static reader routes and `generateStaticParams` coverage.
- Remove heavy story bodies from route server props; reader UI should fetch bundled generated JSON from `public/generated/content/`.
- Add a generated asset manifest for portrait, background, and group-background lookup.
- Convert generated image copies to optimized WebP while keeping source vendor/project assets unchanged.
- Minify generated JSON files.
- Add an export-size guard to the root verification sequence.
- Update product, frontend, reliability, and design-system docs to match the runtime contract.

## Verification Plan

- `npm run harness:test`
- `npm run content:update`
- `npm run content:check`
- `npm run app:typecheck`
- `npm run app:lint`
- `npm run verify`

## Milestones

- Milestone 1: pipeline and reader runtime structure implemented.
- Milestone 2: generated content refreshed and artifact size measured.
- Milestone 3: docs, final verification, PR review, and merge.

## Outcome

- Generated images are optimized as WebP and indexed through `public/generated/content/assets.json`.
- Static route pages no longer embed story body payloads; reader screens load the generated index, manifests, and current story body from bundled public JSON.
- Root verification now enforces export and generated-asset size budgets.
- PR review follow-up fixed asset-manifest failure surfacing and stale optimized group-art verification.
