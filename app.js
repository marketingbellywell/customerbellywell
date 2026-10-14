/* ============================================
   BELLYWELL — Application Logic (Simplified)
   ============================================ */
let sbClient = null;
if (window.supabase) {
  sbClient = window.supabase.createClient(
    'https://jhiczetiklushxvmforb.supabase.co',
    'sb_publishable_lRkfbX0LAcMO8kD1yiUbKg__e5muxBN'
  );
} else {
  console.error('Supabase SDK tidak termuat!');
}


// ---- Data ----
const orders = [
  { id:1, date:'2026-09-29', meal:'lunch',  status:'delivered',   addr:'Rumah',  kloter:'Kloter 1', cutlery:true },
  { id:2, date:'2026-09-29', meal:'dinner', status:'delivered',   addr:'Rumah',  kloter:'Kloter 2', cutlery:true },
  { id:3, date:'2026-09-30', meal:'lunch',  status:'delivered',   addr:'Kantor', kloter:'Kloter 1', cutlery:false },
  { id:4, date:'2026-09-30', meal:'dinner', status:'delivered',   addr:'Kantor', kloter:'Kloter 2', cutlery:true },
  { id:5, date:'2026-10-01', meal:'lunch',  status:'pending',     addr:'Rumah',  kloter:'Kloter 1', cutlery:true },
  { id:6, date:'2026-10-01', meal:'dinner', status:'pending',     addr:'Rumah',  kloter:'Kloter 2', cutlery:true },
  { id:7, date:'2026-10-02', meal:'lunch',  status:'pending',     addr:'Rumah',  kloter:'Kloter 1', cutlery:true },
  { id:8, date:'2026-10-02', meal:'dinner', status:'pending',     addr:'Kantor', kloter:'Kloter 2', cutlery:false },
  { id:9, date:'2026-10-03', meal:'lunch',  status:'pending',     addr:'Rumah',  kloter:'Kloter 1', cutlery:true },
  { id:10,date:'2026-10-05', meal:'lunch',  status:'unscheduled', addr:'Rumah',  kloter:'-',        cutlery:true },
  { id:11,date:'2026-10-06', meal:'lunch',  status:'pending',     addr:'Rumah',  kloter:'Kloter 1', cutlery:true },
  { id:12,date:'2026-10-06', meal:'dinner', status:'pending',     addr:'Kost',   kloter:'Kloter 2', cutlery:true },
  { id:13,date:'2026-10-07', meal:'lunch',  status:'unscheduled', addr:'Rumah',  kloter:'-',        cutlery:true },
  { id:14,date:'2026-10-08', meal:'lunch',  status:'pending',     addr:'Rumah',  kloter:'Kloter 1', cutlery:true },
  { id:15,date:'2026-10-08', meal:'dinner', status:'pending',     addr:'Rumah',  kloter:'Kloter 2', cutlery:true },
  { id:16,date:'2026-10-09', meal:'lunch',  status:'pending',     addr:'Kantor', kloter:'Kloter 1', cutlery:false },
];

const menus = [
  { day:'Sen, 29 Sep',
    lunch:[{e:'🍗',n:'Ayam Panggang Madu',c:'320 kkal • Protein 28g'},{e:'🍚',n:'Nasi Merah',c:'180 kkal • Karbo 38g'},{e:'🥗',n:'Salad Sayur Segar',c:'85 kkal • Serat 4g'}],
    dinner:[{e:'🐟',n:'Salmon Teriyaki',c:'290 kkal • Protein 32g'},{e:'🥦',n:'Brokoli Wortel Kukus',c:'65 kkal • Serat 5g'},{e:'🍲',n:'Sup Jagung Manis',c:'120 kkal • Karbo 18g'}]},
  { day:'Sel, 30 Sep',
    lunch:[{e:'🥩',n:'Daging Lada Hitam',c:'340 kkal • Protein 30g'},{e:'🍠',n:'Ubi Panggang',c:'150 kkal • Karbo 32g'},{e:'🥒',n:'Timun & Selada',c:'45 kkal • Serat 3g'}],
    dinner:[{e:'🍳',n:'Omelette Sayuran',c:'220 kkal • Protein 18g'},{e:'🥑',n:'Avocado Bowl',c:'180 kkal • Lemak 14g'},{e:'🍵',n:'Sup Tofu Miso',c:'90 kkal • Protein 8g'}]},
  { day:'Rab, 1 Okt',
    lunch:[{e:'🍤',n:'Udang Saus Padang',c:'280 kkal • Protein 25g'},{e:'🍚',n:'Nasi Putih',c:'200 kkal • Karbo 42g'},{e:'🥬',n:'Tumis Kangkung',c:'70 kkal • Serat 4g'}],
    dinner:[{e:'🍖',n:'Ayam Bakar Kecap',c:'310 kkal • Protein 26g'},{e:'🌽',n:'Jagung Rebus',c:'95 kkal • Karbo 20g'},{e:'🥗',n:'Gado-gado Mini',c:'150 kkal • Serat 6g'}]},
  { day:'Kam, 2 Okt',
    lunch:[{e:'🐟',n:'Kakap Bumbu Kuning',c:'260 kkal • Protein 28g'},{e:'🍚',n:'Nasi Merah',c:'180 kkal • Karbo 38g'},{e:'🥕',n:'Sayur Asem',c:'80 kkal • Serat 5g'}],
    dinner:[{e:'🥚',n:'Telur Balado',c:'190 kkal • Protein 14g'},{e:'🥦',n:'Cap Cay Goreng',c:'130 kkal • Serat 4g'},{e:'🍲',n:'Sup Ayam Jahe',c:'110 kkal • Protein 12g'}]},
  { day:'Jum, 3 Okt',
    lunch:[{e:'🍗',n:'Chicken Katsu',c:'350 kkal • Protein 24g'},{e:'🥗',n:'Coleslaw Segar',c:'75 kkal • Serat 3g'},{e:'🍠',n:'Sweet Potato Mash',c:'140 kkal • Karbo 30g'}],
    dinner:[{e:'🐟',n:'Pepes Tuna',c:'240 kkal • Protein 30g'},{e:'🥬',n:'Lalapan Segar',c:'35 kkal • Serat 3g'},{e:'🍵',n:'Sayur Bening Bayam',c:'60 kkal • Serat 4g'}]}
];

// ---- State ----
let sel = new Set();
let fil = { status:'all', meal:'all' };
let calM = 9, calY = 2026, calPick = null;
let addrForm = false;

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderCal();
  renderOrders();
  renderFullCal();
  renderMenuTabs();
});

// ---- Navigation ----
function go(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  window.scrollTo(0,0);
  if (id === 'pg-edit') updateBar();
}

// ---- Login ----
async function doLogin() {
  const btn = document.getElementById('btn-login');
  const u = document.getElementById('inp-user').value.trim();
  const p = document.getElementById('inp-pass').value.trim();
  if (!u || !p) return toast('Mohon isi username dan password','error');
  
  btn.innerHTML = '<div class="spinner"></div> Memproses...';
  btn.disabled = true;
  
  if (!sbClient) {
    toast('Gagal memuat sistem login (Supabase error)', 'error');
    btn.innerHTML = 'Masuk';
    btn.disabled = false;
    return;
  }
  
  try {
    const { data, error } = await sbClient.from('customers').select('*').eq('username', u).eq('password', p).single();
    
    if (error || !data) {
      toast('Username atau password salah', 'error');
      btn.innerHTML = 'Masuk';
      btn.disabled = false;
      return;
    }
    
    // Login berhasil
    btn.innerHTML = 'Masuk';
    btn.disabled = false;
    go('pg-dash');
    toast(`Selamat datang, ${data.name.split(' ')[0]}! 👋`);
    
    // Note: data pesanan di app.js ini masih menggunakan dummy (belum narik dari Supabase untuk dashboard).
  } catch (err) {
    console.error(err);
    toast('Gagal terhubung ke database', 'error');
    btn.innerHTML = 'Masuk';
    btn.disabled = false;
  }
}
function doLogout() {
  currentUser = null;
  const u = document.getElementById('inp-user');
  const p = document.getElementById('inp-pass');
  if (u) u.value = '';
  if (p) p.value = '';
  go('pg-login');
  toast('Anda telah keluar');
}
function togglePw() {
  const i = document.getElementById('inp-pass');
  const b = document.getElementById('btn-eye');
  if (i.type === 'password') { i.type = 'text'; b.textContent = '🔒'; }
  else { i.type = 'password'; b.textContent = '👁'; }
}
document.getElementById('inp-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

// ---- Dashboard Tabs ----
function switchDashTab(el) {
  document.querySelectorAll('#dash-tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const target = el.dataset.tab;
  ['dash-ongoing','dash-history'].forEach(id => {
    document.getElementById(id)?.classList.toggle('hide', id !== target);
  });
}

// ---- Filters ----
function setFil(chip, type) {
  chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  fil[type] = chip.dataset.f;
  renderOrders();
}

// ---- Mini Calendar ----
function renderCal() {
  const c = document.getElementById('mini-cal');
  if (!c) return;
  const dn = ['MIN','SEN','SEL','RAB','KAM','JUM','SAB'];
  const start = new Date(2026,8,28);
  const today = new Date(2026,8,29);
  c.innerHTML = '';
  for (let i = 0; i < 14; i++) {
    const d = new Date(start); d.setDate(start.getDate()+i);
    const ds = fmt(d);
    const hasL = orders.some(o => o.date===ds && o.meal==='lunch');
    const hasD = orders.some(o => o.date===ds && o.meal==='dinner');
    const isToday = d.toDateString() === today.toDateString();
    const isSun = d.getDay()===0 && !hasL && !hasD;
    let cls = 'cal-cell';
    if (isToday) cls += ' today active';
    if (isSun) cls += ' off';
    let dot = '';
    if (hasL) dot = '<span class="dot lunch"></span>';
    else if (hasD) dot = '<span class="dot dinner"></span>';
    c.innerHTML += `<div class="${cls}" onclick="pickCal(this)"><span class="dn">${dn[d.getDay()]}</span><span class="dd">${d.getDate()}</span>${dot}</div>`;
  }
}
function pickCal(el) {
  document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

// ---- Order List ----
function renderOrders() {
  const c = document.getElementById('order-items');
  if (!c) return;
  const list = orders.filter(o => {
    if (fil.status !== 'all' && o.status !== fil.status) return false;
    if (fil.meal !== 'all' && o.meal !== fil.meal) return false;
    return true;
  });
  c.innerHTML = list.map(o => {
    const on = sel.has(o.id);
    const dt = new Date(o.date+'T00:00:00');
    const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    const mons = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const dateStr = `${days[dt.getDay()]}, ${dt.getDate()} ${mons[dt.getMonth()]}`;
    const mealBadge = o.meal==='lunch' ? '<span class="badge badge-blue">☀️ Lunch</span>' : '<span class="badge badge-orange">🌙 Dinner</span>';
    const statBadge = o.status==='delivered' ? '<span class="badge badge-green">✓ Terkirim</span>' : o.status==='pending' ? '<span class="badge badge-orange">● Belum Kirim</span>' : '<span class="badge badge-gray">○ Belum Jadwal</span>';
    return `<div class="order-card${on?' selected':''}" data-id="${o.id}" onclick="toggleItem(${o.id},this)">
      <label class="checkbox cb" onclick="event.stopPropagation()"><input type="checkbox" ${on?'checked':''} onchange="toggleItem(${o.id},this.closest('.order-card'))"><span class="checkbox-box">✓</span></label>
      <div class="body">
        <div class="top-row"><span class="date-text">${dateStr}</span><div class="tags">${mealBadge}${statBadge}</div></div>
        <div class="addr">📍 ${o.addr}</div>
        <div class="meta"><span>📦 ${o.kloter}</span><span>${o.cutlery?'🍴 Cutlery':'❌ No Cutlery'}</span></div>
      </div></div>`;
  }).join('');
  updateBar();
}

function toggleItem(id, el) {
  if (sel.has(id)) { sel.delete(id); el.classList.remove('selected'); }
  else { sel.add(id); el.classList.add('selected'); }
  const cb = el.querySelector('input[type="checkbox"]');
  if (cb) cb.checked = sel.has(id);
  syncAll();
  updateBar();
}

function toggleAll() {
  const all = document.getElementById('chk-all').checked;
  document.querySelectorAll('.order-card').forEach(c => {
    const id = +c.dataset.id;
    if (all) { sel.add(id); c.classList.add('selected'); }
    else { sel.delete(id); c.classList.remove('selected'); }
    const cb = c.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = all;
  });
  updateBar();
}

function syncAll() {
  const total = document.querySelectorAll('.order-card').length;
  const ca = document.getElementById('chk-all');
  if (ca) ca.checked = sel.size === total && total > 0;
}

function updateBar() {
  const bar = document.getElementById('bot-bar');
  const cnt = document.getElementById('sel-count');
  if (cnt) cnt.textContent = `${sel.size} dipilih`;
  if (bar) bar.classList.toggle('hide', sel.size === 0);
}

// ---- Sheets ----
function openSheet(id) {
  document.getElementById('overlay')?.classList.add('show');
  document.getElementById(id)?.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  document.getElementById('overlay')?.classList.remove('show');
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('show'));
  document.body.style.overflow = '';
  if (addrForm) hideAddrForm();
}

// Swipe to dismiss
document.querySelectorAll('.sheet-bar').forEach(bar => {
  let y0 = 0;
  bar.addEventListener('touchstart', e => y0 = e.touches[0].clientY, {passive:true});
  bar.addEventListener('touchmove', e => { if (e.touches[0].clientY - y0 > 60) closeSheet(); }, {passive:true});
});

// ---- Full Calendar ----
function renderFullCal() {
  const g = document.getElementById('fullcal');
  const l = document.getElementById('cal-label');
  if (!g || !l) return;
  const mns = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const dls = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  l.textContent = `${mns[calM]} ${calY}`;
  const fd = new Date(calY,calM,1).getDay();
  const dim = new Date(calY,calM+1,0).getDate();
  const today = new Date(2026,8,29);
  g.innerHTML = dls.map(d => `<div class="fc-label">${d}</div>`).join('');
  for (let i = 0; i < fd; i++) g.innerHTML += '<div class="fc-day off"></div>';
  for (let d = 1; d <= dim; d++) {
    const dt = new Date(calY,calM,d);
    const past = dt < today;
    const sun = dt.getDay() === 0;
    const isTd = dt.toDateString() === today.toDateString();
    let cls = 'fc-day';
    if (isTd) cls += ' today';
    if (past || sun) cls += ' off';
    if (sun) cls += ' holiday';
    if (calPick === d) cls += ' picked';
    g.innerHTML += `<div class="${cls}" onclick="pickFc(${d},this)">${d}</div>`;
  }
}
function pickFc(d, el) {
  if (el.classList.contains('off')) return;
  document.querySelectorAll('.fc-day.picked').forEach(e => e.classList.remove('picked'));
  el.classList.add('picked');
  calPick = d;
}
function calNav(dir) {
  calM += dir;
  if (calM > 11) { calM = 0; calY++; }
  if (calM < 0) { calM = 11; calY--; }
  calPick = null;
  renderFullCal();
}

// ---- Address ----
function pickAddr(el) {
  document.querySelectorAll('.addr-card').forEach(c => c.classList.remove('picked'));
  el.classList.add('picked');
}
function showAddrForm() {
  addrForm = true;
  document.getElementById('addr-list-view')?.classList.add('hide');
  document.getElementById('addr-form-view')?.classList.remove('hide');
  document.getElementById('addr-title').textContent = 'Tambah Alamat';
  document.getElementById('btn-save-addr').textContent = 'Simpan Alamat';
}
function hideAddrForm() {
  addrForm = false;
  document.getElementById('addr-list-view')?.classList.remove('hide');
  document.getElementById('addr-form-view')?.classList.add('hide');
  const t = document.getElementById('addr-title');
  if (t) t.textContent = 'Ganti Alamat';
  const b = document.getElementById('btn-save-addr');
  if (b) b.textContent = 'Save Changes';
}
function pickLabel(el) {
  el.parentElement.querySelectorAll('.label-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

// ---- Meals ----
function toggleMeal(el) {
  const wrap = el.closest('.meal-pills');
  const max = +(wrap.dataset.max || 99);
  const grp = wrap.dataset.group;
  const selInGrp = wrap.querySelectorAll('.meal-pill.on');
  if (el.classList.contains('on')) {
    el.classList.remove('on');
    updQuota(grp, selInGrp.length - 1, max);
    updLock(wrap, selInGrp.length - 1, max);
  } else {
    if (selInGrp.length >= max) return toast(`Maksimal ${max} pilihan`, 'error');
    el.classList.add('on');
    updQuota(grp, selInGrp.length + 1, max);
    updLock(wrap, selInGrp.length + 1, max);
  }
}
function updQuota(grp, cnt, max) {
  const q = document.querySelector(`.quota[data-g="${grp}"]`);
  if (q) { q.textContent = `${cnt}/${max}`; q.classList.toggle('full', cnt >= max); }
}
function updLock(wrap, cnt, max) {
  wrap.querySelectorAll('.meal-pill').forEach(p => {
    if (!p.classList.contains('on') && cnt >= max) p.classList.add('locked');
    else p.classList.remove('locked');
  });
}

// ---- Slot ----
function pickSlot(el, type) {
  if (type === 'dinner') {
    toast('Slot Dinner khusus untuk pengiriman area Jakarta', 'success');
  }
  document.querySelectorAll('.slot-card').forEach(s => s.classList.remove('on'));
  el.classList.add('on');
}

// ---- Menu ----
function renderMenuTabs() {
  const tabs = document.getElementById('menu-tabs');
  if (!tabs) return;
  tabs.innerHTML = menus.map((m,i) => `<button class="menu-tab${i===0?' active':''}" onclick="showMenu(${i},this)">${m.day}</button>`).join('');
  showMenu(0);
}
function showMenu(i, tab) {
  if (tab) {
    document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  }
  const m = menus[i]; if (!m) return;
  const c = document.getElementById('menu-content');
  if (!c) return;
  const renderItems = items => items.map(it => `<div class="menu-row"><span class="emoji">${it.e}</span><div><div class="name">${it.n}</div><div class="cal">${it.c}</div></div></div>`).join('');
  c.innerHTML = `
    <div class="menu-block"><span class="menu-block-type lunch">☀️ Lunch</span>${renderItems(m.lunch)}</div>
    <div class="menu-block"><span class="menu-block-type dinner">🌙 Dinner</span>${renderItems(m.dinner)}</div>`;
}

// ---- Save ----
function save(type) {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let blocked = false;
  for (let id of sel) {
    const order = orders.find(o => o.id === id);
    if (!order) continue;
    
    const [y, m, d] = order.date.split('-');
    const orderDate = new Date(y, m - 1, d);
    
    const diffDays = Math.round((orderDate - todayDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      // Order hari ini / kemarin -> cut-off sudah lewat
      blocked = true;
      break;
    } else if (diffDays === 1) {
      // Order besok -> cek apakah sudah lewat jam 20:00
      if (now.getHours() >= 20) {
        blocked = true;
        break;
      }
    }
  }

  if (blocked) {
    closeSheet();
    return toast('Gagal: Melewati batas cut-off H-1 (20:00 WIB)', 'error');
  }

  closeSheet();
  toast(`Perubahan ${type} berhasil disimpan ✓`);
  sel.clear();
  renderOrders();
  syncAll();
}

// ---- Toast ----
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  const inner = document.getElementById('toast-inner');
  const ic = document.getElementById('toast-icon');
  const m = document.getElementById('toast-msg');
  if (!t) return;
  inner.className = 'toast-inner ' + type;
  ic.textContent = type === 'error' ? '✕' : '✓';
  m.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ---- Helpers ----
function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
