---
name: debugging
description: Systematically find and fix bugs. Use when something is broken, throwing errors, rendering wrong, or behaving unexpectedly on client or server.
---

# Debugging

No guess-and-check patching. Find the root cause, prove it, then fix it.

## Procedure

1. **Reproduce**: exact steps/request that triggers it. Can't reproduce → gather more info, don't "fix" blind.
2. **Read the actual error**: full stack trace bottom-up; the first frame in our code is the lead.
3. **Locate**: binary-search the path — does the API return bad data (test with curl/supertest) or does the client mishandle good data (log at the hook)? Recent git diff is suspect #1.
4. **Hypothesize → verify**: one hypothesis, one targeted check (log, debugger, isolated test). Confirmed → fix. Not confirmed → next hypothesis. Never fix what you haven't confirmed.
5. **Fix root cause**, add a regression test that fails before / passes after.
6. **Clean up**: remove debug logs; check the same bug class elsewhere.

## Project-specific hot spots

- **401 loops**: refresh-token flow — check cookie flags (httpOnly/secure/sameSite), axios interceptor retry logic.
- **Stale UI after mutation**: missing query-key invalidation; check `query-keys.ts` usage.
- **Vector search empty**: index name mismatch, embedding dims (1024), filter field not in index, `status: active` pre-filter excluding everything.
- **SSE broken**: proxy buffering (Vite dev proxy config), missing `res.flushHeaders()`, client not handling `[DONE]`.
- **Map bugs**: Leaflet needs explicit container height; markers need `[lat, lng]` while GeoJSON is `[lng, lat]` — classic swap.
- **CORS**: credentials + exact origin allowlist, not `*`.
- **Mongoose**: `lean()` docs lack methods/virtuals; ObjectId vs string comparisons.

## Escalation

Stuck after 3 disproven hypotheses → step back, write down what's known/unknown, and re-derive assumptions (often the bug is in an assumption, not the code you're staring at).
