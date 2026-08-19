# EstateAI API — Backend Engineer Guide

This is the reference for everyone building the EstateAI server. It documents the
**full API contract**, every endpoint's **request/response types**, and **how it is
implemented** following the project's layered architecture.

> **Status (updated):** every endpoint below is now **implemented** against an
> in-memory store (`src/data/store.ts`) and covered by supertest specs (40 passing).
> The store is the only module that owns persistence — swap it for Mongoose without
> touching routes/controllers (see §5). The frontend currently consumes the property
> + review reads; the remaining endpoints (auth, bookings, users, assistant, admin)
> are live and ready for the client to wire its stubbed UI (login form, save button,
> booking panel, assistant chat) to. Keep the shapes exact — the client types depend
> on them.
>
> **Demo accounts** (all password `password123`): `admin@estateai.test` (admin),
> `owner@estateai.test` (owner of the "Rahim Chowdhury" seed listings),
> `buyer@estateai.test` (buyer).

---

## 1. Running the server

```bash
cd server
npm install
cp .env.example .env      # fill in values as services come online (all optional today)
npm run dev               # tsx watch → http://localhost:4000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload (tsx watch) |
| `npm run build` | `tsc` + `tsc-alias` → `dist/` |
| `npm start` | Run compiled `dist/index.js` |
| `npm test` | Vitest (supertest integration tests) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run ai-smoke` | Verify Anthropic + Voyage keys (needs keys in `.env`) |

The client (`../client`, port 5173) proxies `/api` → `http://localhost:4000`, so run
both together for end-to-end work.

---

## 2. Conventions (read first — every endpoint follows these)

### Base path

All routes live under **`/api/v1`**. Example: `GET /api/v1/properties`.

### Response envelope

Every response — success or error — uses this shape (`ApiResponse<T>` on the client,
`client/src/lib/api.ts`):

```ts
// Success
{
  "success": true,
  "data": T,                       // the payload (object or array)
  "meta"?: { ... }                 // pagination / totals, list endpoints only
}

// Error
{
  "success": false,
  "error": { "message": string, "code": string }
}
```

**Never** return a bare array or object. Always wrap in `{ success, data }`.

### List pagination `meta`

List endpoints return `meta` alongside `data`:

```ts
{
  "success": true,
  "data": Property[],
  "meta": { "total": 42, "page": 1, "limit": 12, "totalPages": 4 }
}
```

### Error codes

Throw `AppError(statusCode, message, code)` from anywhere; the central error
middleware (`src/middleware/error-handler.ts`) formats the response. Codes in use:

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | zod rejected the body/query/params (thrown automatically by `validate`) |
| 401 | `UNAUTHORIZED` | missing/invalid access token |
| 403 | `FORBIDDEN` | authenticated but wrong role |
| 404 | `NOT_FOUND` / `PROPERTY_NOT_FOUND` | resource missing |
| 409 | `CONFLICT` | duplicate (e.g. email already registered) |
| 429 | `RATE_LIMITED` | rate limiter tripped |
| 500 | `INTERNAL_ERROR` | uncaught error (never thrown manually) |

Use a specific code per resource where it helps the client (e.g. `PROPERTY_NOT_FOUND`,
`BOOKING_NOT_FOUND`).

### Auth (✅ implemented)

Per `docs/architecture.md`:
- **Access token**: JWT, 15 min, sent as `Authorization: Bearer <token>`.
- **Refresh token**: 7 days, `httpOnly` `Secure` cookie (the client uses
  `withCredentials: true`, so cookies flow automatically).
- Middleware: `requireAuth` (verifies JWT) and `requireRole('owner' | 'admin')`.
- Passwords: bcrypt, cost 12. Rate-limit auth routes.

---

## 3. Data model types

These are the exact shapes the frontend expects. Mirror them in
`server/src/types/*` (already done for `Property`/`Review` in `src/types/property.ts`).
zod schemas are the source of truth: `type X = z.infer<typeof xSchema>`.

### Property (✅ live)

```ts
type PropertyType   = 'apartment' | 'house' | 'land' | 'commercial';
type ListingType    = 'sale' | 'rent';
type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented';

interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;                                   // BDT, integer (taka)
  location: { address: string; city: string; area: string };
  beds: number;
  baths: number;
  sizeSqft: number;
  amenities: string[];
  images: string[];                                // absolute URLs (Cloudinary later)
  status: PropertyStatus;
  avgRating: number;                               // 0–5, one decimal
  reviewCount: number;
  owner: { name: string; phone: string };          // public owner card
}
```

> **DB vs API note:** the Mongoose `Property` document (see `docs/architecture.md`)
> has more fields — `geo: [lng, lat]`, `videos[]`, `virtualTourUrl`, `embedding`,
> `embeddingText`, `owner` as an ObjectId ref. The API **projects** the document down
> to the shape above (map `_id` → `id`, populate `owner` → `{ name, phone }`). Do not
> leak `embedding`, `passwordHash`, or internal refs.

### Review (✅ live)

```ts
interface Review {
  id: string;
  propertyId: string;
  userName: string;      // denormalized display name
  rating: number;        // 1–5 integer
  comment: string;
  date: string;          // ISO 8601, e.g. "2026-06-18"
}
```

### User (✅ live)

```ts
type UserRole = 'buyer' | 'owner' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  savedProperties: string[];   // property ids
  createdAt: string;
}
```
Never return `passwordHash`.

### Booking (✅ live)

```ts
type BookingType   = 'visit' | 'reservation' | 'purchase-request';
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface Booking {
  id: string;
  property: string | PropertySummary;   // id, or populated summary for list views
  user: string;
  type: BookingType;
  scheduledAt?: string;                 // ISO, for visits
  status: BookingStatus;
  message?: string;
  negotiation: { by: string; amount: number; note?: string; at: string }[];
  createdAt: string;
}
```

---

## 4. Endpoint reference

### Health

#### ✅ `GET /api/v1/health`
Liveness probe. The client footer shows an "API online/offline" dot from this.

- **Auth:** none
- **Response 200:**
  ```json
  { "success": true, "data": { "status": "ok" } }
  ```

---

### Properties

#### ✅ `GET /api/v1/properties`
Search + filter + sort + paginate. Backs the landing grid, search page, dashboard,
and the assistant's recommendation cards.

- **Auth:** none
- **Query params** (all optional, coerced & validated — see `src/routes/property.routes.ts`):

  | Param | Type | Notes |
  |---|---|---|
  | `q` | string (≤200) | free text over title/description/area/city |
  | `city` | string (≤100) | exact match (case-insensitive) |
  | `type` | `apartment\|house\|land\|commercial` | |
  | `listingType` | `sale\|rent` | |
  | `minPrice` | number ≥0 | |
  | `maxPrice` | number ≥0 | |
  | `beds` | int ≥0 | "N+" — properties with **at least** N beds |
  | `baths` | int ≥0 | at least N baths |
  | `sort` | `newest\|price-asc\|price-desc\|rating` | default `newest` |
  | `page` | int ≥1 | default `1` |
  | `limit` | int 1–50 | default `12` |

  Invalid values → **400 `VALIDATION_ERROR`**.

- **Response 200:**
  ```json
  {
    "success": true,
    "data": [ /* Property[] — only status: "active" */ ],
    "meta": { "total": 9, "page": 1, "limit": 12, "totalPages": 1 }
  }
  ```
- **Contract rule:** the public list returns **active** listings only. `pending`/`sold`/
  `rented` are excluded (owner/admin dashboards will use separate filtered endpoints).

#### ✅ `GET /api/v1/properties/:id`
Single property for the detail page.

- **Auth:** none
- **Response 200:** `{ "success": true, "data": Property }`
- **404 `PROPERTY_NOT_FOUND`** if missing.

#### ✅ `GET /api/v1/properties/:id/reviews`
Reviews for a property.

- **Auth:** none
- **Response 200:** `{ "success": true, "data": Review[] }`
- **404 `PROPERTY_NOT_FOUND`** if the property doesn't exist.

#### ✅ `POST /api/v1/properties`
Create a listing. Backs the owner dashboard "Add property" wizard.

- **Auth:** `requireAuth` + `requireRole('owner' | 'admin')`
- **Body** (zod `createPropertySchema`):
  ```ts
  {
    title: string;                 // 1–150
    description: string;           // 1–5000
    type: PropertyType;
    listingType: ListingType;
    price: number;                 // > 0
    location: { address: string; city: string; area: string; geo?: [number, number] };
    beds: number; baths: number; sizeSqft: number;   // ints ≥ 0
    amenities?: string[];
    images?: string[];             // Cloudinary URLs from the media endpoint
  }
  ```
- **Response 201:** `{ "success": true, "data": Property }` (status defaults to
  `pending` → admin approval, per `docs/architecture.md`).
- On create/update you must **build `embeddingText` + Voyage embedding** and store it
  (RAG indexing — see §6 and `docs/architecture.md`).

#### ✅ `PATCH /api/v1/properties/:id`
Update a listing (owner of the property, or admin).

- **Auth:** `requireAuth` + ownership check (owner === req.user, or admin)
- **Body:** partial of `createPropertySchema`.
- **Response 200:** `{ "success": true, "data": Property }`
- Re-run embedding if any embedding-relevant field changed.
- **403 `FORBIDDEN`** if not owner/admin; **404** if missing.

#### ✅ `DELETE /api/v1/properties/:id`
- **Auth:** `requireAuth` + ownership/admin
- **Response 200:** `{ "success": true, "data": { "id": string } }`

#### ✅ `POST /api/v1/properties/:id/media`
Attach media URLs to a listing. The client uploads directly to Cloudinary (unsigned
preset) and posts the resulting URLs here — this keeps large binaries off the API and
is the pattern implemented today.

- **Auth:** `requireAuth` + ownership/admin
- **Body:** `{ images: string[] }` — 1–20 absolute URLs (validated as URLs).
- **Response 200:** `{ "success": true, "data": { "images": string[] } }`
- *Future:* a `multipart/form-data` variant that streams files server-side to
  Cloudinary (image ≤10 MB, video ≤100 MB, type whitelist per `docs/project-rules.md`).

---

### Reviews

#### ✅ `POST /api/v1/properties/:id/reviews`
Create a review. One per user per property.

- **Auth:** `requireAuth`
- **Body:** `{ rating: number /* 1–5 int */, comment: string /* 1–1000 */ }`
- **Response 201:** `{ "success": true, "data": Review }`
- Recompute the property's `avgRating` + `reviewCount` on write.
- **409 `CONFLICT`** if the user already reviewed this property.

#### ✅ `DELETE /api/v1/reviews/:id`
- **Auth:** `requireAuth` (author or admin)
- **Response 200:** `{ "success": true, "data": { "id": string } }`

---

### Auth

#### ✅ `POST /api/v1/auth/register`
- **Body:** `{ name: string; email: string; password: string /* ≥8 */; role: 'buyer' | 'owner' }`
- **Response 201:** `{ "success": true, "data": { user: User, accessToken: string } }`
  + sets refresh-token cookie.
- **409 `CONFLICT`** if email exists. bcrypt cost 12. **Rate-limit this route.**

#### ✅ `POST /api/v1/auth/login`
- **Body:** `{ email: string; password: string }`
- **Response 200:** `{ "success": true, "data": { user: User, accessToken: string } }`
  + refresh cookie.
- **401 `UNAUTHORIZED`** on bad credentials (don't reveal which field). **Rate-limit.**

#### ✅ `POST /api/v1/auth/google`  — Sign in with Google (Firebase)
Exchanges a Firebase ID token (from the client's Google popup) for our session.
Find-or-creates a `buyer` account keyed by the Google email.

- **Body:** `{ idToken: string }` (the Firebase ID token from `getIdToken()`)
- **Response 200:** `{ "success": true, "data": { user: User, accessToken: string } }`
  + refresh cookie — identical shape to login/register.
- **401 `INVALID_GOOGLE_TOKEN`** if the token fails verification.
- **503 `FIREBASE_NOT_CONFIGURED`** if the server has no `FIREBASE_*` env set.
- Verified server-side with `firebase-admin` (`src/config/firebase.ts`). Requires
  `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (service
  account). The client needs matching `VITE_FIREBASE_*` web config — see
  `client/.env.example`. Both must point at the **same Firebase project**.

#### ✅ `POST /api/v1/auth/refresh`
- Reads refresh-token cookie; issues a new access token.
- **Response 200:** `{ "success": true, "data": { accessToken: string } }`
- **401** if the refresh token is missing/expired.

#### ✅ `POST /api/v1/auth/logout`
- Clears the refresh cookie. **Response 200:** `{ "success": true, "data": { "ok": true } }`

#### ✅ `GET /api/v1/auth/me`
- **Auth:** `requireAuth`. **Response 200:** `{ "success": true, "data": User }`

---

### Users

#### ✅ `PATCH /api/v1/users/me`
- **Auth:** `requireAuth`. **Body:** partial `{ name?, phone?, avatar? }`.
- **Response 200:** `{ "success": true, "data": User }`

#### ✅ `POST /api/v1/users/me/saved/:propertyId`
Toggle a saved property. Backs the `SaveButton` heart (currently local-only).

- **Auth:** `requireAuth`
- **Response 200:** `{ "success": true, "data": { savedProperties: string[] } }`

---

### Bookings

#### ✅ `POST /api/v1/bookings`
Backs the detail-page `BookingPanel` ("Schedule a visit" / "Make purchase request").

- **Auth:** `requireAuth`
- **Body:**
  ```ts
  {
    property: string;                       // property id
    type: 'visit' | 'reservation' | 'purchase-request';
    scheduledAt?: string;                   // ISO, required for type 'visit'
    message?: string;
  }
  ```
- **Response 201:** `{ "success": true, "data": Booking }`

#### ✅ `GET /api/v1/bookings/mine`
Buyer's own bookings. **Auth:** `requireAuth`. → `{ success, data: Booking[] }`

#### ✅ `GET /api/v1/bookings/owner`
Bookings on the owner's listings (dashboard "Booking requests" table).
**Auth:** `requireAuth` + `requireRole('owner' | 'admin')`.

#### ✅ `PATCH /api/v1/bookings/:id/status`
- **Auth:** owner of the property (or admin).
- **Body:** `{ status: 'confirmed' | 'cancelled' | 'completed' }`
- **Response 200:** `{ "success": true, "data": Booking }`

#### ✅ `POST /api/v1/bookings/:id/negotiate`
Append to the negotiation thread.
- **Auth:** buyer or owner on the booking.
- **Body:** `{ amount: number; note?: string }`
- **Response 200:** `{ "success": true, "data": Booking }`

---

### AI Assistant (RAG — phase 6)

#### ✅ `POST /api/v1/assistant/chat`  *(SSE stream)*
Backs the assistant page (currently a canned reply over live listings). Full pipeline
in `docs/architecture.md` §RAG.

- **Auth:** `requireAuth`. **Rate-limit + cap tokens per request.**
- **Body:** `{ conversationId?: string; message: string }`
- **Response:** `text/event-stream`. Stream tokens; the model must **only** recommend
  retrieved property ids and cite them as `[P:<id>]` (the client renders those as
  `PropertyCard variant="compact"`). Never invent listings.
- Persist the turn + updated extracted preferences. Log token usage (cost tracking).

#### ✅ `GET /api/v1/assistant/conversations` and `GET /.../conversations/:id`
List history / load a conversation. **Auth:** `requireAuth`.

---

### Admin

#### ✅ `GET /api/v1/admin/stats`
Dashboard stat cards. **Auth:** `requireRole('admin')`.
→ `{ success, data: { totalUsers, activeListings, pendingApprovals, bookings, ... } }`

#### ✅ `PATCH /api/v1/admin/properties/:id/approve`
Approve a `pending` listing → `active`. **Auth:** `requireRole('admin')`.

#### ✅ Admin user management
List/patch users. **Auth:** `requireRole('admin')`.

---

## 5. How to implement an endpoint

Follow the **route → controller → service → model** layering. Never skip a layer.

```
src/
├── routes/         # path + method + validate() + auth middleware. NO logic.
├── controllers/    # req/res only. Calls a service, wraps result in { success, data }.
├── services/       # ALL business logic. No req/res. Throws AppError.
├── models/         # Mongoose schemas (to add).
├── middleware/     # validate, auth, errorHandler, rateLimiter, upload
├── utils/          # AppError, asyncHandler, jwt helpers, logger
├── config/         # env (zod), db, cloudinary, ai clients
└── types/          # shared API types (mirror to client/src/types)
```

**Rules (from `docs/coding-standards.md`):**
- Controllers **never** touch Mongoose. Services **never** touch `req`/`res`.
- Wrap every async handler in `asyncHandler` so throws reach the error middleware.
- Validate **every** body/query/params with `validate({ ... })` (zod).
- Only the error middleware sends error responses — elsewhere, `throw new AppError(...)`.
- No `console.log` — use `logger` (pino). No `any` without a justifying comment.

### Worked example — the live properties endpoint

**1. Route** (`src/routes/property.routes.ts`) — declare schema, validate, delegate:

```ts
const listQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  type: z.enum(PROPERTY_TYPES).optional(),
  listingType: z.enum(LISTING_TYPES).optional(),
  beds: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  // ...
});

propertyRouter.get('/', validate({ query: listQuerySchema }), listProperties);
```

**2. Controller** (`src/controllers/property.controller.ts`) — req/res only:

```ts
export const listProperties: RequestHandler = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = propertyService.listProperties(
    req.query as unknown as PropertyQuery,
  );
  res.json({
    success: true,
    data: items,
    meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});
```

**3. Service** (`src/services/property.service.ts`) — the logic. Today it filters the
in-memory seed array; **swap this body for Mongoose** without changing the
controller or route:

```ts
export function listProperties(query: PropertyQuery): PropertyListResult {
  // TODAY: filter/sort MOCK_PROPERTIES.
  // NEXT:  const filter = buildMongoFilter(query);
  //        const [items, total] = await Promise.all([
  //          Property.find(filter).sort(...).skip((page-1)*limit).limit(limit).lean(),
  //          Property.countDocuments(filter),
  //        ]);
  //        return { items: items.map(toApiProperty), total, page, limit };
}
```

**4. Register** the router in `src/app.ts`:

```ts
app.use('/api/v1/properties', propertyRouter);
```

**5. Test** (`*.test.ts`, supertest) — cover happy path, filters, validation, 404s.
See `src/routes/property.routes.test.ts` for the pattern (9 specs, all green).

### Migrating from seed data to MongoDB

The service layer is the **only** place that knows about the data source. To go live:
1. Add `src/models/property.model.ts` (Mongoose schema from `docs/architecture.md`).
2. Add a `toApiProperty(doc)` mapper (`_id`→`id`, populate `owner`, drop `embedding`).
3. Replace each service function body with a Mongoose query. Routes, controllers,
   validation, tests, and the frontend stay untouched — the contract is frozen.
4. Point `MONGODB_URI` at Atlas; `src/config/db.ts` already connects on boot.
5. Tests use `mongodb-memory-server` (to add) so they run without a real cluster.

---

## 6. RAG indexing hook (properties → embeddings)

Whenever a property is created or updated, the property service must keep the vector
index current (`docs/architecture.md` §RAG):

1. Build `embeddingText` = title + description + type + city/area + price + beds/baths
   + amenities.
2. `voyage-3` embedding (1024 dims) via the Voyage client → store on the document.
3. Atlas Vector Search index `property_vector_index` on `embedding`, with filter
   fields: `city`, `type`, `listingType`, `price`, `beds`, `status`.

Prompts live as versioned files in `src/services/prompts/` — **never** inline strings.
If the AI provider is down, search must still work and the assistant shows a friendly
outage message (graceful degradation).

---

## 7. Status & what's next

**Done** — all routes below are implemented against the in-memory store and covered
by supertest specs (40 passing): auth (register/login/refresh/logout/me),
properties (search + CRUD + media + reviews), bookings (create/mine/owner/status/
negotiate), users (profile + saved toggle), assistant (SSE chat + conversations),
admin (stats/approve/users). `requireAuth`/`requireRole` guard every protected route.

**Next (to reach production):**
1. **MongoDB + models** — add Mongoose schemas and swap each service function body for
   queries. Routes, controllers, validation, tests, and the frontend stay untouched
   (see §5). Point `MONGODB_URI` at Atlas; add `mongodb-memory-server` for tests.
2. **Real RAG** — replace `assistant.service.retrieve()`'s keyword matcher with the
   Voyage embedding + Atlas `$vectorSearch` + Claude generation pipeline (§6). The SSE
   contract and grounding rule (`[P:<id>]` citations only) already hold.
3. **Cloudinary media** — add the server-side multipart upload variant (§ media).
4. **Client wiring** — connect the stubbed UI (login form → `authStore`, `SaveButton`
   → `/users/me/saved`, `BookingPanel` → `/bookings`, assistant chat → SSE).
5. **Harden** — refresh-token rotation/revocation, per-user rate limits, token-usage
   logging for the assistant (cost tracking).

Every endpoint is "done" only when: lint + `tsc --noEmit` + tests are green, input is
zod-validated, auth/role is enforced server-side, and the response matches the shapes
above.
```
