# Latest Iteration

Latest parent iteration: `#55`

Completed child issue:

- `#56` via PR `#57` - normalize generated background filenames and tracked generated background assets so GitHub Pages verify resolves the same lowercase public paths on macOS and Linux

Current closeout outcome:

- generated background manifests and the app registry now emit lowercase bundled background filenames while keeping the original background IDs as lookup keys
- the tracked files under `ark-str-web-app/public/generated/backgrounds/` were renamed to the same lowercase paths, removing the remaining Linux-only case mismatch from the Pages deploy
- the stale portrait-rename active plan was removed and replaced by a completed background casefix iteration record
- `npm run verify` passed on branch `codex-pages-background-casefix-issue-56`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- the locale archive still renders the full group list without pagination or virtualization
