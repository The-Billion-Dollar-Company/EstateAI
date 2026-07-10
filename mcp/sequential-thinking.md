# Sequential Thinking MCP

Gives Claude a structured scratchpad for multi-step reasoning — decompose, revise, branch — useful on genuinely complex tasks where single-pass answers go wrong.

## Setup

```bash
claude mcp add sequential-thinking --scope project -- npx -y @modelcontextprotocol/server-sequential-thinking
```

## When to invoke (say "use sequential thinking" in the prompt)

- Designing the RAG pipeline details (chunking/embedding strategy, filter extraction, fallback logic)
- Debugging cross-layer bugs (client + API + DB + vector index interactions)
- Migration/refactor planning across many files
- Phase planning: turning a proposal objective into ordered implementable steps

## When NOT to

Routine CRUD endpoints, styling, single-file changes — the overhead adds tokens without adding quality. Claude Code's native extended thinking ("think hard") is often enough; try that first.

## Example

```
Use sequential thinking to design the negotiation feature: model changes,
state machine for offer/counter/accept/decline, API endpoints, notification
strategy, and edge cases (concurrent offers, expired listings). Output a
plan I can approve before you write code.
```
