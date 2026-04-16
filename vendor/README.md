# Vendor Sources

This directory is reserved for indirect GitHub-backed source repositories such as:

- `vendor/ArknightsGamedata/`
- `vendor/ArknightsResource/`

Runtime code must not read from `vendor/` directly. Build-time pipeline scripts under `scripts/content/` are responsible for translating vendor inputs into bundled assets under `public/generated/`.

Current state:

- `vendor/ArknightsGamedata/` is the upstream game-data submodule
- `vendor/ArknightsResource/` is a tool-managed sparse-checkout cache downloaded from the upstream portrait repository, with `avatar/ASSISTANT/` used for bundled reader portraits
