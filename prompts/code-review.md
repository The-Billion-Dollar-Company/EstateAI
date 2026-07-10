# Prompt: Code Review

Run before every PR. Uses the code-review skill.

```
Task: Review <the current git diff | branch <name> vs dev | files: <paths>> using the code-review skill.

Context: this implements plans/phase-<N>.md item <X>: "<item text>".

Focus areas for this change: <e.g. auth edge cases / query performance / a11y of new form>

Output the skill's format (verdict, blocking, non-blocking, praise).
Then: apply the blocking fixes yourself, re-run lint/tsc/tests, and show the final verdict.
```

## Variants

**Security-focused** (auth, uploads, assistant endpoints):
```
Review <scope> for security only: input validation, authz (ownership + role, server-side),
rate limiting, injection, secrets/PII in logs or responses, upload validation.
Assume a hostile user with a valid buyer account.
```

**Pre-merge sweep** (end of phase):
```
Review everything changed this phase (git diff dev...HEAD) at the architecture level only:
layering violations, duplicated logic across services/hooks, contract drift from docs/architecture.md,
missing tests by module. Table output, no line-level nits.
```
