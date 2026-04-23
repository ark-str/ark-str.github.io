# Latest Iteration

Latest parent iteration: `#88`

Completed child issue:

- `#88` - refine reader group and story navigation UI

Current closeout outcome:

- group overview hero titles wrap safely on narrow mobile widths
- the public app icon is served as a compact 96px bundled asset, while app-bar home/theme controls share the same larger hit area
- story headers no longer expose raw vendor source paths or redundant group story-count copy
- story-page group metrics and sibling-story metadata render as wrapping badges
- the sibling-story navigation card is desktop-only, viewport-height constrained, and independently scrollable
- sibling-story cards keep bridge/stage/pre/post metadata visible without exposing internal story IDs
- horizontal and vertical scrollbar tracks/corners are transparent across local scroll regions
- `npm run verify` passed on branch `issue-88-reader-layout-refinements`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- the locale archive still renders expanded storyline rows without pagination or virtualization
- curated group artwork still needs to replace temporary generated group images over time
