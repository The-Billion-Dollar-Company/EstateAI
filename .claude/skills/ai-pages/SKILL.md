---
name: ai-pages
description: Design and build AI-facing pages and features — the assistant page, AI touchpoints across the app, prompt UX, and trust/transparency patterns.
---

# AI Pages

Patterns for surfacing EstateAI's intelligence. The main assistant page is covered by `rag-ui`; this skill covers AI UX everywhere else + page-level design.

## AI touchpoints across the app

- **Search empty state**: "No matches — describe what you want and I'll find it" → deep-links to assistant with the query prefilled.
- **Detail page**: "Ask about this property" chip → opens assistant scoped to that property (context passed as hidden system context).
- **Landing teaser**: live-looking demo card cycling 2–3 example Q→A pairs (static content, honest — no fake typing of real data).
- **Dashboard (owner)**: AI-suggested listing description generator inside PropertyForm (draft → owner edits → owner saves; never auto-publish AI text).

## Trust & transparency rules

1. Label AI clearly: assistant messages carry an "AI" badge; generated descriptions marked "AI-drafted" until edited.
2. Ground everything: recommendations always show the actual PropertyRecCard — users click through to verify. No unverifiable claims ("best deal in Dhaka").
3. Honest failure: no results → say so + ask a clarifying question. Provider down → friendly outage note, search still works (project-rules.md).
4. User control: editable preferences extracted by the AI shown as removable chips ("Budget: under ৳30k/mo ✕").
5. Never fake latency or fake confidence. Stream real tokens.

## Page design language for AI surfaces

Subtle differentiation, not sci-fi: sparkle icon (lucide `Sparkles`), primary-teal accents, soft `bg-secondary` message surfaces. No glowing gradients, no robot illustrations. AI features look native to the design system.

## Empty/onboarding states

First visit to assistant: 3–4 tappable example prompts spanning use cases (rent + budget + area, buy + family needs, invest). Examples must return real results in the seeded dev DB — test them.
