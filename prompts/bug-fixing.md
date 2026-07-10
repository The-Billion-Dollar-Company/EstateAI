# Prompt: Fix a Bug

Uses the debugging skill — root cause first, no blind patches.

```
Task: Fix this bug using the debugging skill.

Observed: <what happens — exact error message / wrong behavior>
Expected: <what should happen>
Repro steps: <steps / request / URL / user role>
Started after (if known): <commit / feature / "unknown">
Environment: <local dev | production, browser, role logged in as>

Process (do not skip steps):
1. Reproduce it and confirm you can trigger it reliably.
2. Locate: is it server (prove with a direct request/test) or client (prove at the hook/component)?
3. State your root-cause hypothesis and the evidence BEFORE writing the fix.
4. Fix the root cause (not the symptom), minimal diff.
5. Add a regression test that fails without the fix.
6. Check for the same bug class elsewhere in the codebase and report.

Done when: repro steps now show expected behavior, regression test green, lint/tsc/tests pass, debug logging removed.
```

If you cannot reproduce: say so, list what info/access you need, and add targeted logging instead of guessing a fix.
