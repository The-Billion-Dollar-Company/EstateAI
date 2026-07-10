# MCP Servers

Model Context Protocol servers extend Claude Code with external tools. Config lives in `.mcp.json` at repo root (project-scoped, committed) or `~/.claude.json` (personal).

## Recommended for this project

| Server | Purpose | When |
|---|---|---|
| context7 | Up-to-date library docs (React, Mongoose, shadcn…) | always on |
| playwright | Browser automation, screenshots for UI verification | Phase 4+ |
| github | PRs, issues, reviews from the CLI | Phase 3+ |
| figma | Pull designs if the team makes Figma mocks | optional |
| browser | General web browsing/fetching | optional |
| sequential-thinking | Structured step-by-step reasoning for complex tasks | optional |

Setup per server: see the matching .md file in this folder.

## Quick start

```bash
# add project-scoped (writes .mcp.json — commit it)
claude mcp add context7 --scope project -- npx -y @upstash/context7-mcp
claude mcp add playwright --scope project -- npx -y @playwright/mcp@latest

# verify
claude mcp list
```

Inside a session, `/mcp` shows server status and available tools.

## Rules

- Project-scoped servers in `.mcp.json`; personal tokens NEVER in `.mcp.json` — use env var expansion (`${GITHUB_TOKEN}`) and set the var in your shell.
- Don't add servers speculatively; each one adds tool-selection noise. Add when a phase needs it.
- If a server misbehaves, `claude mcp remove <name>` and file it in team notes.
