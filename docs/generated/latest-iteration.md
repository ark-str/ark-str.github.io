# Latest Iteration

Latest parent iteration: `#31`

Completed child issue:

- `#32` via merged PR `#33` - switch portrait sourcing to `ArknightsResource/avgs/npcs`, broaden `speakerId` into the visual lookup key for all speakers, and bundle only referenced full-body crops into the reader

Current closeout outcome:

- dialogue blocks now carry a single `speakerId` field derived from `Character(...)`, `character(...)`, and `charslot(...)` tags
- `speakerId` is now the visual lookup key for all speakers: `char_*` tokens normalize to their first three `_` segments, while non-`char` tokens keep their stripped raw key
- `npm run content:portraits` and `npm run content:update` now refresh a blobless local cache of `ArknightsResource/avgs/npcs` and copy only referenced portraits into bundled public assets
- generated story detail JSON still limits `observedOperators` and the alias ledger in `ark-str:character-observations:v1` to `char_*` speaker IDs
- the exported reader renders bundled full-body speaker portraits from `public/generated/portraits/speakers/<speakerId>.png` with a top-aligned crop while keeping empty reserved slots for missing images
- parser, content pipeline, app export, and exported-site smoke all passed through `npm run verify` before merge from branch `codex-avgs-npcs-portraits-issue-32`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- GitHub Actions still emits a non-blocking Node 20 deprecation warning for the official Pages actions versions currently in use
