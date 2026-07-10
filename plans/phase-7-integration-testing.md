# Phase 7 — Integration & Testing

**Goal**: everything works together as one product. Bugs found and fixed, performance acceptable, quality proven.

## Tasks

### Integration
- [ ] Remove all MSW/mock remnants; client runs fully against the real API
- [ ] Full-journey manual test matrix (each teammate owns journeys):
  - visitor: browse → search → filter → map → detail
  - buyer: register → save property → book visit → review after completion
  - buyer: assistant chat → recommendation → detail → purchase request → negotiate
  - owner: register → create listing (wizard) → get approved → manage requests → confirm visit
  - admin: approve listing → view stats → manage user
- [ ] Log every defect as an issue; fix via `prompts/bug-fixing.md`; zero known criticals to proceed

### E2E automation (Playwright)
- [ ] Test setup: seeded test DB, test users per role
- [ ] Specs: auth flow, search+filter, booking happy path, listing creation, assistant chat happy path (mock AI provider in E2E to avoid cost/flakiness)
- [ ] Wire into CI (chromium only)

### Hardening
- [ ] Security pass (`prompts/code-review.md` security variant) on auth, uploads, assistant; fix findings
- [ ] Cross-browser: Chrome, Firefox, Safari (or iOS Safari via device); 360 px pass on real phone
- [ ] Full a11y audit (accessibility skill) on all routes; axe criticals = 0
- [ ] Performance pass (performance skill): Lighthouse ≥ 90 perf+a11y on landing/search/detail; budgets from the skill met; fix top offenders
- [ ] Error monitoring: server logs structured; unhandled rejection handlers; client ErrorBoundary reporting hook

### Docs
- [ ] Update architecture.md / component-library.md for anything that drifted during build
- [ ] Record test results summary → `docs/research/test-report.md` (feeds capstone report's testing chapter)

## Exit criteria

- [ ] All journey matrix rows pass; E2E suite green in CI; Lighthouse + a11y targets met; zero known critical/major defects
