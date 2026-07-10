# Phase 3 — Environment Setup

**Goal**: both apps run locally with CI, linting, and all external services connected. "Hello world" end to end.

## Tasks

### Repo & tooling
- [x] Init git repo, `dev` branch, `.gitignore` (node, env, builds), PR template from development-workflow.md
- [x] `client/`: Vite + React + TS (`npm create vite@latest client -- --template react-ts`)
- [x] `server/`: Express + TS (tsx for dev, tsconfig strict, pino logger)
- [x] Shared configs: eslint (+import order, a11y plugins), prettier (+tailwind plugin), strict tsconfig both sides
- [x] Path aliases `@/ → src/` (vite + tsconfig + tsc-alias server side)
- [x] Vitest wired on both; one passing smoke test each
- [x] GitHub Actions: lint + tsc + test per package on PR (workflow added; green run pending first push)

### Client foundations
- [x] Tailwind + tokens from design-system.md in `index.css` + `tailwind.config.ts` (incl. dark mode class strategy)
- [x] shadcn/ui init + install the primitives list from component-library.md
- [x] React Router skeleton: AppShell, Header/Footer stubs, route table from phase 2, 404 page
      (note: phase 2 never wrote a route table into ui-guidelines.md — proposed skeleton: `/`, `/search`, `/properties/:id`, `/assistant`, `/login`, `/register`, `/dashboard`, `*`)
- [x] TanStack Query provider + axios instance (`/api/v1`, interceptors stub); Zustand `uiStore`
- [x] Fonts (Inter via fontsource), lucide-react

### Server foundations
- [x] Express app: helmet, cors, json, pino-http, rate limiter, central error middleware + AppError, `asyncHandler`
- [x] Env validation with zod (`config/env.ts`); `.env.example` complete
- [ ] MongoDB Atlas: cluster, dev DB, connection module; mongodb-memory-server for tests
      (connection module done — `src/config/db.ts`; Atlas cluster + mongodb-memory-server pending: needs an Atlas account)
- [x] `GET /api/v1/health` returns `{ success: true, data: { status: 'ok' } }`
- [x] Vite dev proxy `/api → :4000`; client page shows health check result (proves the pipe)

### External services (create accounts, keys in .env only)
- [ ] Cloudinary account + upload preset
- [ ] Anthropic API key; Voyage AI key (test both with a tiny script `server/scripts/ai-smoke.ts`)
      (script written — `npm run ai-smoke`; keys pending: needs accounts)
- [ ] Atlas Vector Search: create `property_vector_index` (1024 dims, cosine; filter fields per architecture.md)

## Exit criteria

- [ ] `npm run dev` both packages → styled placeholder page showing live health check
- [ ] CI green on a test PR; lint/tsc/test all pass; ai-smoke script prints an embedding size + a Claude reply
