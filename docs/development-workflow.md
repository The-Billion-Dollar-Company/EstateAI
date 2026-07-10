# Development Workflow

## Branching

- `main` — always deployable. Protected once Phase 4 begins.
- `dev` — integration branch.
- Feature branches off `dev`: `feat/search-filters`, `fix/booking-status`, `docs/api-notes`.
- Merge via PR into `dev`; `dev` → `main` at phase completion.

## Daily Loop

1. Pull `dev`, branch.
2. Pick the next unchecked item in the current `plans/phase-N.md`.
3. Drive Claude Code with a scoped prompt (see docs/prompting-guide.md, templates in prompts/).
4. Run quality gates: `npm run lint`, `npx tsc --noEmit`, `npm test` (both packages as relevant).
5. Manual check in browser (responsive at 360/768/1280, keyboard pass for new UI).
6. Conventional commit, push, PR.

## PR Checklist (template for .github/PULL_REQUEST_TEMPLATE.md)

- [ ] Linked plan item / issue
- [ ] Lint + tsc + tests green
- [ ] Screenshots for UI changes (mobile + desktop)
- [ ] a11y checklist from docs/accessibility.md done
- [ ] Docs updated (component-library / architecture) if applicable
- [ ] Reviewed by at least one teammate (use prompts/code-review.md with Claude first)

## Environments

| Env | Client | Server | DB |
|---|---|---|---|
| local | vite :5173 | nodemon :4000 | Atlas dev cluster (or local mongod) |
| production | Vercel | Render | Atlas prod cluster |

`.env` files per package; `.env.example` kept current. Client env vars prefixed `VITE_`.

## Testing Strategy

- **Server**: Vitest + Supertest. Services unit-tested (mock models); routes integration-tested against mongodb-memory-server. Target: every service function + happy/error path per endpoint.
- **Client**: Vitest + React Testing Library. Test hooks (queries mocked via MSW) and interactive components (forms, filters, chat input). Snapshot tests avoided.
- **RAG**: golden-set eval in `server/src/services/__tests__/rag.eval.ts` — 15 fixed queries with expected property ids; retrieval hit-rate ≥ 80% asserted. Run manually, not in CI (API cost).
- **E2E (Phase 7)**: Playwright — auth flow, list property, search+filter, book visit, assistant chat happy path.

## CI (GitHub Actions, added Phase 3)

On PR: install → lint → tsc → unit tests, both packages, node 20. Block merge on failure.

## Team Conventions (5 members)

- Feature ownership per proposal objectives; rotate reviews.
- Weekly sync against `plans/` progress; update checkboxes in the plan files (they're the single progress tracker).
- Blockers > 1 day get raised, not sat on.
