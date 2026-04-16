# Latest Iteration

Latest parent iteration: `#15`

Merged child issues:

- `#16` via PR `#17` - manual GitHub Pages deployment workflow and deployment docs

Current closeout outcome:

- the repository ships a manual `Deploy GitHub Pages` workflow that rebuilds, verifies, and publishes `ark-str-web-app/out`
- the Pages deployment path remains aligned with the `/ark-str/` export-safe app contract
- deployment instructions now live in the repository docs instead of relying on local knowledge
- `npm run verify` remains the required gate before any published artifact is uploaded

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- portrait asset integration is still placeholder-based
