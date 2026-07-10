# Phase 1 — Requirements Analysis

**Goal**: turn the proposal into precise, testable requirements. No code this phase (docs only).
**Duration guide**: week 1.

## Tasks

- [ ] Study 3 existing platforms (e.g. Bproperty, Bikroy property, Zillow): list features, gaps, UX patterns worth stealing — write `docs/research/competitor-analysis.md`
- [ ] Define user personas: buyer/tenant, property owner, admin — goals + pain points
- [ ] Write functional requirements per module (auth, listings, search, maps, booking, negotiation, reviews, AI assistant, dashboards) as user stories with acceptance criteria: `docs/research/requirements.md`
  - Format: "As a <role> I can <action> so that <benefit>" + Given/When/Then criteria
- [ ] Define non-functional requirements: performance targets, security, a11y (AA), browser support, mobile-first — fold into requirements.md
- [ ] Scope the AI assistant precisely: supported query types (budget/location/type/amenities/proximity), out-of-scope (legal advice, price prediction), success metric (retrieval hit-rate ≥ 80% on golden set)
- [ ] Prioritize: MoSCoW table (must/should/could/won't for this capstone)
- [ ] Freeze the feature list for phases 4–6; anything new goes to a "future work" list (feeds the report's conclusion chapter)

## Deliverables

`docs/research/competitor-analysis.md`, `docs/research/requirements.md` (stories + NFRs + MoSCoW)

## Exit criteria

- [ ] Every proposal objective maps to ≥ 1 user story
- [ ] Supervisor/team sign-off on scope freeze
