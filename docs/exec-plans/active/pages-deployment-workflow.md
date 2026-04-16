# Pages Deployment Workflow

Status: active
Owner: Codex
Started: 2026-04-16
Parent issue: `#15`
Active child issue: `#16`
Draft PR: pending

## Objective

Add a manual GitHub Pages deployment workflow that publishes the exported app artifact and document the operational flow from local verify through manual dispatch.

## Scope

- add a `workflow_dispatch` GitHub Actions workflow for Pages deployment
- keep `ark-str-web-app/out` as the exported artifact contract
- document repository settings and manual deployment steps
- refresh iteration records after the deployment workflow is merged

## Constraints

- keep GitHub Pages deployment manual-only for this iteration
- keep `/ark-str/` as the published base path
- do not add a `gh-pages` branch deployment flow
- keep `npm run verify` as the deployment quality gate

## Issue And PR Dependency Graph

- `#16 deployment-workflow-and-docs`
  - depends on: none
  - PR: pending

## Commit Policy

- first milestone: scaffold the active plan and issue metadata
- second milestone: add the deployment workflow and docs changes
- final milestone: refresh iteration records, apply review fixes, and close the iteration

Commit format:

- `milestone(issue-16): scaffold`
- `milestone(issue-16): core`
- `chore(issue-16): ...`
- `fix(issue-16): ...`

## Tasks

- [ ] add the active deployment plan and open the child PR
- [ ] add `.github/workflows/deploy-pages.yml` for manual GitHub Pages deployment
- [ ] update README and reliability docs with the manual deployment flow
- [ ] refresh product/quality/iteration docs after verification and merge

## Verification

- `npm run verify`
- `npm --prefix ark-str-web-app run export:ghpages`

## Decision Log

- 2026-04-16: Use GitHub Actions Pages deployment with `workflow_dispatch` only.
- 2026-04-16: Keep the published base path fixed at `/ark-str/` for project-pages deployment.
