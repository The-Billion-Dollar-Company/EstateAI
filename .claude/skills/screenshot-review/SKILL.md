---
name: screenshot-review
description: Visually verify UI by taking and critiquing screenshots. Use after building/changing UI, before marking any UI task done, or when asked "does this look right?"
---

# Screenshot Review

UI isn't done until it's been SEEN. Use the Playwright MCP (`mcp/playwright.md`) to capture rendered output; never claim visual quality from code alone.

## Capture procedure

1. Dev server running (`cd client && npm run dev`).
2. Screenshot the affected route at 360, 768, 1280 widths. Include interaction states when relevant: hover (via script), focus (Tab), open dialogs, loading (throttle/mock), empty and error states.
3. Dark mode pass if the change touches surfaces/colors.

## Critique rubric (score each 1–5, flag < 4)

1. **Hierarchy**: is the intended focal point actually dominant? Squint test.
2. **Spacing rhythm**: consistent gaps, aligned edges, no cramped or orphaned elements.
3. **Token fidelity**: colors/radii/shadows match design-system.md (compare, don't assume).
4. **Typography**: scale steps correct, line lengths ≤ 72ch, no widows in headings.
5. **States**: focus visible, hover present, skeleton matches layout.
6. **Responsive integrity**: no overflow-x, no squashed cards, touch targets ≥ 44px at 360.
7. **Polish details**: image aspect ratios, icon alignment with text, badge/pill consistency.

## Output format

```
## Visual review: <page> @ <widths>
Verdict: ✅ ship | 🔶 minor fixes | ❌ rework
| # | Issue | Severity | Fix |
```

Then apply the fixes and re-screenshot to confirm. Attach/reference before-after.

## Rule

Any UI task's definition of done includes one clean pass of this rubric at all three widths.
