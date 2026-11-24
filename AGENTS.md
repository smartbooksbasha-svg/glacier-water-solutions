# Glacier Water Solutions — project memory

Static local-first PWA for a packaged drinking water manufacturer: GST billing, case/bottle stock, production, purchases, expenses, cash/bank, reports, role login, audit log, JSON/PDF/Excel backup.

## Architecture
- `index.html` — app shell; loads vendored jsPDF + local scripts.
- `styles.css` — glacier/cyan design system, responsive drawer, focus-visible states.
- `core.js` — `window.GWS`: localStorage DB (`gws_*`), integer-paise money, GST math, ledger-derived stock, roles/permissions, audit, month lock.
- `ui.js` — all screens, forms, modals, tables, report data.
- `app.js` — boot, auth, hash router, event delegation, save/confirm/cancel actions.
- `backup.js` — JSON restore, SpreadsheetML `.xls`, CSV, jsPDF PDF export.
- `sw.js` / `manifest.webmanifest` / `icons/` — PWA offline shell. Bump `gws-v2` on every release.
- `tests/smoke.mjs` — jsdom full-flow test; `npm test`.

## Commands
- `npm test` — headless smoke + calculation assertions.
- `node --check core.js && node --check ui.js && node --check backup.js && node --check app.js && node --check sw.js` — syntax pass.
- `python3 tools/mkicon.py` — regenerate PWA icons.

## Decisions (2026-11-24/25)
- Static GitHub Pages hosting: no Node/Postgres, client-side calculations openly disclosed in Settings → About.
- Money = integer paise. Stock = opening + ledger deltas; confirm posts, cancel writes reversal.
- Defaults: 300 ml 30/case, 500 ml 24/case, 1000 ml 24/case; GST/HSN/address/GSTIN editable, unapproved by default.
- Roles: owner/admin/accountant/staff; owner setup first run; 5 failed tries = 5 min lock.
- Local data is browser-only; backups are the only portable copy.
- Smoke test stubs `HTMLAnchorElement.prototype.click` to avoid jsdom navigation noise, and calls `G.boot()` manually because jsdom never fires DOMContentLoaded for eval'd scripts.

## Current state
- 77 jsdom assertions green, syntax checks green, no external runtime hosts.
- LIVE: https://smartbooksbasha-svg.github.io/glacier-water-solutions/ — all key assets verified 200, offline cache `gws-v2`.
- Repo: `smartbooksbasha-svg/glacier-water-solutions` (main, commits c4b3685 → a778bad → 920c8e8).
- NEXT: Shan ke auditor se rates/GSTIN/address/opening balances confirm karke company settings update karna.
