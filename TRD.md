# Glacier Water Solutions — Technical Spec (TRD)

## Stack (chosen for free static hosting)
Vanilla HTML/CSS/JS single-page app, no build step; GitHub Pages at `/<repo>/`; localStorage under prefix `gws_`; installable PWA (manifest + service worker). PDF via vendored jsPDF UMD (+ autotable); Excel via SpreadsheetML 2003 XML written in JS (opens in Excel/LibreOffice); fonts self-hosted woff2.

## Why not Node API + PostgreSQL here
RDP section 8 recommends a server. Free GitHub Pages cannot run Node or Postgres, and no paid backend/account was supplied. This build is a fully functional **local-first** version: all rules run in one browser. For multi-device shared data and statutory use, upgrade path = Node API + Postgres with the same rule functions moved server-side. This limitation is shown in the app's Settings → About.

## Storage keys
`gws_company`, `gws_users`, `gws_session`, `gws_products`, `gws_materials`, `gws_customers`, `gws_suppliers`, `gws_invoices`, `gws_purchases`, `gws_stock`, `gws_production`, `gws_expenses`, `gws_cashbank`, `gws_ledger`, `gws_adjust`, `gws_audit`, `gws_locks`, `gws_settings`, `gws_idseq`.

## Core rules
- Money = integer paise. Rate input paise; display Rs with 2 decimals.
- `bottles = qty * (unit==='case' ? product.bpc : 1)`; cases display = `Math.floor(bottles/bpc)` + loose remainder.
- Invoice line amount = bottles × ratePerBottle (case rate configurable as `priceCase`, converted to per-bottle when selected).
- Taxable = sum(line amounts) − discount (paise). Same state → CGST+SGST halves; different state → IGST. Round-off to nearest rupee on grand total.
- Stock is derived: `opening + Σ ledger.deltaBottles`; ledger entry = {date, productId, deltaBottles, type, ref, note, user}.
- Only `confirm()` posts ledger/balances; `cancel()` writes equal-opposite reversal entries and sets status `cancelled`.
- Customer balance = invoices (net) − receipts; supplier balance = purchases (net) − payments.
- Month lock: `gws_locks` YYYY-MM with reviewer + note; entries in locked months blocked; reopen by owner logs audit.

## Auth model
First-run owner setup; PBKDF2-ish iterated SHA-256 via WebCrypto where available, with sync fallback for jsdom/tests; session token + expiry (12h) stored hashed in user record; roles checked on every route/action; 5 failed tries = 5-min lockout. Owner email configurable in Settings. Audit every login/logout/failure.

## Backup formats
- JSON: full snapshot with schema version `1`; restore validates arrays and required fields.
- Excel `.xls`: SpreadsheetML with worksheets Sales, Purchases, Stock, Production, Customers, Suppliers, Expenses, CashBank, Audit, Summary.
- PDF: jsPDF A4 with autotable — invoice, monthly management report, audit log.

## UI tokens
```
--bg:#F3F7F9; --surface:#FFFFFF; --ink:#102A38; --ink-2:#5B7381;
--accent:#0E7490; --accent-2:#0B5E75; --line:#DBE7EC;
--ok:#0F7B52; --warn:#A86A00; --danger:#BE3B34;
--sidebar:#0B2230; --radius:14px; --radius-sm:9px;
--space-1:4px; --space-2:8px; --space-3:16px; --space-4:24px; --space-5:48px;
--container:1440px;
```
Type: display/h2/numbers Space Grotesk 700; body Work Sans 400/500; fluid `clamp()` scale. ≤3 colors + statuses on screen.

## File map
`index.html` shell · `styles.css` tokens+layout+components · `app.js` state/rules/routes/UI · `vendor/jspdf.umd.min.js`, `vendor/jspdf.plugin.autotable.min.js` · `fonts/*.woff2` · `sw.js`, `manifest.webmanifest`, `icons/*` · `tests/smoke.mjs` · `tools/*`.

## Verification
`npm test` = jsdom smoke: boot, owner setup, product/customer master, invoice calc + stock posting, cancel reversal, purchase/production, report filters, audit entries, backups (JSON/Excel/PDF blob creation), role gates, mobile DOM sanity.
