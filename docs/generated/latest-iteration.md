# Latest Iteration

Latest parent iteration: `#25`

Merged child issues:

- `#26` via PR `#27` - resolve operator IDs from `Character(...)` tags and persist locale-scoped alias observations

Current closeout outcome:

- dialogue blocks now carry `speakerToken`, `operatorId`, and `portraitKey` derived from story `Character(...)` tags
- generated story detail JSON now embeds `observedOperators` so the app can track operator aliases without runtime source parsing
- the reader persists locale-scoped alias observations in `localStorage` under `ark-str:character-observations:v1`
- parser, content, app export, and exported-site smoke all passed through `npm run verify`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- portrait asset integration is still placeholder-based
- GitHub Actions still emits a non-blocking Node 20 deprecation warning for the official Pages actions versions currently in use
