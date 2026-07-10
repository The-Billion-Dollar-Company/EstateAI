# Phase 5 — Backend Development

**Goal**: complete REST API per architecture.md — every endpoint validated, authorized, tested. Contract frozen from phase 2.

Use the express skill; route → controller → service → model discipline throughout.

## Tasks

### Auth module
- [ ] User model (+ indexes); register/login/refresh/logout/me endpoints
- [ ] JWT access (15 m) + refresh (7 d httpOnly cookie) flow; bcrypt cost 12
- [ ] requireAuth + requireRole middleware; rate limits on auth routes
- [ ] Tests: happy paths, wrong password, expired/reused refresh, role gating

### Property module
- [ ] Property model (text index, 2dsphere, compound city+type+price)
- [ ] CRUD endpoints + ownership checks (owner edits own; admin any)
- [ ] List endpoint: all filters from architecture.md (q, city, type, listingType, price range, beds, baths, amenities, near-geo, sort, pagination) — each filter tested
- [ ] Media upload: multer → Cloudinary (type/size validation), attach/remove endpoints
- [ ] Admin approval flow: status pending → active; approval endpoints
- [ ] Seed script: ~60 realistic Dhaka properties with photos (Cloudinary demo images), varied types/prices/areas — powers dev, demos, and the RAG golden set

### Booking module
- [ ] Booking model + state machine (pending → confirmed/cancelled → completed)
- [ ] Create visit/reservation/purchase-request; owner + buyer list endpoints; status transitions (authz: only owner confirms, only participants view)
- [ ] Negotiation subdocument endpoints (offer/counter); guard invalid transitions
- [ ] Tests incl. double-booking slot conflict and forbidden transitions

### Reviews module
- [ ] Review model (unique user+property); create/list/delete; avgRating recompute on write
- [ ] Only users with a completed booking can review (business rule) — tested

### Users & admin
- [ ] Profile get/patch; saved properties toggle + list
- [ ] Admin: stats endpoint (counts, recent activity), user list/role management

## Exit criteria

- [ ] Every endpoint in architecture.md's table implemented; `{ success, data }` shape everywhere
- [ ] Supertest coverage: happy + 400/401/403/404 per endpoint; lint/tsc/tests green
- [ ] Seed script produces a demo-ready database in one command
