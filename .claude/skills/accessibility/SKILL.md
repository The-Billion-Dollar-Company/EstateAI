---
name: accessibility
description: Make UI accessible (WCAG 2.1 AA). Use when building interactive components, forms, modals, the chat UI, maps — or when auditing/fixing a11y issues.
---

# Accessibility

Enforce `docs/accessibility.md`. Non-negotiable on every UI task, not a separate pass.

## While building

- Semantic elements first; Radix/shadcn primitives already handle focus traps and aria — don't re-implement or break them.
- Every icon-only button: `aria-label`. Every image: meaningful `alt` or `alt=""`.
- Forms: shadcn `Form` + `FormLabel` + `FormMessage` gives you label/error wiring — always use it.
- Focus: `focus-visible:ring-2 ring-ring ring-offset-2`; removing outlines without replacement is a defect.
- Chat: `role="log"` + `aria-live="polite"` on message list; announce "Assistant is typing".
- Map views: ensure the list alternative is reachable; markers get accessible names.

## Audit procedure (when asked to audit)

1. Keyboard pass: Tab through the page — order logical? Everything reachable? Focus visible? Esc closes overlays?
2. Static grep: `onClick` on div/span, `outline-none` without ring, `<img` without alt, buttons without text or aria-label.
3. Contrast-check any new token pairs against AA (4.5:1 text).
4. Heading structure: exactly one h1, no skips.
5. Output: table of issue / severity / file / fix, then apply fixes.

## Definition of done

axe critical issues = 0, keyboard pass clean, PR checklist in docs/accessibility.md ticked.
