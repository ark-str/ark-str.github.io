# Reader Archive Disclosure Polish

## Objective

Polish locale archive disclosure behavior and layout after the accordion archive refresh.

## Scope

- split storyline header metrics into group/reference and chars/time lines
- animate storyline open and close over 300ms
- move `오퍼레이터 서사` out of the main grid into a bottom section
- render expanded storyline items as a responsive grid without changing item content

## Constraints

- keep archive data flow server-rendered
- keep disclosure state local and non-persistent
- keep routes and generated content unchanged
- preserve existing primary and reference link destinations

## Tasks

- add a small client disclosure component under reader UI
- refactor locale archive composition to separate operator narratives
- update smoke coverage for grid exclusion, bottom operator section, and animated panels
- update product/frontend/design docs and latest iteration record

## Verification

- `npm run app:typecheck`
- `npm run app:lint`
- `npm run verify`
- `codex review --base main`
