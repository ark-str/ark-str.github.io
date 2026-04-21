# Latest Iteration

Latest parent iteration: `#58`

Completed child issue:

- `#59` via PR `#60` - treat negative-focus story frames as visual-only so unrelated dialogue does not inherit an inactive portrait

Current closeout outcome:

- `priority < 0` character/charslot frames now remain visual state but are excluded from dialogue speaker selection
- speaker-name fallback is skipped while any visual frame is still active, preventing stale bindings from adding unrelated portraits
- `level_act12side_01_beg` now leaves `경박한 관광객` without Chen's `speakerId`, while the following Chen line still resolves to `char_010_chen`
- generated story detail artifacts were rebuilt with `content:build-index`
- `npm run verify` passed on branch `codex-negative-focus-speaker-issue-59`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- the locale archive still renders the full group list without pagination or virtualization
