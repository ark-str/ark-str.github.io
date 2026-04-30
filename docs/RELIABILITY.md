# Reliability

## Verification Bar

Every meaningful change should pass:

1. `npm run guards:all`
2. `npm run content:check`
3. `npm run harness:test`
4. `npm run app:verify`
5. `npm run export:size-check`
6. `npm run smoke`

`npm run verify` runs the full root sequence.

## Expectations

- The app must build without runtime network access after dependencies are installed.
- The app must export successfully for the `https://ark-str.github.io/` Pages root path.
- The exported artifact must stay under the committed size budget: `ark-str-web-app/.next-export` below 2 GiB and `.next-export/generated` below 750 MiB.
- The repository must provide a manual GitHub Pages deployment workflow that rebuilds and verifies before publishing `ark-str-web-app/.next-export`.
- The app must keep dev-cache and export-cache output isolated so `npm run verify` does not slow the next `npm run dev`.
- The app must render without requiring a server-side data source.
- Persisted state must survive a refresh and recover safely from malformed `localStorage` values.
- Browser smoke must complete with no uncaught page errors.
- Browser smoke must complete with no `console.error` output.
- Browser smoke must exercise the exported site, not a `next start` server.
- Any Pages deployment workflow must publish only an artifact produced after `npm run verify` succeeds.
- Design-system guard checks must reject hard-coded runtime colors outside the token source.
- Content integrity checks must reject drift between committed generated outputs and the current vendor source when the submodule is available.
- Harness orchestration logic must pass its unit tests before an iteration can be reported as successful.
- A harness-driven iteration is not complete until every generated child issue PR is merged and the default branch passes `npm run verify`.
- Repository rule checks must fail loudly when architecture or asset constraints drift.
