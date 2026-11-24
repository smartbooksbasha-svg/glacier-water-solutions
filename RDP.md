# Glacier Water Solutions - RDP v2.0

**Document:** Requirements and Design Plan (PRD + TRD + Build Record)

**Version:** 2.0

**Date:** 25 November 2026

**Status:** LIVE - verified and deployed

**Prepared for:** Shan / Glacier Water Solutions

**Owner:** Isthiyaque Basha (smartbooksbasha@gmail.com)

---

## 1. Executive summary

Glacier Water Solutions is a responsive, offline-capable website for a packaged drinking-water manufacturer. It replaces scattered register books and Excel files with one workplace for GST billing, case and bottle stock, production batches, purchases, expenses, cash and bank entries, reports, role-based login, audit history, and backups.

The delivered build is a static local-first PWA on GitHub Pages. It is fully usable after the first load, keeps records in the browser, and exports portable JSON, Excel and PDF files. The original RDP recommended a Node API and PostgreSQL server; that path is documented as the upgrade route for shared multi-device data and statutory use.

Live link and repository are listed in section 11.

## 2. Document control

| Item | Value |
| --- | --- |
| Source RDP | 6-page PDF supplied by Shan on 24 Nov 2026 |
| Source Drive ID | 1HTdY7MUAL9d9QiCqDVD2vryVUXk4Njsi |
| Project folder | /data/data/com.termux/files/home/glacier-water-solutions |
| Live URL | https://smartbooksbasha-svg.github.io/glacier-water-solutions/ |
| Repository | smartbooksbasha-svg/glacier-water-solutions |
| Offline cache | gws-v2 |
| Test result | 77 jsdom assertions green |
| Open approval | GSTIN, address, rates, HSN and opening balances from auditor |

## 3. Product vision and goals

### 3.1 Vision

One dependable workplace where the owner, admin, accountant and staff can record daily water-factory operations and trust the numbers at month end.

### 3.2 Goals

1. Create and confirm GST invoices with configurable price, discount and tax treatment, with unique numbering.
2. Keep stock accurate in bottles and cases, derived from a movement ledger instead of a hand-edited number.
3. Record production batches, rejected bottles and raw-material consumption, then post finished stock.
4. Track customers, suppliers, expenses, cash, bank, capital and drawings.
5. Produce daily, monthly and auditor-ready reports with PDF, Excel and CSV exports.
6. Provide role-based login, a complete audit log, backup and restore, and a month lock.

## 4. Scope

### 4.1 Included in v1

- Company profile with GSTIN, registered address, state, financial year and configurable defaults.
- Masters: products, raw materials, customers, suppliers and expense heads.
- Sales invoices with line items in bottles or cases, discount, CGST/SGST or IGST, round-off and PDF.
- Purchase bills with supplier, GST, freight, other charges, proof reference and stock posting.
- Inventory with opening stock, ledger, adjustments, damage, leakage, expiry, wastage and low-stock alerts.
- Production batches with good and rejected output plus raw-material usage.
- Accounts with customer and supplier ledgers, cash book, bank book, receipts, payments, capital and drawings.
- Reports with date filters: sales, purchase, stock, production, ledgers, expenses, cash and bank, GST summary, monthly management.
- Owner, admin, accountant and staff roles with route and action guards.
- Audit log for login, failure, logout, every financial mutation, cancellation, export, restore and month lock.
- JSON backup and restore, SpreadsheetML Excel workbook, CSV reports and PDF report, invoice and audit log.
- Installable PWA with self-hosted fonts, icons, service worker and offline app shell.
- Responsive layout down to 375 px phone width, visible focus states and labelled icon buttons.

### 4.2 Excluded from v1

Native mobile app, payment gateway, bank sync, WhatsApp automation, e-invoice, e-waybill, multi-branch, payroll, attendance and advanced costing.

## 5. Users and roles

| Role | Main use | Access |
| --- | --- | --- |
| Owner | Full control, setup, settings, users, reopen month, restore, audit | All screens and actions |
| Admin | Daily sales, purchase, stock, production, expenses and reports | Operational screens, no owner settings |
| Accountant | Reconciliation, GST reports, ledgers and exports | Financial screens, no user management |
| Staff | Assigned data entry only | Dashboard, sales, production, inventory and materials |

First run creates the owner account. Passwords are hashed with an iterated WebCrypto digest where available. A session has a 12-hour expiry. Five failed login attempts lock login for five minutes. Every login, failure and logout is audited.

## 6. Functional modules

### 6.1 Sales invoices

Select customer, choose product lines, enter quantity in bottle or case, rate, discount and payment mode. The preview shows taxable value, tax, round-off and grand total before saving. Save creates a draft. Confirm posts the stock ledger and customer receivable. Cancel writes an equal and opposite reversal and records the reason. Duplicate invoice numbers are rejected.

### 6.2 Purchase bills

Record supplier bill number, date, lines, GST, freight, other charges and amount paid. Confirm credits raw material or finished product stock and creates the supplier payable. Proof reference can be stored as a text note or file name.

### 6.3 Inventory

Opening stock is editable before go-live. Every movement is a ledger row with date, product, delta in bottles, type, reference, note and user. Current stock is calculated from opening plus all ledger deltas. Adjustments handle leakage, damage, expiry and corrections. Low-stock alerts use editable thresholds.

### 6.4 Production

Each batch records date, batch number, product, good bottles, rejected bottles and raw-material consumption. Confirm credits finished stock and debits raw materials. Nothing posts from a draft batch.

### 6.5 Accounts

Customer balance equals confirmed invoices minus receipts. Supplier balance equals confirmed purchase bills minus payments. Cash and bank entries record direction, account, category, amount and reference. Expense register records category, mode, amount and note.

### 6.6 Reports and exports

Reports share one date filter. Export options are CSV for single reports, Excel workbook for all registers, and A4 PDF for monthly report, invoice and audit log. On-screen totals and export totals come from the same calculation functions.

## 7. Business rules and calculations

| Rule | Implementation |
| --- | --- |
| Money | Integer paise everywhere; convert at input, format at display |
| Case conversion | bottles = qty x bottles-per-case when unit is case |
| Default case sizes | 300 ml = 30, 500 ml = 24, 1000 ml = 24 |
| Line amount | bottles x rate per bottle |
| Taxable value | Sum of line amounts minus discount |
| Same state | CGST and SGST split the tax equally |
| Different state | IGST carries the full tax |
| Grand total | Taxable plus tax, rounded to nearest rupee |
| Stock | Opening plus sum of ledger deltas |
| Confirm | Posts ledger and balances, writes audit entry |
| Cancel | Writes reversal, sets cancelled, keeps original record |
| Month lock | Locked months reject new posting; owner reopen is audited |

Negative stock is blocked on confirm. Case and bottle conversion never silently rounds: the display shows full cases plus loose bottles. GSTIN, HSN, address and tax rates are editable and remain marked unapproved until the auditor confirms them.

## 8. Data model

Data lives in localStorage under the `gws_` prefix. Main collections are company, settings, users, session, products, materials, customers, suppliers, invoices, purchases, production, expenses, cashbank, ledger, adjust, audit, locks and id sequences.

A JSON backup carries a schema version and all collections. Restore validates arrays and required fields before replacing records. Because the browser is the only store in this build, the exported backup is the portable copy of the business data.

## 9. Technical architecture

| Layer | File | Responsibility |
| --- | --- | --- |
| Shell | index.html | App frame, auth layer, sidebar, modal root |
| Design | styles.css | Glacier tokens, responsive drawer, tables, forms, focus states |
| Rules | core.js | Store, money, GST math, ledger stock, roles, audit, month lock |
| Screens | ui.js | All views, forms, modals and report rendering |
| Actions | app.js | Boot, auth, hash router, event delegation, save and post actions |
| Export | backup.js | JSON restore, Excel XML, CSV and jsPDF PDF |
| Offline | sw.js, manifest.webmanifest, icons | Installable PWA, cached app shell |
| QA | tests/smoke.mjs | jsdom end-to-end flow and calculation checks |

There is no build step. Fonts, PDF libraries and icons are self-hosted so the app works offline after first load. No runtime request goes to an external host.

### 9.1 Why static local-first

Free GitHub Pages cannot run Node or PostgreSQL. No paid backend was supplied. The rules were therefore implemented in one browser and disclosed in Settings. For shared data across devices and statutory system-of-record use, move the same rule functions behind a Node API and PostgreSQL while keeping this UI.

## 10. UI design system

The look uses a cool glacier/cyan palette and a compact professional layout. Colors are slate `#0B2230`, white surface `#FFFFFF`, cyan accent `#0E7490`, with separate success, warning and danger colors. Display type is Space Grotesk 700; body type is Work Sans 400 and 500. Icons are inline SVG, not emoji. Sidebar navigation groups Work, Masters, Accounts and Control. On phones the sidebar becomes a drawer. Tables scroll or wrap cleanly and touch targets stay at least 42 px.

## 11. Deployment and live status

| Item | Value |
| --- | --- |
| Live URL | https://smartbooksbasha-svg.github.io/glacier-water-solutions/ |
| Repository | https://github.com/smartbooksbasha-svg/glacier-water-solutions |
| Branch | main |
| Pages source | main branch root, legacy build |
| Offline cache | gws-v2 |
| Last verified | 25 Nov 2026 - all key assets returned 200 |

All key assets were verified live: index, styles, core, ui, app, backup, service worker, manifest, fonts, icons and both vendored PDF libraries.

## 12. Verification record

- `npm test` runs `tests/smoke.mjs`: 77 assertions green.
- `node --check` passed for core, ui, backup, app and service worker.
- Smoke test covers first-run setup, company settings, masters, invoice math, confirm, cancel reversal, purchase posting, production consumption, adjustments, expenses, cash, month lock, reports, JSON/Excel/PDF exports, role gating and failed-login audit.
- Static audit found no external runtime hosts in application files.
- Live asset check returned 200 for every key file.

## 13. Known limitations and open approvals

1. Data is per browser. Different devices do not share records unless a backup is moved manually or a server is added.
2. Calculations run in the browser. A server-backed version is required before treating this as the statutory system of record.
3. GSTIN, registered address, state, HSN, tax rates, prices, MRP and opening balances are defaults until the auditor confirms them.
4. No e-invoice, e-waybill or payment gateway in v1.
5. Clearing browser storage removes local data; keep regular JSON backups.

## 14. Upgrade roadmap

1. Node API with PostgreSQL, moving GST math, stock ledger and audit writes server-side.
2. Authentication with server sessions and per-user permissions.
3. Shared multi-device database with nightly backups.
4. E-invoice and e-waybill integration after auditor sign-off.
5. Barcode or QR product scan and WhatsApp report sharing as separate scoped features.

## 15. Acceptance checklist

- Invoice totals reconcile to ledgers.
- Stock summary equals opening plus receipts minus issues for every product.
- Every report export matches on-screen numbers.
- Audit log contains every login and financial mutation.
- Layout works on a 375 px phone without horizontal overflow.
- App installs and opens offline after the first load.
- Owner can export JSON, Excel and PDF backups and restore from JSON.
