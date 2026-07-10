---
name: dashboard
description: Build dashboard views — stats, tables, management screens for buyers, owners, and admins. Use for anything under /dashboard routes.
---

# Dashboard

Three role dashboards share `DashboardLayout` (sidebar + content, role-aware nav). Density is higher than public pages: borders over shadows, `p-4` cards, `text-sm` tables.

## Views per role

**Buyer**: saved properties grid, my bookings (upcoming/past tabs), my reviews, profile settings.
**Owner**: stats row (active listings, pending requests, total views, avg rating), listings table, booking requests table, add/edit property wizard.
**Admin**: platform stats, listing approval queue, user management table, reported reviews.

## Patterns

- **StatCard**: label, big value, delta w/ trend icon (green up / red down), optional sparkline later. Grid `sm:grid-cols-2 lg:grid-cols-4`.
- **Tables**: shadcn Table + server-side pagination/sorting via TanStack Query (`useOwnerListings({ page, sort })`). Columns: essential data + StatusBadge + row actions in DropdownMenu (⋯). Mobile: collapse to card list (responsive skill).
- **Row actions**: Edit navigates; Delete/Deactivate → ConfirmDialog; status changes optimistic w/ rollback toast.
- **PropertyForm wizard** (owner): steps basics → location (map pin drag) → media (MediaUploader) → amenities → review. Per-step zod validation; draft persisted to store so refresh doesn't lose work; final submit creates listing (status `pending` until admin approval).
- **Approval queue** (admin): card list w/ property preview, approve/reject + reason; mutations invalidate both admin and public queries.
- **Empty states**: every table/grid gets one with a CTA ("No listings yet — Add your first property").

## Guards

Routes wrapped in `<RequireRole>`; server enforces the same (client checks are cosmetic — project-rules.md). Never render admin nav items to non-admins.

## Data freshness

Booking requests poll (`refetchInterval: 30_000`) so owners see new requests; everything else on-focus refetch defaults.
