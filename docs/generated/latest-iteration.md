# Latest Iteration

Latest parent iteration: `#49`

Completed child issue:

- `#50` via PR `#51` - normalize generated portrait filenames so GitHub Pages deploys pass on case-sensitive runners

Current closeout outcome:

- generated portrait manifests now keep the original mixed-case `speakerId` keys but point at lowercase bundled filenames
- portrait artifact writing and `content:check` now share the same filename normalization rule, so Linux CI no longer expects impossible mixed-case files
- generated content artifacts were rebuilt to remove uppercase portrait paths from the app registry and portrait manifest
- `npm run verify` passed on branch `codex-pages-portrait-casefix-issue-50`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- the locale archive still renders the full group list without pagination or virtualization
