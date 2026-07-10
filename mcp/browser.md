# Browser MCP

General web browsing/fetching for research — reading docs pages, checking competitor UX (Zillow/Airbnb patterns), verifying deployed site behavior.

## Options

**Playwright MCP already covers this** — it can navigate any URL and extract content. Prefer reusing it over adding another server:

```
Using playwright, open https://tanstack.com/query/latest/docs and summarize
the useInfiniteQuery API for our infinite property scroll.
```

**Fetch MCP** (lightweight, no browser) for plain page-to-markdown:

```bash
claude mcp add fetch -- npx -y @modelcontextprotocol/server-fetch
```

**Claude in Chrome / Browser extension** — if using Claude's browser extension, no MCP config needed here.

## Recommendation for this project

Skip a dedicated browser server; use playwright (already required for screenshot-review) + Claude Code's built-in WebFetch/WebSearch. Add fetch-mcp only if token-heavy page dumps become a problem.

## Uses

- Research competitor property-card/filter UX before design work
- Read library docs not covered by context7
- Smoke-check the deployed Vercel/Render URLs after Phase 8 deploys
