/* Glacier Water Solutions — data + business rules (no framework, no build) */
(function () {
  'use strict';
  var G = window.GWS = window.GWS || {};

  var K = {
    company: 'gws_company', users: 'gws_users', session: 'gws_session',
    products: 'gws_products', materials: 'gws_materials',
    customers: 'gws_customers', suppliers: 'gws_suppliers',
    invoices: 'gws_invoices', purchases: 'gws_purchases',
    production: 'gws_production', expenses: 'gws_expenses',
    cashbank: 'gws_cashbank', ledger: 'gws_ledger', adjust: 'gws_adjust',
    audit: 'gws_audit', locks: 'gws_locks', settings: 'gws_settings',
    seq: 'gws_idseq'
  };
  var STORES = ['products','materials','customers','suppliers','invoices','purchases','production','expenses','cashbank','ledger','adjust','audit','users'];

  var COMPANY = {
    name: 'Glacier Water Solutions', address: '', gstin: '', phone: '', email: '',
    state: 'Tamil Nadu', fyStartMonth: 4, invoicePrefix: 'GWS', invoiceStart: 1,
    hsn: '2201', gstRate: 18, needsSetup: true
  };
  var SETTINGS = { lowStockBottles: 300, theme: 'light', appVersion: '1.0' };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function read(k, fallback) {
    try { var v = localStorage.getItem(k); return v == null ? clone(fallback) : JSON.parse(v); }
    catch (e) { return clone(fallback); }
  }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function uid(p) { return (p || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function paise(v) { var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? Math.round(n * 100) : 0; }
  function rupees(p) { return 'Rs ' + ((Number(p) || 0) / 100).toFixed(2); }
  function pct(n) { return (Number(n) || 0).toFixed(2) + '%'; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function nowTs() { return new Date().toISOString(); }
  function monthOf(d) { return String(d || today()).slice(0, 7); }
  function fyOf(d) {
    var dt = new Date(d || today()); var m = (G.db ? G.db.company.fyStartMonth : 4) || 4;
    var y = dt.getFullYear(); if (dt.getMonth() + 1 < m) y--; return String(y) + '-' + String(y + 1).slice(-2);
  }
  function dateLabel(d) {
    if (!d) return '—';
    var p = String(d).split('-'); if (p.length !== 3) return String(d);
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  function fnv(s) {
    var h = 2166136261;
    for (var i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }
  function hashPassword(pw, salt) {
    var x = salt + '|' + pw + '|gws';
    for (var i = 0; i < 6000; i++) x = fnv(x) + fnv(x.split('').reverse().join(''));
    return fnv(x);
  }

  function defaultDb() {
    return {
      company: clone(COMPANY), settings: clone(SETTINGS), seq: {},
      products: [
        { id:'prd-300', name:'300 ml PET', size:'300 ml', bpc:30, priceBottle:500, priceCase:13500, mrp:1000, gstRate:18, hsn:'2201', opening:0, lowAt:300, active:true },
        { id:'prd-500', name:'500 ml PET', size:'500 ml', bpc:24, priceBottle:800, priceCase:17280, mrp:1500, gstRate:18, hsn:'2201', opening:0, lowAt:240, active:true },
        { id:'prd-1000', name:'1000 ml PET', size:'1000 ml', bpc:24, priceBottle:1500, priceCase:32400, mrp:2500, gstRate:18, hsn:'2201', opening:0, lowAt:120, active:true }
      ],
      materials: [
        { id:'mat-bottle', name:'PET bottles', unit:'pcs', opening:0, rate:200 },
        { id:'mat-cap', name:'Caps', unit:'pcs', opening:0, rate:50 },
        { id:'mat-label', name:'Labels', unit:'pcs', opening:0, rate:40 },
        { id:'mat-carton', name:'Cartons', unit:'pcs', opening:0, rate:700 }
      ],
      customers: [], suppliers: [], invoices: [], purchases: [], production: [],
      expenses: [], cashbank: [], ledger: [], adjust: [], audit: [], locks: {}, users: [], session: null
    };
  }

  function load() {
    var d = defaultDb();
    d.company = Object.assign(d.company, read(K.company, {}));
    d.settings = Object.assign(d.settings, read(K.settings, {}));
    d.seq = read(K.seq, {});
    d.locks = read(K.locks, {});
    d.session = read(K.session, null);
    STORES.forEach(function (s) { d[s] = read(K[s], d[s]); });
    return d;
  }
  function save(name) {
    if (!name) { Object.keys(K).forEach(save); return; }
    if (G.db[name] !== undefined) write(K[name], G.db[name]);
  }
  function reset() {
    Object.keys(K).forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    G.db = defaultDb(); G.booted = false; return G.db;
  }
  function init() { G.db = load(); return G.db; }

  function list(name) { return (G.db[name] || []).slice(); }
  function get(name, id) { return (G.db[name] || []).filter(function (x) { return x.id === id; })[0] || null; }
  function add(name, obj) {
    var o = Object.assign({ id: uid(name.slice(0,3)), createdAt: nowTs(), createdBy: currentName() }, obj || {});
    G.db[name].unshift(o); save(name); return o;
  }
  function update(name, id, patch) {
    var o = get(name, id); if (!o) return null;
    Object.assign(o, patch || {}); o.updatedAt = nowTs(); o.updatedBy = currentName(); save(name); return o;
  }
  function remove(name, id) {
    G.db[name] = G.db[name].filter(function (x) { return x.id !== id; }); save(name);
  }

  function currentUser() {
    var s = G.db.session;
    if (!s || !s.token || !s.exp || s.exp < Date.now()) return null;
    var u = get('users', s.uid);
    if (!u || !u.sess || u.sess !== fnv(s.token)) return null;
    return u;
  }
  function currentName() { var u = currentUser(); return u ? u.name : 'system'; }
  function currentRole() { var u = currentUser(); return u ? u.role : null; }
  var PERMS = {
    owner: ['dashboard','sales','purchase','inventory','production','materials','customers','suppliers','expenses','cashbook','accounts','reports','backup','audit','users','settings'],
    admin: ['dashboard','sales','purchase','inventory','production','materials','customers','suppliers','expenses','cashbook','accounts','reports','backup'],
    accountant: ['dashboard','sales','purchase','inventory','customers','suppliers','expenses','cashbook','accounts','reports','backup'],
    staff: ['dashboard','sales','production','inventory','materials']
  };
  function can(view) { var r = currentRole(); return !!(r && (PERMS[r] || []).indexOf(view) >= 0); }
  function canAny(role, view) { return !!(PERMS[role] || []).indexOf(view) >= 0; }

  function audit(action, detail) {
    var u = currentUser();
    var entry = {
      id: uid('aud'), ts: nowTs(), date: today(), action: action, detail: detail || '',
      user: u ? u.name : 'unknown', role: u ? u.role : '—',
      device: (typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent.slice(0, 90) : 'local')
    };
    G.db.audit.unshift(entry);
    if (G.db.audit.length > 1000) G.db.audit.length = 1000;
    save('audit'); return entry;
  }

  function isLocked(d) { return !!G.db.locks[monthOf(d)]; }
  function lockMonth(m, note) {
    if (!/^\d{4}-\d{2}$/.test(m)) return false;
    G.db.locks[m] = { by: currentName(), note: note || '', ts: nowTs() }; save('locks');
    audit('Month locked', m + ' — ' + (note || 'no reason given')); return true;
  }
  function unlockMonth(m, note) {
    if (!currentUser() || currentUser().role !== 'owner') return false;
    delete G.db.locks[m]; save('locks'); audit('Month reopened', m + ' — ' + (note || 'no reason given')); return true;
  }

  function nextNumber(kind) {
    var key = kind + '-' + fyOf(); var n = (G.db.seq[key] || 0) + 1;
    G.db.seq[key] = n; save('seq');
    var prefix = kind === 'invoice' ? (G.db.company.invoicePrefix || 'GWS') : kind === 'purchase' ? 'PUR' : 'PRD';
    return prefix + '-' + fyOf().slice(0,4) + '-' + String(n).padStart(4, '0');
  }
  function checkNumber(kind, no, skipId) {
    var arr = kind === 'invoice' ? G.db.invoices : G.db.purchases;
    return !arr.some(function (x) { return x.no === no && x.id !== skipId; });
  }

  function product(id) { return get('products', id); }
  function material(id) { return get('materials', id); }
  function bpc(p) { return Math.max(1, Number(p && p.bpc) || 1); }
  function lineBottles(p, unit, qty) {
    var n = Math.max(0, Number(qty) || 0);
    return Math.round(n * (unit === 'case' ? bpc(p) : 1));
  }
  function stockLabel(pid, itemType) {
    var total = stockBottles(pid, itemType);
    if (itemType === 'material') return total + ' ' + ((material(pid) || {}).unit || 'pcs');
    var p = product(pid) || { bpc: 1 };
    return Math.floor(total / bpc(p)) + ' cases + ' + (total % bpc(p)) + ' bottles';
  }
  function stockBottles(pid, itemType) {
    var type = itemType || 'product';
    var p = type === 'material' ? material(pid) : product(pid);
    var opening = Number((p || {}).opening) || 0;
    var delta = G.db.ledger.reduce(function (a, l) {
      return a + ((l.productId === pid && (l.itemType || 'product') === type) ? (Number(l.deltaBottles) || 0) : 0);
    }, 0);
    return opening + delta;
  }
  function postStock(pid, delta, type, ref, note, itemType) {
    return add('ledger', { date: today(), productId: pid, itemType: itemType || 'product', deltaBottles: Math.round(delta), type: type, ref: ref || '', note: note || '' });
  }
  function lowStock() {
    return G.db.products.filter(function (p) {
      return p.active !== false && stockBottles(p.id) < (Number(p.lowAt) || G.db.settings.lowStockBottles || 300);
    });
  }

  function amountLine(l) { return Math.max(0, Number(l.bottles) || 0) * Math.max(0, Number(l.rate) || 0) - (Number(l.discount) || 0); }
  function calcInvoice(inv) {
    var taxable = (inv.lines || []).reduce(function (a, l) { return a + amountLine(l); }, 0) - (Number(inv.discount) || 0);
    taxable = Math.max(0, taxable);
    var rate = Number(inv.gstRate != null ? inv.gstRate : (G.db.company.gstRate || 0)) || 0;
    var tax = Math.round(taxable * rate / 100);
    var inter = inv.taxMode === 'inter' || (inv.taxMode !== 'intra' && String(inv.customerState || '') !== String(G.db.company.state || ''));
    var igst = inter ? tax : 0, cgst = inter ? 0 : Math.round(tax / 2), sgst = inter ? 0 : (tax - cgst);
    var gross = taxable + tax;
    var round = Math.round(gross / 100) * 100 - gross;
    return { taxable: taxable, rate: rate, cgst: cgst, sgst: sgst, igst: igst, tax: tax, round: round, total: gross + round, inter: inter };
  }
  function calcPurchase(p) {
    var taxable = (p.lines || []).reduce(function (a, l) { return a + Math.max(0, Number(l.amount) || 0); }, 0);
    var tax = (p.lines || []).reduce(function (a, l) { return a + Math.round(Math.max(0, Number(l.amount) || 0) * (Number(l.gstRate) || 0) / 100); }, 0);
    var gross = taxable + tax + (Number(p.freight) || 0) + (Number(p.other) || 0);
    var round = Math.round(gross / 100) * 100 - gross;
    return { taxable: taxable, tax: tax, round: round, total: gross + round };
  }

  function customerBalance(cid) {
    var billed = G.db.invoices.filter(function (i) { return i.customerId === cid && i.status === 'confirmed'; })
      .reduce(function (a, i) { return a + (Number(i.total) || 0); }, 0);
    var paid = G.db.cashbank.filter(function (c) { return c.dir === 'in' && c.ref === cid && c.kind === 'customer'; })
      .reduce(function (a, c) { return a + (Number(c.amount) || 0); }, 0);
    return billed - paid;
  }
  function supplierBalance(sid) {
    var billed = G.db.purchases.filter(function (p) { return p.supplierId === sid && p.status === 'confirmed'; })
      .reduce(function (a, p) { return a + (Number(p.total) || 0); }, 0);
    var paid = G.db.cashbank.filter(function (c) { return c.dir === 'out' && c.ref === sid && c.kind === 'supplier'; })
      .reduce(function (a, c) { return a + (Number(c.amount) || 0); }, 0);
    return billed - paid;
  }
  function cashBalance(account) {
    return G.db.cashbank.reduce(function (a, c) { return a + ((c.account === account) ? ((c.dir === 'in' ? 1 : -1) * (Number(c.amount) || 0)) : 0); }, 0);
  }

  function confirmInvoice(id) {
    var inv = get('invoices', id);
    if (!inv || inv.status !== 'draft') return { ok:false, msg:'Invoice is not a draft.' };
    if (isLocked(inv.date)) return { ok:false, msg:'Month is locked. Reopen it first.' };
    var need = {};
    (inv.lines || []).forEach(function (l) { need[l.productId] = (need[l.productId] || 0) + (Number(l.bottles) || 0); });
    for (var pid in need) { if (stockBottles(pid) < need[pid]) return { ok:false, msg:'Insufficient stock for ' + ((product(pid)||{}).name || pid) + '.' }; }
    Object.keys(need).forEach(function (pid) { postStock(pid, -need[pid], 'Sale', inv.no, 'Invoice ' + inv.no); });
    if (Number(inv.paid) > 0) add('cashbank', {
      date: inv.date, account: inv.paymentMode === 'bank' ? 'bank' : 'cash', dir: 'in',
      amount: Number(inv.paid), kind: 'customer', ref: inv.customerId, category: 'Invoice payment',
      note: 'Against ' + inv.no, refNo: inv.no
    });
    update('invoices', id, { status:'confirmed', confirmedAt: nowTs(), confirmedBy: currentName() });
    audit('Invoice confirmed', inv.no + ' · ' + rupees(inv.total));
    return { ok:true, msg:'Invoice ' + inv.no + ' confirmed. Stock updated.' };
  }
  function cancelInvoice(id, reason) {
    var inv = get('invoices', id);
    if (!inv || inv.status !== 'confirmed') return { ok:false, msg:'Only confirmed invoices can be cancelled.' };
    if (isLocked(inv.date)) return { ok:false, msg:'Month is locked. Reopen it first.' };
    (inv.lines || []).forEach(function (l) { postStock(l.productId, Number(l.bottles) || 0, 'Sale reversal', inv.no, 'Cancelled: ' + (reason || 'no reason')); });
    var paid = G.db.cashbank.filter(function (c) { return c.refNo === inv.no && c.kind === 'customer'; });
    paid.forEach(function (c) { add('cashbank', { date: today(), account: c.account, dir:'out', amount: c.amount, kind:'customer', ref: inv.customerId, category:'Invoice cancellation', note:'Reversal of ' + inv.no }); });
    update('invoices', id, { status:'cancelled', cancelReason: reason || '', cancelledAt: nowTs(), cancelledBy: currentName() });
    audit('Invoice cancelled', inv.no + ' — ' + (reason || 'no reason given'));
    return { ok:true, msg:'Invoice ' + inv.no + ' cancelled with reversal entries.' };
  }
  function confirmPurchase(id) {
    var p = get('purchases', id);
    if (!p || p.status !== 'draft') return { ok:false, msg:'Bill is not a draft.' };
    if (isLocked(p.date)) return { ok:false, msg:'Month is locked. Reopen it first.' };
    (p.lines || []).forEach(function (l) {
      var qty = (Number(l.qty) || 0) * ((l.unit === 'case' && l.itemType === 'product') ? bpc(product(l.itemId)) : 1);
      postStock(l.itemId, Math.round(qty), 'Purchase', p.no, 'Bill ' + p.no, l.itemType || 'product');
    });
    if (Number(p.paid) > 0) add('cashbank', { date:p.date, account: p.paymentMode === 'bank' ? 'bank':'cash', dir:'out', amount:Number(p.paid), kind:'supplier', ref:p.supplierId, category:'Supplier payment', note:'Against '+p.no, refNo:p.no });
    update('purchases', id, { status:'confirmed', confirmedAt:nowTs() });
    audit('Purchase confirmed', p.no + ' · ' + rupees(p.total));
    return { ok:true, msg:'Bill ' + p.no + ' confirmed. Stock updated.' };
  }
  function confirmProduction(id) {
    var p = get('production', id);
    if (!p || p.status !== 'draft') return { ok:false, msg:'Batch is not a draft.' };
    if (isLocked(p.date)) return { ok:false, msg:'Month is locked. Reopen it first.' };
    postStock(p.productId, Number(p.good) || 0, 'Production', p.batch, 'Batch ' + p.batch);
    (p.consumption || []).forEach(function (c) { postStock(c.materialId, -(Number(c.qty) || 0), 'Production use', p.batch, 'Batch ' + p.batch, 'material'); });
    update('production', id, { status:'confirmed' });
    audit('Production confirmed', p.batch + ' · ' + (Number(p.good)||0) + ' bottles');
    return { ok:true, msg:'Batch ' + p.batch + ' posted to finished stock.' };
  }
  function addAdjust(o) {
    if (isLocked(o.date)) return { ok:false, msg:'Month is locked.' };
    var a = add('adjust', o); postStock(o.productId, Number(o.delta) || 0, o.type || 'Adjustment', a.id, o.note || '', o.itemType || 'product');
    audit('Stock adjustment', (o.type || 'Adjustment') + ' · ' + (Number(o.delta)||0) + ' · ' + (o.note||''));
    return { ok:true, msg:'Adjustment posted.' };
  }
  function addCash(o) {
    if (isLocked(o.date)) return { ok:false, msg:'Month is locked.' };
    var c = add('cashbank', Object.assign({ dir:'in', account:'cash', amount:0, date:today() }, o));
    audit((c.dir === 'in' ? 'Receipt' : 'Payment') + ' recorded', (c.category || 'Cash') + ' · ' + rupees(c.amount));
    return { ok:true, msg:'Entry saved.' };
  }

  function period(rows, from, to, field) {
    field = field || 'date';
    return (rows || []).filter(function (r) {
      var d = String(r[field] || '').slice(0,10);
      return (!from || d >= from) && (!to || d <= to);
    });
  }
  function sum(rows, field) { return rows.reduce(function (a, r) { return a + (Number(r[field]) || 0); }, 0); }
  function stats(from, to) {
    var inv = period(G.db.invoices.filter(function (i) { return i.status === 'confirmed'; }), from, to);
    var pur = period(G.db.purchases.filter(function (p) { return p.status === 'confirmed'; }), from, to);
    var exp = period(G.db.expenses, from, to);
    var cash = period(G.db.cashbank, from, to);
    return {
      sales: sum(inv, 'total'), purchases: sum(pur, 'total'), expenses: sum(exp, 'amount'),
      collections: sum(cash.filter(function (c) { return c.dir === 'in' && c.kind === 'customer'; }), 'amount'),
      invoices: inv.length, bills: pur.length
    };
  }

  Object.assign(G, {
    K:K, db:null, booted:false, PERMS:PERMS, defaults:{ company:COMPANY, settings:SETTINGS },
    clone:clone, read:read, write:write, esc:esc, uid:uid, paise:paise, rupees:rupees, pct:pct,
    today:today, nowTs:nowTs, monthOf:monthOf, fyOf:fyOf, dateLabel:dateLabel, fnv:fnv, hashPassword:hashPassword,
    init:init, reset:reset, save:save, list:list, get:get, add:add, update:update, remove:remove,
    currentUser:currentUser, currentName:currentName, currentRole:currentRole, can:can, canAny:canAny, audit:audit,
    isLocked:isLocked, lockMonth:lockMonth, unlockMonth:unlockMonth, nextNumber:nextNumber, checkNumber:checkNumber,
    product:product, material:material, bpc:bpc, lineBottles:lineBottles,
    stockBottles:stockBottles, stockLabel:stockLabel, postStock:postStock, lowStock:lowStock,
    amountLine:amountLine, calcInvoice:calcInvoice, calcPurchase:calcPurchase,
    customerBalance:customerBalance, supplierBalance:supplierBalance, cashBalance:cashBalance,
    confirmInvoice:confirmInvoice, cancelInvoice:cancelInvoice, confirmPurchase:confirmPurchase,
    confirmProduction:confirmProduction, addAdjust:addAdjust, addCash:addCash,
    period:period, sum:sum, stats:stats
  });
})();
