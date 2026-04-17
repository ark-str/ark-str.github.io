# Pages Portrait Rename

## Objective

Finish the Pages deployment fix by renaming tracked generated portrait files to the lowercase paths already emitted by the generated portrait manifests.

## Scope

- rename case-only mismatched files under `ark-str-web-app/public/generated/portraits/speakers/`
- keep generated manifests untouched unless another mismatch is found
- rerun `npm run verify`
- redeploy GitHub Pages after merge

## Constraints

- do not change runtime portrait lookup keys
- keep the fix limited to tracked generated portrait assets
- finish with `npm run verify`

## Tasks

- identify every tracked speaker portrait path that still contains uppercase characters
- rename each file through a temporary path so git records the change on a case-insensitive filesystem
- confirm `git ls-files` and the working tree now expose only lowercase portrait filenames
- rerun `npm run verify`
- merge and rerun the Pages workflow

## Verification

- `git ls-files ark-str-web-app/public/generated/portraits/speakers`
- `npm run verify`

## Decision Log

- the manifest/registry hotfix stays intact; this follow-up only reconciles tracked public files with those lowercase paths
