# Prompt: Build a Page

Copy, fill the blanks, paste into Claude Code.

```
Task: Build the <PAGE NAME> page at route <ROUTE>.

Context:
- Spec: docs/ui-guidelines.md section "<PAGE>"; plan item: plans/phase-<N>.md
- Reuse components from docs/component-library.md: <LIST>
- Data: <API endpoints / hooks to use, e.g. useProperties(filters)>

Requirements:
1. Follow docs/design-system.md tokens and docs/animation-system.md motion.
2. All states: loading (skeletons), empty, error, populated.
3. Responsive 360/768/1280 per the responsive skill; a11y per docs/accessibility.md.
4. URL-synced state where applicable (filters in searchParams).
5. New reusable components → add to docs/component-library.md.

Done when:
- lint + tsc + tests pass
- screenshot-review skill pass at all three widths
- <PAGE-SPECIFIC ACCEPTANCE, e.g. "filter changes update results without full reload">
```

## Example (filled)

```
Task: Build the Search Results page at route /properties.
Context: docs/ui-guidelines.md "Search results"; plans/phase-4.md step 4.
Reuse: PropertyGrid, PropertyCard, FilterSidebar, FilterChips, SortSelect, MapToggle, EmptyState.
Data: useProperties(filters) hook against GET /api/v1/properties.
Requirements: 1–5 above. Filters live in searchParams. Map split view on lg+.
Done when: lint/tsc/tests pass, screenshots clean, changing any filter updates grid + URL + result count.
```
