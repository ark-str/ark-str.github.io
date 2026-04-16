# Reliability

## Verification Bar

Every meaningful change should pass:

1. `npm run guards:all`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run harness:test`
5. `npm run build`
6. `npm run smoke`

`npm run verify` runs the full sequence.

## Expectations

- The page must build without network access.
- The page must render without requiring a server-side data source.
- Persisted state must survive a refresh and recover safely from malformed `localStorage` values.
- Browser smoke must complete with no uncaught page errors.
- Browser smoke must complete with no `console.error` output.
- Harness orchestration logic must pass its unit tests before an iteration can be reported as successful.
- A harness-driven iteration is not complete until every generated child issue PR is merged and the default branch passes `npm run verify`.
- Repository rule checks must fail loudly when architecture or asset constraints drift.
