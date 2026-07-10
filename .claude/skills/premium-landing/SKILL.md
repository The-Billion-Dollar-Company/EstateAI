---
name: premium-landing
description: Build a high-converting, premium landing page. Use when creating or improving the EstateAI home page, hero sections, or marketing-style sections.
---

# Premium Landing

The landing page sells the platform in 5 seconds. Premium = restraint + photography + typography, not effects.

## Section order

1. **Hero**: full-bleed property photo w/ `from-black/60` overlay, h1 (`text-4xl md:text-6xl font-semibold tracking-tight`, display font) + one-line subhead, SearchBar (location/type/price + Search) in a floating card, Buy/Rent/Sell tabs above it. Trust line under search ("2,000+ verified listings across Dhaka").
2. **Featured properties**: h2 + "View all →", 3-col PropertyGrid of 6, from `GET /properties?sort=featured&limit=6`.
3. **How it works**: 3 steps (Search/Ask AI → Visit → Move in), icon + title + one sentence each.
4. **AI assistant teaser**: split layout — copy + CTA left, static example chat card right (ai-pages skill rules: honest, no fake data).
5. **Stats strip**: 3–4 CountUp numbers on `bg-primary text-primary-foreground`.
6. **Browse by area**: image cards for top cities/areas → pre-filtered search links.
7. **Final CTA**: "List your property" for owners (secondary audience).

## Craft rules

- Hero LCP image: Cloudinary optimized, `fetchpriority="high"`, no carousel.
- Entrances: fade+rise stagger per animation-system.md; stats count up once on scroll into view.
- Copy: concrete over hype — "Find a 3-bed in Dhanmondi under ৳40k" beats "Discover your dream home". Sentence case. No lorem ipsum ever; write real copy.
- One primary CTA per viewport-height of content.
- Fully responsive per responsive skill; hero text ≥ 30px on mobile, search card stacks vertically.

## Anti-patterns

Autoplaying video hero, particle effects, 3+ fonts, testimonial sliders with fake people, badge walls, scroll-jacking.
