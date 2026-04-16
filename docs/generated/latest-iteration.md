# Latest Iteration

Latest parent iteration: `#28`

Open child issue:

- `#29` via draft PR `#30` - download the portrait source cache, normalize story dialogue to `speakerId`, and bundle referenced ASSISTANT portraits into the reader

Current closeout outcome:

- dialogue blocks now carry a single `speakerId` field derived from story `Character(...)` tags
- `npm run content:portraits` and `npm run content:update` can sparse-download `ArknightsResource/avatar/ASSISTANT/` into `vendor/ArknightsResource/` and copy only referenced portraits into bundled public assets
- generated story detail JSON now embeds `observedOperators` keyed by `speakerId`, and the reader persists locale-scoped alias observations in `localStorage` under `ark-str:character-observations:v1`
- the exported reader renders bundled operator portraits from `public/generated/portraits/assistant/<speakerId>.png` while keeping empty reserved slots for non-operators or missing portraits
- parser, content, app export, and exported-site smoke all passed through `npm run verify` on branch `codex-speaker-portrait-speakerid-issue-29`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- GitHub Actions still emits a non-blocking Node 20 deprecation warning for the official Pages actions versions currently in use
