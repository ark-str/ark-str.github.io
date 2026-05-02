# Plans

Execution plans are first-class repository artifacts.

## Rules

- Put in-flight work under `docs/exec-plans/active/`.
- Move finished plans to `docs/exec-plans/completed/`.
- Keep each plan short enough for an agent to scan quickly.
- Log decisions when a change alters scope, architecture, or verification strategy.
- Before any implementation commit, record or create the GitHub issue and work from an issue-scoped branch; never commit directly on the default branch.

## Minimum Plan Sections

- objective
- scope
- constraints
- tasks
- verification
- decision log
