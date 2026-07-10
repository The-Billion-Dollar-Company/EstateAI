# Prompting Guide (for driving Claude Code on this repo)

How to get the best results building EstateAI with Claude Code. Reusable templates live in `prompts/`.

## Golden Rules

1. **One phase, one feature at a time.** "Implement phase-4 step 3 (search results page)" beats "build the frontend".
2. **Point at docs, don't repeat them.** "Follow docs/design-system.md and use PropertyCard from component-library.md" keeps prompts short and consistent.
3. **State the definition of done.** Include acceptance criteria: "done when `npm run lint && npx tsc --noEmit && npm test` pass and the page matches ui-guidelines.md".
4. **Give context files.** Mention exact paths to edit/reference so Claude doesn't search blindly.
5. **Ask for a plan first on big tasks.** "Plan the booking feature: list files you'll create/change and the API contract. Wait for my OK." Then approve.
6. **Iterate visually.** For UI: build → screenshot (playwright MCP) → critique against docs → refine. See `prompts/design-critique.md`.

## Prompt Skeleton

```
Task: <one sentence>
Context: read <files>; relevant plan: plans/phase-N.md step X
Constraints: <stack rules, docs to follow>
Done when: <checks/behavior>
```

## Examples

**Good** — "Implement `GET /api/v1/properties` with filters from docs/architecture.md (API Surface table). Route→controller→service per coding-standards.md. zod-validate query params. Add supertest coverage for filter combos. Done when lint/tsc/tests pass."

**Bad** — "Make the property search work."

**Good (UI)** — "Build PropertyCard per component-library.md spec. Tokens from design-system.md only, hover per animation-system.md, a11y per accessibility.md (save button aria-label). Add all three variants + a test."

## Session Hygiene

- Start sessions with `/init`-style context: Claude reads CLAUDE.md automatically — verify it mentions the current phase, update the "current phase" note as you progress.
- Use `/clear` between unrelated tasks; long unfocused sessions degrade quality.
- Commit after every working increment so Claude (and you) can roll back.
- When Claude drifts from conventions, don't hand-fix silently — tell it which doc rule was violated so the pattern sticks; if it recurs, tighten the doc.

## Skill Triggers

The `.claude/skills/` folder auto-loads expertise. Mention the domain to trigger: "use the rag-ui skill", "apply the code-review skill to server/src/services". Skills reference the docs — keeping docs accurate keeps skills accurate.
