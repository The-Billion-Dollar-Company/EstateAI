# Phase 8 — Deployment

**Goal**: production URLs live, secure, and demo-ready for the defense.

Targets: client → Vercel, server → Render, DB → Atlas (per CLAUDE.md). Free tiers suffice.

## Tasks

### Prep
- [ ] Production env audit: every var in `.env.example` has a prod value planned; secrets generated fresh (JWT secrets, not dev values)
- [ ] Production builds verified locally: `npm run build` both; server runs from `dist/`
- [ ] CORS: server allowlist = exact Vercel domain; cookies `secure` + `sameSite=none` verified for cross-origin refresh flow
- [ ] Atlas: production cluster/db, network access rules (Render IPs / 0.0.0.0 + strong auth), vector index recreated, seed prod with demo dataset

### Deploy
- [ ] Render: web service from repo (`server/`), env vars, health check path `/api/v1/health`, note cold-start behavior of free tier
- [ ] Vercel: project from `client/`, `VITE_API_URL` → Render URL, SPA rewrite rule (all routes → index.html)
- [ ] Custom domain if desired; HTTPS verified both ends
- [ ] CI: deploy on merge to `main` (Vercel automatic; Render auto-deploy)

### Verification (production smoke)
- [ ] Full journey matrix (phase 7 list) run against production URLs
- [ ] Assistant works in prod (API keys valid, SSE not buffered by proxy — verify streaming visually)
- [ ] Media upload → Cloudinary works in prod
- [ ] Lighthouse on prod URLs (real-world numbers for the report)
- [ ] Load sanity: ~20 concurrent search requests (simple script) — no errors

### Demo readiness
- [ ] Seed data curated for the defense demo (attractive photos, realistic Dhaka listings, data that makes the AI shine)
- [ ] Demo script written: 5-minute walkthrough hitting every objective from the proposal
- [ ] Backup plan: local run instructions + screen recording of full demo in case of venue internet failure

## Exit criteria

- [ ] Production URLs stable through a full rehearsal demo; rollback understood (redeploy previous commit)
