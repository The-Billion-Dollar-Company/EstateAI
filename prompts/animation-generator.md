# Prompt: Add Animation

```
Task: Animate <ELEMENT/INTERACTION> in <FILE/PAGE>.

Intent: <what should this motion communicate? e.g. "new chat message arriving", "card is clickable", "results updated">

Requirements:
1. Follow docs/animation-system.md — use its tokens (duration-fast/base/slow, ease-standard) and recipes; don't invent new timings.
2. Choose the lightest tool: Tailwind transition < CSS keyframe < framer-motion. Justify if reaching for framer-motion.
3. transform/opacity only; no layout-property animation (use motion layout prop for reflows).
4. useReducedMotion fallback for entrances; micro-interactions can stay.
5. First-mount only for list entrances — no re-animation on filter/sort/data refresh.

Done when:
- Motion feels ≤ 300ms snappy (record a quick screen check via playwright if uncertain)
- prefers-reduced-motion disables it correctly
- No jank: verify no animated width/height/top/left in the diff
```

## Common asks (pre-approved recipes — see animation-system.md)

- Card hover lift + image zoom
- Page/grid stagger entrance
- Chat message arrival + typing dots + streaming caret
- Save-heart pop (ease-out-back)
- Stat count-up on scroll into view
- Filter chip add/remove (AnimatePresence)
