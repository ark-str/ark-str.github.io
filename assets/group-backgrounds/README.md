# Group Background Overrides

Place manually curated group images in this directory as:

```text
<groupId>.png
```

Examples:

```text
main_16.png
act34side.png
act13side.png
```

These source files are copied by the content pipeline into
`ark-str-web-app/public/generated/group-backgrounds/`. Do not edit the
generated public directory directly because it is rebuilt by
`npm run content:build-index`.
