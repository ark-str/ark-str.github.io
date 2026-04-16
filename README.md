# ARK STR

Repository harness plus nested Next.js app for an Arknights story reader.

## Structure

- `ark-str-web-app/` - independent Next.js App Router application
- `docs/` - product spec, execution plans, and generated harness reports
- `scripts/` - guards, harness orchestration, and content-pipeline commands
- `tests/` - root harness unit tests and browser smoke tests
- `vendor/` - indirect GitHub-backed source repositories

## Run The App

From the app directory:

```bash
cd ark-str-web-app
npm run dev
npm run verify
```

From the repository root:

```bash
npm run app:dev
npm run app:verify
npm run verify
```

## Root Harness Commands

- `npm run guards:all`
- `npm run harness:test`
- `npm run content:status`
- `npm run harness:iterate -- --goal "..."`

## Repository Rules

- bundled runtime resources only
- no remote runtime calls
- mutable client state via `localStorage`
- root repository owns harness and docs
- `ark-str-web-app/` owns all runnable app code

## Current Phase

The repository is still in the bootstrap phase:

- nested app scaffold created with `create-next-app`
- root harness retained
- local-first bootstrap shell restored inside `ark-str-web-app`
- real Arknights data sync, parsing, summaries, and reader routes are still follow-up work
