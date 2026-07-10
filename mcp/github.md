# GitHub MCP

PRs, issues, reviews, and repo queries without leaving Claude Code. Supports the workflow in `docs/development-workflow.md`.

## Setup

Official remote server (OAuth, easiest):

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
# then /mcp in a session → authenticate
```

Alternative (PAT, local):

```bash
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_TOKEN} -- npx -y @modelcontextprotocol/server-github
```

PAT scopes: `repo`, `read:org`. Env var only — never in `.mcp.json`.

Note: `gh` CLI covers most of this too; the MCP is optional if everyone has `gh` installed and authed.

## Uses

- Open PRs matching the template: `Create a PR from feat/booking-panel into dev, fill the checklist from docs/development-workflow.md, include screenshots I attach.`
- Review incoming PRs: `Fetch PR #14, review with the code-review skill, post the review as comments.`
- Track plan items as issues: `Create issues for each unchecked item in plans/phase-5.md, label phase-5.`
- Release notes at phase end from merged PR titles.

## Rules

- Claude drafts, human merges — never auto-merge to main/dev.
- PR descriptions must reference the plan item (traceability for the capstone report).
