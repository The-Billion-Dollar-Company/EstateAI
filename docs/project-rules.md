# Project Rules

Hard rules for Claude Code and human contributors. CLAUDE.md summarizes these; this is the authoritative list.

## Process

1. Work phase-by-phase from `plans/`. A phase is done only when its checklist and the quality gates in `coding-standards.md` pass.
2. Before implementing UI, read `design-system.md` + `ui-guidelines.md`. Before backend, read `architecture.md`.
3. Check `component-library.md` before creating any component; extend before you create.
4. When a decision isn't covered by docs, propose it in the PR/commit description — don't silently invent conventions.
5. Keep docs current: schema change → update architecture.md; new component → component-library.md; new pattern → the relevant doc.

## Scope Discipline

- Build only what the current phase asks. No speculative features, no extra abstraction layers, no premature optimization.
- Feature must map to a proposal objective (auth, listings, search, maps, booking, reviews, RAG assistant, dashboards).
- Don't add dependencies without a note justifying them; prefer stdlib/existing deps.

## Safety & Data

- Never commit secrets; `.env.example` documents every env var (name + comment, no values).
- Sanitize all user HTML/markdown; escape by default.
- Rate-limit auth and assistant endpoints. Cap assistant tokens per request.
- Uploaded media validated: type whitelist, size ≤ 10 MB image / 100 MB video.
- Roles enforced server-side always — client-side checks are cosmetic.
- User data deletable (account deletion cascades bookings/reviews anonymization).

## AI-Specific Rules

- Assistant must never invent listings — only recommend retrieved property ids.
- All LLM prompts live in `server/src/services/prompts/` as versioned template files, not inline strings.
- Log token usage per request (cost tracking for the capstone report).
- Graceful degradation: if AI provider is down, search still works; assistant shows a friendly outage message.

## Quality Bars

- TypeScript strict, lint clean, tests green — non-negotiable per commit to `main`.
- Lighthouse ≥ 90 (performance + a11y) on landing, search, detail before deployment phase closes.
- Every page usable at 360 px width and keyboard-only.

## Forbidden

- `any` without justification comment, `// @ts-ignore` without explanation
- Direct DOM manipulation in React, `dangerouslySetInnerHTML` without sanitizer
- Business logic in controllers or components
- CSS files per-component (Tailwind only), inline `style=` except dynamic values
- `console.log` in committed server code (use logger)
- Committing to `main` directly once Phase 4 starts (branch + PR)
