# Group Background Images

## Objective

Add generated group-level images to reader archive cards and group overview pages without introducing runtime network access.

## Scope

- Use `assets/group-backgrounds/<groupId>.png` as the project-owned override source, then infer group image candidates from `stage_table.json`, `story_review_table.json`, `story_review_meta_table.json`, and `zone_table.json`.
- Copy only referenced `ArknightsResource` images into `ark-str-web-app/public/generated/group-backgrounds/`.
- Render MAINLINE images as square/contained artwork and ACTIVITY images as wide card backgrounds.
- Keep operator narrative groups image-free until a reliable source is found.

## Constraints

- Do not use remote runtime assets.
- Do not bundle the full upstream resource repository.
- Do not edit `ark-str-web-app/public/generated/group-backgrounds/` directly.
- Keep generated files deterministic and verifiable through `npm run content:check`.
- Preserve the existing root harness and nested Next.js app boundary.

## Tasks

- Expand the content pipeline to search project overrides, direct `avgs/*.png`, and `mapreview/*.png` resources.
- Generate temporary `assets/group-backgrounds/<groupId>.png` placeholders from each group's last available story background image.
- Prefer MAINLINE `avgs/ac{arc}_title{part}.png` aliases, falling back through related title/KV/background IDs.
- Prefer ACTIVITY KV/title IDs, archive primary `pic.assetPath`, then `mapreview/{activityId}_01.png`.
- Add `backgroundImageAspect` metadata so UI can distinguish square and wide images.
- Update reader archive and group overview rendering for the new metadata.
- Regenerate content artifacts and static group image assets.

## Verification

- `node --check scripts/content/lib.mjs`
- `npm run content:build-index`
- `npm run content:check`
- `npm run harness:test`
- `npm --prefix ark-str-web-app run verify`
- `npm run verify`

## Decision Log

- `titleImageId` is treated as semantic metadata, not as the only file lookup key.
- Project-owned `assets/group-backgrounds/<groupId>.png` overrides are treated as the intended long-term authoring surface.
- MAINLINE assets are inferred from `storySetId` because the resource repo stores current mainline title art as `ac{arc}_title{part}.png`.
- ACTIVITY assets use archive KV data where available and `mapreview` as a deterministic fallback for newer events that do not yet appear in archive metadata.
- Temporary placeholders were generated from each group's last available story background image and can be replaced in-place by overwriting the matching `<groupId>.png` source file.
- `npm run verify` passed after regenerating content.
