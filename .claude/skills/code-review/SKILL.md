---
name: code-review
description: Review code changes against EstateAI standards. Use when asked to review a diff, PR, file, or feature before merging.
---

# Code Review

Review like a strict but constructive senior engineer. Standards: `docs/coding-standards.md`, `docs/project-rules.md`, `docs/accessibility.md`.

## Procedure

1. Understand intent: which plan item / feature is this? Does the change match its scope (no scope creep, nothing missing)?
2. Read the diff fully before commenting.
3. Check in this order — correctness → security → standards → design → nits.

## Checklist

**Correctness**: edge cases (empty lists, unauthenticated, non-owner), error paths throw AppError, async handled (no floating promises), race conditions in mutations.
**Security**: input validated (zod), authz server-side (ownership + role), no secrets/PII in logs, injection-safe queries, rate limits on new public endpoints.
**Standards**: layering respected (controller/service split, no fetch in components), types honest (no `any`/casts), naming, response shape, conventional commit.
**UI (if applicable)**: tokens only, states (loading/empty/error/focus), responsive, a11y checklist, component-library.md updated.
**Tests**: new logic covered, tests assert behavior not implementation, error paths tested.

## Output format

```
## Review: <scope>
**Verdict**: ✅ approve | 🔶 approve with nits | ❌ needs changes

### Blocking
- [file:line] issue → suggested fix
### Non-blocking
- ...
### Praise
- (one thing done well — always find it)
```

Every blocking comment must include a concrete fix. If > 5 blocking issues, stop and summarize the pattern instead of listing 30 instances.
