# Reliability

## Verification Bar

Every meaningful change should pass:

1. `npm run guards:all`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
5. `npm run smoke`

`npm run verify` runs the full sequence.

## Expectations

- The page must build without network access.
- The page must render without requiring a server-side data source.
- Persisted state must survive a refresh and recover safely from malformed `localStorage` values.
- Browser smoke must complete with no uncaught page errors.
- Browser smoke must complete with no `console.error` output.
- Repository rule checks must fail loudly when architecture or asset constraints drift.
