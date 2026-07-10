# EstateAI — Project Brain

AI-powered Real Estate Management & Property Recommendation Platform (CSE 400 capstone, BUBT). Users buy, sell, rent, and manage properties; an AI assistant recommends properties from natural-language queries using RAG.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State/Data | TanStack Query (server), Zustand (client) |
| Routing | React Router v6 |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (Mongoose) |
| Vector store | MongoDB Atlas Vector Search |
| AI | Claude API (generation), Voyage AI (embeddings) |
| Auth | JWT (access + refresh), bcrypt |
| Maps | Leaflet + OpenStreetMap |
| Media | Cloudinary (images/videos) |
| Testing | Vitest + React Testing Library, Supertest |
| Deploy | Vercel (client), Render (server), Atlas (DB) |

## Repository Layout

```
EstateAI/
├── client/          # React app (src/components, src/pages, src/hooks, src/lib, src/stores)
├── server/          # Express API (src/routes, src/controllers, src/models, src/services, src/middleware)
├── docs/            # All standards & guidelines — READ BEFORE CODING
├── plans/           # Phase-by-phase build plans (phase-1 … phase-9)
├── prompts/         # Reusable task prompts
├── mcp/             # MCP server setup notes
└── .claude/         # Settings + skills
```

## Core Features

1. Auth: register/login, roles (buyer, owner, admin), JWT refresh flow
2. Listings: CRUD for properties, image/video upload, virtual tours
3. Search: filters (price, location, type, beds/baths), map view, sorting
4. Booking: visit scheduling, reservations, purchase requests, negotiation
5. Reviews: property ratings and comments
6. AI Assistant: RAG-powered conversational property recommendations
7. Dashboards: user, owner, and admin views

## Rules (non-negotiable)

- Read `docs/project-rules.md` and `docs/coding-standards.md` before writing code.
- TypeScript strict mode everywhere. No `any` without a comment justifying it.
- Follow phase plans in `plans/` sequentially — don't skip ahead.
- UI work must follow `docs/design-system.md` and `docs/ui-guidelines.md`.
- Every API route: validated input (zod), auth middleware where needed, consistent error shape.
- Never commit secrets. All config via `.env` (see `.env.example`).
- Prefer editing existing files over creating new ones; keep components under ~200 lines.
- Write/update tests for every feature before marking a phase complete.

## Key Commands

```bash
# client
cd client && npm run dev | build | lint | test
# server
cd server && npm run dev | build | lint | test
```

## API Conventions

- Base path `/api/v1`. REST: `GET/POST /properties`, `GET/PATCH/DELETE /properties/:id`, etc.
- Response shape: `{ success, data, error?, meta? }`
- Errors: central error middleware, typed AppError class, proper HTTP codes.

## RAG Pipeline (summary — details in docs/architecture.md)

1. On listing create/update → build canonical text → Voyage embedding → store in Atlas Vector Search index.
2. Query: user message → embed → vector search (top-k, with metadata filters) → Claude generates grounded recommendation with property citations.
3. Assistant endpoint: `POST /api/v1/assistant/chat` (streaming via SSE).

## Where to Look

| Need | File |
|---|---|
| System design, ERD, RAG detail | `docs/architecture.md` |
| Visual language, tokens | `docs/design-system.md` |
| Page/UX patterns | `docs/ui-guidelines.md` |
| Motion rules | `docs/animation-system.md` |
| A11y checklist | `docs/accessibility.md` |
| Code style | `docs/coding-standards.md` |
| Component inventory | `docs/component-library.md` |
| Git/branch/PR workflow | `docs/development-workflow.md` |
| How to prompt Claude Code | `docs/prompting-guide.md` |
| Current phase tasks | `plans/phase-N-*.md` |
