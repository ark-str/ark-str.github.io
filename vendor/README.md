# Vendor Sources

This directory is reserved for indirect GitHub-backed source repositories such as:

- `vendor/ArknightsData/`
- `vendor/PortraitSource/`

Runtime code must not read from `vendor/` directly. Build-time pipeline scripts under `scripts/content/` are responsible for translating vendor inputs into bundled assets under `public/generated/`.

Current state:

- `vendor/ArknightsData/` is the upstream game-data submodule
- `vendor/PortraitSource/` remains a placeholder until portrait extraction work starts
