# Plans

Execution plans are first-class repository artifacts.

## Rules

- Put in-flight work under `docs/exec-plans/active/`.
- Move finished plans to `docs/exec-plans/completed/`.
- Keep each plan short enough for an agent to scan quickly.
- Log decisions when a change alters scope, architecture, or verification strategy.
- Do not close or delete a PR/branch listed in a plan until the target branch contains the work or the plan explicitly records why the work was abandoned.

## Minimum Plan Sections

- objective
- scope
- constraints
- tasks
- verification
- decision log
