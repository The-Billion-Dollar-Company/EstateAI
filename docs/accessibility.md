# Accessibility

Target: WCAG 2.1 AA. Checked per-PR (checklist below) and with Lighthouse/axe before phase completion.

## Foundations

- Semantic HTML first: `nav`, `main`, `section`, `button`, `a`. A `div` with onClick is a bug.
- One `h1` per page; heading levels never skip.
- All interactive elements reachable and operable by keyboard; logical tab order; visible focus (`focus-visible:ring-2 ring-ring ring-offset-2` — never `outline-none` without replacement).
- Skip-to-content link as first focusable element.
- Color contrast: text ≥ 4.5:1, large text/icons ≥ 3:1. Verify token pairs (esp. amber accent on white — use it on dark text chips only).
- Never convey meaning by color alone (status badges get text/icons too).

## Components

- **Images**: property photos get meaningful alt ("3-bed apartment in Dhanmondi — living room"); decorative images `alt=""`.
- **Forms**: every input has a `<label>` (shadcn `FormLabel`); errors linked via `aria-describedby`; required marked in label not just color; error summary focus-moved on submit fail.
- **Modals/drawers**: focus trap, Esc closes, focus returns to trigger (Radix handles this — don't break it).
- **Icon-only buttons**: `aria-label` always (save-heart, close, gallery arrows).
- **Toasts**: `role="status"`; destructive/errors `role="alert"`.
- **Map**: keyboard-accessible list alternative always visible or one toggle away; markers focusable with property name.
- **Gallery/carousel**: arrow-key navigation, buttons not swipe-only.
- **Tables (dashboards)**: `<th scope>`, caption or aria-label, sortable headers announce state.

## AI Assistant specifics

- Chat log: `role="log"` + `aria-live="polite"` so streamed replies are announced after completion (not token-by-token).
- Message input: labelled, Enter sends / Shift+Enter newline, documented via `aria-keyshortcuts`.
- Property cards in replies are links with full accessible names.
- Loading state announced ("Assistant is typing").

## Motion & Media

- Respect `prefers-reduced-motion` (see animation-system.md).
- Videos/virtual tours: captions where narration exists; never autoplay with sound.

## PR Checklist

- [ ] Keyboard-only pass on new UI
- [ ] Focus visible everywhere
- [ ] Labels/alt/aria-label on new inputs, images, icon buttons
- [ ] Contrast checked for new color pairs
- [ ] axe DevTools: zero critical issues
