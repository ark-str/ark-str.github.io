# Latest Iteration

Latest parent iteration: `#86`

Completed child issue:

- `#86` - update app bar chrome and icon behavior

Current closeout outcome:

- the shared app bar is fixed to the top edge instead of using rounded floating chrome
- breadcrumb separators use icon-only chevrons while preserving the existing navigation layout
- the home control uses the bundled `ark_str_icon.png`, and the same asset is registered for browser metadata icons
- the theme control is icon-only and remains persisted through the existing preferences feature
- the app bar measures its own height for mobile wrapping and hides on downward scroll until the reader scrolls upward
- smoke coverage now checks the app icon, fixed app bar chrome, icon separators, and scroll hide/reveal behavior
- `npm run verify` passed on branch `issue-86-app-bar-chrome`

Remaining product gaps:

- story summaries are not generated yet
- character unlock extraction is not implemented yet
- the locale archive still renders expanded storyline rows without pagination or virtualization
- curated group artwork still needs to replace temporary generated group images over time
