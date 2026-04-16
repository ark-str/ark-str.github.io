# Reliability

## Verification Bar

Every meaningful change should pass:

1. `npm run guards:all`
2. `npm run content:check`
3. `npm run harness:test`
4. `npm run app:verify`
5. `npm run smoke`

`npm run verify` runs the full root sequence.

## Expectations

- The app must build without runtime network access after dependencies are installed.
- The app must export successfully for the gh-pages `/ark-str/` base path.
- The app must render without requiring a server-side data source.
- Persisted state must survive a refresh and recover safely from malformed `localStorage` values.
- Browser smoke must complete with no uncaught page errors.
- Browser smoke must complete with no `console.error` output.
- Browser smoke must exercise the exported site, not a `next start` server.
- Design-system guard checks must reject hard-coded runtime colors outside the token source.
- Content integrity checks must reject drift between committed generated outputs and the current vendor source when the submodule is available.
- Harness orchestration logic must pass its unit tests before an iteration can be reported as successful.
- A harness-driven iteration is not complete until every generated child issue PR is merged and the default branch passes `npm run verify`.
- Repository rule checks must fail loudly when architecture or asset constraints drift.
