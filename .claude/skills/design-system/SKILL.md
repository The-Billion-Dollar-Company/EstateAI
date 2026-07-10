---
name: design-system
description: Apply or extend EstateAI's design tokens — colors, typography, spacing, radius, shadows. Use when styling anything, adding a token, theming dark mode, or auditing visual consistency.
---

# Design System

`docs/design-system.md` is the source of truth. This skill enforces it.

## Token usage

- Colors only via semantic tokens: `bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`. Raw hex/rgb/hsl in a component is a defect — fix by using or adding a token.
- Type scale, spacing (4-px grid), and radius come from Tailwind config; arbitrary values (`w-[347px]`) need a comment justifying them.

## Extending tokens

1. Add the CSS variable to `client/src/index.css` (`:root` and `.dark`).
2. Map it in `tailwind.config.ts` under `theme.extend.colors`.
3. Document it in `docs/design-system.md` with usage guidance.
4. Never fork a near-duplicate — check for an existing token first.

## Dark mode

- Class strategy (`darkMode: ["class"]`), toggled via Zustand ui store + `localStorage` persistence handled in app code.
- Every new color pair must pass AA contrast in BOTH modes.
- Test: property cards, badges, and the chat UI are the usual dark-mode breakage points.

## Consistency audit (run when asked to "audit" styles)

1. Grep client for `#[0-9a-fA-F]{3,8}`, `rgb(`, `hsl(` outside index.css → replace with tokens.
2. Grep for arbitrary Tailwind values `\[.*px\]` → justify or normalize.
3. Check badge/status color mapping matches component-library.md.
4. Report findings as a table: file, violation, fix.
