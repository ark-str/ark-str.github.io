# Latest Iteration

Latest parent iteration: `#37`

Completed child issue:

- `#38` via merged PR `#39` - bundle and render story backgrounds, mark `CharacterCutin` lines as remote wireless dialogue, and normalize Doctor choice follow-up flow without placeholder or shared-response sections

Current closeout outcome:

- `Background(image="...")` tags now generate explicit `background` blocks and copy only referenced `avgs/bg` PNGs into `ark-str-web-app/public/generated/backgrounds/`
- reader story routes now load bundled background paths from generated metadata and render them inline without runtime 404s
- dialogue blocks now carry `isRemote` so cutin-driven lines are visibly marked as wireless communication in the reader shell
- Doctor choice normalization no longer emits the unfinished fallback sentence, and predicates that apply to every option now render as ordinary continuation after the choice
- `sourcePath` stays repository-relative under `vendor/ArknightsGamedata/` even when generated from a harness worktree, and background matching is now case-insensitive against upstream `avgs/bg` files
- parser, content pipeline, app export, and exported-site smoke all passed through `npm run verify` before merge from branch `codex-backgrounds-radio-choice-issue-38-wt`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- GitHub Actions still emits a non-blocking Node 20 deprecation warning for the official Pages actions versions currently in use
