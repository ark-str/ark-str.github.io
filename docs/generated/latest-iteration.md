# Latest Iteration

Latest parent iteration: `#52`

Completed child issue:

- `#53` via PR `#54` - rename tracked generated portrait assets so GitHub Pages verify uses the same lowercase paths as the generated portrait manifests

Current closeout outcome:

- the remaining case-only portrait filename mismatches under `ark-str-web-app/public/generated/portraits/speakers/` were renamed to lowercase tracked paths
- the earlier manifest/registry hotfix from `#50` now has matching committed public assets, so Linux CI no longer fails on mixed-case portrait filenames
- `npm run verify` passed on branch `codex-pages-portrait-rename-issue-53`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- the locale archive still renders the full group list without pagination or virtualization
