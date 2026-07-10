# Animation System

Motion is functional: guide attention, communicate state, add polish. Never decorative for its own sake.

## Stack

- Tailwind transitions for micro-interactions (hover, focus, color).
- `framer-motion` for entrances, layout shifts, page transitions, and the assistant UI.
- `tailwindcss-animate` (shadcn dependency) for dialog/popover primitives.

## Tokens

| Token | Value | Use |
|---|---|---|
| duration-fast | 150 ms | hovers, toggles, color changes |
| duration-base | 250 ms | dropdowns, tooltips, card lift |
| duration-slow | 400 ms | modals, drawers, page fade |
| ease-standard | cubic-bezier(0.2, 0, 0, 1) | most things |
| ease-out-back | cubic-bezier(0.34, 1.56, 0.64, 1) | playful pops (save-heart) |

## Standard Recipes

**Card hover**: `transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`. Image inside: `group-hover:scale-105 transition-transform duration-300`.

**Page entrance** (framer-motion): fade + 8px rise, `duration: 0.3`, stagger children `0.06`. One `<motion.div>` wrapper per page — don't animate every element.

**List/grid items**: stagger on first mount only; never re-animate on filter changes (feels janky) — use `layout` animations instead.

**Modals/drawers**: shadcn defaults (fade + zoom-95 / slide). Don't override.

**AI assistant**: messages fade+rise in; streaming text renders token-by-token with a subtle caret pulse; property cards inside a reply stagger 80 ms; typing indicator = 3 bouncing dots (`animate-bounce`, delays 0/150/300 ms).

**Skeletons**: `animate-pulse` on `bg-muted` blocks matching final layout.

**Numbers/stats**: count-up on scroll-into-view once (landing stats strip).

## Rules

- Everything interactive gets a `transition` — no instant state jumps.
- Nothing over 500 ms. If it feels slow, halve it.
- Animate `transform` and `opacity` only (compositor-friendly). No `width/height/top/left` animation; use framer-motion `layout` where size changes.
- Respect `prefers-reduced-motion`: wrap page/list entrances in `useReducedMotion()`; CSS media query kills nonessential animation globally.
- No parallax, no scroll-jacking, no autoplaying carousels faster than 6 s.
