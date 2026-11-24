# Glacier Water Solutions — PRD v1.1

## Product vision
One dependable workplace for a packaged drinking-water manufacturer to replace scattered Excel: correct GST invoices, traceable stock in cases and bottles, production records, ledgers and auditor-ready exports.

## Goals
1. Create/confirm invoices with configurable price, discount and GST; unique FY-wise numbering.
2. Keep stock accurate in bottles + cases, derived from a movement ledger.
3. Record production, rejects and raw-material consumption; post finished stock.
4. Track customers, suppliers, expenses, cash/bank, capital and drawings.
5. Produce daily/monthly/auditor reports with PDF/Excel/CSV export.
6. Role-based login, complete audit log, backup/restore, month lock.

## Target users & stories
- **Owner / Super Admin** — full access, settings, users, approvals, reopen locked month, backup/restore, audit log.
- **Admin** — daily sales, purchase, stock, production, expenses, reports; no owner settings.
- **Accountant** — invoices, ledgers, GST reports, reconciliation, exports, month review; no user management.
- **Staff** — assigned data entry only (sales/production); no financial reports or settings.

Typical stories: "As owner I set opening stock and GST rates before go-live" · "As staff I bill 5 cases and stock drops by 150 bottles of 300ml" · "As accountant I export the GST summary for the auditor" · "As owner I see who cancelled an invoice and why".

## Functional requirements
- Masters: products (300/500/1000 ml, bottles/case 30/24/24), raw materials, customers, suppliers, expense heads — all editable.
- Sales: customer, items, quantity in case/bottle, rate, discount, intra/inter GST (CGST+SGST or IGST), round-off, payment mode, due date, PDF, history, cancel/reversal with reason.
- Purchase: supplier bill no./date, items, GST input, freight/other, payment status, proof attachment, stock posting on confirm.
- Inventory: opening stock, ledger of every movement, adjustments, damage/leakage/expiry/wastage, returns, low-stock alert.
- Production: date, size, batch, good/rejected bottles, raw-material usage, finished-goods posting, registers.
- Accounts: customer/supplier ledgers, cash book, bank book, receipts/payments, capital, drawings, expense register.
- Reports: daily sales, purchase register, stock summary/ledger, production register, ledgers, cash/bank, expenses, GST summary, monthly management report; date filters.
- Control: unique IDs, audit log for create/edit/cancel/payment/permission/login/backup, month review lock + admin reopen reason, no silent deletion of posted entries.
- Backups: JSON full backup + restore; Excel workbook (.xls) of all registers; PDF monthly report, invoice PDF, audit-log PDF.
- Login: one-time owner setup, hashed password, 4 roles, 5-try/5-min lockout, session expiry, visible logout.

## Non-functional / constraints
- Responsive mobile-first; usable offline after first load (installable PWA).
- Self-hosted fonts and PDF library; no CDN at runtime.
- Clear empty/loading/error states; keyboard focus visible; icon buttons labelled.
- All money stored as integer paise; no floating-point totals.
- Demo/sample data must be labelled clearly; real company data only after owner+auditor approval.
- **Deployment reality**: free static Pages has no Postgres/Node API; calculations and auth run in the browser on this build. A server-backed version (Node API + PostgreSQL) remains a documented upgrade path — do not use this static build as the statutory system of record without server validation.

## User flows
1. First run → create owner credentials + company profile → set products, opening stock, GST → start billing.
2. Invoice: select customer → lines → taxable/tax/total preview → Confirm → stock ledger debit + customer receivable + audit entry → PDF.
3. Purchase: bill details → Confirm → stock credit + payable + audit → proof attached.
4. Production: batch form → Confirm → finished stock credit + raw material debit + audit.
5. Month end: accountant reviews → locks month → owner reopens only with reason (audit).
6. Backup: Settings → choose JSON / Excel / PDF → download file with date stamp.

## Edge cases
- Negative stock blocked on confirm; invoice cancel reverses stock once only.
- Duplicate invoice/bill numbers rejected; numbers sequential per financial year.
- Case/bottle conversion never rounds silently; remainder stays as loose bottles.
- Inter-state detected from company state vs customer state, configurable.
- Restoring backup asks for confirmation and re-validates all records.
- Month-locked periods reject new/confirmed entries until reopened.

## Success metrics
- Invoice totals reconcile to ledger; stock summary = opening + in − out for every product.
- Every report export matches on-screen numbers.
- Audit log contains every login and financial mutation.
- Works on a 375px phone without horizontal overflow.

## Out of scope v1
Mobile native app, payment gateway, bank sync, WhatsApp automation, e-invoice/e-waybill, multi-branch, payroll, attendance, advanced costing.
