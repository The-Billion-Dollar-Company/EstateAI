# Figma MCP

Lets Claude read Figma files — frames, layers, styles, exact values — so designs translate to code without eyeballing screenshots. Pairs with the `figma-review` skill.

## Setup (official Figma Dev Mode MCP)

1. Figma desktop app → Preferences → enable Dev Mode MCP Server (requires a Dev/Full seat on the file).
2. Server runs locally at `http://127.0.0.1:3845/mcp`.

```bash
claude mcp add --transport http figma http://127.0.0.1:3845/mcp
```

Alternative (API-based, works headless): community `figma-developer-mcp` with a personal access token:

```bash
claude mcp add figma -e FIGMA_API_KEY=${FIGMA_TOKEN} -- npx -y figma-developer-mcp --stdio
```

Token from Figma → Settings → Security → Personal access tokens. Keep it in your shell env, never committed.

## Usage

```
Using the figma MCP, pull frame "Property Detail / Desktop" from <file link>
and implement it per the figma-review skill (map values to our tokens, flag deviations).
```

## Workflow rules

- Figma frame = layout truth; `docs/design-system.md` = styling truth (figma-review skill arbitrates).
- Pull exact values via MCP rather than guessing from exported PNGs.
- If the team isn't using Figma, skip this server entirely.
