# Pages Deployment Follow-Up Fix

Status: active
Owner: Codex
Started: 2026-04-16
Parent issue: `#18`
Active child issue: `#19`
Draft PR: pending

## Objective

Repair the exported-site path handling so the GitHub Pages workflow can complete its CI verify step and publish successfully.

## Scope

- make app config resolve its root from the app directory rather than the caller cwd
- re-run the manual Pages workflow after the fix merges
- close the follow-up iteration after a successful deployment run

## Constraints

- keep the existing `ark-str-web-app/out` artifact contract
- do not change the `/ark-str/` base path
- keep `npm run verify` as the required deployment gate

## Issue And PR Dependency Graph

- `#19 deployment-workflow-follow-up-fix`
  - depends on: none
  - PR: pending

## Commit Policy

- first milestone: scaffold the follow-up fix plan
- second milestone: fix app-root resolution for export output
- final milestone: close the plan and record the successful deployment rerun

Commit format:

- `milestone(issue-19): scaffold`
- `fix(issue-19): ...`
- `chore(issue-19): ...`

## Tasks

- [ ] open the follow-up plan and child PR
- [ ] fix root-driven export output path handling
- [ ] rerun `npm run verify`
- [ ] rerun the `Deploy GitHub Pages` workflow successfully

## Verification

- `npm run verify`
- successful `Deploy GitHub Pages` workflow run on `main`

## Decision Log

- 2026-04-16: Treat the first failed deployment as a follow-up fix iteration rather than force-pushing changes into the merged deployment PR history.
