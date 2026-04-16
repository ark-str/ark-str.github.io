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

These are the base layer that features should compose before adding their own product-specific UI.

## Product Patterns

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
