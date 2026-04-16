# Vendor Sources

This directory is reserved for indirect GitHub-backed source repositories such as:

- `vendor/ArknightsGamedata/`
- `vendor/ArknightsResource/`

Runtime code must not read from `vendor/` directly. Build-time pipeline scripts under `scripts/content/` are responsible for translating vendor inputs into bundled assets under `public/generated/`.

Current state:

- `vendor/ArknightsGamedata/` is the upstream game-data submodule
- `vendor/ArknightsResource/` is a tool-managed blobless portrait cache downloaded from the upstream portrait repository, recreated automatically when stale, and only referenced `avgs/npcs/` files materialized before copying them into bundled reader assets
