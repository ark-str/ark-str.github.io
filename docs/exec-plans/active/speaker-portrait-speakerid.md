# Speaker Portrait And SpeakerId

Status: active
Parent issue: #28
Child issue: #29
Branch: `codex-speaker-portrait-speakerid-issue-29`

## Goal

Rename vendor sources to match their upstream project names, simplify dialogue identity to `speakerId`, download the upstream portrait repo into a tool-managed cache, and render bundled operator portraits in the reader without runtime image guessing.

## Scope

- rename `vendor/ArknightsData` to `vendor/ArknightsGamedata`
- replace the portrait placeholder with a tool-managed `vendor/ArknightsResource` sparse-checkout cache
- generate `speakerId` instead of `speakerToken` / `operatorId` / `portraitKey`
- copy only referenced `avatar/ASSISTANT/<speakerId>.png` files into bundled assets
- render bundled portraits in reader dialogue rows while preserving empty slots for missing portraits

## Acceptance Criteria

- `content:sync` manages `vendor/ArknightsGamedata`, and `content:portraits` / `content:update` can initialize `vendor/ArknightsResource`
- generated story detail JSON exposes `speakerId` only
- generated portrait assets and registry are created for referenced speakers only
- reader renders portraits from bundled PNG assets and keeps reserved empty slots when unavailable
- docs and generated artifacts reflect the new vendor names and `speakerId` contract

## Verification

- `npm run content:sync`
- `npm run content:portraits`
- `npm run content:update`
- `npm run content:check`
- `npm run app:verify`
- `npm run smoke`
- `npm run verify`
