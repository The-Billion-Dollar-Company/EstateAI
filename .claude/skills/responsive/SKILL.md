---
name: responsive
description: Make layouts work across mobile, tablet, and desktop. Use when building any page/component or fixing layout breakage at specific widths.
---

# Responsive Design

Mobile-first, 360 px baseline. Breakpoints: `sm 640 / md 768 / lg 1024 / xl 1280`.

## Per-page behavior (from ui-guidelines.md)

| Page | Mobile | Desktop |
|---|---|---|
| Header | logo + hamburger → Sheet | full nav inline |
| Search | filters = bottom Sheet, 1-col grid, map = full-screen toggle | sidebar + 3-col grid, split map view |
| Detail | stacked, booking = fixed bottom bar | 2-col, sticky booking panel right |
| Dashboard | sidebar → Sheet, tables → card lists | fixed sidebar + tables |
| Assistant | full-height chat, history in Sheet | history sidebar visible |

## Rules

1. Base classes = mobile. Add `md:`/`lg:` upward only.
2. Touch targets ≥ 44 px on mobile (`h-11` buttons, spaced icon buttons).
3. Typography scales down gracefully: hero `text-3xl md:text-5xl`.
4. Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — never fixed widths.
5. Tables on mobile: transform to stacked cards or horizontal-scroll with `overflow-x-auto` + sticky first column — never squashed.
6. Images: aspect-ratio classes (`aspect-[16/10]`) so height is predictable at every width.
7. No horizontal scroll ever (except intentional carousels): watch for unwrapped flex rows, fixed widths, long unbroken strings (`break-words` on user content).

## Verification (mandatory for UI tasks)

Check 360, 768, 1024, 1280 widths. Playwright MCP: screenshot each width. Look for: overflow-x, cramped touch targets, orphaned single-column desktop layouts, text truncation losing critical info (price must never truncate).
