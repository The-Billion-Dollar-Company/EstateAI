---
name: tailwind
description: Write clean, consistent Tailwind CSS. Use when styling components, fixing responsive issues, or refactoring messy class strings.
---

# Tailwind

## Conventions

- Class order (enforced by prettier-plugin-tailwindcss): layout → box → spacing → typography → color → effects → states.
- Mobile-first: base classes for 360 px, then `md:` `lg:` upward. Never desktop-first with `max-*` unless unavoidable.
- Breakpoints used in this project: `sm 640 / md 768 / lg 1024 / xl 1280`. Don't add custom ones.
- Conditional classes via `cn()` (clsx + tailwind-merge) from `@/lib/utils` — never template-string concatenation.
- Repeated 3+ times → extract a component (preferred) or a `cva` variant. No `@apply` except in `index.css` base layer.

## Token discipline

Colors/radius/shadows via semantic tokens only (see design-system skill). Spacing on the 4-px scale. Arbitrary values need a justifying comment.

## Recipes

```tsx
// Responsive property grid
"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
// Page container
"mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8"
// Truncation
"line-clamp-2" // titles; "truncate" for single-line
// Sticky booking panel
"lg:sticky lg:top-24 lg:self-start"
// Image hover zoom (inside group)
"overflow-hidden rounded-lg [&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-105"
```

## Debugging layout

1. Outline suspects: temporarily `outline outline-red-500`.
2. Overflow bugs: usually a missing `min-w-0` on flex children or `overflow-hidden` on rounded parents.
3. Height bugs in grids: `h-full` chain from grid item to card.
