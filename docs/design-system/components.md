# Components

## Shared Primitives

Current shared primitives live in `ark-str-web-app/src/components/ui/`.

- `Button`
- `Card`
- `Textarea`
- `Select`
- `Checkbox`
- `Badge`
- `Separator`
- `DisclosureCard`

These are the base layer that features should compose before adding their own product-specific UI. `DisclosureCard` owns only generic open/close behavior and must not encode feature-specific grid spanning.

## Product Patterns

Current product patterns:

- home landing hero with nickname capture and continue-reading action
- image-backed recommendation group cards
- selected-locale archive statistics

Planned product patterns for subsequent issues:

- `LocaleSwitch`
- `ThemeToggle`
- `SectionHeader`
- `ReadingRail`
- `DialogueBlock`
- `NarrationBlock`
- `ChoiceBranch`
- `SummaryPanel`
- `CharacterFactCard`
- `UnlockPill`
- `EmptyArchiveState`

## Placement Rules

- shared primitives: `ark-str-web-app/src/components/ui/`
- feature composition: `ark-str-web-app/src/features/*/ui/`
- features should not duplicate base button, card, or form-control styling
