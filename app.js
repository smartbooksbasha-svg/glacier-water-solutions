/* Glacier Water Solutions — boot, auth, routing and interactions */
(function () {
  'use strict';
  var G = window.GWS, U = G.ui, B = G.backup;
  var LOCK_KEY = 'gws_loginlock';

  function q(sel, root) { return (root || document).querySelector(sel); }
  function v(name, root) {
    var el = q('[name="' + name + '"]', root || document.getElementById('modalRoot'));
    if (!el) return '';
    return el.type === 'checkbox' ? !!el.checked : el.value;
  }
  function lockState() {
    try { return JSON.parse(localStorage.getItem(LOCK_KEY) || '{"tries":0,"until":0}'); }
    catch (e) { return { tries:0, until:0 }; }
  }
  function saveLock(s) { try { localStorage.setItem(LOCK_KEY, JSON.stringify(s)); } catch (e) {} }
  function lockSeconds() { var s = lockState(); return s.until && s.until > Date.now() ? Math.ceil((s.until - Date.now())/1000) : 0; }

  function currentView() {
    var h = String(location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return h && G.ui.TITLES[h] ? h : 'dashboard';
  }
  function go(view) {
    if (!G.can(view)) { U.toast('Your role does not have access to that section.', 'err'); return; }
    location.hash = '#/' + view;
    if (currentView() === view) U.render(view);
    U.closeModal();
  }

  /* ---------------- auth ---------------- */
  function renderAuth(error) {
    var layer = document.getElementById('authLayer'); if (!layer) return;
    layer.hidden = false;
    var setup = G.db.users.length === 0;
    var wait = lockSeconds();
    var inner = setup ?
      '<div class="auth-card"><span class="brand-mark">'+U.icon('drop')+'</span><p class="overline">First-run setup</p><h1>Set up Glacier</h1>' +
      '<p class="lede">Create the owner account. This device will hold the records until you export a backup or add a server.</p>' +
      '<div class="field"><label for="auName">Owner name</label><input id="auName" name="name" autocomplete="name"></div>' +
      '<div class="field"><label for="auEmail">Email (used to log in)</label><input id="auEmail" name="email" type="email" autocomplete="username"></div>' +
      '<div class="field"><label for="auPass">Password</label><input id="auPass" name="password" type="password" autocomplete="new-password"></div>' +
      '<div class="field"><label for="auPass2">Confirm password</label><input id="auPass2" name="password2" type="password" autocomplete="new-password"></div>' +
      '<button class="btn" data-act="do-setup" type="button" style="width:100%">Create owner account</button>' +
      (error ? '<p class="tiny" style="color:var(--danger);margin-top:10px">'+G.esc(error)+'</p>' : '') +
      '<div class="auth-foot">Local-first build · confirm GST settings with your auditor before live use.</div></div>' :
      '<div class="auth-card"><span class="brand-mark">'+U.icon('drop')+'</span><p class="overline">Secure workspace</p><h1>Welcome back</h1>' +
      '<p class="lede">Sign in to continue to billing, stock and accounts.</p>' +
      '<div class="field"><label for="auEmail">Email</label><input id="auEmail" name="email" type="email" autocomplete="username"></div>' +
      '<div class="field"><label for="auPass">Password</label><input id="auPass" name="password" type="password" autocomplete="current-password"></div>' +
      (wait ? '<p class="tiny" style="color:var(--danger)">Too many attempts. Try again in '+wait+' seconds.</p>' : '') +
      '<button class="btn" data-act="do-login" type="button" style="width:100%"'+(wait?' disabled':'')+'>Log in</button>' +
      (error ? '<p class="tiny" style="color:var(--danger);margin-top:10px">'+G.esc(error)+'</p>' : '') +
      '<div class="auth-foot">Audit login · failed attempts are recorded · 5 tries = 5 minute lock.</div></div>';
    layer.innerHTML = inner;
  }
  function doSetup() {
    var layer = document.getElementById('authLayer');
    var name = (q('#auName', layer)||{}).value || '';
    var email = ((q('#auEmail', layer)||{}).value || '').trim().toLowerCase();
    var pw = (q('#auPass', layer)||{}).value || '';
    var pw2 = (q('#auPass2', layer)||{}).value || '';
    if (!name.trim() || !email || !pw) return renderAuth('Name, email and password are required.');
    if (pw !== pw2) return renderAuth('The two passwords do not match.');
    if (pw.length < 6) return renderAuth('Use at least 6 characters.');
    var salt = G.uid('salt');
    var user = G.add('users', { name:name.trim(), email:email, role:'owner', salt:salt, pass:G.hashPassword(pw,salt), sess:'' });
    G.db.session = startSession(user); G.save('session');
    G.audit('Owner setup', 'Owner account created');
    document.getElementById('authLayer').hidden = true;
    U.toast('Owner account ready. Add your company details next.', 'good');
    U.render('settings'); location.hash = '#/settings';
  }
  function startSession(user) {
    var token = G.uid('tok') + Math.random().toString(36).slice(2);
    user.sess = G.fnv(token); G.save('users');
    return { token:token, uid:user.id, exp:Date.now() + 12*3600*1000 };
  }
  function doLogin() {
    if (lockSeconds()) return U.toast('Login locked. Wait a moment.', 'err');
    var layer = document.getElementById('authLayer');
    var email = ((q('#auEmail', layer)||{}).value || '').trim().toLowerCase();
    var pw = (q('#auPass', layer)||{}).value || '';
    var user = G.db.users.filter(function (u) { return String(u.email||'').toLowerCase() === email; })[0];
    if (user && G.hashPassword(pw, user.salt) === user.pass) {
      G.db.session = startSession(user); G.save('session');
      G.audit('Login', user.name + ' · ' + user.role);
      saveLock({ tries:0, until:0 });
      document.getElementById('authLayer').hidden = true;
      U.toast('Welcome back, ' + user.name.split(' ')[0] + '.', 'good');
      U.render(currentView()); return;
    }
    var s = lockState(); s.tries = (s.tries||0) + 1;
    if (s.tries >= 5) { s.until = Date.now() + 5*60*1000; s.tries = 0; }
    saveLock(s);
    G.audit('Login failed', email || '(blank email)');
    renderAuth(s.until ? 'Five failed attempts — locked for 5 minutes.' : 'Wrong email or password. Attempt ' + s.tries + ' of 5.');
  }
  function logout() {
    G.audit('Logout', (G.currentUser()||{}).name || 'unknown');
    G.db.session = null; G.save('session');
    var layer = document.getElementById('authLayer');
    if (layer) layer.hidden = true;
    renderAuth();
  }
  function requireOwner() {
    var u = G.currentUser();
    if (!u || u.role !== 'owner') { U.toast('Only the owner can do that.', 'err'); return false; }
    return true;
  }
  function requireView(view) { if (!G.can(view)) { U.toast('Your role does not have access to that action.', 'err'); return false; } return true; }

  /* ---------------- generic forms ---------------- */
  function openSimple(title, fields, saveAct, id, small) {
    U.openModal(title,
      '<form data-form="simple">' + U.form(fields) + '</form>',
      '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="'+saveAct+'" data-id="'+G.esc(id||'')+'" type="button">Save</button>', small);
  }
  var MASTER = {
    product:function (o) { return [
      U.field({name:'name',label:'Product name',value:o&&o.name,req:true}),
      U.field({name:'size',label:'Size',value:o&&o.size,ph:'300 ml'}),
      U.field({name:'bpc',label:'Bottles per case',type:'number',min:1,value:o?o.bpc:24,req:true}),
      U.field({name:'priceBottle',label:'Rate per bottle (Rs)',type:'number',step:'0.01',min:0,value:o?(o.priceBottle/100).toFixed(2):'0'}),
      U.field({name:'priceCase',label:'Rate per case (Rs)',type:'number',step:'0.01',min:0,value:o?(o.priceCase/100).toFixed(2):'0'}),
      U.field({name:'mrp',label:'MRP per bottle (Rs)',type:'number',step:'0.01',min:0,value:o?(o.mrp/100).toFixed(2):'0'}),
      U.field({name:'gstRate',label:'GST %',type:'number',step:'0.5',min:0,value:o?o.gstRate:18}),
      U.field({name:'hsn',label:'HSN',value:o?o.hsn:'2201'}),
      U.field({name:'opening',label:'Opening stock (bottles)',type:'number',min:0,value:o?o.opening:0,hint:'Set before going live.'}),
      U.field({name:'lowAt',label:'Low-stock alert (bottles)',type:'number',min:0,value:o?o.lowAt:300}),
      U.field({name:'active',label:'Active',type:'checkbox',value:o?o.active!==false:true})
    ]; },
    material:function (o) { return [
      U.field({name:'name',label:'Material name',value:o&&o.name,req:true}),
      U.field({name:'unit',label:'Unit',value:o?o.unit:'pcs'}),
      U.field({name:'opening',label:'Opening balance',type:'number',min:0,value:o?o.opening:0}),
      U.field({name:'rate',label:'Rate (Rs)',type:'number',step:'0.01',min:0,value:o?(o.rate/100).toFixed(2):'0'})
    ]; },
    customer:function (o) { return partyFields(o); },
    supplier:function (o) { return partyFields(o); },
    expense:function () { return [
      U.field({name:'date',label:'Date',type:'date',value:G.today(),req:true}),
      U.field({name:'category',label:'Category',options:'',value:'',ph:'Rent / wages / electricity…',req:true}),
      U.field({name:'amount',label:'Amount (Rs)',type:'number',step:'0.01',min:0,value:'0',req:true}),
      U.field({name:'mode',label:'Mode',type:'select',options:'<option value="cash">Cash</option><option value="bank">Bank</option><option value="upi">UPI</option>'}),
      U.field({name:'note',label:'Note',type:'textarea',full:true})
    ]; }
  };
  function partyFields(o) { return [
    U.field({name:'name',label:'Name',value:o&&o.name,req:true}),
    U.field({name:'phone',label:'Phone',value:o&&o.phone}),
    U.field({name:'gstin',label:'GSTIN',value:o&&o.gstin}),
    U.field({name:'state',label:'State',value:o?o.state:G.db.company.state}),
    U.field({name:'opening',label:'Opening balance (Rs)',type:'number',step:'0.01',value:o?(o.opening/100).toFixed(2):'0',full:true,hint:'Positive = they owe you (customer) / you owe them (supplier).'})
  ]; }
  function listFor(kind) {
    return kind==='product'?'products':kind==='material'?'materials':kind==='customer'?'customers':kind==='supplier'?'suppliers':kind==='expense'?'expenses':kind;
  }
  function openMaster(kind, id) {
    var perm = kind === 'product'||kind === 'material' ? 'inventory' : kind === 'expense' ? 'expenses' : kind === 'customer' ? 'customers' : kind === 'supplier' ? 'suppliers' : kind;
    if (!requireView(perm)) return;
    var list = listFor(kind);
    var o = id ? G.get(list, id) : null;
    var names = { product:'Product', material:'Raw material', customer:'Customer', supplier:'Supplier', expense:'Expense' };
    openSimple((id?'Edit ':'New ') + names[kind], MASTER[kind](o), 'save-master-' + kind, id, kind==='expense');
  }
  function saveMaster(kind, id) {
    var data = {};
    ['name','size','unit','phone','gstin','state','category','mode','note','hsn'].forEach(function (k) { data[k] = v(k); });
    ['bpc','lowAt','qty'].forEach(function (k) { data[k] = Number(v(k))||0; });
    ['priceBottle','priceCase','mrp','rate','amount'].forEach(function (k) { data[k] = G.paise(v(k)); });
    data.opening = (kind === 'customer' || kind === 'supplier') ? G.paise(v('opening')) : (Number(v('opening'))||0);
    data.gstRate = Number(v('gstRate'))||0;
    if (kind === 'product') data.active = !!v('active');
    if (kind === 'expense') data.date = v('date');
    if (!data.name && kind !== 'expense') { U.toast('Name is required.', 'err'); return; }
    if (kind === 'expense' && (!data.category || !data.amount)) { U.toast('Category and amount are required.', 'err'); return; }
    var store = listFor(kind);
    if (id) { G.update(store,id,data); G.audit('Edited ' + kind, (data.name||data.category||id)); }
    else { var o = G.add(store,data); G.audit('Added ' + kind, (data.name||data.category||o.id)); }
    U.closeModal(); U.toast((id?'Updated':'Added') + ' ' + kind + '.','good'); U.render();
  }

  /* ---------------- transaction forms ---------------- */
  function saveInvoice() {
    if (!requireView('sales')) return;
    var root = document.getElementById('modalRoot');
    var customerId = v('customerId');
    if (!customerId) { U.toast('Choose a customer.', 'err'); return; }
    var raw = U.collectLines(root, 'invoice');
    var lines = raw.filter(function(l){return l.productId && l.qty>0;}).map(function (l) {
      var p = G.product(l.productId);
      var bottles = G.lineBottles(p, l.unit, l.qty);
      return { productId:l.productId, unit:l.unit, qty:l.qty, bottles:bottles, rate:l.rate, discount:0 };
    });
    if (!lines.length) { U.toast('Add at least one item with a quantity.', 'err'); return; }
    var cust = G.get('customers', customerId) || {};
    var inv = {
      no:G.nextNumber('invoice'), date:v('date')||G.today(), dueDate:v('dueDate'), customerId:customerId,
      customerState:cust.state||'', taxMode:v('taxMode'), paymentMode:v('paymentMode'),
      paid:G.paise(v('paid')), discount:G.paise(v('discount')), notes:v('notes'), lines:lines, status:'draft'
    };
    var c = G.calcInvoice(inv);
    Object.assign(inv,{ taxable:c.taxable, cgst:c.cgst, sgst:c.sgst, igst:c.igst, gstRate:c.rate, total:c.total, round:c.round });
    if (!G.checkNumber('invoice',inv.no)) { U.toast('Duplicate invoice number. Try again.','err'); return; }
    G.add('invoices',inv); G.audit('Invoice created', inv.no + ' · ' + G.rupees(inv.total));
    U.closeModal(); U.toast('Draft ' + inv.no + ' saved. Confirm it to post stock.','good'); U.render('sales');
  }
  function savePurchase() {
    if (!requireView('purchase')) return;
    var root = document.getElementById('modalRoot'), no = v('no');
    if (!no || !v('supplierId')) { U.toast('Bill number and supplier are required.','err'); return; }
    if (!G.checkNumber('purchase',no)) { U.toast('That bill number already exists.','err'); return; }
    var lines = U.collectLines(root,'purchase').filter(function(l){return l.itemId && l.qty>0;}).map(function (l) {
      var p = l.itemType==='material' ? G.material(l.itemId) : G.product(l.itemId);
      var qty = l.qty * (l.unit==='case' && l.itemType==='product' ? G.bpc(p) : 1);
      var amount = Math.round(qty*l.rate);
      return { itemType:l.itemType, itemId:l.itemId, qty:l.qty, unit:l.unit, rate:l.rate, gstRate:l.gstRate, bottles:qty, amount:amount };
    });
    if (!lines.length) { U.toast('Add at least one bill line.','err'); return; }
    var p = { no:no, date:v('date')||G.today(), supplierId:v('supplierId'), paymentMode:v('paymentMode'), paid:G.paise(v('paid')), freight:G.paise(v('freight')), other:G.paise(v('other')), proof:v('proof'), notes:v('notes'), lines:lines, status:'draft' };
    var c = G.calcPurchase(p); Object.assign(p,{ taxable:c.taxable, tax:c.tax, total:c.total, round:c.round });
    G.add('purchases',p); G.audit('Purchase created', no + ' · ' + G.rupees(p.total));
    U.closeModal(); U.toast('Draft ' + no + ' saved.','good'); U.render('purchase');
  }
  function saveProduction() {
    if (!requireView('production')) return;
    var root = document.getElementById('modalRoot');
    if (!v('productId') || !Number(v('good'))) { U.toast('Product and good bottles are required.','err'); return; }
    var consumption = U.collectLines(root,'consumption').filter(function(l){return l.materialId && l.qty>0;}).map(function(l){return {materialId:l.materialId,qty:l.qty};});
    var p = { date:v('date')||G.today(), batch:v('batch')||G.uid('B'), productId:v('productId'), good:Number(v('good'))||0, rejected:Number(v('rejected'))||0, consumption:consumption, note:v('note'), status:'draft' };
    G.add('production',p); G.audit('Production batch created', p.batch);
    U.closeModal(); U.toast('Batch saved. Confirm it to post finished stock.','good'); U.render('production');
  }
  function saveAdjust() {
    if (!requireView('inventory')) return;
    var itemId = v('productId'), delta = Number(v('delta'))||0;
    if (!itemId || !delta) { U.toast('Choose an item and enter a change.','err'); return; }
    var res = G.addAdjust({ date:v('date')||G.today(), itemType:v('itemType'), productId:itemId, delta:delta, type:v('type'), note:v('note') });
    U.toast(res.msg, res.ok?'good':'err'); if (res.ok) { U.closeModal(); U.render('inventory'); }
  }
  function saveCash() {
    if (!requireView('cashbook')) return;
    var amt = G.paise(v('amount'));
    if (!v('category') || !amt) { U.toast('Category and amount are required.','err'); return; }
    var res = G.addCash({ date:v('date')||G.today(), account:v('account'), dir:v('dir'), kind:v('kind'), ref:v('ref'), category:v('category'), amount:amt, note:v('note') });
    U.toast(res.msg, res.ok?'good':'err'); if (res.ok) { U.closeModal(); U.render('cashbook'); }
  }
  function saveUser() {
    if (!requireOwner()) return;
    var name = v('name'), email = (v('email')||'').trim().toLowerCase(), pw = v('password'), role = v('role');
    if (!name || !email || !pw || pw.length < 6) { U.toast('Name, email and a 6+ character password are required.','err'); return; }
    if (G.db.users.some(function(u){return u.email===email;})) { U.toast('That email already has an account.','err'); return; }
    var salt = G.uid('salt');
    G.add('users',{ name:name, email:email, role:role, salt:salt, pass:G.hashPassword(pw,salt), sess:'' });
    G.audit('User added', name + ' · ' + role);
    U.closeModal(); U.toast('User created.','good'); U.render('users');
  }
  function saveCompany() {
    if (!requireOwner()) return;
    var c = G.db.company;
    var patch = {
      name:v('name'), address:v('address'), gstin:v('gstin'), state:v('state'), phone:v('phone'), email:v('email'),
      fyStartMonth:Math.min(12,Math.max(1,Number(v('fyStartMonth'))||4)), invoicePrefix:v('invoicePrefix')||'GWS',
      gstRate:Number(v('gstRate'))||0, hsn:v('hsn'), needsSetup:false
    };
    if (!patch.name) { U.toast('Company name is required.','err'); return; }
    G.db.company = Object.assign(c,patch); G.save('company'); G.audit('Company settings updated', patch.name + ' · GSTIN ' + (patch.gstin||'—'));
    U.closeModal(); U.toast('Company settings saved.','good'); U.render('settings');
  }
  function resetPassword(id) {
    if (!requireOwner()) return;
    var u = G.get('users', id); if (!u) return;
    U.openModal('Reset password — ' + u.name,
      '<div class="field"><label for="newPass">New password</label><input id="newPass" name="password" type="password"></div>',
      '<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="do-reset-pass" data-id="'+G.esc(id)+'" type="button">Reset</button>', true);
  }
  function doResetPass(id) {
    var u = G.get('users', id); if (!u) return;
    var pw = (q('#newPass')||{}).value || '';
    if (pw.length < 6) return U.toast('Use at least 6 characters.','err');
    var salt = G.uid('salt');
    G.update('users',id,{ salt:salt, pass:G.hashPassword(pw,salt), sess:'' });
    G.audit('Password reset', u.name); U.closeModal(); U.toast('Password changed.','good');
  }

  /* ---------------- actions ---------------- */
  var ACTS = {
    'toggle-nav':function(){var s=document.getElementById('sidebar'),c=document.getElementById('scrim');if(s)s.classList.toggle('open');if(c)c.classList.toggle('open');},
    'close-nav':function(){var s=document.getElementById('sidebar'),c=document.getElementById('scrim');if(s)s.classList.remove('open');if(c)c.classList.remove('open');},
    go:function(el){go(el.dataset.view);},
    logout:logout,
    'do-setup':doSetup, 'do-login':doLogin,
    'close-modal':function(){U.closeModal();},
    'modal-back':function(el,ev){if(ev.target===el)U.closeModal();},
    'new-invoice':function(){if(requireView('sales'))U.formInvoice();},
    'new-purchase':function(){if(requireView('purchase'))U.formPurchase();},
    'new-production':function(){if(requireView('production'))U.formProduction();},
    'new-adjust':function(){if(requireView('inventory'))U.formAdjust();},
    'new-cash':function(){if(requireView('cashbook'))U.formCash();},
    'new-user':function(){if(requireOwner())U.formUser();},
    'edit-company':function(){if(requireOwner())U.formCompany();},
    'new-product':function(){openMaster('product');}, 'edit-product':function(el){openMaster('product',el.dataset.id);},
    'new-material':function(){openMaster('material');}, 'edit-material':function(el){openMaster('material',el.dataset.id);},
    'new-customer':function(){openMaster('customer');}, 'new-supplier':function(){openMaster('supplier');},
    'edit-party':function(el){openMaster(el.dataset.kind==='customers'?'customer':'supplier',el.dataset.id);},
    'new-expense':function(){openMaster('expense');},
    'save-master-product':function(el){saveMaster('product',el.dataset.id);},
    'save-master-material':function(el){saveMaster('material',el.dataset.id);},
    'save-master-customer':function(el){saveMaster('customer',el.dataset.id);},
    'save-master-supplier':function(el){saveMaster('supplier',el.dataset.id);},
    'save-master-expense':function(el){saveMaster('expense',el.dataset.id);},
    'save-invoice':saveInvoice, 'save-purchase':savePurchase, 'save-production':saveProduction,
    'save-adjust':saveAdjust, 'save-cash':saveCash, 'save-user':saveUser, 'save-company':saveCompany,
    'do-reset-pass':function(el){doResetPass(el.dataset.id);},
    'reset-password':function(el){resetPassword(el.dataset.id);},
    'delete-user':function(el){if(requireOwner())U.confirmModal('Remove user','Remove this user account? Records they created stay in the audit log.','do-delete-user',el.dataset.id);},
    'do-delete-user':function(el){var u=G.get('users',el.dataset.id);if(u){G.remove('users',u.id);G.audit('User removed',u.name);U.closeModal();U.toast('User removed.','good');U.render('users');}},
    'delete-expense':function(el){if(requireView('expenses'))U.confirmModal('Delete expense','Delete this expense entry?','do-delete-expense',el.dataset.id);},
    'do-delete-expense':function(el){G.remove('expenses',el.dataset.id);G.audit('Expense deleted',el.dataset.id);U.closeModal();U.toast('Entry deleted.','good');U.render('expenses');},
    'confirm-invoice':function(el){var r=G.confirmInvoice(el.dataset.id);U.toast(r.msg,r.ok?'good':'err');U.render('sales');},
    'cancel-invoice':function(el){U.confirmModal('Cancel invoice','Cancelling writes a reversal entry and removes the customer balance. Continue?','do-cancel-invoice',el.dataset.id,'<div class="field" style="margin-top:14px"><label for="cancelReason">Reason</label><input id="cancelReason" placeholder="e.g. customer return"></div>');},
    'do-cancel-invoice':function(el){var reason=(q('#cancelReason')||{}).value||'';var r=G.cancelInvoice(el.dataset.id,reason);U.toast(r.msg,r.ok?'good':'err');U.closeModal();U.render('sales');},
    'confirm-purchase':function(el){var r=G.confirmPurchase(el.dataset.id);U.toast(r.msg,r.ok?'good':'err');U.render('purchase');},
    'confirm-production':function(el){var r=G.confirmProduction(el.dataset.id);U.toast(r.msg,r.ok?'good':'err');U.render('production');},
    'view-invoice':function(el){var i=G.get('invoices',el.dataset.id);if(i)U.showInvoice(i);},
    'view-purchase':function(el){var p=G.get('purchases',el.dataset.id);if(!p)return;var lines=(p.lines||[]).map(function(l){return [l.itemType==='material'?((G.material(l.itemId)||{}).name||''):((G.product(l.itemId)||{}).name||''),l.qty,G.rupees(l.amount)];});U.openModal('Bill '+p.no,'<div class="spread"><p class="overline">'+G.dateLabel(p.date)+'</p>'+U.status(p.status)+'</div>'+U.table([{t:'Item',f:function(r){return G.esc(r[0]);}},{t:'Qty',r:true,f:function(r){return G.esc(r[1]);}},{t:'Amount',r:true,f:function(r){return G.esc(r[2]);}}],lines.map(function(r){return {0:r[0],1:r[1],2:r[2]};}),{})+'<div class="summary-box" style="margin-top:12px"><div class="line total"><span>Grand total</span><span>'+G.rupees(p.total)+'</span></div></div>','<button class="btn ghost" data-act="close-modal" type="button">Close</button>',true);},
    'view-production':function(el){var p=G.get('production',el.dataset.id);if(!p)return;var lines=(p.consumption||[]).map(function(c){return [(G.material(c.materialId)||{}).name||'',c.qty];});U.openModal('Batch '+p.batch,'<p class="tiny">'+G.dateLabel(p.date)+' · '+(G.product(p.productId)||{}).name+' · Good '+p.good+' · Rejected '+(p.rejected||0)+'</p>'+U.table([{t:'Material',f:function(r){return G.esc(r[0]);}},{t:'Used',r:true,f:function(r){return G.esc(r[1]);}}],lines.map(function(r){return {0:r[0],1:r[1]};}),{}),'<button class="btn ghost" data-act="close-modal" type="button">Close</button>',true);},
    'party-ledger':function(el){U.showLedger(el.dataset.kind,el.dataset.id);},
    'add-invoice-line':function(){var b=q('#lineBody');if(b){b.insertAdjacentHTML('beforeend',U.invoiceLineRow());U.updateInvoiceSummary();}},
    'add-purchase-line':function(){var b=q('#lineBody');if(b){b.insertAdjacentHTML('beforeend',U.purchaseLineRow());U.updatePurchaseSummary();}},
    'add-consumption':function(){var b=q('#lineBody');if(b)b.insertAdjacentHTML('beforeend',U.consumptionRow());},
    'del-line':function(el){var row=el.closest('[data-line]');if(row){row.parentNode.removeChild(row);U.updateInvoiceSummary();U.updatePurchaseSummary();}},
    'filter':function(){var f=q('#fFrom'),t=q('#fTo');G.uiState.from=f?f.value:'';G.uiState.to=t?t.value:'';U.render();},
    'filter-clear':function(){G.uiState.from='';G.uiState.to='';U.render();},
    'filter-sales':function(){var f=q('#fFrom'),t=q('#fTo'),s=q('#fStatus');G.uiState.from=f?f.value:'';G.uiState.to=t?t.value:'';G.uiState.salesStatus=s?s.value:'';U.render('sales');},
    'filter-report':function(){var f=q('#fFrom'),t=q('#fTo'),r=q('#fReport');G.uiState.from=f?f.value:'';G.uiState.to=t?t.value:'';G.uiState.report=r?r.value:'sales';U.render('reports');},
    'inv-tab':function(el){G.uiState.invTab=el.dataset.tab;U.render('inventory');},
    'export-csv':function(){B.exportCSV();U.toast('CSV downloaded.','good');},
    'export-excel':function(){B.exportExcel();U.toast('Excel workbook downloaded.','good');},
    'export-json':function(){B.exportJSON();U.toast('JSON backup downloaded.','good');},
    'export-pdf-report':function(){B.exportPDFReport();U.toast('PDF report downloaded.','good');},
    'export-pdf-invoice':function(el){B.exportPDFInvoice(el.dataset.id);},
    'export-audit':function(){B.exportAuditCSV();U.toast('Audit CSV downloaded.','good');},
    'export-audit-pdf':function(){B.exportAuditPDF();},
    'import-json':function(){var f=q('#restoreFile');if(f)f.click();},
    'save-low':function(){var el=q('#lowAt');if(!el)return;G.db.settings.lowStockBottles=Math.max(0,Number(el.value)||0);G.save('settings');G.audit('Low-stock level updated',String(G.db.settings.lowStockBottles));U.toast('Alert level saved.','good');U.render('settings');},
    'lock-month':function(){var el=q('#lockMonth');if(!el||!el.value)return U.toast('Choose a month.','err');if(!requireView('reports'))return;U.openModal('Lock month '+el.value,'<div class="field"><label for="lockNote">Review note</label><input id="lockNote" placeholder="Reviewed by accountant"></div>','<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn" data-act="do-lock" type="button">Lock month</button>',true);G.uiState.pendingMonth=el.value;},
    'do-lock':function(){var m=G.uiState.pendingMonth,note=(q('#lockNote')||{}).value||'';if(G.lockMonth(m,note)){U.closeModal();U.toast('Month '+m+' locked.','good');U.render('settings');}},
    'open-month':function(){if(!requireOwner())return;var el=q('#openMonth');if(!el||!el.value)return U.toast('Choose a month.','err');G.uiState.pendingMonth=el.value;U.openModal('Reopen month '+el.value,'<div class="field"><label for="openReason">Reason (recorded in audit log)</label><input id="openReason" required></div>','<button class="btn ghost" data-act="close-modal" type="button">Cancel</button><button class="btn danger" data-act="do-open" type="button">Reopen</button>',true);},
    'do-open':function(){var reason=(q('#openReason')||{}).value||'';if(!reason)return U.toast('A reason is required.','err');if(G.unlockMonth(G.uiState.pendingMonth,reason)){U.closeModal();U.toast('Month reopened.','good');U.render('settings');}}
  };

  function onClick(ev) {
    var el = ev.target.closest && ev.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act, fn = ACTS[act];
    if (!fn) return;
    if (act !== 'modal-back') ev.preventDefault();
    fn(el, ev);
  }
  function onChange(ev) {
    var el = ev.target;
    if (!el || !el.name || !el.closest) return;
    if (el.name === 'lItemType') {
      var row = el.closest('[data-line]'), sel = row && row.querySelector('[name="lItem"]');
      if (sel) sel.innerHTML = U.opts(el.value==='material'?'materials':'products','','');
      U.updatePurchaseSummary();
    }
    if (el.name === 'lProduct') {
      var r = el.closest('[data-line]'), rate = r && r.querySelector('[name="lRate"]');
      var p = G.product(el.value);
      if (rate && p && !rate.value) rate.value = (p.priceBottle/100).toFixed(2);
    }
    if (el.id === 'restoreFile' && el.files && el.files[0]) {
      var reader = new FileReader();
      reader.onload = function () {
        U.confirmModal('Restore backup','This replaces current records with the backup file. Continue?','do-restore','','');
        G.uiState.pendingRestore = String(reader.result || '');
      };
      reader.readAsText(el.files[0]);
    }
  }
  function onInput(ev) {
    var el = ev.target;
    if (!el || !el.closest || !el.closest('#modalRoot')) return;
    var f = q('[data-form]', document.getElementById('modalRoot'));
    if (!f) return;
    if (f.dataset.form === 'invoice') U.updateInvoiceSummary();
    if (f.dataset.form === 'purchase') U.updatePurchaseSummary();
  }
  function onKey(ev) {
    if (ev.key === 'Escape') { U.closeModal(); ACTS['close-nav'](); }
  }
  function boot() {
    if (G.booted) return;
    G.booted = true;
    G.init();
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', function () {
      if (!G.currentUser()) return;
      U.render(currentView());
    });
    var noRestore = document.createElement('script'); // placeholder keeps listener simple
    void noRestore;
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest && ev.target.closest('[data-act="do-restore"]');
      if (!el) return;
      var res = B.restoreJSON(G.uiState.pendingRestore || '');
      U.toast(res.msg, res.ok?'good':'err');
      if (res.ok) { U.closeModal(); U.render(); }
    });
    if (G.db.users.length === 0 || !G.currentUser()) renderAuth();
    else { var l = document.getElementById('authLayer'); if (l) l.hidden = true; U.render(currentView()); }
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('./sw.js').catch(function () { });
    }
  }
  Object.assign(G, { boot:boot, go:go, renderAuth:renderAuth, currentView:currentView, doLogin:doLogin, doSetup:doSetup, logout:logout, ACTS:ACTS });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
