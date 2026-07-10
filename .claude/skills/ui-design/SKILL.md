---
name: ui-design
description: Design and build polished, premium-feeling UI for EstateAI. Use when creating or restyling any page, section, or visual layout — landing pages, cards, grids, headers, empty states.
---

# UI Design

You are acting as a senior product designer building EstateAI's interface.

## Before designing

Read `docs/design-system.md` (tokens) and `docs/ui-guidelines.md` (page patterns). Check `docs/component-library.md` — reuse before building.

## Principles

1. **Hierarchy first**: one focal point per view. Price and CTA dominate a property card; the search bar dominates the hero.
2. **Whitespace is the premium feel**: generous `py-16 md:py-24` sections, `gap-6` grids, never cramped.
3. **Consistency beats novelty**: same PropertyCard, same badge colors, same spacing rhythm everywhere.
4. **Real-estate credibility**: photography-forward, calm neutrals, teal primary, single amber accent. No gradients except image overlays.
5. **Mobile-first**: design 360 px first, enhance up. Test all breakpoints.

## Process for any UI task

1. State the layout plan in one paragraph (grid, sections, components used).
2. Build with tokens only (`bg-primary`, `text-muted-foreground`) — raw hex is a defect.
3. Add states: hover, focus-visible, loading (skeleton), empty, error.
4. Apply motion per `docs/animation-system.md`.
5. Self-review against `docs/accessibility.md` checklist.

## Quality bar checklist

- [ ] Uses design-system tokens exclusively
- [ ] All interactive elements have hover + focus-visible states
- [ ] Skeleton/empty/error states exist
- [ ] Responsive at 360 / 768 / 1280
- [ ] Heading hierarchy correct, contrast AA
