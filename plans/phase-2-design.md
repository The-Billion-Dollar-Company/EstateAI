# Phase 2 — Planning & Design

**Goal**: lock architecture, data model, and UX direction before setup. Mostly docs; validate ideas with throwaway sketches only.
**Depends on**: phase 1 scope freeze.

## Tasks

### Architecture
- [ ] Review/refine `docs/architecture.md` against requirements — confirm every user story has an endpoint + model that serves it
- [ ] Finalize ERD: User, Property, Booking, Review, Conversation (+ relations, indexes) — export diagram to `docs/research/erd.png`, embed in architecture.md
- [ ] Confirm RAG design decisions: embedding model (voyage-3), index config, filter-extraction approach, citation format `[P:<id>]` — record any changes in architecture.md
- [ ] Define the full zod schema list (one per endpoint) as a checklist in architecture.md

### UX/UI
- [ ] Sitemap + route table (public, auth, role-gated) — add to ui-guidelines.md
- [ ] Low-fi wireframes for the 6 key screens: landing, search, detail, assistant, owner dashboard, property wizard (Figma or paper photos → `docs/research/wireframes/`)
- [ ] Validate design tokens in `docs/design-system.md` render well: build a single throwaway HTML page with the palette/type scale, screenshot, adjust tokens if needed
- [ ] Walk each persona through the wireframes (team exercise); note friction, revise once

### Planning
- [ ] Assign module ownership across the 5 team members
- [ ] Break phases 3–8 task lists into GitHub issues (or keep checkbox tracking here — decide as a team)

## Exit criteria

- [ ] architecture.md + ERD final; ui-guidelines.md routes final; wireframes approved by team
- [ ] No open "TBD" in any doc
