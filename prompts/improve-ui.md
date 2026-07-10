# Prompt: Improve Existing UI

For polishing something that works but doesn't feel great yet.

```
Task: Improve the UI of <COMPONENT/PAGE> at <FILE PATH / ROUTE>.

Current problems (my observations):
- <e.g. feels cramped, hierarchy unclear, hover states missing>

Process:
1. Screenshot the current state at 360/768/1280 (screenshot-review skill) and critique it against docs/design-system.md + docs/ui-guidelines.md before changing anything.
2. Propose the improvement list (ranked by impact), wait for my OK if any change is structural.
3. Apply improvements using existing tokens/components only — no new dependencies.
4. Re-screenshot and show before/after summary.

Constraints:
- No functional/behavior changes, no API changes.
- Keep diffs focused; don't reformat untouched code.
- Motion per docs/animation-system.md; a11y must not regress.

Done when: critique rubric scores ≥ 4 everywhere, lint/tsc pass, before/after documented.
```

Tip: run this prompt per-page after each phase's functional work — build first, polish second, but never skip the polish pass.
