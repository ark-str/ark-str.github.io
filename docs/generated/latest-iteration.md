# Latest Iteration

Latest parent iteration: `#18`

Merged child issues:

- `#19` via PR `#20` - fix app-root resolution for root-driven export verification
- `#21` via PR `#22` - align smoke preview and Pages upload with the actual export artifact
- `#23` via PR `#24` - close deployment follow-up docs and iteration records

Current closeout outcome:

- the repository ships a manual `Deploy GitHub Pages` workflow that rebuilds, verifies, and publishes `ark-str-web-app/.next-export`
- the workflow succeeded on `main` in run `#24504983628`
- exported-site smoke now reads the real static export directory instead of relying on a stale local `out/` folder
- deployment instructions and follow-up plan records now match the actual GitHub Pages artifact contract
- `npm run verify` remains the required gate before any published artifact is uploaded

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- portrait asset integration is still placeholder-based
- GitHub Actions still emits a non-blocking Node 20 deprecation warning for the official Pages actions versions currently in use
