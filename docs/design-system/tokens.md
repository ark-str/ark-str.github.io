# Tokens

## Theme Model

The app uses semantic tokens rather than per-page colors.

- light theme: warm paper archive
- dark theme: dim slate archive

The active theme is applied through `html[data-theme="light|dark"]`.

## Core Color Roles

- `--bg` - page canvas
- `--surface` - primary card surface
- `--surface-muted` - nested surface or raised strip
- `--panel` - translucent overlay surface
- `--text` - primary foreground
- `--text-muted` - secondary foreground
- `--accent` - primary action and highlight
- `--accent-soft` - soft accent fill
- `--accent-strong` - stronger accent text or surface
- `--accent-contrast` - text on accent surfaces
- `--image-overlay` - dark wash over generated artwork cards
- `--image-text` - primary text on image-backed cards
- `--image-muted` - secondary text and borders on image-backed cards
- `--border` - structural outline
- `--ring` - focus ring
- `--success` - positive status
- `--warning` - caution status

## Typography

- `--font-display` - serif stack for major headings and archival tone
- `--font-body` - sans stack for long-form interface reading
- `--font-mono` - code or manifest snippets

## Spacing And Shape

- `--space-1` to `--space-8`
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--motion-fast`, `--motion-base`

## Usage Rules

- feature UI must reference semantic tokens, not literal colors
- token values are defined only in `ark-str-web-app/src/app/globals.css`
- line length for story reading surfaces should target roughly `68ch` to `72ch` on desktop
