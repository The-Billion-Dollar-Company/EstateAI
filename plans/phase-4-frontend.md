# Phase 4 — Frontend Development

**Goal**: all user-facing pages built against mocked/seeded data (MSW or a seeded dev API from phase 5 running in parallel). UI complete, polished, responsive, accessible.
**Note**: phases 4 and 5 can run in parallel across the team; agree on API contracts (architecture.md) first — the contract is frozen.

Use `prompts/build-page.md` per page; finish each with a screenshot-review pass.

## Tasks

### Core components (build first — everything reuses them)
- [ ] PropertyCard (all 3 variants) + PropertyGrid + skeletons + EmptyState/ErrorState
- [ ] PriceTag (BDT lakh + /mo), StatusBadge, SpecIcons, RatingStars, SaveButton (optimistic)
- [ ] SearchBar (hero + header variants), FilterSidebar/FilterChips/SortSelect
- [ ] PageHeader, Section, ConfirmDialog, UserAvatar

### Auth
- [ ] Register (password strength) + Login pages; authStore (Zustand) + token handling; RequireAuth / RequireRole wrappers; header auth states

### Pages
- [ ] Landing page per premium-landing skill (hero, featured, how-it-works, AI teaser, stats, areas, CTA)
- [ ] Search results: filters ↔ searchParams, grid, sort, pagination, mobile filter sheet
- [ ] Map view: Leaflet PropertyMap, markers + clusters, split view lg+, list/map toggle (lazy-loaded)
- [ ] Property detail: gallery + lightbox, specs, amenities, map, owner card, sticky BookingPanel (fixed bottom bar mobile), reviews section
- [ ] Booking flow UI: VisitScheduler (calendar + slots), purchase request + NegotiationThread UI
- [ ] Review UI: ReviewForm (star radio input), ReviewList
- [ ] Dashboards (dashboard skill): DashboardLayout + buyer views + owner views (StatCards, ListingsTable, BookingRequestsTable, PropertyForm wizard + MediaUploader) + admin views (stats, ApprovalQueue, users table)
- [ ] 404 / error boundary pages

### Cross-cutting (definition of done per page)
- [ ] All states: loading/empty/error; responsive 360/768/1280; a11y checklist; motion per animation-system.md
- [ ] Dark mode toggle working across all pages
- [ ] Component tests for interactive components; hook tests with MSW

## Exit criteria

- [ ] Every route from the phase-2 sitemap renders finished UI on seeded/mock data
- [ ] Lighthouse a11y ≥ 90 on landing/search/detail; lint/tsc/tests green; screenshot-review passes recorded
