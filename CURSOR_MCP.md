# Cursor MCP – Playwright (browser)

This project includes **Playwright MCP** so the AI agent can drive a browser (navigate, snapshot pages, interact) — useful to debug **http://localhost:4200** when `npm start` is running.

## What was added

- **`.cursor/mcp.json`** – registers the `@playwright/mcp` server via `npx`.

## Setup on your machine

1. **Restart Cursor completely** (quit and reopen) so MCP config is loaded.
2. Open **Cursor Settings → MCP** and confirm **playwright** appears and is enabled (first launch may download the package).
3. If tools fail with missing browsers, run once in a terminal:
   ```bash
   npx playwright install chromium
   ```
   (Or follow any error message from `@playwright/mcp`.)

## Using it with this app

1. In a terminal at the project root:
   ```bash
   npm install
   npm start
   ```
2. Wait until the dev server shows **http://localhost:4200**.
3. Ask the agent to open that URL and check the page (e.g. errors, blank screen).

## Notes

- MCP runs **on your machine**; it does not replace fixing firewall/WSL/network issues.
- Project config is merged with **`~/.cursor/mcp.json`** (global). Project entries take priority where applicable.
- Do **not** commit secrets into `mcp.json`; this file only uses `npx` + public npm package.

## Official reference

- [Cursor – MCP](https://cursor.com/docs)
- [npm – @playwright/mcp](https://www.npmjs.com/package/@playwright/mcp)
