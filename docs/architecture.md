# Architecture

## System Overview

```
[React SPA (Vite)] ──HTTPS/JSON──> [Express API] ──> [MongoDB Atlas]
        │                              │                 ├── collections (users, properties, bookings, reviews, conversations)
        │                              │                 └── vector index (property embeddings)
        │                              ├──> [Claude API]   (RAG generation)
        │                              ├──> [Voyage AI]    (embeddings)
        │                              └──> [Cloudinary]   (media)
        └── SSE stream for assistant chat
```

Monorepo: `client/` and `server/` with independent package.json files.

## Backend Structure (server/src)

- `routes/` — route definitions only, one file per resource
- `controllers/` — request/response handling, no business logic
- `services/` — business logic (propertyService, authService, ragService, embeddingService)
- `models/` — Mongoose schemas
- `middleware/` — auth, validate(zod), errorHandler, rateLimiter, upload
- `utils/` — AppError, asyncHandler, jwt helpers
- `config/` — db connection, env validation (zod), cloudinary, ai clients

## Data Models (core fields)

**User**: name, email (unique), passwordHash, role (`buyer|owner|admin`), phone, avatar, savedProperties[], createdAt
**Property**: title, description, type (`apartment|house|land|commercial`), listingType (`sale|rent`), price, currency, location { address, city, area, geo: [lng, lat] }, beds, baths, sizeSqft, amenities[], images[], videos[], virtualTourUrl, owner (ref User), status (`active|pending|sold|rented`), embedding (vector), embeddingText, avgRating
**Booking**: property (ref), user (ref), type (`visit|reservation|purchase-request`), scheduledAt, status (`pending|confirmed|cancelled|completed`), message, negotiation [{ by, amount, note, at }]
**Review**: property (ref), user (ref), rating (1–5), comment, createdAt — one per user per property
**Conversation**: user (ref), messages [{ role, content, propertyRefs[], at }], preferences (extracted filters)

## API Surface (`/api/v1`)

| Resource | Endpoints |
|---|---|
| auth | POST /register, /login, /refresh, /logout, GET /me |
| properties | GET (search+filters+pagination), POST, GET/:id, PATCH/:id, DELETE/:id, POST/:id/media |
| bookings | POST, GET /mine, GET /owner, PATCH /:id/status, POST /:id/negotiate |
| reviews | POST /properties/:id/reviews, GET same, DELETE /reviews/:id |
| users | GET/PATCH /me, POST /me/saved/:propertyId |
| assistant | POST /chat (SSE), GET /conversations, GET /conversations/:id |
| admin | GET /stats, PATCH /properties/:id/approve, user management |

Search query params: `q, city, type, listingType, minPrice, maxPrice, beds, baths, amenities, near (lng,lat,km), sort, page, limit`.

## RAG Pipeline (detailed)

**Indexing (on property create/update):**
1. Build `embeddingText`: title + description + type + city/area + price + beds/baths + amenities + nearby landmarks.
2. `voyage-3` embedding (1024 dims) → save on document.
3. Atlas Vector Search index `property_vector_index` on `embedding` with filter fields: city, type, listingType, price, beds, status.

**Query flow (`POST /assistant/chat`):**
1. Load conversation history (last ~10 turns).
2. Claude tool-use pass extracts structured filters from the user message (budget, city, beds…). Merge with stored preferences.
3. Embed the user query → `$vectorSearch` (numCandidates 100, limit 8) with metadata pre-filter (status active + extracted filters).
4. Build grounded prompt: system role + retrieved property cards (id, title, price, location, key specs) + history.
5. Claude streams the answer; must only recommend retrieved properties and cite them as `[P:<id>]`. Client renders those ids as property cards.
6. Persist turn + updated preferences.

**Fallbacks:** no vector hits → relax filters once → else honestly say nothing matches and ask a clarifying question. Never invent listings.

## Auth Flow

- Access token (15 min, memory) + refresh token (7 d, httpOnly secure cookie).
- `requireAuth` middleware verifies JWT; `requireRole('owner'|'admin')` for protected routes.
- Passwords: bcrypt, cost 12. Rate-limit auth routes.

## Non-Functional Targets

- p95 API < 300 ms (excluding AI calls); assistant first token < 2 s.
- Lighthouse ≥ 90 performance/accessibility on key pages.
- Mobile-first responsive; images lazy-loaded via Cloudinary transforms.
