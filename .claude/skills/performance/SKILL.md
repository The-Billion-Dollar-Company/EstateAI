---
name: performance
description: Measure and improve performance — bundle size, rendering, API latency, DB queries, Lighthouse scores. Use when something is slow or before deployment sign-off.
---

# Performance

Rule zero: **measure before and after**. No optimization without a number.

## Client

- **Measure**: Lighthouse (target ≥ 90), React DevTools Profiler, `npx vite-bundle-visualizer`.
- **Bundle**: lazy-load routes (dashboard, assistant, map); Leaflet and framer-motion are the heavy deps — dynamic-import map components; check for accidental lodash/moment imports.
- **Images (biggest win)**: Cloudinary transforms `f_auto,q_auto,w_600` per breakpoint via `srcSet`; `loading="lazy"` below the fold; explicit width/height (no CLS); hero image `fetchpriority="high"`.
- **Rendering**: memoize only what the Profiler shows re-rendering hot (PropertyCard in big grids, chat MessageList); virtualize lists only past ~50 visible items; debounce search input 300 ms.
- **Query cache**: sensible `staleTime` (properties 60 s, user 5 min) to kill redundant refetches.

## Server

- **Measure**: pino request duration logs; Atlas slow query profiler.
- **DB**: every list endpoint hits an index — verify with `.explain()`; `lean()` on reads; project only needed fields (never ship `embedding` to the client); pagination capped `limit ≤ 50`.
- **Caching**: in-memory cache for hot, rarely-changing reads (city list, amenities). No Redis unless proven necessary.
- **AI costs/latency**: stream responses (perceived speed), cap history to ~10 turns, cache embeddings for repeated identical queries.

## Budgets

- Initial JS < 250 kB gz; LCP < 2.5 s on Fast 3G-ish; p95 API < 300 ms non-AI; assistant first token < 2 s.

## Output format

Before/after table: metric, baseline, result, change made.
