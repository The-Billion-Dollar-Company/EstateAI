---
name: express
description: Build Express + TypeScript API endpoints, middleware, and services. Use when working in server/ — routes, controllers, services, Mongoose models, auth, validation, error handling.
---

# Express

Follow `docs/architecture.md` (structure, API surface) and `docs/coding-standards.md` (Express section).

## Layering (strict)

```
routes/property.routes.ts    → paths + middleware chain only
controllers/property.controller.ts → parse req, call service, shape res
services/property.service.ts → business logic, DB via models
models/property.model.ts     → Mongoose schema + indexes
```

Controllers never import models. Services never see `req/res`.

## Endpoint recipe

```ts
// route
router.post('/', requireAuth, requireRole('owner'), validate(createPropertySchema), propertyController.create);
// controller
export const create = asyncHandler(async (req, res) => {
  const property = await propertyService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: property });
});
// errors — throw, never res.json errors inline
if (!property) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
```

## Must-haves per endpoint

1. zod schema in `schemas/` — body, params, query all validated.
2. Auth middleware where architecture.md requires it; ownership checks in the service (owner can only edit own listings).
3. Response `{ success, data }`; pagination meta: `{ page, limit, total, totalPages }`.
4. Supertest coverage: happy path + 401/403 + validation 400.

## Mongoose

- Indexes declared in schema (text index on title/description; 2dsphere on location.geo; compound on city+type+price).
- `lean()` for read queries; select `-passwordHash -embedding` by default.
- Transactions only where truly multi-doc (booking confirm + property status).

## Security defaults

helmet, cors (allowlist client origin), express-rate-limit (tight on /auth and /assistant), mongo-sanitize, JWT per architecture.md auth flow. Multer + Cloudinary for uploads with type/size validation.
