# Latest Iteration

Latest parent iteration: `#40`

Completed child issue:

- `#41` via merged PR `#42` - refresh the reader information architecture with a floating app bar, group overview routes, generated reading metrics, and story-only dynamic backdrops

Current closeout outcome:

- home, locale archive, group overview, and story routes now share a rounded floating app bar with locale switching, theme toggle, and in-group story navigation
- the reader now has a first-class `/reader/[locale]/[groupId]` route that shows story counts, total visible characters, and estimated reading time for each group
- story pages keep bundled `background` blocks in the reading flow while also driving a fixed blurred backdrop that updates as the reader scrolls
- story layouts now use left-side group navigation, a central reading column, a full-width summary section below the body, and a floating scroll-to-top action
- generated content index entries now include visible character counts and reading-time estimates for both stories and groups, with integrity checks enforcing the calculation contract
- exported-site smoke now covers the home shell, locale archive, group route, story backdrop, story summary section, and reader session recovery under the `/ark-str/` base path
- `npm run verify` passed on branch `codex-reader-ia-layout-refresh-issue-41` after the group reading-time calculation was corrected to use the generated character total instead of summing per-story minimums

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- the locale archive still renders the full group list without pagination or virtualization
