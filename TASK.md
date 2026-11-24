GOAL: Build and ship complete Glacier Water Solutions website: billing, stock, production, accounts, GST reports, role-based audit login, JSON/PDF/Excel backups.

PLAN: PROJECT_PLAN.md · PRD.md · TRD.md

- [x] 1. Read RDP, write PRD/TRD/plan/TASK
- [x] 2. Set up project folders, tokens, fonts, vendored PDF library
- [x] 3. index.html shell: sidebar/topbar, login screen, all view containers
- [x] 4. styles.css: glacier design system + responsive drawer + tables/forms
- [x] 5. app.js foundation: store, seed, router, auth, audit, helpers
- [x] 6. Masters: products, raw materials, customers, suppliers, expense heads
- [x] 7. Sales invoices: create/confirm/cancel, GST math, PDF, stock posting
- [x] 8. Purchases: bill entry, proof, stock posting, payable
- [x] 9. Inventory: opening stock, ledger, adjustments, returns, low-stock
- [x] 10. Production + raw materials: batches, rejects, consumption, posting
- [x] 11. Expenses + cash/bank + accounts: receipts, payments, capital, drawings
- [x] 12. Dashboard: KPI bento, alerts, recent activity, quick actions
- [x] 13. Reports: registers, ledgers, GST, monthly; date filters + CSV
- [x] 14. Users/Settings: roles, company, tax/FY config, month lock, audit viewer
- [x] 15. Backups: JSON download/restore, Excel workbook, PDF report/invoice/audit
- [x] 16. PWA: manifest, service worker, icons, offline
- [x] 17. Tests: jsdom smoke + calculation assertions (77 green)
- [x] 18. Responsive + accessibility + QA checklist pass
- [x] 19. Commit, create GitHub repo, enable Pages, deploy
- [x] 20. Verify live URL/assets, report to Shan

KEY DECISIONS: static local-first PWA on GitHub Pages (no Node/Postgres on free hosting); integer-paise money; stock derived from ledger; client-side calculations honestly disclosed; glacier slate + cyan design.

NOW: complete and LIVE at https://smartbooksbasha-svg.github.io/glacier-water-solutions/ — 77 tests green, cache gws-v2, all assets 200.
