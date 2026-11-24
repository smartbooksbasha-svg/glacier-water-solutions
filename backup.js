/* Glacier Water Solutions — exports, backups and restore */
(function () {
  'use strict';
  var G = window.GWS, U = G.ui;

  function stamp() { return G.today().replace(/-/g, '') + '-' + String(new Date().getHours()).padStart(2,'0') + String(new Date().getMinutes()).padStart(2,'0'); }
  function download(name, text, mime) {
    mime = mime || 'text/plain;charset=utf-8';
    var href = '';
    try {
      var blob = new Blob([text], { type:mime });
      if (window.URL && window.URL.createObjectURL) href = window.URL.createObjectURL(blob);
    } catch (e) { }
    if (!href) href = 'data:' + mime + ',' + encodeURIComponent(text);
    var a = document.createElement('a'); a.href = href; a.download = name; a.style.display = 'none';
    document.body.appendChild(a);
    if (a.click) a.click();
    setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 0);
    G.audit('Backup / export', name);
    return href;
  }
  function xml(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;'); }
  function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g,'""') + '"'; }

  function exportJSON() {
    var payload = {
      app:'glacier-water-solutions', version:1, exportedAt:G.nowTs(),
      data:{
        company:G.db.company, settings:G.db.settings, seq:G.db.seq, locks:G.db.locks,
        products:G.db.products, materials:G.db.materials, customers:G.db.customers, suppliers:G.db.suppliers,
        invoices:G.db.invoices, purchases:G.db.purchases, production:G.db.production, expenses:G.db.expenses,
        cashbank:G.db.cashbank, ledger:G.db.ledger, adjust:G.db.adjust, audit:G.db.audit
      }
    };
    return download('Glacier-backup-' + stamp() + '.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
  }
  function restoreJSON(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return { ok:false, msg:'That file is not valid JSON.' }; }
    if (!data || data.app !== 'glacier-water-solutions') return { ok:false, msg:'Not a Glacier backup file.' };
    var src = data.data || {}, keys = ['company','settings','seq','locks','products','materials','customers','suppliers','invoices','purchases','production','expenses','cashbank','ledger','adjust','audit'];
    keys.forEach(function (k) {
      if (src[k] == null) return;
      if (k === 'company' || k === 'settings' || k === 'seq' || k === 'locks') {
        G.db[k] = Object.assign({}, G.db[k], src[k]); G.write(G.K[k], G.db[k]);
      } else if (Array.isArray(src[k])) { G.db[k] = src[k]; G.write(G.K[k], G.db[k]); }
    });
    G.audit('Restore backup', 'From file exported ' + (data.exportedAt || 'unknown'));
    return { ok:true, msg:'Backup restored. Check your opening stock and balances.' };
  }

  function workbook(sheets) {
    var esc = xml;
    function tableXml(rows) {
      return '<Table>' + rows.map(function (r) {
        return '<Row>' + r.map(function (v) {
          var numeric = typeof v === 'number' && isFinite(v);
          return '<Cell' + (numeric ? '' : ' ss:StyleID="s"') + '><Data ss:Type="' + (numeric ? 'Number' : 'String') + '">' + esc(numeric ? v : (v == null ? '' : v)) + '</Data></Cell>';
        }).join('') + '</Row>';
      }).join('') + '</Table>';
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n' +
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
      '<Styles><Style ss:ID="s"><Font ss:Bold="1"/><Interior ss:Color="#DCE7EC" ss:Pattern="Solid"/></Style></Styles>' +
      sheets.map(function (s) {
        return '<Worksheet ss:Name="' + esc(s.name.slice(0,28)) + '">' + tableXml(s.rows) + '</Worksheet>';
      }).join('') + '</Workbook>';
  }
  function exportExcel() {
    function rows(arr, fn) { return [fn && fn.head || []].concat(arr.map(fn)); }
    var sheets = [
      { name:'Summary', rows:[['Glacier Water Solutions'],['Generated',G.nowTs()],['Company',G.db.company.name],['GSTIN',G.db.company.gstin],
        ['Sales',G.sum(G.db.invoices,'total')],['Purchases',G.sum(G.db.purchases,'total')],['Cash',G.cashBalance('cash')],['Bank',G.cashBalance('bank')]] },
      { name:'Sales', rows:[['Invoice','Date','Customer','Taxable','CGST','SGST','IGST','Total','Status','Payment']].concat(G.db.invoices.map(function(i){return [i.no,i.date,(G.get('customers',i.customerId)||{}).name||'',i.taxable/100,i.cgst/100,i.sgst/100,i.igst/100,i.total/100,i.status,i.paymentMode||''];})) },
      { name:'Purchases', rows:[['Bill','Date','Supplier','Taxable','GST','Freight','Total','Status']].concat(G.db.purchases.map(function(p){return [p.no,p.date,(G.get('suppliers',p.supplierId)||{}).name||'',p.taxable/100,p.tax/100,(p.freight||0)/100,p.total/100,p.status];})) },
      { name:'Stock', rows:[['Product','Bottles/case','Opening','Ledger change','Closing','Cases','Loose']].concat(G.db.products.map(function(p){var d=G.db.ledger.filter(function(l){return l.productId===p.id&&(l.itemType||'product')==='product';}).reduce(function(a,l){return a+l.deltaBottles;},0);var b=G.stockBottles(p.id);return [p.name,p.bpc,p.opening,d,b,Math.floor(b/p.bpc),b%p.bpc];})) },
      { name:'StockLedger', rows:[['Date','Item','Type','Change','Reference','User']].concat(G.db.ledger.map(function(l){return [l.date,(G.get((l.itemType||'product')==='material'?'materials':'products',l.productId)||{}).name||l.productId,l.type,l.deltaBottles,l.ref,l.user||''];})) },
      { name:'Production', rows:[['Batch','Date','Product','Good','Rejected','Status']].concat(G.db.production.map(function(p){return [p.batch,p.date,(G.get('products',p.productId)||{}).name||'',p.good,p.rejected||0,p.status];})) },
      { name:'Materials', rows:[['Material','Unit','Balance','Rate']].concat(G.db.materials.map(function(m){return [m.name,m.unit||'pcs',G.stockBottles(m.id,'material'),(m.rate||0)/100];})) },
      { name:'Customers', rows:[['Name','Phone','GSTIN','State','Opening','Balance']].concat(G.db.customers.map(function(c){return [c.name,c.phone||'',c.gstin||'',c.state||'',(c.opening||0)/100,G.customerBalance(c.id)/100];})) },
      { name:'Suppliers', rows:[['Name','Phone','GSTIN','State','Opening','Balance']].concat(G.db.suppliers.map(function(s){return [s.name,s.phone||'',s.gstin||'',s.state||'',(s.opening||0)/100,G.supplierBalance(s.id)/100];})) },
      { name:'Expenses', rows:[['Date','Category','Amount','Mode','Note']].concat(G.db.expenses.map(function(x){return [x.date,x.category,(x.amount||0)/100,x.mode||'',x.note||''];})) },
      { name:'CashBank', rows:[['Date','Account','Direction','Category','Amount','Note']].concat(G.db.cashbank.map(function(c){return [c.date,c.account,c.dir,c.category,(c.amount||0)/100,c.note||''];})) },
      { name:'Audit', rows:[['When','User','Role','Action','Detail']].concat(G.db.audit.map(function(a){return [a.ts,a.user,a.role,a.action,a.detail];})) }
    ];
    // Style the header row of every sheet.
    sheets.forEach(function (s) { s.rows[0] = s.rows[0].map(function (v) { return v; }); });
    return download('Glacier-backup-' + stamp() + '.xls', workbook(sheets), 'application/vnd.ms-excel;charset=utf-8');
  }
  function exportCSV() {
    var d = U.reportData();
    var text = '\ufeff' + [d.cols, d.rows].map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
    return download('Glacier-' + d.title.replace(/\s+/g,'-') + '-' + stamp() + '.csv', text, 'text/csv;charset=utf-8');
  }
  function exportAuditCSV() {
    var rows = [['When','User','Role','Action','Detail','Device']].concat(G.db.audit.map(function(a){return [a.ts,a.user,a.role,a.action,a.detail,a.device||''];}));
    return download('Glacier-audit-' + stamp() + '.csv', '\ufeff' + rows.map(function(r){return r.map(csvCell).join(',');}).join('\r\n'), 'text/csv;charset=utf-8');
  }

  function pdfDoc() {
    var lib = window.jspdf || {};
    if (!lib.jsPDF) { U.toast('PDF library is not loaded — use print instead.', 'err'); return null; }
    var doc = new lib.jsPDF({ orientation:'p', unit:'mm', format:'a4' });
    return doc;
  }
  function header(doc, title, sub) {
    doc.setFillColor(11,34,48); doc.rect(0,0,210,30,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(15);
    doc.text(String(G.db.company.name || 'Glacier Water Solutions').slice(0,42),14,12);
    doc.setFont('helvetica','normal'); doc.setFontSize(9);
    doc.text(String(G.db.company.address || '').slice(0,80),14,19);
    doc.text('GSTIN: ' + (G.db.company.gstin || '—'),14,25);
    doc.text(String(sub || ''),196,12,{align:'right'});
    doc.setTextColor(16,42,56); doc.setFont('helvetica','bold'); doc.setFontSize(13);
    doc.text(title,14,42); doc.setFont('helvetica','normal'); doc.setFontSize(9);
    doc.text('Period: ' + (G.uiState.from || 'all') + ' to ' + (G.uiState.to || G.today()),14,48);
    return 54;
  }
  function table(doc, head, body, y) {
    if (doc.autoTable) {
      doc.autoTable({ head:[head], body:body, startY:y, styles:{fontSize:8, cellPadding:2}, headStyles:{fillColor:[219,231,236], textColor:[16,42,56]}, alternateRowStyles:{fillColor:[247,251,252]} });
      return doc.lastAutoTable.finalY + 8;
    }
    doc.setFontSize(8); var x = 14;
    head.forEach(function (h) { doc.text(String(h).slice(0,26),x,y); x += 36; });
    y += 6;
    body.forEach(function (r) { x=14; r.forEach(function(v){doc.text(String(v).slice(0,26),x,y);x+=36;}); y+=5; if(y>275){doc.addPage();y=20;} });
    return y + 8;
  }
  function exportPDFReport() {
    var doc = pdfDoc(); if (!doc) return null;
    var d = U.reportData(); var y = header(doc, d.title, 'AUDIT / MANAGEMENT COPY');
    y = table(doc, d.cols, d.rows, y);
    if (d.title === 'Monthly management report') {
      var s = G.stats(G.uiState.from, G.uiState.to);
      doc.setFont('helvetica','bold'); doc.setFontSize(10);
      doc.text('Totals: Sales ' + G.rupees(s.sales) + ' | Purchases ' + G.rupees(s.purchases) + ' | Expenses ' + G.rupees(s.expenses),14,Math.min(y+6,282));
    }
    doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text('Working report for review. Statutory GST filing remains the auditor’s responsibility.',14,288);
    doc.save('Glacier-' + d.title.replace(/\s+/g,'-') + '-' + stamp() + '.pdf');
    G.audit('PDF export', d.title);
    return doc;
  }
  function exportPDFInvoice(id) {
    var inv = G.get('invoices', id); if (!inv) { U.toast('Invoice not found.', 'err'); return null; }
    var doc = pdfDoc(); if (!doc) return null;
    var c = G.calcInvoice(inv), y = header(doc, 'TAX INVOICE ' + inv.no, G.dateLabel(inv.date));
    var party = G.get('customers', inv.customerId) || {};
    doc.setFontSize(9); doc.text('To: ' + (party.name || 'Walk-in'),14,y); y += 5;
    doc.text((party.address || '') + '  GSTIN: ' + (party.gstin || '—'),14,y); y += 6;
    var body = (inv.lines||[]).map(function(l){ var p=G.product(l.productId)||{}; return [p.name||l.productId,l.qty+' '+(l.unit==='case'?'case':'bottle'),l.bottles,G.rupees(l.rate),G.rupees(G.amountLine(l))]; });
    y = table(doc, ['Item','Qty','Bottles','Rate','Amount'], body, y);
    doc.setFont('helvetica','bold'); doc.text('Grand total: ' + G.rupees(c.total),14,y);
    doc.setFont('helvetica','normal');
    doc.text('CGST ' + G.rupees(c.cgst) + '  SGST ' + G.rupees(c.sgst) + '  IGST ' + G.rupees(c.igst),14,y+6);
    doc.text('Payment: ' + (inv.paymentMode||'cash') + ' · Paid ' + G.rupees(inv.paid||0),14,y+12);
    doc.save('Invoice-' + inv.no + '.pdf'); G.audit('PDF export', 'Invoice ' + inv.no); return doc;
  }
  function exportAuditPDF() {
    var doc = pdfDoc(); if (!doc) return null;
    var y = header(doc, 'Audit log', 'OWNER COPY');
    y = table(doc, ['When','User','Action','Detail'], G.db.audit.slice(0,300).map(function(a){return [a.ts.replace('T',' ').slice(0,19),a.user,a.action,a.detail];}), y);
    doc.save('Glacier-audit-' + stamp() + '.pdf'); G.audit('PDF export', 'Audit log'); return doc;
  }

  Object.assign(G, { backup:{
    download:download, exportJSON:exportJSON, restoreJSON:restoreJSON, exportExcel:exportExcel,
    exportCSV:exportCSV, exportAuditCSV:exportAuditCSV, workbook:workbook,
    exportPDFReport:exportPDFReport, exportPDFInvoice:exportPDFInvoice, exportAuditPDF:exportAuditPDF
  }});
})();
