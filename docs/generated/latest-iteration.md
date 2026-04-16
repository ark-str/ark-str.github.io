# Latest Iteration

Latest parent iteration: `#12`

Merged child issues:

- `#13` via PR `#14` - dev-startup regression recovery for generated loaders and cache separation

Current closeout outcome:

- `public/generated/content/` remains the published bundled content contract for full story payloads
- `ark-str-web-app/src/generated/content/` now contains metadata-only loader artifacts instead of mirroring the full story corpus
- `npm run dev` uses `.next-dev` and export verification uses `.next-export`, so verify no longer poisons the next local dev startup
- `npm run verify` still validates the gh-pages `/ark-str/` export path with Playwright

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- portrait asset integration is still placeholder-based
