---
name: refactoring
description: Safely restructure existing code without changing behavior. Use when splitting large components, extracting hooks/services, removing duplication, or paying down tech debt.
---

# Refactoring

Behavior-preserving changes only. New features never ride along in a refactor commit.

## Procedure

1. **Safety net first**: ensure tests cover current behavior; if not, write characterization tests before touching anything.
2. **Small steps, green between each**: one rename/extraction per step, `tsc` + tests after each. Commit at each stable point (`refactor: extract usePropertyFilters`).
3. **Verify no behavior change**: same outputs, same API responses, same rendered UI (screenshot compare for UI refactors).

## Common refactors in this codebase

- **Fat component (>200 lines)** → extract: data logic to a hook, JSX chunks to subcomponents, config/constants out of the body.
- **Repeated JSX 3+** → component with variant props (check component-library.md first).
- **Fat controller** → move logic into the service; controller returns to ~10 lines.
- **Duplicated service logic** → shared helper in `services/shared/` or util.
- **Prop drilling > 2 levels** → composition (children/slots) before context; context before store.
- **Copy-pasted zod fragments** → shared schema parts (`paginationSchema`, `objectIdSchema`).

## Boundaries

- Public API routes and response shapes are contracts — refactor internals freely, changing contracts is a feature change requiring architecture.md update.
- Don't "improve" naming/style in files you aren't otherwise touching (noise diffs).
- Don't introduce abstractions for a single use case; rule of three.

## Output

Summarize: what moved where, why, and proof of no behavior change (tests green, tsc clean).
