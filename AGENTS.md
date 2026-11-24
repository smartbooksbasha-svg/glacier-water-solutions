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
- RDP PDF delivered 2026-11-25: `RDP.md` -> `RDP.tex` -> `RDP.pdf` (17 pages), saved to `~/storage/shared/Download/GLACIER-WATER-SOLUTIONS-RDP.pdf`.
- **RDP v3.0 RECEIVED (2026-11-25)**: Shan ne 8-page new spec PDF bheja (Drive ID `1u8CZiNkEIFqKJWEfnm6cXEWfagPj2YnJ`), saved as `RDP-v3.0-source.pdf` and `~/storage/shared/Download/GLACIER-WATER-SOLUTIONS-RDP-v3.pdf`. Ye v2 local-first ko TARGET spec ke taur par supersede karta hai, par abhi IMPLEMENTED NAHI.
- v3 targets: cloud-hosted shared PostgreSQL, React+TS+Vite frontend, Node+TS REST API, server-side totals/tax/stock/permissions/audit, DB transactions + idempotency, private object storage, automated encrypted backups, staging+production. 6 roles: owner, admin, accountant, sales staff, production staff, read-only auditor. 9 nav groups: Overview, Sales (quotation->order->invoice/challan/returns/receipts), Purchase (PO->GRN->bill/returns), Inventory (batches, expiry, counts, FEFO), Manufacturing (BOM, plans, batches, costing), Quality (tests, hold/release, traceability), Delivery (dispatch, POD, returnables), Accounts (journals, assets, trial balance, P&L, balance sheet), Reports + Administration. Phase gates 0-6; migration must export/reconcile every v2 browser backup first. GST rules, HSN, rates, opening balances, quality tests and hosting details still need owner/auditor sign-off.
- NEXT: v3 build shuru karne se pehle cloud hosting/DB choice + credentials/auditor approvals chahiye; tab tak v2 live app read-only archive samajhna.
