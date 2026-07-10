# Phase 9 — Maintenance & Future Enhancement

**Goal**: keep production healthy through the defense; document future work credibly for the report.

## Tasks

### Monitoring & upkeep
- [ ] Uptime check on both URLs (UptimeRobot free) + Render/Vercel dashboards reviewed weekly
- [ ] Watch AI spend: token-usage logs reviewed; alert threshold agreed (kill-switch env var `ASSISTANT_ENABLED` exists)
- [ ] Weekly dependency audit: `npm audit` both packages; patch criticals only (no upgrades near the defense)
- [ ] Bug triage: defects found post-deploy → issues → fix via bug-fixing prompt; re-run affected E2E
- [ ] DB backups: Atlas automated backups confirmed on

### RAG quality loop
- [ ] Review real assistant conversations weekly (sampled, anonymized): failed retrievals → extend golden set → tune embeddingText/filters
- [ ] Re-run `rag.eval.ts` after any prompt/pipeline change; hit-rate must not regress

### Capstone deliverables
- [ ] Final report chapters fed from repo artifacts: requirements (phase 1 docs), design (architecture.md, ERD, wireframes), implementation (per-phase summaries), testing (test-report.md), results (Lighthouse + eval numbers)
- [ ] Defense slides + rehearsed demo script (phase 8)
- [ ] README.md polished: overview, screenshots, setup, live URLs, team credits

### Future enhancements (document, don't build)
Price-trend prediction, saved-search alerts (email/notifications), in-app owner↔buyer chat, payments/escrow integration, mobile app (React Native), Bangla language support in the assistant, image-based search ("find apartments that look like this"), SSR/Next migration for SEO.

## Exit criteria

- [ ] Production stable through defense day; report + slides done; future-work section written
