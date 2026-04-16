# Latest Iteration

Latest parent iteration: `#1`

Merged child issues:

- `#2` via PR `#3` - root harness split and nested Next.js app bootstrap
- `#4` via PR `#5` - editorial archive design-system foundation
- `#6` via PR `#7` - vendor-backed content pipeline and generated index contract
- `#8` via PR `#9` - canonical locale reader shell and first-pass story rendering
- `#10` via PR `#11` - verification/docs closeout, gh-pages export safety, and exported smoke coverage

Current closeout outcome:

- `public/generated/content/` remains the published bundled content contract
- `ark-str-web-app/src/generated/content/` mirrors the published content as app-internal loaders for export-safe reads
- `npm run verify` validates the gh-pages `/ark-str/` export path with Playwright
- no known runtime or browser-console issues remain under the current verification bar

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- portrait asset integration is still placeholder-based
