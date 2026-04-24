# Latest Iteration

Latest parent iteration: `#96`

Completed child issue:

- `#96` - fix act22side multiline and stale portrait parsing

Merged PR:

- `#97` - Fix act22side multiline and stale portrait parsing

Current closeout outcome:

- `[multiline(name="...")]` and `[multiline(name="...",end=true)]` are normalized as speaker-bearing dialogue instead of narration
- `charslot(...)` frames are cleared when `character(...)` scene state takes over, preventing old slot portraits from leaking into later dialogue
- speaker-name fallback after active frames clear is limited to confirmed fresh-frame `char_` operator aliases, including focus-only `charslot` updates, so stale frames do not contaminate unrelated speaker names
- `Sticker(text="...")` title-card text is preserved as narration with escaped line breaks decoded and bracketed labels intact, and `Image(image="...")` scene art now emits background blocks backed by direct `ArknightsResource/avgs/` images
- no-image `Image` / `Background` tags emit `backgroundId: null` clear markers that clear the fixed story backdrop, including leading clear markers, and adjacent duplicate background IDs from paired `Background` / `Image` tags are coalesced before rendering
- story details were regenerated from the updated parser
- `npm run verify` passed on branch `issue-96-act22side-parser-fix`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- the locale archive still renders expanded storyline rows without pagination or virtualization
- curated group artwork still needs to replace temporary generated group images over time
