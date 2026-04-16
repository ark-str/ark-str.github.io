# ARK STR

Repository harness plus nested Next.js app for an Arknights story reader.

## Structure

- `ark-str-web-app/` - independent Next.js App Router application
- `docs/` - product spec, execution plans, and generated harness reports
- `docs/design-system/` - design principles, tokens, components, and content style rules
- `scripts/` - guards, harness orchestration, and content-pipeline commands
- `tests/` - root harness unit tests and browser smoke tests
- `vendor/` - indirect GitHub-backed source repositories

## Run The App

From the app directory:

```bash
cd ark-str-web-app
npm run dev
npm run verify
npm run export:ghpages
```

From the repository root:

```bash
npm run app:dev
npm run app:verify
npm run app:export
npm run app:export:ghpages
npm run content:update
npm run content:check
npm run verify
```

## Deploy To GitHub Pages

The repository publishes a static export to project pages at `https://wjlee611.github.io/ark-str/`.

Before the first deployment, set the repository Pages source to `GitHub Actions` in `Settings -> Pages`.

Manual deployment flow:

```bash
npm run verify
npm --prefix ark-str-web-app run export:ghpages
```

Then open the Actions tab and run the `Deploy GitHub Pages` workflow manually from `main`.

The workflow rebuilds the app, runs `npm run verify`, uploads `ark-str-web-app/.next-export`, and deploys that exported artifact to GitHub Pages.

## Root Harness Commands

- `npm run guards:all`
- `npm run harness:test`
- `npm run content:update`
- `npm run content:portraits`
- `npm run content:check`
- `npm run content:status`
- `npm run harness:iterate -- --goal "..."`

## Repository Rules

- bundled runtime resources only
- no remote runtime calls
- mutable client state via `localStorage`
- root repository owns harness and docs
- `ark-str-web-app/` owns all runnable app code
- shared UI primitives live in `ark-str-web-app/src/components/ui/`
- semantic theme tokens live in `ark-str-web-app/src/app/globals.css`

## Current Phase

The repository is in the manual Pages deployment enablement phase after the first reader iteration:

- nested app scaffold and root harness split are complete
- editorial archive theme tokens and shared UI primitives are established
- `vendor/ArknightsGamedata`, the tool-managed `vendor/ArknightsResource` portrait cache, and `public/generated/` power canonical locale reader routes and bundled reader portraits
- app-internal generated metadata under `ark-str-web-app/src/generated/content/` keep the reader export-safe without mirroring full story payloads into app source
- `npm run dev` uses an isolated `.next-dev` cache and export verification uses `.next-export`, so verify no longer poisons the next local dev startup
- `npm run verify` now validates the exported site with Playwright against the `/ark-str/` subpath
- a manual `Deploy GitHub Pages` workflow can publish the exported artifact through GitHub Actions
- summary generation and character unlock extraction remain follow-up work
