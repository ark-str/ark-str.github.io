# Pages Deployment Follow-Up Fix

Status: completed
Owner: Codex
Started: 2026-04-16
Parent issue: `#18`
Active child issue: `#23`
Draft PR: pending

## Objective

Repair the Pages deployment workflow after the first failed run, then close the follow-up deployment iteration after a successful rerun.

## Scope

- align smoke preview and Pages upload with the actual `ark-str-web-app/.next-export` output
- re-run the manual Pages workflow after the fix merges
- close the follow-up iteration after a successful deployment run

## Constraints

- keep `/ark-str/` as the published base path
- treat `ark-str-web-app/.next-export` as the actual exported artifact contract for build verification and Pages upload
- keep `npm run verify` as the required deployment gate

## Issue And PR Dependency Graph

- `#19 config-root-fix`
  - depends on: none
  - PR: `#20`
- `#21 export-artifact-contract-fix`
  - depends on: `#19`
  - PR: `#22`
- `#23 iteration-closeout`
  - depends on: `#19`, `#21`
  - PR: pending

## Commit Policy

- first milestone: scaffold the follow-up fix plan
- second milestone: align smoke and deployment with the actual exported artifact path
- final milestone: close the plan and record the successful deployment rerun

Commit format:

- `milestone(issue-19): scaffold`
- `fix(issue-21): ...`
- `chore(issue-23): ...`

## Tasks

- [x] open the follow-up plan and child PR
- [x] fix root-driven export output path handling
- [x] open the second child PR for the export artifact contract fix
- [x] align smoke preview and workflow upload with `ark-str-web-app/.next-export`
- [x] rerun `npm run verify`
- [x] rerun the `Deploy GitHub Pages` workflow successfully

## Verification

- `npm run verify`
- successful `Deploy GitHub Pages` workflow run on `main`

## Decision Log

- 2026-04-16: Treat the first failed deployment as a follow-up fix iteration rather than force-pushing changes into the merged deployment PR history.
- 2026-04-16: The real static export output lives in `ark-str-web-app/.next-export`, so the smoke server and Pages workflow must use that path instead of a stale `out/` directory.
- 2026-04-16: Keep the Node 20 GitHub Actions deprecation notice as a documented follow-up since it does not block the successful manual Pages deployment.
