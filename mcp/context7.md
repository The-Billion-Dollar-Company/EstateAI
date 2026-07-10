# context7 MCP

Live, version-accurate documentation for libraries — stops Claude from hallucinating outdated APIs (React Router v6 vs v5, Mongoose 8 syntax, current shadcn CLI, TanStack Query v5 signatures).

## Setup

```bash
claude mcp add context7 --scope project -- npx -y @upstash/context7-mcp
```

No API key required (rate-limited free tier; optional key via `CONTEXT7_API_KEY` env for higher limits).

## Usage

Add "use context7" to a prompt, or Claude calls it automatically when tool-enabled:

```
Implement the vector search aggregation in propertyService — use context7 for
current MongoDB Atlas $vectorSearch syntax and Mongoose 8 aggregate typing.
```

Best for: TanStack Query v5 (API changed heavily from v4), Mongoose 8, Atlas Vector Search (new, sparse training data), shadcn CLI commands, framer-motion current API, zod v3/v4 differences.

## Tips

- Pin library + version in the ask: "TanStack Query v5 docs for useInfiniteQuery".
- If Claude's suggestion conflicts with context7 docs, trust context7 (it's current).
