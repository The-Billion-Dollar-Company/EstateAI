# Prompt: Generate a Component

```
Task: Create component <Name> in client/src/components/<area>/<Name>.tsx

First: check docs/component-library.md — if something close exists, extend it with a variant instead and tell me.

Spec:
- Purpose: <one sentence>
- Props: <name: type — behavior; mark optional + defaults>
- Variants: <default / compact / ...>
- States: <hover, focus, loading, disabled, empty — which apply>
- Used in: <pages/parents>

Requirements:
1. Typed props interface, defaults in signature; no data fetching inside (props in, events out).
2. Tokens only (design-system skill); motion per animation-system.md; a11y per accessibility skill (aria-labels for icon buttons, focus-visible rings).
3. cva for variants if ≥ 2 visual variants.
4. Co-located test: renders, variant classes, interaction callbacks fire.
5. Add entry to docs/component-library.md.

Done when: lint/tsc/test pass, rendered in isolation and screenshot-checked.
```

## Example (filled)

```
Task: Create PropertyRecCard in client/src/components/assistant/PropertyRecCard.tsx
Purpose: compact property card rendered inside AI chat replies.
Props: property: PropertySummary; onSave?: (id) => void; className?
Variants: none (single compact form). States: hover lift, saved/unsaved heart.
Used in: MessageBubble (assistant messages).
Note: compose from PropertyCard compact variant if feasible — check first.
```
