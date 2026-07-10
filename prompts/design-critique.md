# Prompt: Design Critique

Get an honest expert critique without changing code. Pairs with screenshot-review skill.

```
Task: Critique the design of <PAGE/COMPONENT> at <ROUTE>. Do NOT change any code.

Process:
1. Screenshot at 360/768/1280 (+ dark mode if relevant) via the playwright MCP.
2. Score against the screenshot-review rubric (hierarchy, spacing, tokens, typography, states, responsive, polish) — 1–5 each with evidence.
3. Compare against docs/ui-guidelines.md spec for this page and 2–3 best-in-class references (e.g. Zillow, Airbnb patterns) — what do they do that we don't?
4. Deliver: 
   - Top 5 improvements ranked by impact/effort
   - Quick wins (< 30 min each)
   - Anything violating our own docs (cite the doc)

Be blunt. "Looks fine" is a failed critique — find the gap between good and excellent.
```

## Follow-up

Approve items from the critique, then run `prompts/improve-ui.md` with them pasted in as the "current problems" list.
