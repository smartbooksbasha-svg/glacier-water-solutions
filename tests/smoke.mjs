import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

const dom = new JSDOM(read('index.html'), {
  url: 'https://glacier.test/', runScripts: 'outside-only', pretendToBeVisual: true
});
const { window } = dom;
const D = window.document;
window.scrollTo = () => {};
window.matchMedia = () => ({ matches:false, addListener(){}, removeListener(){} });
window.HTMLAnchorElement.prototype.click = function () {};
const saved = [];
window.jspdf = { jsPDF: class {
  setFillColor(){} rect(){} setTextColor(){} setFont(){} setFontSize(){} text(){} addPage(){}
  save(n){ saved.push(n); }
} };
try { window.URL.createObjectURL = () => 'blob:test-download'; } catch (e) {}

for (const f of ['core.js','ui.js','backup.js','app.js']) window.eval(read(f));
const G = window.GWS, U = G.ui, B = G.backup;
if (!G.booted) G.boot();
let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); n++; };
const $ = (sel) => D.querySelector(sel);
const setv = (name, val) => {
  const root = D.getElementById('modalRoot');
  const el = (root && root.querySelector(`[name="${name}"]`)) || D.querySelector(`[name="${name}"]`);
  assert.ok(el, `missing field ${name}`);
  el.value = String(val);
  return el;
};
const act = (name, attrs = {}) => {
  const fn = G.ACTS[name];
  assert.ok(fn, `missing action ${name}`);
  const el = { dataset:{ ...attrs }, getAttribute(){ return null; } };
  fn(el, { target:el, preventDefault(){} });
};
const clickAct = (name) => {
  const el = D.querySelector(`[data-act="${name}"]`);
  assert.ok(el, `missing button ${name}`);
  el.click();
};

/* 1. first run + setup */
ok($('#authLayer').hidden === false, 'auth screen visible on first run');
ok(/Set up Glacier/.test($('#authLayer').textContent), 'owner setup form shown');
$('#auName').value = 'Shan Owner';
$('#auEmail').value = 'owner@glacier.test';
$('#auPass').value = 'ownerpass123';
$('#auPass2').value = 'ownerpass123';
act('do-setup');
eq(G.db.users.length, 1, 'owner created');
eq(G.currentRole(), 'owner', 'session role owner');
ok($('#authLayer').hidden === true, 'auth hidden after setup');
ok(G.db.audit.some(a => a.action === 'Owner setup'), 'setup audited');

/* 2. company settings through real modal */
clickAct('edit-company');
ok(!!D.querySelector('[data-form="company"]'), 'company modal opened');
setv('gstin', '33AABCG1234K1Z5');
setv('state', 'Tamil Nadu');
act('save-company');
eq(G.db.company.gstin, '33AABCG1234K1Z5', 'GSTIN saved');
eq(G.db.company.needsSetup, false, 'setup flag cleared');

/* 3. masters through UI */
G.go('inventory'); U.render('inventory');
clickAct('new-product');
setv('name', '500 ml PET');
setv('bpc', 24);
setv('priceBottle', '8');
setv('priceCase', '172.80');
setv('opening', 1200);
setv('lowAt', 240);
act('save-master-product', { id:'' });
eq(G.db.products.length, 4, 'product added');
const p500 = G.db.products.find(p => p.name === '500 ml PET');
eq(p500.bpc, 24, 'bottles per case');
eq(G.stockBottles(p500.id), 1200, 'opening stock in bottles');
eq(G.stockLabel(p500.id), '50 cases + 0 bottles', 'case/bottle display');

G.go('customers'); U.render('customers');
clickAct('new-customer');
setv('name', 'Test Customer');
setv('phone', '9876543210');
setv('gstin', '');
setv('state', 'Tamil Nadu');
setv('opening', '0');
act('save-master-customer', { id:'' });
eq(G.db.customers.length, 1, 'customer added');
const cust = G.db.customers[0];
eq(cust.opening, 0, 'customer opening paise');

G.go('suppliers'); U.render('suppliers');
clickAct('new-supplier');
setv('name', 'Test Supplier'); setv('state', 'Tamil Nadu'); setv('opening', '0');
act('save-master-supplier', { id:'' });
eq(G.db.suppliers.length, 1, 'supplier added');

/* 4. invoice math + stock posting + reversal */
G.go('sales'); U.render('sales');
clickAct('new-invoice');
const line = D.querySelector('[data-line="invoice"]');
assert.ok(line, 'invoice line rendered'); n++;
line.querySelector('[name="lProduct"]').value = p500.id;
line.querySelector('[name="lUnit"]').value = 'case';
line.querySelector('[name="lQty"]').value = '10';
line.querySelector('[name="lRate"]').value = '8';
setv('customerId', cust.id);
setv('taxMode', 'auto');
setv('discount', '0');
setv('paid', '0');
act('save-invoice');
eq(G.db.invoices.length, 1, 'invoice saved');
const inv = G.db.invoices[0];
eq(inv.lines[0].bottles, 240, '10 cases x 24 = 240 bottles');
eq(inv.taxable, 240*800, 'taxable in paise');
eq(inv.cgst + inv.sgst, Math.round(240*800*18/100), 'intra-state CGST+SGST');
eq(inv.igst, 0, 'no IGST intra-state');
eq(inv.total, Math.round((inv.taxable + inv.cgst + inv.sgst + inv.igst)/100)*100, 'invoice grand total with round off');
eq(inv.round, inv.total - (inv.taxable + inv.cgst + inv.sgst + inv.igst), 'round off recorded');
eq(G.stockBottles(p500.id), 1200, 'draft invoice does not move stock');
const conf = G.confirmInvoice(inv.id);
ok(conf.ok, 'invoice confirm succeeded: ' + conf.msg);
eq(G.stockBottles(p500.id), 960, 'stock fell by 240 bottles');
eq(G.customerBalance(cust.id), inv.total, 'customer receivable matches invoice');
ok(G.db.audit.some(a => a.action === 'Invoice confirmed'), 'confirmation audited');
const canc = G.cancelInvoice(inv.id, 'test return');
ok(canc.ok, 'invoice cancelled with reversal');
eq(G.stockBottles(p500.id), 1200, 'reversal restored stock');
eq(G.customerBalance(cust.id), 0, 'receivable cleared');
eq(G.db.invoices[0].status, 'cancelled', 'status cancelled');

/* 5. purchase confirmation posts material stock */
G.go('purchase'); U.render('purchase');
clickAct('new-purchase');
setv('no', 'SUP/TEST/1');
setv('supplierId', G.db.suppliers[0].id);
const pl = D.querySelector('[data-line="purchase"]');
ok(!!pl, 'purchase line rendered');
const itemTypeSel = pl.querySelector('[name="lItemType"]');
itemTypeSel.value = 'material';
itemTypeSel.dispatchEvent(new window.Event('change', { bubbles:true }));
pl.querySelector('[name="lItem"]').value = 'mat-cap';
pl.querySelector('[name="lQty"]').value = '500';
pl.querySelector('[name="lRate"]').value = '0.50';
pl.querySelector('[name="lGst"]').value = '18';
setv('freight', '0'); setv('other', '0'); setv('paid', '0');
act('save-purchase');
eq(G.db.purchases.length, 1, 'purchase bill saved');
ok(G.confirmPurchase(G.db.purchases[0].id).ok, 'purchase confirmed');
eq(G.stockBottles('mat-cap','material'), 500, 'caps stock credited');
ok(G.supplierBalance(G.db.suppliers[0].id) > 0, 'supplier payable positive');

/* 6. production + raw material consumption */
G.go('production'); U.render('production');
clickAct('new-production');
setv('batch', 'B-TEST-1');
setv('productId', p500.id);
setv('good', '480');
setv('rejected', '20');
const cl = D.querySelector('[data-line="consumption"]');
cl.querySelector('[name="lMaterial"]').value = 'mat-cap';
cl.querySelector('[name="lQty"]').value = '480';
act('save-production');
eq(G.db.production.length, 1, 'batch saved');
ok(G.confirmProduction(G.db.production[0].id).ok, 'batch confirmed');
eq(G.stockBottles(p500.id), 1680, 'finished stock credited 480');
eq(G.stockBottles('mat-cap','material'), 20, 'caps consumed 480');

/* 7. adjustments, expense, cash */
G.go('inventory'); U.render('inventory');
clickAct('new-adjust');
setv('itemType', 'product'); setv('productId', p500.id); setv('delta', '-10'); setv('type', 'Leakage');
act('save-adjust');
eq(G.stockBottles(p500.id), 1670, 'leakage adjustment posted');
G.go('expenses'); U.render('expenses');
clickAct('new-expense');
setv('category', 'Electricity'); setv('amount', '1500'); setv('date', G.today());
act('save-master-expense', { id:'' });
eq(G.db.expenses.length, 1, 'expense saved');
eq(G.db.expenses[0].amount, 150000, 'expense paise');
G.go('cashbook'); U.render('cashbook');
clickAct('new-cash');
setv('category', 'Owner capital'); setv('amount', '10000'); setv('dir', 'in'); setv('account', 'cash');
act('save-cash');
eq(G.cashBalance('cash'), 1000000, 'cash balance in paise');

/* 8. month lock blocks posting */
const m = G.monthOf();
ok(G.lockMonth(m, 'accountant review'), 'month locked');
const draft = G.add('invoices', { no:'DRAFT-1', date:G.today(), customerId:cust.id, lines:[{productId:p500.id,unit:'bottle',qty:1,bottles:1,rate:800}], total:800, status:'draft' });
ok(!G.confirmInvoice(draft.id).ok, 'locked month rejects confirmation');
ok(G.unlockMonth(m, 'test'), 'owner reopened month');

/* 9. reports + exports */
G.uiState.from = ''; G.uiState.to = ''; G.uiState.report = 'sales';
const rep = U.reportData();
ok(rep.rows.some(r => r[0] === inv.no), 'sales report contains invoice');
const csvHref = B.exportCSV();
ok(typeof csvHref === 'string' && csvHref.length > 0, 'CSV download produced');
const xlsHref = B.exportExcel();
ok(/blob:|data:/.test(xlsHref), 'Excel download produced');
const wb = B.workbook([{name:'Sales',rows:[['A','B'],[1,2]]}]);
ok(/Worksheet ss:Name="Sales"/.test(wb) && /ss:Type="Number"/.test(wb), 'SpreadsheetML workbook valid');
const jsonHref = B.exportJSON();
ok(typeof jsonHref === 'string', 'JSON backup produced');
const backupObj = { app:'glacier-water-solutions', version:1, exportedAt:G.nowTs(), data:{ company:{ name:'Restored Co' } } };
ok(B.restoreJSON(JSON.stringify(backupObj)).ok, 'JSON restore succeeded');
eq(G.db.company.name, 'Restored Co', 'restored company name');
ok(!B.restoreJSON('{}').ok, 'foreign file rejected');
const pdf = B.exportPDFReport();
ok(!!pdf && saved.some(s => /Glacier-.*\.pdf/.test(s)), 'PDF report generated');
const pdfInv = B.exportPDFInvoice(inv.id);
ok(!!pdfInv && saved.some(s => s === 'Invoice-' + inv.no + '.pdf'), 'PDF invoice generated');
ok(G.db.audit.some(a => /PDF export/.test(a.action)), 'exports audited');

/* 10. roles + login guard */
const salt = G.uid('salt');
G.add('users', { name:'Staff User', email:'staff@glacier.test', role:'staff', salt, pass:G.hashPassword('staffpass1',salt), sess:'' });
G.logout();
$('#auEmail').value = 'staff@glacier.test'; $('#auPass').value = 'staffpass1';
act('do-login');
eq(G.currentRole(), 'staff', 'staff logged in');
ok(!G.can('settings') && !G.can('users'), 'staff cannot reach settings or users');
U.render('dashboard');
ok(!/Settings/.test($('#nav').textContent), 'settings hidden from staff navigation');
G.logout();
$('#auEmail').value = 'owner@glacier.test'; $('#auPass').value = 'wrongpass';
act('do-login');
ok(G.db.audit.some(a => a.action === 'Login failed'), 'failed login audited');
const lk = JSON.parse(window.localStorage.getItem('gws_loginlock') || '{}');
ok((lk.tries||0) >= 1, 'failed attempt counted');
$('#auEmail').value = 'owner@glacier.test'; $('#auPass').value = 'ownerpass123';
act('do-login');
eq(G.currentRole(), 'owner', 'owner logged back in');

/* 11. static sanity */
const css = read('styles.css');
ok(css.includes('@media(max-width:640px)'), 'mobile breakpoint present');
ok(css.includes(':focus-visible'), 'visible focus styles present');
const html = read('index.html');
ok(/manifest\.webmanifest/.test(html) && /theme-color/.test(html), 'PWA meta present');
const sw = read('sw.js');
for (const asset of SHELL_CHECK()) ok(sw.includes(asset), `service worker caches ${asset}`);
function SHELL_CHECK(){ return ['./index.html','./styles.css','./core.js','./ui.js','./backup.js','./app.js','./vendor/jspdf.umd.min.js','./fonts/work-sans-latin-400-normal.woff2']; }

console.log(`ALL GREEN — ${n} assertions passed`);
