---
name: animation
description: Add motion, transitions, and micro-interactions. Use when animating components, page entrances, hover effects, loading states, or the AI chat streaming UI.
---

# Animation

Follow `docs/animation-system.md` exactly — durations, easings, and recipes are defined there.

## Decision tree

- Hover/focus/color change → Tailwind `transition-*` classes, 150–250 ms.
- Element entrance, stagger, layout shift → framer-motion.
- Dialog/sheet/popover → shadcn defaults, don't touch.

## framer-motion patterns

```tsx
// Page entrance — one wrapper per page
const page = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0,
  transition: { duration: 0.3, staggerChildren: 0.06 } } };

// Grid item (first mount only — gate with a mounted ref on filter changes)
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };
```

Use `layout` prop for size/position changes (filter results reflow), `AnimatePresence` for exits (toast, chips).

## Hard rules

- `transform`/`opacity` only. Never animate width/height/top/left directly.
- Max 500 ms. Micro-interactions 150 ms.
- Every entrance animation wrapped with `useReducedMotion()` fallback.
- No re-animating lists on filter/sort — feels broken.
- One "delight" moment max per page (save-heart pop, count-up stats).

## Verify

Interact with the result: does anything jump without transition? Does anything take > 500 ms? Does `prefers-reduced-motion: reduce` disable entrances?
