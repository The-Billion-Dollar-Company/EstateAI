# Phase 6 — AI Recommendation System (RAG)

**Goal**: the conversational assistant recommends real seeded properties from natural-language queries, streaming, with citations. The capstone's centerpiece — budget the most time here.

Pipeline spec: architecture.md "RAG Pipeline (detailed)". UI spec: rag-ui + ai-pages skills.

## Tasks

### Indexing
- [ ] `embeddingService`: buildEmbeddingText(property) — canonical text per architecture.md; unit-tested formatting
- [ ] Voyage client wrapper (retry, timeout, cost logging); embed on property create/update (async, non-blocking to the request), delete handling
- [ ] Backfill script: embed all seeded properties; verify count in Atlas
- [ ] Verify `property_vector_index` returns sane neighbors for 5 manual probes

### Retrieval
- [ ] Filter extraction: Claude tool-use pass → zod-validated FilterSet (budget, city/area, type, listingType, beds, amenities); merge with conversation preferences
- [ ] `$vectorSearch` query (numCandidates 100, limit 8) + metadata pre-filter (status active + FilterSet)
- [ ] Relax-once fallback → honest "no match + clarifying question" path; never fabricate
- [ ] Golden-set eval: 15 queries → expected ids, hit-rate ≥ 80% (`rag.eval.ts`, run manually)

### Generation
- [ ] Prompt templates in `services/prompts/` (versioned files): system prompt (grounding rules, `[P:<id>]` citation format, tone, refusal of out-of-scope asks)
- [ ] `ragService.chat()`: history (≤ 10 turns) + retrieved cards → Claude streaming call
- [ ] SSE endpoint `POST /assistant/chat` (flush headers, heartbeat, abort handling); rate-limited + token-capped; usage logged per request
- [ ] Conversation model: persist turns, propertyRefs, extracted preferences; list/get endpoints
- [ ] Graceful degradation when AI provider errors (project-rules.md)

### Assistant UI (rag-ui skill is the spec)
- [ ] ChatLayout + ConversationSidebar + SuggestedPrompts (verified against seed data)
- [ ] useChatStream hook (SSE reader, abort); chatStore
- [ ] Streaming states 1–6 from the skill; citation parsing → PropertyRecCard inline; markdown rendering (sanitized)
- [ ] AI touchpoints: search empty state → assistant deep link; detail page "Ask about this property"
- [ ] A11y: role=log, announcements, keyboard send

## Exit criteria

- [ ] Demo script passes: "family apartment near schools in Uttara under ৳35k/mo" → streamed reply citing 3+ real seeded properties as cards
- [ ] Golden-set hit-rate ≥ 80%; provider-down path shows friendly error; lint/tsc/tests green
