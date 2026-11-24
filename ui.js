/* Glacier Water Solutions — screens, forms and UI helpers */
(function () {
  'use strict';
  var G = window.GWS;
  var e = G.esc;
  var S = G.uiState = { invTab:'products', report:'sales', from:'', to:'', salesStatus:'', authMode:'login' };

  var I = {
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    sales:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    purchase:'<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L22 8H7"/><circle cx="10" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>',
    inventory:'<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="M3 7v10l9 5 9-5V7M12 12v10"/>',
    production:'<path d="M3 21V10l6 4V10l6 4V7h6v14z"/><path d="M7 21v-3M13 21v-3M18 21v-3"/>',
    materials:'<path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    customers:'<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a6 6 0 0 1 12 0v2M18 8v6m3-3h-6"/>',
    suppliers:'<path d="M3 7h11v11H3zM14 10h4l3 3v5h-7z"/><circle cx="7" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/>',
    expenses:'<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    cashbook:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    accounts:'<path d="M4 3h16v18H4zM8 7h8M8 11h3m2 0h3M8 15h3m2 0h3"/>',
    reports:'<path d="M4 20V10m5 10V4m5 16v-7m5 7V8"/><path d="M2 20h20"/>',
    backup:'<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"/>',
    audit:'<path d="M12 3 4 6v5c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 21v-1.5A5.5 5.5 0 0 1 7.5 14h3A5.5 5.5 0 0 1 16 19.5V21M17 8h6m-3-3v6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4h-.1a1.7 1.7 0 0 0-1.6 1Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/>',
    check:'<path d="m5 13 4 4L19 7"/>', close:'<path d="M6 6l12 12M18 6 6 18"/>',
    print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/>',
    alert:'<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3h.01"/>',
    lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    file:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9"/>',
    drop:'<path d="M12 2C8.6 7.3 6 10.9 6 14.5a6 6 0 0 0 12 0C18 10.9 15.4 7.3 12 2Z"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || I.file) + '</svg>'; }
  function btn(label, act, extra, cls) {
    return '<button class="btn ' + (cls || '') + '" data-act="' + act + '" type="button" ' + (extra || '') + '>' + icon((extra && extra.indexOf('print') >= 0) ? 'print' : 'plus') + '<span>' + e(label) + '</span></button>';
  }
  function empty(title, msg) { return '<div class="empty">' + icon('drop') + '<strong>' + e(title) + '</strong><span>' + e(msg) + '</span></div>'; }
  function head(title, lede, actions) {
    return '<div class="page-head"><div class="head-copy"><p class="overline">Glacier · Workspace</p><h1>' + e(title) + '</h1><p class="lede">' + e(lede) + '</p></div><div class="head-actions">' + (actions || '') + '</div></div>';
  }
  function table(cols, rows, opts) {
    if (!rows.length) return empty((opts && opts.emptyTitle) || 'Nothing here yet', (opts && opts.emptyMsg) || 'Add your first record to get started.');
    var h = cols.map(function (c) { return '<th class="' + (c.r ? 'r' : '') + '">' + e(c.t) + '</th>'; }).join('');
    var b = rows.map(function (r) {
      return '<tr>' + cols.map(function (c) {
        var v = c.f ? c.f(r) : e(r[c.k]);
        return '<td class="' + (c.r ? 'r' : '') + '">' + (v == null ? '—' : v) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<div class="table-wrap card"><table><thead><tr>' + h + '</tr></thead><tbody>' + b + '</tbody></table></div>';
  }
  function money(p) { return '<span class="num">' + e(G.rupees(p)) + '</span>'; }
  function status(s) {
    var c = s === 'confirmed' ? 'ok' : s === 'cancelled' ? 'danger' : 'warn';
    return '<span class="pill ' + c + '">' + e(String(s || 'draft').toUpperCase()) + '</span>';
  }
  function dateFilter() {
    return '<div class="filter-bar">' + icon('search') +
      '<input type="date" id="fFrom" value="' + e(S.from) + '" aria-label="From date"><span class="tiny muted">to</span>' +
      '<input type="date" id="fTo" value="' + e(S.to) + '" aria-label="To date">' +
      '<button class="btn ghost sm" data-act="filter" type="button">Apply</button>' +
      '<button class="btn ghost sm" data-act="filter-clear" type="button">Clear</button></div>';
  }
  function nameOf(listName, id) { var o = G.get(listName, id); return o ? o.name : '—'; }
  function opts(listName, selected, blank) {
    var s = '<option value="">' + e(blank || 'Select…') + '</option>';
    return s + G.list(listName).map(function (o) {
      return '<option value="' + e(o.id) + '"' + (o.id === selected ? ' selected' : '') + '>' + e(o.name) + '</option>';
    }).join('');
  }
  function field(f) {
    var id = 'f_' + f.name, v = f.value == null ? '' : f.value;
    var input;
    if (f.type === 'select') input = '<select id="' + id + '" name="' + f.name + '"' + (f.onchange ? ' data-onchange="' + f.onchange + '"' : '') + '>' + f.options + '</select>';
    else if (f.type === 'textarea') input = '<textarea id="' + id + '" name="' + f.name + '">' + e(v) + '</textarea>';
    else if (f.type === 'checkbox') input = '<label class="inline-check"><input id="' + id + '" name="' + f.name + '" type="checkbox"' + (v ? ' checked' : '') + '> ' + e(f.checkLabel || 'Yes') + '</label>';
    else input = '<input id="' + id + '" name="' + f.name + '" type="' + (f.type || 'text') + '" value="' + e(v) + '"' + (f.step ? ' step="' + f.step + '"' : '') + (f.ph ? ' placeholder="' + e(f.ph) + '"' : '') + (f.min != null ? ' min="' + f.min + '"' : '') + '>';
    return '<div class="field' + (f.full ? ' full' : '') + '"><label for="' + id + '">' + e(f.label) + (f.req ? ' <span class="req">*</span>' : '') + '</label>' + input + (f.hint ? '<div class="hint">' + e(f.hint) + '</div>' : '') + '</div>';
  }
  function form(fields) {
    return '<div class="form-grid">' + fields.map(function (f) { return typeof f === 'string' ? f : field(f); }).join('') + '</div>';
  }

  /* ---------------- dashboard ---------------- */
  function viewDashboard() {
    var t = G.stats(G.today(), G.today()), all = G.stats();
    var low = G.lowStock(), locked = G.db.locks[G.monthOf()];
    var recent = G.db.invoices.slice(0, 6);
    return head('Dashboard', 'Today at a glance — billing, stock and money, all in one place.',
      '<button class="btn ghost" data-act="go" data-view="reports" type="button">' + icon('reports') + '<span>Reports</span></button>' +
      btn('New invoice', 'new-invoice')) +
      '<div class="bento">' +
      '<div class="tile hero-tile"><div><p class="label">Today’s sales</p><div class="value">' + e(G.rupees(t.sales)) + '</div><div class="sub">' + t.invoices + ' confirmed invoice' + (t.invoices === 1 ? '' : 's') + '</div></div>' +
      '<div class="hero-meta"><div>Cash collected<strong>' + e(G.rupees(t.collections)) + '</strong></div><div>Purchases<strong>' + e(G.rupees(t.purchases)) + '</strong></div><div>Expenses<strong>' + e(G.rupees(t.expenses)) + '</strong></div></div>' +
      '<div class="quick"><button data-act="new-invoice" type="button">' + icon('sales') + ' New invoice</button><button data-act="new-production" type="button">' + icon('production') + ' Production</button><button data-act="new-expense" type="button">' + icon('expenses') + ' Expense</button></div></div>' +
      '<div class="tile"><p class="label">Customers receivable</p><div class="value">' + e(G.rupees(G.list('customers').reduce(function (a, c) { return a + Math.max(0, G.customerBalance(c.id)); }, 0))) + '</div><div class="sub">Across ' + G.db.customers.length + ' customers</div></div>' +
      '<div class="tile"><p class="label">Suppliers payable</p><div class="value">' + e(G.rupees(G.list('suppliers').reduce(function (a, s) { return a + Math.max(0, G.supplierBalance(s.id)); }, 0))) + '</div><div class="sub">Across ' + G.db.suppliers.length + ' suppliers</div></div>' +
      '<div class="tile"><p class="label">Cash in hand</p><div class="value">' + e(G.rupees(G.cashBalance('cash'))) + '</div><div class="sub">Bank ' + e(G.rupees(G.cashBalance('bank'))) + '</div></div>' +
      '<div class="tile wide"><div class="spread"><div><p class="label">Low stock</p><h3>' + low.length + ' product' + (low.length === 1 ? '' : 's') + ' below alert level</h3></div><button class="btn ghost sm" data-act="go" data-view="inventory" type="button">Open stock</button></div>' +
      (low.length ? '<div class="row" style="margin-top:12px">' + low.map(function (p) { return '<span class="pill warn">' + e(p.name) + ' · ' + e(G.stockLabel(p.id)) + '</span>'; }).join('') + '</div>' : '<p class="tiny muted" style="margin-top:8px">All finished products are above their alert level.</p>') + '</div>' +
      '<div class="tile wide"><div class="spread"><div><p class="label">Lifetime totals</p><h3>' + e(G.rupees(all.sales)) + ' billed</h3></div><span class="pill info">' + (locked ? 'Month locked' : 'Month open') + '</span></div>' +
      '<p class="tiny muted" style="margin-top:8px">Production batches ' + G.db.production.length + ' · Purchase bills ' + G.db.purchases.length + ' · Expenses ' + G.db.expenses.length + '</p></div>' +
      '</div>' +
      '<div style="margin-top:24px"><div class="card-head"><h2>Recent invoices</h2><button class="btn ghost sm" data-act="go" data-view="sales" type="button">View all</button></div>' +
      table([{t:'No',f:function(r){return '<span class="mono">'+e(r.no)+'</span>';}},{t:'Customer',f:function(r){return e(nameOf('customers',r.customerId));}},{t:'Date',f:function(r){return e(G.dateLabel(r.date));}},{t:'Total',r:true,f:function(r){return money(r.total);}},{t:'Status',f:function(r){return status(r.status);}}], recent, {emptyTitle:'No invoices yet', emptyMsg:'Create your first invoice to see it here.'}) + '</div>';
  }

  /* ---------------- sales ---------------- */
  function viewSales() {
    var rows = G.period(G.db.invoices, S.from, S.to).filter(function (i) { return !S.salesStatus || i.status === S.salesStatus; });
    return head('Sales & invoices', 'Create tax invoices, confirm them, and print or share a PDF copy.',
      btn('New invoice', 'new-invoice')) +
      '<div class="card" style="margin-bottom:16px"><div class="filter-bar">' + icon('search') +
      '<select id="fStatus" aria-label="Status"><option value="">All statuses</option><option value="draft"' + (S.salesStatus==='draft'?' selected':'') + '>Draft</option><option value="confirmed"' + (S.salesStatus==='confirmed'?' selected':'') + '>Confirmed</option><option value="cancelled"' + (S.salesStatus==='cancelled'?' selected':'') + '>Cancelled</option></select>' +
      '<input type="date" id="fFrom" value="' + e(S.from) + '"><span class="tiny muted">to</span><input type="date" id="fTo" value="' + e(S.to) + '">' +
      '<button class="btn ghost sm" data-act="filter-sales" type="button">Apply</button></div></div>' +
      table([
        {t:'Invoice',f:function(r){return '<span class="mono">'+e(r.no)+'</span>';}},
        {t:'Date',f:function(r){return e(G.dateLabel(r.date));}},
        {t:'Customer',f:function(r){return e(nameOf('customers',r.customerId));}},
        {t:'Taxable',r:true,f:function(r){return money(r.taxable);}},
        {t:'Tax',r:true,f:function(r){return money(r.cgst+r.sgst+r.igst);}},
        {t:'Total',r:true,f:function(r){return money(r.total);}},
        {t:'Status',f:function(r){return status(r.status);}},
        {t:'',r:true,f:function(r){return '<div class="tbl-actions"><button class="icon-btn" data-act="view-invoice" data-id="'+e(r.id)+'" title="View" aria-label="View invoice">'+icon('eye')+'</button>'+
          (r.status==='draft'?'<button class="icon-btn" data-act="confirm-invoice" data-id="'+e(r.id)+'" title="Confirm" aria-label="Confirm invoice">'+icon('check')+'</button>':'')+
          (r.status==='confirmed'?'<button class="icon-btn" data-act="cancel-invoice" data-id="'+e(r.id)+'" title="Cancel" aria-label="Cancel invoice">'+icon('close')+'</button>':'')+
          '<button class="icon-btn" data-act="pdf-invoice" data-id="'+e(r.id)+'" title="PDF" aria-label="Download PDF">'+icon('print')+'</button></div>';}}
      ], rows, {emptyTitle:'No invoices', emptyMsg:'Set up a customer, then create your first invoice.'}) +
      '<p class="tiny muted" style="margin-top:12px">Draft invoices do not move stock. Confirming posts the stock ledger and customer balance; cancelling writes a reversal entry.</p>';
  }

  /* ---------------- purchases ---------------- */
  function viewPurchases() {
    var rows = G.period(G.db.purchases, S.from, S.to);
    return head('Purchase bills', 'Supplier bills, GST input and proof — confirmation adds stock.',
      btn('New bill', 'new-purchase')) + dateFilter() +
      table([
        {t:'Bill',f:function(r){return '<span class="mono">'+e(r.no)+'</span>';}},
        {t:'Date',f:function(r){return e(G.dateLabel(r.date));}},
        {t:'Supplier',f:function(r){return e(nameOf('suppliers',r.supplierId));}},
        {t:'Taxable',r:true,f:function(r){return money(r.taxable);}},
        {t:'GST',r:true,f:function(r){return money(r.tax);}},
        {t:'Total',r:true,f:function(r){return money(r.total);}},
        {t:'Status',f:function(r){return status(r.status);}},
        {t:'',r:true,f:function(r){return '<div class="tbl-actions">'+(r.status==='draft'?'<button class="icon-btn" data-act="confirm-purchase" data-id="'+e(r.id)+'" title="Confirm">'+icon('check')+'</button>':'')+'<button class="icon-btn" data-act="view-purchase" data-id="'+e(r.id)+'" title="View">'+icon('eye')+'</button></div>';}}
      ], rows, {emptyTitle:'No purchase bills', emptyMsg:'Enter a supplier bill when stock or raw material arrives.'});
  }

  /* ---------------- inventory ---------------- */
  function viewInventory() {
    var tab = S.invTab;
    var tabs = '<div class="seg" style="margin-bottom:16px"><button data-act="inv-tab" data-tab="products" class="' + (tab==='products'?'on':'') + '" type="button">Products & stock</button><button data-act="inv-tab" data-tab="ledger" class="' + (tab==='ledger'?'on':'') + '" type="button">Stock ledger</button><button data-act="inv-tab" data-tab="adjust" class="' + (tab==='adjust'?'on':'') + '" type="button">Adjustments</button></div>';
    if (tab === 'ledger') return head('Stock ledger', 'Every bottle that entered or left, with a reference.', btn('Record adjustment', 'new-adjust')) + tabs +
      table([{t:'Date',f:function(r){return e(G.dateLabel(r.date));}},{t:'Item',f:function(r){return e(nameOf((r.itemType||'product')==='material'?'materials':'products',r.productId));}},{t:'Type',f:function(r){return e(r.type);}},{t:'Change',r:true,f:function(r){return (r.deltaBottles>0?'+':'')+e(r.deltaBottles);}},{t:'Reference',f:function(r){return e(r.ref);}},{t:'By',f:function(r){return e(r.user||'—');}}], G.db.ledger.slice(0,300), {emptyTitle:'No movements yet', emptyMsg:'Confirm an invoice, bill or production batch to create ledger entries.'});
    if (tab === 'adjust') return head('Stock adjustments', 'Damage, leakage, expiry, returns and corrections.', btn('Record adjustment', 'new-adjust')) + tabs +
      table([{t:'Date',f:function(r){return e(G.dateLabel(r.date));}},{t:'Item',f:function(r){return e(nameOf((r.itemType||'product')==='material'?'materials':'products',r.productId));}},{t:'Type',f:function(r){return e(r.type);}},{t:'Change',r:true,f:function(r){return (r.delta>0?'+':'')+e(r.delta);}},{t:'Note',f:function(r){return e(r.note||'—');}}], G.db.adjust, {emptyTitle:'No adjustments', emptyMsg:'Use adjustments for wastage, damage or corrections.'});
    return head('Products & stock', 'Stock stays accurate in cases and bottles through a movement ledger.',
      btn('New product', 'new-product') + btn('Adjust stock', 'new-adjust', '', 'ghost')) + tabs +
      table([
        {t:'Product',f:function(r){return '<strong>'+e(r.name)+'</strong><div class="tiny muted">'+e(r.size||'')+'</div>';}},
        {t:'Bottles / case',r:true,f:function(r){return e(r.bpc);}},
        {t:'Stock',f:function(r){var n=G.stockBottles(r.id);return '<span class="num">'+e(n)+' bottles</span><div class="tiny muted">'+e(G.stockLabel(r.id))+'</div>';}},
        {t:'Rate / bottle',r:true,f:function(r){return money(r.priceBottle);}},
        {t:'Rate / case',r:true,f:function(r){return money(r.priceCase);}},
        {t:'GST',r:true,f:function(r){return e(G.pct(r.gstRate));}},
        {t:'',r:true,f:function(r){return '<div class="tbl-actions"><button class="icon-btn" data-act="edit-product" data-id="'+e(r.id)+'" title="Edit">'+icon('edit')+'</button></div>';}}
      ], G.db.products, {emptyTitle:'No products', emptyMsg:'Add your 300 ml, 500 ml and 1000 ml products.'});
  }

  /* ---------------- production + materials ---------------- */
  function viewProduction() {
    return head('Production', 'Daily batches, rejects and raw-material use — good output posts to finished stock.', btn('New batch', 'new-production')) +
      dateFilter() +
      table([
        {t:'Batch',f:function(r){return '<span class="mono">'+e(r.batch)+'</span>';}},
        {t:'Date',f:function(r){return e(G.dateLabel(r.date));}},
        {t:'Product',f:function(r){return e(nameOf('products',r.productId));}},
        {t:'Good',r:true,f:function(r){return e(r.good);}},
        {t:'Rejected',r:true,f:function(r){return e(r.rejected||0);}},
        {t:'Status',f:function(r){return status(r.status);}},
        {t:'',r:true,f:function(r){return '<div class="tbl-actions">'+(r.status==='draft'?'<button class="icon-btn" data-act="confirm-production" data-id="'+e(r.id)+'" title="Confirm">'+icon('check')+'</button>':'')+'<button class="icon-btn" data-act="view-production" data-id="'+e(r.id)+'" title="View">'+icon('eye')+'</button></div>';}}
      ], G.period(G.db.production, S.from, S.to), {emptyTitle:'No batches', emptyMsg:'Record the first production batch for today.'});
  }
  function viewMaterials() {
    return head('Raw materials', 'Bottles, caps, labels and cartons — purchases and production consumption.', btn('New material', 'new-material')) +
      table([
        {t:'Material',f:function(r){return '<strong>'+e(r.name)+'</strong>';}},
        {t:'Unit',f:function(r){return e(r.unit||'pcs');}},
        {t:'Closing balance',r:true,f:function(r){return '<span class="num">'+e(G.stockBottles(r.id,'material'))+'</span>';}},
        {t:'Rate',r:true,f:function(r){return money(r.rate);}},
        {t:'',r:true,f:function(r){return '<div class="tbl-actions"><button class="icon-btn" data-act="edit-material" data-id="'+e(r.id)+'" title="Edit">'+icon('edit')+'</button></div>';}}
      ], G.db.materials, {emptyTitle:'No raw materials', emptyMsg:'Add the materials used in production.'});
  }

  /* ---------------- parties ---------------- */
  function partyView(kind) {
    var isC = kind === 'customers', listName = kind, rows = G.db[listName];
    return head(isC ? 'Customers' : 'Suppliers', isC ? 'Invoices, receipts and outstanding balances.' : 'Bills, payments and outstanding balances.',
      btn(isC ? 'New customer' : 'New supplier', isC ? 'new-customer' : 'new-supplier')) +
      table([
        {t:'Name',f:function(r){return '<strong>'+e(r.name)+'</strong><div class="tiny muted">'+e(r.phone||'—')+'</div>';}},
        {t:'GSTIN',f:function(r){return '<span class="mono">'+e(r.gstin||'—')+'</span>';}},
        {t:'State',f:function(r){return e(r.state||'—');}},
        {t:'Opening',r:true,f:function(r){return money(r.opening);}},
        {t:'Balance',r:true,f:function(r){var b = isC ? G.customerBalance(r.id) : G.supplierBalance(r.id); return '<span class="' + (b>0?'':'muted') + '">' + money(b) + '</span>';}},
        {t:'',r:true,f:function(r){return '<div class="tbl-actions"><button class="icon-btn" data-act="party-ledger" data-kind="'+kind+'" data-id="'+e(r.id)+'" title="Ledger">'+icon('file')+'</button><button class="icon-btn" data-act="edit-party" data-kind="'+kind+'" data-id="'+e(r.id)+'" title="Edit">'+icon('edit')+'</button></div>';}}
      ], rows, {emptyTitle:'No ' + kind, emptyMsg:'Add a ' + (isC?'customer':'supplier') + ' before creating entries.'});
  }

  /* ---------------- expenses / cash / accounts ---------------- */
  function viewExpenses() {
    return head('Expenses', 'Rent, wages, electricity, transport and other configurable heads.', btn('New expense', 'new-expense')) + dateFilter() +
      table([
        {t:'Date',f:function(r){return e(G.dateLabel(r.date));}},{t:'Category',f:function(r){return e(r.category);}},
        {t:'Amount',r:true,f:function(r){return money(r.amount);}},{t:'Mode',f:function(r){return e(r.mode||'cash');}},
        {t:'Note',f:function(r){return e(r.note||'—');}},
        {t:'',r:true,f:function(r){return '<div class="tbl-actions"><button class="icon-btn" data-act="delete-expense" data-id="'+e(r.id)+'" title="Delete">'+icon('trash')+'</button></div>';}}
      ], G.period(G.db.expenses, S.from, S.to), {emptyTitle:'No expenses', emptyMsg:'Record daily business expenses here.'});
  }
  function viewCashbook() {
    return head('Cash & bank', 'Receipts, payments and transfers — closing balances update automatically.', btn('New entry', 'new-cash')) + dateFilter() +
      '<div class="grid g2" style="margin-bottom:16px"><div class="tile"><p class="label">Cash closing</p><div class="value">'+e(G.rupees(G.cashBalance('cash')))+'</div></div><div class="tile"><p class="label">Bank closing</p><div class="value">'+e(G.rupees(G.cashBalance('bank')))+'</div></div></div>' +
      table([
        {t:'Date',f:function(r){return e(G.dateLabel(r.date));}},{t:'Account',f:function(r){return e(r.account);}},
        {t:'Direction',f:function(r){return '<span class="pill '+(r.dir==='in'?'ok':'warn')+'">'+(r.dir==='in'?'In':'Out')+'</span>';}},
        {t:'Category',f:function(r){return e(r.category);}},{t:'Amount',r:true,f:function(r){return money(r.amount);}},
        {t:'Note',f:function(r){return e(r.note||'—');}}
      ], G.period(G.db.cashbank, S.from, S.to), {emptyTitle:'No cash entries', emptyMsg:'Receipts from invoices and supplier payments appear here.'});
  }
  function viewAccounts() {
    var s = G.stats();
    var dr = s.purchases + s.expenses, cr = s.sales;
    return head('Accounts', 'Ledger-ready summary of balances and movements.',
      '<button class="btn ghost" data-act="go" data-view="reports" type="button">'+icon('reports')+'<span>Reports</span></button>') +
      '<div class="grid g4">' +
      '<div class="tile"><p class="label">Owner capital</p><div class="value">'+money(G.db.company.capital||0)+'</div></div>' +
      '<div class="tile"><p class="label">Drawings</p><div class="value">'+money(G.db.company.drawings||0)+'</div></div>' +
      '<div class="tile"><p class="label">Sales credit</p><div class="value">'+money(cr)+'</div></div>' +
      '<div class="tile"><p class="label">Purchases + expenses</p><div class="value">'+money(dr)+'</div></div></div>' +
      '<div class="card" style="margin-top:16px"><div class="card-head"><h2>Customer & supplier ledgers</h2></div><div class="card-body">' +
      (G.db.customers.length || G.db.suppliers.length ?
        '<div class="grid g2">' +
        '<div><h3 class="tiny">Customers</h3>' + G.db.customers.map(function (c) { return '<div class="spread" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>'+e(c.name)+'</span>'+money(G.customerBalance(c.id))+'</div>'; }).join('') + '</div>' +
        '<div><h3 class="tiny">Suppliers</h3>' + G.db.suppliers.map(function (c) { return '<div class="spread" style="padding:8px 0;border-bottom:1px solid var(--line)"><span>'+e(c.name)+'</span>'+money(G.supplierBalance(c.id))+'</div>'; }).join('') + '</div></div>' :
        empty('No ledgers yet','Add customers and suppliers to see balances.')) + '</div></div>';
  }

  /* ---------------- reports ---------------- */
  function reportData() {
    var r = S.report, from = S.from, to = S.to;
    if (r === 'sales') return { title:'Daily sales', cols:['Invoice','Date','Customer','Taxable','Tax','Total','Status'], rows:G.period(G.db.invoices,from,to).map(function (x) { return [x.no,G.dateLabel(x.date),nameOf('customers',x.customerId),G.rupees(x.taxable),G.rupees(x.cgst+x.sgst+x.igst),G.rupees(x.total),x.status]; }) };
    if (r === 'purchase') return { title:'Purchase register', cols:['Bill','Date','Supplier','Taxable','GST','Total','Status'], rows:G.period(G.db.purchases,from,to).map(function (x) { return [x.no,G.dateLabel(x.date),nameOf('suppliers',x.supplierId),G.rupees(x.taxable),G.rupees(x.tax),G.rupees(x.total),x.status]; }) };
    if (r === 'stock') return { title:'Stock summary', cols:['Product','Bottles / case','Opening','Ledger change','Closing','Cases + loose'], rows:G.db.products.map(function (p) { var d=G.db.ledger.filter(function(l){return l.productId===p.id&&(l.itemType||'product')==='product';}).reduce(function(a,l){return a+l.deltaBottles;},0); return [p.name,p.bpc,p.opening,d,G.stockBottles(p.id),G.stockLabel(p.id)]; }) };
    if (r === 'production') return { title:'Production register', cols:['Batch','Date','Product','Good','Rejected','Materials used'], rows:G.period(G.db.production,from,to).map(function (x) { return [x.batch,G.dateLabel(x.date),nameOf('products',x.productId),x.good,x.rejected||0,(x.consumption||[]).map(function(c){return nameOf('materials',c.materialId)+' '+c.qty;}).join(', ')||'—']; }) };
    if (r === 'expense') return { title:'Expense register', cols:['Date','Category','Mode','Amount','Note'], rows:G.period(G.db.expenses,from,to).map(function (x) { return [G.dateLabel(x.date),x.category,x.mode||'cash',G.rupees(x.amount),x.note||'']; }) };
    if (r === 'cash') return { title:'Cash / bank book', cols:['Date','Account','Direction','Category','Amount','Note'], rows:G.period(G.db.cashbank,from,to).map(function (x) { return [G.dateLabel(x.date),x.account,x.dir,x.category,G.rupees(x.amount),x.note||'']; }) };
    if (r === 'gst') return { title:'GST summary', cols:['Invoice','Date','Taxable','CGST','SGST','IGST','Total'], rows:G.period(G.db.invoices.filter(function(i){return i.status==='confirmed';}),from,to).map(function (x) { return [x.no,G.dateLabel(x.date),G.rupees(x.taxable),G.rupees(x.cgst),G.rupees(x.sgst),G.rupees(x.igst),G.rupees(x.total)]; }) };
    var s = G.stats(from,to);
    return { title:'Monthly management report', cols:['Heading','Value'], rows:[['Sales',G.rupees(s.sales)],['Purchases',G.rupees(s.purchases)],['Collections',G.rupees(s.collections)],['Expenses',G.rupees(s.expenses)],['Confirmed invoices',s.invoices],['Purchase bills',s.bills]] };
  }
  function viewReports() {
    var d = reportData(), types = [['sales','Daily sales'],['purchase','Purchase register'],['stock','Stock summary'],['production','Production register'],['expense','Expenses'],['cash','Cash / bank'],['gst','GST summary'],['monthly','Monthly report']];
    return head('Reports & exports', 'Filter a register, review totals, then export for the auditor.',
      '<button class="btn ghost" data-act="export-csv" type="button">'+icon('file')+'<span>CSV</span></button>' +
      '<button class="btn ghost" data-act="export-excel" type="button">'+icon('file')+'<span>Excel</span></button>' +
      '<button class="btn" data-act="export-pdf-report" type="button">'+icon('print')+'<span>PDF</span></button>') +
      '<div class="card" style="margin-bottom:16px"><div class="filter-bar">' +
      '<select id="fReport" aria-label="Report type">'+types.map(function(t){return '<option value="'+t[0]+'"'+(S.report===t[0]?' selected':'')+'>'+t[1]+'</option>';}).join('')+'</select>' +
      '<input type="date" id="fFrom" value="'+e(S.from)+'"><span class="tiny muted">to</span><input type="date" id="fTo" value="'+e(S.to)+'">' +
      '<button class="btn ghost sm" data-act="filter-report" type="button">Apply</button></div></div>' +
      '<div class="card"><div class="card-head"><h2>'+e(d.title)+'</h2><span class="pill info">'+d.rows.length+' rows</span></div>' +
      table(d.cols.map(function(c){return {t:c};}), d.rows.map(function(r){var o={};r.forEach(function(v,i){o['c'+i]=v;});return o;}), {}) + '</div>';
  }

  /* ---------------- control screens ---------------- */
  function viewUsers() {
    return head('Users & roles', 'Owner has full control; admin, accountant and staff are limited by role.', btn('Add user', 'new-user')) +
      table([{t:'Name',f:function(r){return '<strong>'+e(r.name)+'</strong><div class="tiny muted">'+e(r.email||'—')+'</div>';}},
        {t:'Role',f:function(r){return '<span class="pill '+(r.role==='owner'?'info':'')+'">'+e(G.PERMS[r.role]?'Owner · Admin':r.role)+'</span>';}},
        {t:'Status',f:function(r){return '<span class="pill ok">Active</span>';}},
        {t:'',r:true,f:function(r){return '<div class="tbl-actions"><button class="icon-btn" data-act="reset-password" data-id="'+e(r.id)+'" title="Reset password">'+icon('lock')+'</button>'+(r.role!=='owner'?'<button class="icon-btn" data-act="delete-user" data-id="'+e(r.id)+'" title="Remove">'+icon('trash')+'</button>':'')+'</div>';}}],
        G.db.users, {emptyTitle:'No users', emptyMsg:'Create the owner account at first launch.'});
  }
  function viewSettings() {
    var c = G.db.company, s = G.db.settings;
    return head('Settings', 'Company, tax and system configuration. Change rates only after auditor approval.',
      '<button class="btn ghost" data-act="edit-company" type="button">'+icon('edit')+'<span>Edit company</span></button>') +
      '<div class="grid g2">' +
      '<div class="card"><div class="card-head"><h2>Company profile</h2></div><div class="card-body">' +
      '<div class="spread" style="padding:6px 0"><span class="muted">Name</span><strong>'+e(c.name)+'</strong></div>' +
      '<div class="spread" style="padding:6px 0"><span class="muted">Address</span><span>'+e(c.address||'Not set')+'</span></div>' +
      '<div class="spread" style="padding:6px 0"><span class="muted">GSTIN</span><span class="mono">'+e(c.gstin||'Not set')+'</span></div>' +
      '<div class="spread" style="padding:6px 0"><span class="muted">State</span><span>'+e(c.state)+'</span></div>' +
      '<div class="spread" style="padding:6px 0"><span class="muted">Financial year starts</span><span>Month '+e(c.fyStartMonth)+'</span></div>' +
      '<div class="spread" style="padding:6px 0"><span class="muted">Invoice series</span><span class="mono">'+e(c.invoicePrefix)+'-'+e(G.fyOf().slice(0,4))+'-0001</span></div></div></div>' +
      '<div class="card"><div class="card-head"><h2>Tax & stock rules</h2></div><div class="card-body">' +
      '<div class="spread" style="padding:6px 0"><span class="muted">Default GST</span><strong>'+e(G.pct(c.gstRate))+'</strong></div>' +
      '<div class="spread" style="padding:6px 0"><span class="muted">HSN</span><span class="mono">'+e(c.hsn)+'</span></div>' +
      '<div class="spread" style="padding:6px 0"><span class="muted">Low-stock alert</span><span>'+e(s.lowStockBottles)+' bottles</span></div>' +
      '<div class="field" style="margin-top:12px"><label for="lowAt">Change alert level (bottles)</label><input id="lowAt" type="number" min="0" value="'+e(s.lowStockBottles)+'"></div>' +
      '<button class="btn ghost sm" data-act="save-low" type="button">Save alert level</button></div></div>' +
      '<div class="card"><div class="card-head"><h2>Month close</h2></div><div class="card-body">' +
      '<p class="tiny muted">Accountant marks a month reviewed; owner reopens it with a reason. Locked months reject new entries.</p>' +
      '<div class="row" style="margin-top:12px"><input id="lockMonth" type="month" value="'+G.monthOf()+'" style="width:160px"><button class="btn sm" data-act="lock-month" type="button">'+icon('lock')+'<span>Lock</span></button></div>' +
      '<div class="row" style="margin-top:10px"><input id="openMonth" type="month" value="'+G.monthOf()+'" style="width:160px"><button class="btn ghost sm" data-act="open-month" type="button">Reopen</button></div>' +
      '<p class="tiny" style="margin-top:12px">'+Object.keys(G.db.locks).map(function(m){return '<span class="pill warn" style="margin:2px">'+e(m)+'</span>';}).join('')+'</p></div></div>' +
      '<div class="card"><div class="card-head"><h2>About this build</h2></div><div class="card-body">' +
      '<p class="tiny muted">Version '+e(s.appVersion)+' · local-first PWA. Data lives in this browser only. Free static hosting cannot run a Node API or PostgreSQL — for multi-device shared data and statutory use, move these business rules to a server. GST rates, HSN and tax treatment must be approved by the company’s auditor before live use.</p></div></div>' +
      '</div>';
  }
  function viewAudit() {
    return head('Audit log', 'Every login and financial action, newest first.', btn('Export CSV', 'export-audit')) + dateFilter() +
      table([{t:'When',f:function(r){return '<span class="tiny">'+e(r.ts ? r.ts.replace('T',' ').slice(0,19) : '')+'</span>';}},
        {t:'User',f:function(r){return e(r.user)+'<div class="tiny muted">'+e(r.role||'')+'</div>';}},
        {t:'Action',f:function(r){return '<strong>'+e(r.action)+'</strong>';}},
        {t:'Detail',f:function(r){return e(r.detail);}}], G.period(G.db.audit, S.from, S.to),
        {emptyTitle:'No activity', emptyMsg:'Logins, confirmations and backups will be recorded here.'});
  }
  function viewBackup() {
    return head('Backup & restore', 'Take a copy before month end, or move data to another device.', '') +
      '<div class="grid g3">' +
      '<div class="card card-pad"><h3>Excel workbook</h3><p class="tiny muted">All registers as separate sheets. Opens in Excel or LibreOffice.</p><button class="btn" data-act="export-excel" type="button">'+icon('file')+'<span>Download .xls</span></button></div>' +
      '<div class="card card-pad"><h3>PDF report</h3><p class="tiny muted">Monthly management report with totals, ready to print or share.</p><button class="btn" data-act="export-pdf-report" type="button">'+icon('print')+'<span>Download .pdf</span></button></div>' +
      '<div class="card card-pad"><h3>Full backup</h3><p class="tiny muted">JSON snapshot of every record. Use Restore to bring it back.</p><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="export-json" type="button">Download JSON</button><button class="btn ghost sm" data-act="import-json" type="button">Restore</button></div></div></div>' +
      '<div class="card" style="margin-top:16px"><div class="card-head"><h2>Backup history</h2></div><div class="card-body">' +
      table([{t:'When',f:function(r){return e(r.ts ? r.ts.replace('T',' ').slice(0,19):'');}},{t:'Action',f:function(r){return e(r.action);}},{t:'Detail',f:function(r){return e(r.detail);}}],
        G.db.audit.filter(function(a){return /backup|restore|export/i.test(a.action);}).slice(0,30), {emptyTitle:'No backups yet', emptyMsg:'Downloads and restores are recorded here.'}) + '</div></div>' +
      '<input type="file" id="restoreFile" accept="application/json,.json" hidden>';
  }

  var VIEWS = {
    dashboard:viewDashboard, sales:viewSales, purchase:viewPurchases, inventory:viewInventory,
    production:viewProduction, materials:viewMaterials, customers:function(){return partyView('customers');},
    suppliers:function(){return partyView('suppliers');}, expenses:viewExpenses, cashbook:viewCashbook,
    accounts:viewAccounts, reports:viewReports, users:viewUsers, settings:viewSettings, audit:viewAudit, backup:viewBackup
  };
  var TITLES = {
    dashboard:'Dashboard', sales:'Sales & invoices', purchase:'Purchase bills', inventory:'Inventory / stock',
    production:'Production', materials:'Raw materials', customers:'Customers', suppliers:'Suppliers',
    expenses:'Expenses', cashbook:'Cash & bank', accounts:'Accounts', reports:'Reports & exports',
    users:'Users & roles', settings:'Settings', audit:'Audit log', backup:'Backup & restore'
  };
  var GROUPS = [
    { label:'Work', items:[['dashboard','dashboard','Dashboard'],['sales','sales','Sales & invoices'],['purchase','purchase','Purchase bills'],['inventory','inventory','Inventory / stock'],['production','production','Production']] },
    { label:'Masters', items:[['materials','materials','Raw materials'],['customers','customers','Customers'],['suppliers','suppliers','Suppliers']] },
    { label:'Accounts', items:[['expenses','expenses','Expenses'],['cashbook','cashbook','Cash & bank'],['accounts','accounts','Accounts'],['reports','reports','Reports']] },
    { label:'Control', items:[['backup','backup','Backup'],['audit','audit','Audit log'],['users','users','Users & roles'],['settings','settings','Settings']] }
  ];
  function renderSidebar(view) {
    var nav = document.getElementById('nav'); if (!nav) return;
    nav.innerHTML = GROUPS.map(function (g) {
      var items = g.items.filter(function (it) { return G.can(it[0]); });
      if (!items.length) return '';
      return '<div class="nav-label">'+g.label+'</div>' + items.map(function (it) {
        return '<button class="nav-item'+(view===it[0]?' active':'')+'" data-act="go" data-view="'+it[0]+'" type="button">'+icon(it[1])+'<span>'+it[2]+'</span></button>';
      }).join('');
    }).join('');
    var u = G.currentUser(), su = document.getElementById('sideUser');
    if (su) su.innerHTML = '<span class="avatar">'+e((u?u.name:'?').slice(0,1).toUpperCase())+'</span><span>'+e(u?u.name:'')+'<small>'+(u && u.role==='owner'?'Owner · Admin':e(u?u.role:''))+'</small></span>';
  }
  function render(view) {
    view = view || 'dashboard';
    if (!G.can(view)) view = 'dashboard';
    renderSidebar(view);
    var title = document.getElementById('pageTitle'), crumb = document.getElementById('crumb'), root = document.getElementById('view');
    if (title) title.textContent = TITLES[view] || 'Workspace';
    if (crumb) crumb.textContent = (G.db.company.name || 'Glacier');
    if (root) root.innerHTML = (VIEWS[view] || viewDashboard)();
    var foot = document.getElementById('footNote');
    if (foot) foot.textContent = G.db.company.needsSetup ? 'Setup needed: add your registered address, GSTIN and opening stock in Settings before live use.' : 'Demo configuration — confirm rates and opening balances with your auditor before live use.';
    window.scrollTo && window.scrollTo(0,0);
  }

  /* ---------------- modal helpers ---------------- */
  function openModal(title, bodyHtml, footHtml, small) {
    var root = document.getElementById('modalRoot'); if (!root) return;
    root.innerHTML = '<div class="modal-back" data-act="modal-back"><div class="modal'+(small?' small':'')+'" role="dialog" aria-modal="true" aria-label="'+e(title)+'">' +
      '<div class="modal-head"><h2>'+e(title)+'</h2><button class="icon-btn" data-act="close-modal" type="button" aria-label="Close">'+icon('close')+'</button></div>' +
      '<div class="modal-body">'+bodyHtml+'</div>' + (footHtml ? '<div class="modal-foot">'+footHtml+'</div>' : '') + '</div></div>';
    root.hidden = false;
    var first = root.querySelector('input,select,textarea,button');
    if (first && first.focus) first.focus();
  }
  function closeModal() { var r = document.getElementById('modalRoot'); if (r) { r.hidden = true; r.innerHTML = ''; } }
  function toast(msg, kind) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(t._timer); t._timer = setTimeout(function () { t.className = 'toast'; }, 3600);
  }
  function confirmModal(title, msg, yesAct, id, extra) {
    openModal(title, '<p style="margin:0">'+e(msg)+'</p>'+(extra||''),
      '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn danger" data-act="'+yesAct+'" data-id="'+e(id||'')+'" type="button">Yes, continue</button>', true);
  }

  /* ---------------- entry forms ---------------- */
  function invoiceLineRow(l, products) {
    l = l || {};
    return '<div class="line-grid" data-line="invoice">' +
      '<div><label>Product</label><select name="lProduct" data-lineselect>'+opts('products',l.productId,'')+'</select></div>' +
      '<div><label>Unit</label><select name="lUnit"><option value="bottle"'+(l.unit==='bottle'?' selected':'')+'>Bottle</option><option value="case"'+(l.unit==='case'?' selected':'')+'>Case</option></select></div>' +
      '<div><label>Qty</label><input name="lQty" type="number" min="1" step="1" value="'+(l.qty||1)+'"></div>' +
      '<div><label>Rate / bottle (Rs)</label><input name="lRate" type="number" min="0" step="0.01" value="'+(l.rate!=null?(l.rate/100).toFixed(2):'0')+'"></div>' +
      '<button class="icon-btn" data-act="del-line" type="button" aria-label="Remove line">'+icon('trash')+'</button></div>';
  }
  function formInvoice(inv) {
    inv = inv || {};
    var c = G.db.company;
    var body =
      '<form data-form="invoice">' +
      '<div class="form-grid">' +
      field({name:'date',label:'Invoice date',type:'date',value:inv.date||G.today(),req:true}) +
      field({name:'dueDate',label:'Due date',type:'date',value:inv.dueDate||''}) +
      field({name:'customerId',label:'Customer',type:'select',options:opts('customers',inv.customerId,'Walk-in / select'),full:true}) +
      field({name:'taxMode',label:'Tax treatment',type:'select',options:'<option value="auto">Auto (by state)</option><option value="intra">Intra-state · CGST+SGST</option><option value="inter">Inter-state · IGST</option>',full:true,hint:'Confirm with your GST auditor before live use.'}) +
      field({name:'paymentMode',label:'Payment mode',type:'select',options:'<option value="cash">Cash</option><option value="bank">Bank</option><option value="upi">UPI</option><option value="credit">Credit</option>'}) +
      field({name:'paid',label:'Paid with this invoice (Rs)',type:'number',step:'0.01',value:inv.paid!=null?(inv.paid/100).toFixed(2):'0',min:0}) +
      '</div><div class="card-head" style="margin-top:14px;padding-left:0;padding-right:0"><h3>Line items</h3><button class="btn ghost sm" data-act="add-invoice-line" type="button">'+icon('plus')+'<span>Add item</span></button></div>' +
      '<div id="lineBody">'+(inv.lines&&inv.lines.length?inv.lines.map(function(l){return invoiceLineRow(l);}).join(''):invoiceLineRow())+'</div>' +
      '<div class="form-grid" style="margin-top:10px">' +
      field({name:'discount',label:'Invoice discount (Rs)',type:'number',step:'0.01',value:inv.discount!=null?(inv.discount/100).toFixed(2):'0',min:0}) +
      field({name:'notes',label:'Notes',type:'textarea',value:inv.notes||'',full:true}) +
      '</div><div class="summary-box" id="invSummary"></div></form>';
    var foot = '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="save-invoice" type="button">'+icon('check')+'<span>Save draft</span></button>';
    openModal('New sales invoice', body, foot);
    updateInvoiceSummary();
  }
  function collectLines(root, kind) {
    var rows = [], nodes = root.querySelectorAll('[data-line="'+kind+'"]');
    nodes.forEach(function (n) {
      function val(name) { var el = n.querySelector('[name="'+name+'"]'); return el ? el.value : ''; }
      rows.push({ productId:val('lProduct'), materialId:val('lMaterial'), itemId:val('lItem'), itemType:val('lItemType'), unit:val('lUnit'), qty:Number(val('lQty'))||0, rate:Math.round((Number(val('lRate'))||0)*100), gstRate:Number(val('lGst'))||0, amount:Math.round((Number(val('lAmount'))||0)*100) });
    });
    return rows;
  }
  function updateInvoiceSummary() {
    var root = document.getElementById('modalRoot'), box = root && root.querySelector('#invSummary'); if (!box) return;
    var raw = collectLines(root,'invoice').map(function (l) {
      var p = G.product(l.productId); var bottles = G.lineBottles(p,l.unit,l.qty);
      return { bottles:bottles, rate:l.rate, discount:0 };
    });
    var d = root.querySelector('[name="discount"]');
    var calc = G.calcInvoice({ lines:raw, discount:G.paise(d?d.value:0), taxMode:(root.querySelector('[name="taxMode"]')||{}).value });
    box.innerHTML = '<div class="line"><span>Taxable value</span><span class="num">'+e(G.rupees(calc.taxable))+'</span></div>' +
      '<div class="line"><span>'+(calc.inter?'IGST':'CGST + SGST')+'</span><span class="num">'+e(G.rupees(calc.tax))+'</span></div>' +
      '<div class="line"><span>Round off</span><span class="num">'+e(G.rupees(calc.round))+'</span></div>' +
      '<div class="line total"><span>Grand total</span><span>'+e(G.rupees(calc.total))+'</span></div>';
  }
  function formPurchase() {
    var body = '<form data-form="purchase"><div class="form-grid">' +
      field({name:'date',label:'Bill date',type:'date',value:G.today(),req:true}) +
      field({name:'no',label:'Supplier bill number',value:'',ph:'e.g. SUP/1234',req:true}) +
      field({name:'supplierId',label:'Supplier',type:'select',options:opts('suppliers','','Select supplier'),req:true}) +
      field({name:'paymentMode',label:'Payment mode',type:'select',options:'<option value="cash">Cash</option><option value="bank">Bank</option><option value="upi">UPI</option><option value="credit">Credit</option>'}) +
      field({name:'paid',label:'Paid now (Rs)',type:'number',step:'0.01',value:'0',min:0}) +
      field({name:'freight',label:'Freight (Rs)',type:'number',step:'0.01',value:'0',min:0}) +
      field({name:'other',label:'Other charges (Rs)',type:'number',step:'0.01',value:'0',min:0}) +
      field({name:'proof',label:'Proof reference / file name',value:'',full:true,ph:'Optional — attach note or file name'}) +
      '</div><div class="card-head" style="margin-top:14px;padding-left:0;padding-right:0"><h3>Bill lines</h3><button class="btn ghost sm" data-act="add-purchase-line" type="button">'+icon('plus')+'<span>Add line</span></button></div>' +
      '<div id="lineBody">'+purchaseLineRow()+'</div>' +
      field({name:'notes',label:'Notes',type:'textarea',full:true}) +
      '<div class="summary-box" id="purSummary"></div></form>';
    openModal('New purchase bill', body,
      '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="save-purchase" type="button">Save draft</button>');
    updatePurchaseSummary();
  }
  function purchaseLineRow() {
    return '<div class="line-grid" data-line="purchase">' +
      '<div><label>Item type</label><select name="lItemType"><option value="product">Finished product</option><option value="material">Raw material</option></select></div>' +
      '<div><label>Item</label><select name="lItem" data-lineselect>'+opts('products','','')+'</select></div>' +
      '<div><label>Quantity</label><input name="lQty" type="number" min="1" value="1"></div>' +
      '<div><label>Rate / unit (Rs)</label><input name="lRate" type="number" min="0" step="0.01" value="0"></div>' +
      '<div><label>GST %</label><input name="lGst" type="number" min="0" step="0.5" value="18"></div>' +
      '<button class="icon-btn" data-act="del-line" type="button" aria-label="Remove line">'+icon('trash')+'</button></div>';
  }
  function updatePurchaseSummary() {
    var root = document.getElementById('modalRoot'), box = root && root.querySelector('#purSummary'); if (!box) return;
    var lines = collectLines(root,'purchase').map(function (l) {
      var p = G.product(l.itemId) || G.material(l.itemId) || { bpc:1 };
      var qty = l.qty * (l.unit==='case' && l.itemType==='product' ? G.bpc(p) : 1);
      return { amount:Math.round(qty*l.rate), gstRate:l.gstRate };
    });
    function v(n){var el=root.querySelector('[name="'+n+'"]');return Math.round((Number(el&&el.value)||0)*100);}
    var calc = G.calcPurchase({ lines:lines, freight:v('freight'), other:v('other') });
    box.innerHTML = '<div class="line"><span>Taxable</span><span class="num">'+e(G.rupees(calc.taxable))+'</span></div><div class="line"><span>GST</span><span class="num">'+e(G.rupees(calc.tax))+'</span></div><div class="line total"><span>Grand total</span><span>'+e(G.rupees(calc.total))+'</span></div>';
  }
  function formProduction() {
    var body = '<form data-form="production"><div class="form-grid">' +
      field({name:'date',label:'Date',type:'date',value:G.today(),req:true}) +
      field({name:'batch',label:'Batch number',value:'B-'+G.today().replace(/-/g,''),req:true}) +
      field({name:'productId',label:'Product',type:'select',options:opts('products','','Select product'),req:true}) +
      field({name:'good',label:'Good bottles',type:'number',min:0,value:'0',req:true}) +
      field({name:'rejected',label:'Rejected bottles',type:'number',min:0,value:'0'}) +
      '</div><div class="card-head" style="margin-top:14px;padding-left:0;padding-right:0"><h3>Raw material used</h3><button class="btn ghost sm" data-act="add-consumption" type="button">'+icon('plus')+'<span>Add material</span></button></div><div id="lineBody">'+consumptionRow()+'</div>' +
      field({name:'note',label:'Note',type:'textarea',full:true})+'</form>';
    openModal('New production batch', body,
      '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="save-production" type="button">Save draft</button>');
  }
  function consumptionRow() {
    return '<div class="line-grid" data-line="consumption">' +
      '<div class="full"><label>Material</label><select name="lMaterial">'+opts('materials','','')+'</select></div>' +
      '<div><label>Quantity used</label><input name="lQty" type="number" min="0" value="0"></div>' +
      '<button class="icon-btn" data-act="del-line" type="button" aria-label="Remove">'+icon('trash')+'</button></div>';
  }
  function formAdjust() {
    var body = '<form data-form="adjust"><div class="form-grid">' +
      field({name:'date',label:'Date',type:'date',value:G.today(),req:true}) +
      field({name:'itemType',label:'Item type',type:'select',options:'<option value="product">Finished product</option><option value="material">Raw material</option>'}) +
      field({name:'productId',label:'Item',type:'select',options:opts('products','','Select item'),full:true,req:true}) +
      field({name:'type',label:'Reason',type:'select',options:'<option value="Damage">Damage</option><option value="Leakage">Leakage</option><option value="Expiry">Expiry</option><option value="Wastage">Wastage</option><option value="Return">Return</option><option value="Correction">Correction</option>'}) +
      field({name:'delta',label:'Change (use − for reduction)',type:'number',step:'1',value:'0',req:true}) +
      field({name:'note',label:'Note',type:'textarea',full:true})+'</div></form>';
    openModal('Stock adjustment', body, '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="save-adjust" type="button">Post adjustment</button>', true);
  }
  function formCash() {
    var body = '<form data-form="cash"><div class="form-grid">' +
      field({name:'date',label:'Date',type:'date',value:G.today(),req:true}) +
      field({name:'account',label:'Account',type:'select',options:'<option value="cash">Cash</option><option value="bank">Bank</option>'}) +
      field({name:'dir',label:'Direction',type:'select',options:'<option value="in">Receipt (in)</option><option value="out">Payment (out)</option>'}) +
      field({name:'kind',label:'Against',type:'select',options:'<option value="other">Other</option><option value="customer">Customer</option><option value="supplier">Supplier</option>'}) +
      field({name:'ref',label:'Party',type:'select',options:opts('customers','','Select party'),full:true}) +
      field({name:'category',label:'Category',value:'',ph:'e.g. Customer receipt',req:true}) +
      field({name:'amount',label:'Amount (Rs)',type:'number',step:'0.01',min:0,value:'0',req:true}) +
      field({name:'note',label:'Note',type:'textarea',full:true})+'</div></form>';
    openModal('Cash / bank entry', body, '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="save-cash" type="button">Save entry</button>', true);
  }
  function formUser() {
    var body = '<form data-form="user"><div class="form-grid">' +
      field({name:'name',label:'Full name',req:true}) + field({name:'email',label:'Email',type:'email'}) +
      field({name:'role',label:'Role',type:'select',options:'<option value="admin">Admin</option><option value="accountant">Accountant</option><option value="staff">Staff</option>'}) +
      field({name:'password',label:'Temporary password',type:'password',req:true,hint:'Share it privately; change it after first login.'}) +
      '</div></form>';
    openModal('Add user', body, '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="save-user" type="button">Create user</button>', true);
  }
  function formCompany() {
    var c = G.db.company;
    var body = '<form data-form="company"><div class="form-grid">' +
      field({name:'name',label:'Legal company name',value:c.name,req:true,full:true}) +
      field({name:'address',label:'Registered address',value:c.address,full:true}) +
      field({name:'gstin',label:'GSTIN',value:c.gstin}) + field({name:'state',label:'State',value:c.state}) +
      field({name:'phone',label:'Phone',value:c.phone}) + field({name:'email',label:'Email',type:'email',value:c.email}) +
      field({name:'fyStartMonth',label:'Financial year start month (1-12)',type:'number',min:1,max:12,value:c.fyStartMonth}) +
      field({name:'invoicePrefix',label:'Invoice prefix',value:c.invoicePrefix}) +
      field({name:'gstRate',label:'Default GST %',type:'number',step:'0.5',min:0,value:c.gstRate}) +
      field({name:'hsn',label:'HSN code',value:c.hsn}) +
      '</div></form>';
    openModal('Company settings', body, '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="save-company" type="button">Save settings</button>');
  }
  function showInvoice(inv) {
    var c = G.calcInvoice(inv);
    var rows = (inv.lines||[]).map(function(l){var p=G.product(l.productId)||{};return '<tr><td>'+e(p.name||l.productId)+'</td><td>'+e(l.qty)+' '+(l.unit==='case'?'case':'bottle')+'</td><td>'+e(l.bottles)+' bottles</td><td class="r">'+e(G.rupees(l.rate))+'</td><td class="r">'+e(G.rupees(G.amountLine(l)))+'</td></tr>';}).join('');
    openModal('Invoice '+inv.no,
      '<div class="spread"><div><p class="overline">'+e(G.dateLabel(inv.date))+'</p><h3>'+e(nameOf('customers',inv.customerId))+'</h3></div>'+status(inv.status)+'</div>' +
      '<div class="table-wrap" style="margin-top:16px"><table><thead><tr><th>Item</th><th>Qty</th><th>Bottles</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>'+rows+'</tbody></table></div>' +
      '<div class="summary-box" style="margin-top:14px"><div class="line"><span>Taxable</span><span>'+e(G.rupees(c.taxable))+'</span></div><div class="line"><span>'+(c.inter?'IGST':'CGST '+G.rupees(c.cgst)+' + SGST '+G.rupees(c.sgst))+'</span><span>'+e(G.rupees(c.tax))+'</span></div><div class="line total"><span>Total</span><span>'+e(G.rupees(c.total))+'</span></div></div>' +
      (inv.cancelReason?'<p class="tiny muted">Cancelled: '+e(inv.cancelReason)+'</p>':''),
      '<button class="btn ghost" data-act="export-pdf-invoice" data-id="'+e(inv.id)+'" type="button">PDF</button><button class="btn ghost" data-act="close-modal" type="button">Close</button>');
  }
  function showLedger(kind, id) {
    var isC = kind === 'customers', party = G.get(kind, id);
    var rows = isC ? G.db.invoices.filter(function(i){return i.customerId===id;}).map(function(i){return [G.dateLabel(i.date),i.no,'Billed',G.rupees(i.total)];})
      .concat(G.db.cashbank.filter(function(c){return c.kind==='customer'&&c.ref===id;}).map(function(c){return [G.dateLabel(c.date),c.category,'Receipt','-'+G.rupees(c.amount)];}))
      : G.db.purchases.filter(function(p){return p.supplierId===id;}).map(function(p){return [G.dateLabel(p.date),p.no,'Billed',G.rupees(p.total)];})
      .concat(G.db.cashbank.filter(function(c){return c.kind==='supplier'&&c.ref===id;}).map(function(c){return [G.dateLabel(c.date),c.category,'Payment','-'+G.rupees(c.amount)];}));
    openModal((party?party.name:'Party')+' ledger',
      '<p class="tiny muted">Closing balance: <strong>'+e(G.rupees(isC?G.customerBalance(id):G.supplierBalance(id)))+'</strong></p>' +
      table([{t:'Date',f:function(r){return '<span class="mono">'+e(r[0])+'</span>';}},{t:'Reference',f:function(r){return e(r[1]);}},{t:'Type',f:function(r){return e(r[2]);}},{t:'Amount',r:true,f:function(r){return e(r[3]);}}],rows.map(function(r){return {0:r[0],1:r[1],2:r[2],3:r[3]};}),{}),
      '<button class="btn ghost" data-act="close-modal" type="button">Close</button>', true);
  }

  Object.assign(G, { ui:{
    I:I, icon:icon, btn:btn, empty:empty, head:head, table:table, money:money, status:status,
    opts:opts, field:field, form:form, render:render, renderSidebar:renderSidebar,
    openModal:openModal, closeModal:closeModal, toast:toast, confirmModal:confirmModal,
    formInvoice:formInvoice, formPurchase:formPurchase, formProduction:formProduction, formAdjust:formAdjust,
    formCash:formCash, formUser:formUser, formCompany:formCompany, invoiceLineRow:invoiceLineRow,
    purchaseLineRow:purchaseLineRow, consumptionRow:consumptionRow, collectLines:collectLines,
    updateInvoiceSummary:updateInvoiceSummary, updatePurchaseSummary:updatePurchaseSummary,
    showInvoice:showInvoice, showLedger:showLedger, reportData:reportData, viewBackup:viewBackup,
    VIEWS:VIEWS, TITLES:TITLES
  }});
})();
