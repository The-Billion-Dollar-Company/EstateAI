# Coding Standards

## TypeScript (both sides)

- `strict: true`, `noUncheckedIndexedAccess: true`. No `any` — use `unknown` + narrowing; if unavoidable, comment why.
- Shared API types in `server/src/types` mirrored to `client/src/types` (or a shared package later). zod schemas are the source of truth: `type X = z.infer<typeof xSchema>`.
- Prefer `interface` for object shapes, `type` for unions/utilities.
- No enums; use `as const` objects + union types.
- Explicit return types on exported functions.

## Naming

- Components/types: `PascalCase`. Functions/vars: `camelCase`. Constants: `SCREAMING_SNAKE`. Files: components `PropertyCard.tsx`, everything else `kebab-case.ts`.
- Hooks start with `use`. Booleans read as predicates: `isLoading`, `hasError`, `canEdit`.
- Handlers: `handleX` in component, `onX` as prop.

## React (client)

- Function components only. Props typed inline or `interface Props`. Destructure props in signature.
- Keep components < ~200 lines; extract subcomponents/hooks past that.
- Server state: TanStack Query only (`useQuery`/`useMutation` wrapped in `src/hooks/queries/`). No fetch in components. Client state: Zustand for cross-cutting (auth, ui), `useState` for local.
- Derive, don't sync: no `useEffect` to copy props into state.
- Lists: stable keys (ids, never index).
- Co-locate: `PropertyCard.tsx` + `PropertyCard.test.tsx` together.

## Express (server)

- Route → controller → service → model. Controllers never touch Mongoose directly; services never touch `req/res`.
- All async handlers wrapped in `asyncHandler`; throw `AppError(status, message)` — the error middleware is the only place that sends error responses.
- Validate every body/query/params with zod via `validate(schema)` middleware.
- Response shape always `{ success, data }` or `{ success: false, error: { message, code } }`.
- No business logic in routes files. No console.log — use the `logger` util (pino).

## Imports & Structure

- Path aliases: `@/` = `src/` on both sides.
- Import order: node/external → aliases → relative. Enforced by eslint-plugin-import.
- Barrel files only for `components/ui` (shadcn).

## Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. Scope optional: `feat(search): map view toggle`.
- Small commits, working state. Never commit `.env`, `node_modules`, build output.

## Quality Gates (before any phase is "done")

1. `npm run lint` clean (eslint + prettier)
2. `npx tsc --noEmit` clean
3. Tests pass; new logic has tests (services and hooks minimum)
4. No TODOs without a linked issue comment
