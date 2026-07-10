---
name: react
description: Write idiomatic React 18 with hooks, TanStack Query, Zustand, and React Router. Use when building components, pages, hooks, or state logic in client/.
---

# React

Follow `docs/coding-standards.md` React section. Key enforcement points:

## Data & state

- Server data: TanStack Query hooks in `src/hooks/queries/` (e.g., `useProperties(filters)`, `useProperty(id)`, `useCreateBooking()`). Components never call axios/fetch directly.
- Query keys: `['properties', filters]`, `['property', id]` — centralize in `src/lib/query-keys.ts`.
- Mutations: invalidate related keys; optimistic updates for save-heart and review submission.
- Client state: Zustand stores (`authStore`, `uiStore`, `chatStore`) — small, action-based, no derived data stored.
- Local UI state stays in `useState`. Derive instead of syncing with `useEffect`.

## Components

- Pages in `src/pages/` do data fetching + composition; presentational components receive props.
- < 200 lines; extract hooks (`usePropertyFilters`) and subcomponents when growing.
- Props: typed interface, destructured in signature, sensible defaults.
- Stable keys; memoize only after measuring (React DevTools profiler), not by habit.

## Routing (React Router v6)

- Routes defined once in `src/App.tsx` (or `routes.tsx`): public, auth-required (`<RequireAuth>`), role-gated (`<RequireRole role="owner">`).
- URL is state for search: filters live in searchParams (`useSearchParams`), so results are shareable/bookmarkable.
- Lazy-load route components (`React.lazy`) for dashboard and assistant routes.

## Effects discipline

`useEffect` is for synchronizing with external systems (SSE subscription, map instance, document title) — not for data fetching (Query does it) or state derivation. Every effect: dependency array complete, cleanup returned.

## SSE / chat specifics

Assistant streaming handled in a `useChatStream` hook: fetch-based SSE reader, appends tokens to `chatStore`, aborts on unmount/new message.
