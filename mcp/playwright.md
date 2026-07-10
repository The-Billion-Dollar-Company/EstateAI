# Playwright MCP

Drives a real browser: navigate, click, type, screenshot, read console/network. This is how Claude SEES the UI it builds — required by the `screenshot-review` skill and invaluable for debugging.

## Setup

```bash
claude mcp add playwright --scope project -- npx -y @playwright/mcp@latest
# first run downloads browsers; or: npx playwright install chromium
```

## Core uses in this project

**1. Visual verification (every UI task)**
```
Dev server is on http://localhost:5173. Screenshot /properties at 360, 768 and 1280 wide,
then critique per the screenshot-review skill.
```

**2. Interaction testing**
```
Open /properties, open the filter sheet, set max price 30000, screenshot the result,
confirm the URL contains maxPrice=30000 and the grid updated.
```

**3. Debugging**
```
Open /assistant, send "2 bed in Mirpur", capture console errors and the /assistant/chat
network request/response, and diagnose why no property cards render.
```

**4. E2E flows (Phase 7)** — draft Playwright test specs from recorded interactions.

## Tips

- Keep the dev server running yourself; Claude shouldn't own long-lived processes.
- Auth-gated pages: create a seeded test user and let Claude log in through the UI, or expose a dev-only login shortcut.
- Screenshot full page (`fullPage: true`) for landing; viewport-only for component checks.
