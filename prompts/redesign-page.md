# Prompt: Redesign a Page

For when a page needs structural rethinking, not polish (use improve-ui.md for polish).

```
Task: Redesign <PAGE> at <ROUTE>. 

Why (what's failing): <e.g. users can't find the booking CTA; layout wastes space on desktop; doesn't match new direction>

Keep: <data, functionality, components that must survive>
Open to change: <layout, section order, component variants>
Inspiration/direction: <reference sites, Figma frame, or "propose 2 options">

Process:
1. Screenshot + critique current page (screenshot-review skill).
2. Propose 2 layout options as brief wireframe descriptions (sections, grid, component placement). WAIT for my choice.
3. Implement the chosen option: reuse component-library.md components, tokens only, all states, responsive, a11y.
4. Screenshot the result; run the critique rubric; iterate once on anything scoring < 4.

Constraints:
- API contracts unchanged. Routing unchanged unless specified.
- Update docs/ui-guidelines.md section for this page to match the new design.
- Update docs/component-library.md for any new/changed components.

Done when: rubric clean, docs updated, lint/tsc/tests pass, before/after screenshots shown.
```
