/* ============================================
   BELLYWELL ADMIN — Application Logic
   Data disimpan di localStorage (key: bw_admin_v1)
   ============================================ */

const STORE_KEY = 'bw_admin_v1';

// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => fmt(new Date());
const addDays = (ds, n) => { const d = new Date(ds + 'T00:00:00'); d.setDate(d.getDate() + n); return fmt(d); };
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const fmtLong = ds => { const d = new Date(ds + 'T00:00:00'); return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort = ds => { const d = new Date(ds + 'T00:00:00'); return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };
const MEAL_LABEL = { lunch: 'LUNCH', dinner: 'DINNER' };

// Highlight colors (sama seperti label Word)
const COLORS = [
  { k: 'yellow', hex: '#FFFF00', name: 'Umum' },
  { k: 'cyan', hex: '#00FFFF', name: 'Protein / Ikan' },
  { k: 'red', hex: '#FF0000', name: 'Replace' },
  { k: 'gray', hex: '#C0C0C0', name: 'Karbo / Nasi' },
  { k: 'green', hex: '#00FF00', name: 'Custom hijau' },
  { k: 'pink', hex: '#FF66FF', name: 'Custom pink' },
];
function suggestColor(t) {
  const u = t.toUpperCase();
  if (/REPLACE/.test(u)) return 'red';
  if (/\b(NASI|KARBO|CARBO)\b/.test(u)) return 'gray';
  if (/\b(IKAN|SEAFOOD|SAPI|BEEF|AYAM|UDANG|SALMON|TUNA|CUMI)\b/.test(u)) return 'cyan';
  return 'yellow';
}
const PRESETS = ['NO PEDAS', 'NO SANTAN', 'NO IKAN', 'NO SEAFOOD', 'NO KUNING TELUR', 'TELUR HARUS MATANG', 'ALL MATANG',
  'NO SAPI REPLACE AYAM', 'NO SAPI REPLACE IKAN', 'NO NASI PUTIH GANTI NASI MERAH', 'NO KARBO GANTI SAYUR', 'NO KENTANG',
  'NO TIMUN', 'LESS VEGGIES', 'GLUTEN FREE', 'TANPA GULA', 'TANPA GARAM', 'NO DAIRY', 'SAMBAL PISAH'];

// ---------- Seed data ----------
function seed() {
  const D0 = todayStr(), D1 = addDays(D0, 1);
  const categories = [
    { id: uid(), name: 'HEALTHY', abbr: '', color: '#FFFFFF' },
    { id: uid(), name: 'SLIMMING', abbr: 'S', color: '#4A86E8' },
    { id: uid(), name: 'MUSCLE GROWTH', abbr: 'MG', color: '#F6B26B' },
    { id: uid(), name: 'VEGAN HEALTHY', abbr: 'VH', color: '#93C47D' },
    { id: uid(), name: 'GERD SLIMM', abbr: 'GS', color: '#D5A6BD' },
  ];
  const couriers = [
    { id: 'k1', name: 'Pak Joko', phone: '081211110001', area: 'Alam Sutera / Serpong / BSD' },
    { id: 'k2', name: 'Mas Andi', phone: '081211110002', area: 'Bintaro / Pondok Aren' },
    { id: 'k3', name: 'Bang Rudi', phone: '081211110003', area: 'Tangerang Kota / Karang Tengah' },
  ];
  const C = (name, phone, address, kecamatan, kota, note = '') => ({ id: uid(), name, phone, address, kecamatan, kota, note });
  const cs = [
    C('Rizki Adila Ramadhan', '081298787705', 'Brooklyn Apartment Alam Sutera B 23 I', 'Tangerang', 'Kota Tangerang'),
    C('Shindunata', '08123545683', 'BSD Sky House Leonie Tower Room L2-35J', 'Pagedangan', 'Kab. Tangerang', 'Tiba max jam 11.30'),
    C('Ayudi', '081231993409', 'Emerald View, Jl. Emerald Citra VII Blok F No.17 Periigi, Pondok Aren Tangerang Selatan Banten 15227', 'Pondok Aren', 'Tangerang Selatan'),
    C('Ida Halya', '0819-9358-9091', 'Global Islamic School 2 Serpong, Jl. Raya Puspitek Serpong, Tangerang Selatan, Banten 15310', 'Serpong', 'Tangerang Selatan', 'Dikirim ke security di pendopo perguruan GIS 2 Serpong'),
    C('H.Rhe', '0811444630', 'Jl. Parkit IV Blok Z1 No.3 Bintaro Jaya Sektor 2', 'Bintaro', 'Tangerang Selatan'),
    C('Dwi Fuad', '082112345642', 'Kantor Lapas Kelas I Tangerang, Jalan Veteran No. 2 Babakan, Kota Tangerang-Banten', 'Tangerang', 'Kota Tangerang'),
    C('Sandra Lexi', '081290159949', 'Metro Permata 1 Blok N3/31 Karang Tengah Tangerang', 'Karang Tengah', 'Kota Tangerang'),
    C('Elysia Verona', '08999150561', 'Pacific Garden Campus Town, Alam Sutera, Jl. Jalur Sutera Bar. No.Kav.19B, RT.002/RW.003, Panunggangan Tim., Kec. Pinang, Kota Tangerang, Banten 15143 (TC 28/31)', 'Pinang', 'Kota Tangerang'),
    C('Yetty Agus', '08158014991', 'Perumahan The Caspia, Blok A2/33 BSD, Sampora - Cisauk', 'Cisauk', 'Kab. Tangerang'),
    C('Anita Anwar', '081377712345', 'Cluster Avani, Jl. Avani Raya No. 8 BSD City', 'Serpong', 'Tangerang Selatan'),
    C('Amanda', '081399923456', 'Apartemen Paddington Heights Tower A 1205, Alam Sutera', 'Pinang', 'Kota Tangerang'),
    C('Bagus Susanto', '081288834567', 'Jl. Bintaro Utama 3A No. 21, Sektor 3A', 'Pondok Aren', 'Tangerang Selatan'),
    C('Vera Rismawati', '081255545678', 'Graha Raya Bintaro Cluster Sanur Blok J2/10', 'Serpong Utara', 'Tangerang Selatan'),
    C('Mutiara', '081266656789', 'The Breeze BSD, Ruko Kios B-12, Jl. BSD Grand Boulevard', 'Serpong', 'Tangerang Selatan'),
    C('Ethika', '081277767890', 'Sutera Renata 2 No. 15, Alam Sutera', 'Serpong Utara', 'Tangerang Selatan'),
  ];
  const by = n => cs.find(c => c.name === n).id;
  const R = (...arr) => arr.map(t => ({ t, c: suggestColor(t) }));
  const O = (date, name, category, lunch, dinner, kurir, requests = [], cutlery = false, status = 'pending') =>
    ({ id: uid(), date, customerId: by(name), category, lunch, dinner, kurir, requests, cutlery, status });

  const orders = [
    O(D0, 'Rizki Adila Ramadhan', 'HEALTHY', 1, 1, 'k1', R('NO SANTAN', 'NO KUNING TELUR', 'NO SEAFOOD, IKAN OK'), true),
    O(D0, 'Shindunata', 'SLIMMING', 0, 1, 'k1', [{ t: 'LESS VEGGIES', c: 'yellow' }]),
    O(D0, 'Ayudi', 'SLIMMING', 1, 1, 'k2', R('NO IKAN', 'NO TIMUN', 'ALL MATANG')),
    O(D0, 'Ayudi', 'SLIMMING', 1, 1, 'k2', R('NO IKAN', 'NO TIMUN', 'TELUR HARUS MATANG')),
    O(D0, 'Ida Halya', 'HEALTHY', 1, 0, 'k1', R('NO SAPI REPLACE IKAN')),
    O(D0, 'H.Rhe', 'HEALTHY', 1, 1, 'k2'),
    O(D0, 'Dwi Fuad', 'SLIMMING', 1, 0, 'k3'),
    O(D0, 'Sandra Lexi', 'GERD SLIMM', 1, 1, 'k3'),
    O(D0, 'Elysia Verona', 'HEALTHY', 1, 1, 'k1'),
    O(D0, 'Yetty Agus', 'SLIMMING', 1, 1, 'k1'),
    O(D0, 'Anita Anwar', 'MUSCLE GROWTH', 1, 1, 'k1', R('NO PEDAS')),
    O(D0, 'Amanda', 'HEALTHY', 0, 1, 'k1', [
      { t: 'NO SAPI REPLACE AYAM', c: 'red' }, { t: 'MIE GLUTEN FREE', c: 'yellow' }, { t: 'TANPA GULA', c: 'yellow' },
      { t: 'TANPA LAPISAN (BREAD CUMBS ON PROTEIN)', c: 'yellow' }, { t: 'NO SANTAN', c: 'yellow' }]),
    O(D0, 'Bagus Susanto', 'VEGAN HEALTHY', 0, 1, 'k2', [{ t: 'MENU DINNER JANGAN PAKAI SAYUR', c: 'yellow' }]),
    O(D0, 'Vera Rismawati', 'SLIMMING', 1, 0, 'k2', R('NO MIE, KACANG PANJANG', 'NO DAUN PEPAYA', 'NO PEDAS', 'NO TELUR BULAT')),
    O(D0, 'Mutiara', 'HEALTHY', 1, 1, 'k1', [{ t: 'NO NASI PUTIH GANTI NASI MERAH', c: 'gray' }, { t: 'NO IKAN KECUALI SALMON / TUNA', c: 'cyan' }, { t: 'GLUTEN FREE', c: 'yellow' }]),
    O(D0, 'Ethika', 'SLIMMING', 1, 0, 'k1', [{ t: 'NO IKAN', c: 'cyan' }, { t: 'OLIVE OIL ONLY', c: 'yellow' }, { t: 'NO SANTAN', c: 'yellow' }, { t: 'NO SEAFOOD', c: 'yellow' }, { t: 'NO KARBO GANTI SAYUR', c: 'gray' }, { t: 'NO KENTANG', c: 'yellow' }]),
    // Besok
    O(D1, 'Rizki Adila Ramadhan', 'HEALTHY', 1, 1, 'k1', R('NO SANTAN', 'NO KUNING TELUR', 'NO SEAFOOD, IKAN OK'), true),
    O(D1, 'Ayudi', 'SLIMMING', 1, 1, 'k2', R('NO IKAN', 'NO TIMUN', 'ALL MATANG')),
    O(D1, 'Anita Anwar', 'MUSCLE GROWTH', 1, 1, 'k1', R('NO PEDAS')),
    O(D1, 'Sandra Lexi', 'GERD SLIMM', 1, 1, 'k3'),
    O(D1, 'Mutiara', 'HEALTHY', 1, 1, 'k1', [{ t: 'NO NASI PUTIH GANTI NASI MERAH', c: 'gray' }, { t: 'NO IKAN KECUALI SALMON / TUNA', c: 'cyan' }]),
  ];

  const M = (date, meal, category, name, cal, pro, carb, fat) => ({ id: uid(), date, meal, category, name, cal, pro, carb, fat });
  const menus = [];
  [D0, D1].forEach((d, i) => {
    const alt = i === 1;
    menus.push(
      M(d, 'lunch', 'ALL', alt ? 'Chicken Teriyaki Brown Rice' : 'Grilled Chicken Honey Garlic', alt ? 410 : 395, 35, 42, 10),
      M(d, 'dinner', 'ALL', alt ? 'Dory Lemon Butter' : 'Salmon Teriyaki Quinoa', alt ? 360 : 380, 32, 28, 14),
      M(d, 'lunch', 'SLIMMING', alt ? 'Chicken Pepper Cauli Rice' : 'Ayam Bakar Taliwang', 320, 32, 22, 9),
      M(d, 'dinner', 'SLIMMING', alt ? 'Tuna Sambal Matah' : 'Dory Sambal Matah', 290, 30, 18, 8),
      M(d, 'lunch', 'GERD SLIMM', 'Steak Bite Garlic Butter', 338, 40, 30, 12),
      M(d, 'dinner', 'GERD SLIMM', 'Steamed Chicken Ginger', 300, 34, 24, 7),
      M(d, 'lunch', 'MUSCLE GROWTH', 'Beef Bulgogi Rice Bowl', 560, 48, 55, 16),
      M(d, 'dinner', 'MUSCLE GROWTH', 'Double Chicken Breast Potato', 520, 52, 40, 13),
      M(d, 'dinner', 'VEGAN HEALTHY', 'Tofu Tempeh Rendang', 380, 22, 38, 15),
    );
  });

  return {
    customers: cs, orders, menus, couriers, categories,
    settings: { autoPrintOnSave: 'none', schedOn: false, schedTime: '19:00', cols: 3, lastAuto: '' },
  };
}

// ---------- Store ----------
let db;
function load() {
  try { db = JSON.parse(localStorage.getItem(STORE_KEY)); } catch { db = null; }
  if (!db || !db.customers) { db = seed(); persist(); }
}
function persist() { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }

// ---------- UI state ----------
const state = { date: todayStr(), view: 'kurir', sel: new Set() };
const VIEW_META = {
  kurir: ['Dashboard', 'Daftar pengiriman harian — nama, alamat & kurir'],
  request: ['Label Request', 'Label untuk tim kitchen — copy & print terpisah'],
  nutrition: ['Nutrition Facts & Pengiriman', 'Label nutrisi + nama & alamat customer dalam satu label'],
  customers: ['Database Customer', 'Tambah, edit & hapus data customer'],
  menus: ['Menu & Nutrisi', 'Data nutrition facts per tanggal, meal & kategori'],
  couriers: ['Database Kurir', 'Kelola kurir & area pengiriman'],
  settings: ['Pengaturan & Print', 'Print otomatis, kategori paket & backup data'],
};

const cust = id => db.customers.find(c => c.id === id) || { name: '(customer dihapus)', address: '', phone: '', kecamatan: '', kota: '', note: '' };
const courier = id => db.couriers.find(k => k.id === id);
const category = name => db.categories.find(c => c.name === name) || { name, abbr: '', color: '#FFFFFF' };
const dayOrders = (date = state.date) => db.orders.filter(o => o.date === date);
const findMenu = (date, meal, cat) =>
  db.menus.find(m => m.date === date && m.meal === meal && m.category === cat) ||
  db.menus.find(m => m.date === date && m.meal === meal && m.category === 'ALL');

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  load();
  $('inp-date').value = state.date;
  fillFilters();
  renderAll();
  syncSettingsUI();
  setInterval(checkSchedule, 20000);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

function renderAll() {
  renderCounts();
  if (state.view === 'kurir') renderKurir();
  if (state.view === 'request') renderRequest();
  if (state.view === 'nutrition') renderNutrition();
  if (state.view === 'customers') renderCustomers();
  if (state.view === 'menus') renderMenus();
  if (state.view === 'couriers') renderCouriers();
  if (state.view === 'settings') renderCategories();
}

function goView(v) {
  state.view = v;
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === v));
  $('view-title').textContent = VIEW_META[v][0];
  $('view-sub').textContent = VIEW_META[v][1];
  $('date-nav').classList.toggle('hide', ['customers', 'couriers', 'settings'].includes(v));
  renderAll();
}

function setDate(ds) {
  if (!ds) return;
  state.date = ds; state.sel.clear();
  $('inp-date').value = ds;
  renderAll();
}
function shiftDate(n) { setDate(addDays(state.date, n)); }

function renderCounts() {
  const d = dayOrders();
  $('cnt-kurir').textContent = d.length;
  $('cnt-request').textContent = d.filter(o => o.requests.length).length;
  $('cnt-customers').textContent = db.customers.length;
}

function fillFilters() {
  const catOpts = '<option value="all">Semua Kategori</option>' + db.categories.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
  const kOpts = '<option value="all">Semua Kurir</option><option value="">— Belum di-assign —</option>' + db.couriers.map(k => `<option value="${k.id}">${esc(k.name)}</option>`).join('');
  const refill = (id, html) => {
    const el = $(id), had = el.options.length > 0, v = el.value;
    el.innerHTML = html;
    el.value = had ? v : 'all';
    if (el.selectedIndex < 0) el.value = 'all';
  };
  refill('f-cat', catOpts);
  refill('f-kurir', kOpts);
  refill('nf-kurir', kOpts);
}

// =============================================
//  DASHBOARD KURIR
// =============================================
function kurirFiltered() {
  const q = $('q-kurir').value.trim().toLowerCase();
  const meal = $('f-meal').value, cat = $('f-cat').value, kur = $('f-kurir').value, st = $('f-status').value;
  return dayOrders().filter(o => {
    const c = cust(o.customerId);
    if (meal === 'lunch' && !o.lunch) return false;
    if (meal === 'dinner' && !o.dinner) return false;
    if (cat !== 'all' && o.category !== cat) return false;
    if (kur !== 'all' && (o.kurir || '') !== kur) return false;
    if (st !== 'all' && o.status !== st) return false;
    if (q && !`${c.name} ${c.address} ${c.phone} ${c.kecamatan} ${c.kota} ${o.requests.map(r => r.t).join(' ')}`.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => cust(a.customerId).name.localeCompare(cust(b.customerId).name));
}

function menuQtyText(o) {
  const ab = category(o.category).abbr;
  const s = ab ? ` (${ab})` : '';
  const parts = [];
  if (o.lunch) parts.push(`${o.lunch} LUNCH${s}`);
  if (o.dinner) parts.push(`${o.dinner} DINNER${s}`);
  return parts.join(' + ');
}

function renderStats() {
  const d = dayOrders();
  const lunch = d.reduce((a, o) => a + o.lunch, 0), dinner = d.reduce((a, o) => a + o.dinner, 0);
  const done = d.filter(o => o.status === 'delivered').length;
  const reqs = d.filter(o => o.requests.length).length;
  const pct = d.length ? Math.round(done / d.length * 100) : 0;
  $('stats').innerHTML = `
    <div class="stat hero"><span class="ico">📦</span><div class="lbl">Total Box</div><div class="val">${lunch + dinner}</div><div class="foot">${fmtLong(state.date)}</div></div>
    <div class="stat" style="--accent:#DBEAFE"><span class="ico">👥</span><div class="lbl">Pengiriman</div><div class="val">${d.length}</div><div class="foot">${new Set(d.map(o => o.customerId)).size} customer unik</div></div>
    <div class="stat" style="--accent:#FEF3C7"><span class="ico">☀️</span><div class="lbl">Lunch</div><div class="val">${lunch}</div><div class="foot">box</div></div>
    <div class="stat" style="--accent:#FFEDD5"><span class="ico">🌙</span><div class="lbl">Dinner</div><div class="val">${dinner}</div><div class="foot">box • ${reqs} order dengan request</div></div>
    <div class="stat" style="--accent:#DCFCE7"><span class="ico">✅</span><div class="lbl">Terkirim</div><div class="val">${pct}%</div><div class="foot">${done} dari ${d.length} pengiriman</div></div>`;
}

function renderKurirStrip() {
  const d = dayOrders(), cur = $('f-kurir').value;
  const groups = [...db.couriers.map(k => ({ id: k.id, name: k.name })), { id: '', name: 'Belum di-assign' }];
  $('kurir-strip').innerHTML = groups.map(g => {
    const list = d.filter(o => (o.kurir || '') === g.id);
    if (!list.length && g.id === '') return '';
    const box = list.reduce((a, o) => a + o.lunch + o.dinner, 0);
    const done = list.filter(o => o.status === 'delivered').length;
    const pct = list.length ? done / list.length * 100 : 0;
    return `<div class="kurir-card ${cur === g.id ? 'on' : ''}" onclick="focusKurir('${g.id}')" id="kc-${g.id || 'none'}">
      <div class="av" style="${g.id ? '' : 'background:#94A3B8'}">${g.id ? esc(g.name.split(' ').pop()[0]) : '?'}</div>
      <div><div class="nm">${esc(g.name)}</div><div class="mt">${list.length} alamat • ${box} box</div><div class="prog"><i style="width:${pct}%"></i></div></div>
    </div>`;
  }).join('');
}
function focusKurir(id) {
  const f = $('f-kurir');
  f.value = f.value === id ? 'all' : id;
  renderKurir();
}

function renderKurir() {
  renderStats(); renderKurirStrip();
  const list = kurirFiltered();
  const addrCount = {};
  list.forEach(o => { const a = cust(o.customerId).address.toUpperCase(); addrCount[a] = (addrCount[a] || 0) + 1; });
  const kOpts = sel => `<option value="">— pilih —</option>` + db.couriers.map(k => `<option value="${k.id}" ${sel === k.id ? 'selected' : ''}>${esc(k.name)}</option>`).join('');
  const sOpt = (v, l, s) => `<option value="${v}" ${s === v ? 'selected' : ''}>${l}</option>`;

  $('tb-kurir').innerHTML = list.length ? list.map(o => {
    const c = cust(o.customerId), cat = category(o.category), on = state.sel.has(o.id);
    const dup = addrCount[c.address.toUpperCase()] > 1;
    const reqLines = o.requests.map(r => `- ${esc(r.t)}`).concat(o.cutlery ? ['- SENDOK GARPU'] : []).join('<br>');
    const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${c.address}, ${c.kecamatan}, ${c.kota}`);
    const wa = 'https://wa.me/' + c.phone.replace(/\D/g, '').replace(/^0/, '62');
    return `<tr class="${on ? 'sel' : ''}" id="row-${o.id}">
      <td class="c"><input type="checkbox" class="cb" ${on ? 'checked' : ''} onchange="toggleSel('${o.id}', this.checked)"></td>
      <td class="cat-cell" style="background:${cat.color}">${esc(o.category)}</td>
      <td class="strong nowrap">${esc(c.name)}</td>
      <td class="menu-cell"><span class="qty">${menuQtyText(o)}</span>${reqLines}</td>
      <td class="c"><span class="box-num">${o.lunch + o.dinner}</span></td>
      <td class="addr ${dup ? 'dup' : ''}">${esc(c.address)}${c.note ? `<span class="note">NOTE : ${esc(c.note)}</span>` : ''}</td>
      <td class="strong nowrap" style="font-weight:600">${esc(c.kecamatan)}</td>
      <td class="strong nowrap" style="font-weight:600">${esc(c.kota)}</td>
      <td class="nowrap">${esc(c.phone)}</td>
      <td><select class="kurir-sel" onchange="setOrderField('${o.id}','kurir',this.value)">${kOpts(o.kurir)}</select></td>
      <td><select class="status-sel ${o.status}" onchange="setOrderField('${o.id}','status',this.value)">
        ${sOpt('pending', '● Belum Kirim', o.status)}${sOpt('otw', '🛵 OTW', o.status)}${sOpt('delivered', '✓ Terkirim', o.status)}${sOpt('failed', '✕ Gagal', o.status)}
      </select></td>
      <td class="actions">
        <a class="icon-btn" href="${maps}" target="_blank" title="Buka Maps">📍</a>
        <a class="icon-btn" href="${wa}" target="_blank" title="WhatsApp">💬</a>
        <button class="icon-btn" title="Print label order ini" onclick="printOrderLabels('${o.id}')">🖨️</button>
        <button class="icon-btn" title="Edit" onclick="openOrderModal('${o.id}')">✏️</button>
        <button class="icon-btn" title="Duplikat" onclick="duplicateOrder('${o.id}')">⧉</button>
        <button class="icon-btn del" title="Hapus" onclick="deleteOrder('${o.id}')">🗑</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="12"><div class="empty"><div class="big">🛵</div>Belum ada pengiriman untuk ${fmtLong(state.date)}.<br><br><button class="btn btn-primary" onclick="openOrderModal()">＋ Tambah Order</button></div></td></tr>`;

  const ids = list.map(o => o.id);
  $('chk-all').checked = ids.length > 0 && ids.every(id => state.sel.has(id));
  updateSelInfo();
}

function toggleSel(id, on) {
  on ? state.sel.add(id) : state.sel.delete(id);
  $('row-' + id)?.classList.toggle('sel', on);
  const ids = kurirFiltered().map(o => o.id);
  $('chk-all').checked = ids.length > 0 && ids.every(i => state.sel.has(i));
  updateSelInfo();
}
function toggleAll(on) {
  kurirFiltered().forEach(o => on ? state.sel.add(o.id) : state.sel.delete(o.id));
  renderKurir();
}
function updateSelInfo() {
  const n = state.sel.size;
  $('sel-info').textContent = n ? `${n} dipilih — print hanya yang dipilih` : `${kurirFiltered().length} pengiriman ditampilkan`;
  $('btn-bulk-del').classList.toggle('hide', !n);
}

function setOrderField(id, field, val) {
  const o = db.orders.find(x => x.id === id); if (!o) return;
  o[field] = val; persist();
  if (field === 'status') toast(`Status diperbarui: ${({ pending: 'Belum Kirim', otw: 'Dalam Perjalanan', delivered: 'Terkirim', failed: 'Gagal' })[val]}`);
  else toast('Kurir diperbarui');
  renderKurir();
}

function deleteOrder(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o || !confirm(`Hapus order ${cust(o.customerId).name}?`)) return;
  db.orders = db.orders.filter(x => x.id !== id);
  state.sel.delete(id); persist(); renderAll(); toast('Order dihapus');
}
function bulkDelete() {
  if (!confirm(`Hapus ${state.sel.size} order terpilih?`)) return;
  db.orders = db.orders.filter(o => !state.sel.has(o.id));
  state.sel.clear(); persist(); renderAll(); toast('Order terpilih dihapus');
}
function duplicateOrder(id) {
  const o = db.orders.find(x => x.id === id); if (!o) return;
  db.orders.push({ ...JSON.parse(JSON.stringify(o)), id: uid(), status: 'pending' });
  persist(); renderAll(); toast('Order diduplikat');
}

// =============================================
//  ORDER MODAL
// =============================================
let mReqs = [];
function openOrderModal(id) {
  const o = id ? db.orders.find(x => x.id === id) : null;
  mReqs = o ? JSON.parse(JSON.stringify(o.requests)) : [];
  const custOpts = [...db.customers].sort((a, b) => a.name.localeCompare(b.name))
    .map(c => `<option value="${c.id}" ${o && o.customerId === c.id ? 'selected' : ''}>${esc(c.name)} — ${esc(c.kecamatan)}</option>`).join('');
  const catOpts = db.categories.map(c => `<option ${o && o.category === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const kOpts = '<option value="">— Belum di-assign —</option>' + db.couriers.map(k => `<option value="${k.id}" ${o && o.kurir === k.id ? 'selected' : ''}>${esc(k.name)}</option>`).join('');

  openModal(o ? 'Edit Order' : 'Tambah Order', `
    <div class="form-grid">
      <div class="field"><label id="lbl-date">Tanggal Kirim</label><input type="date" class="inp" id="o-date" value="${o ? o.date : state.date}"></div>
      <div class="field"><label>Kategori Paket</label><select id="o-cat" onchange="renderReqPreview()">${catOpts}</select></div>
      <div class="field full"><label>Customer</label>
        <select id="o-cust" onchange="onCustChange()"><option value="__new">＋ Customer baru…</option>${custOpts}</select></div>
      <div class="form-grid full hide" id="o-new">
        <div class="section-sep">Customer Baru</div>
        <div class="field"><label>Nama</label><input class="inp" id="n-name" oninput="renderReqPreview()"></div>
        <div class="field"><label>Phone</label><input class="inp" id="n-phone"></div>
        <div class="field full"><label>Alamat</label><textarea id="n-address"></textarea></div>
        <div class="field"><label>Kecamatan</label><input class="inp" id="n-kec"></div>
        <div class="field"><label>Kota</label><input class="inp" id="n-kota"></div>
        <div class="field full"><label>Catatan pengiriman</label><input class="inp" id="n-note" placeholder="Contoh: Tiba max jam 11.30"></div>
      </div>
      ${!o ? `<div class="field full"><label style="display:flex;align-items:center;gap:10px;cursor:pointer;background:var(--gray-50);padding:10px;border-radius:8px"><label class="switch"><input type="checkbox" id="o-multi" onchange="$('lbl-date').textContent = this.checked ? 'Mulai Pengiriman' : 'Tanggal Kirim'; $('lbl-lunch').textContent = this.checked ? '☀️ Total Lunch' : '☀️ Box Lunch'; $('lbl-dinner').textContent = this.checked ? '🌙 Total Dinner' : '🌙 Box Dinner'"><span></span></label> <b>Jadwalkan paket per hari</b> (Otomatis sebar 1 box/hari weekday Senin - Jumat)</label></div>` : ''}
      <div class="field"><label id="lbl-lunch">☀️ Box Lunch</label><div class="qty-box"><button type="button" onclick="qty('o-lunch',-1)">−</button><input id="o-lunch" type="number" min="0" value="${o ? o.lunch : 1}"><button type="button" onclick="qty('o-lunch',1)">＋</button></div></div>
      <div class="field"><label id="lbl-dinner">🌙 Box Dinner</label><div class="qty-box"><button type="button" onclick="qty('o-dinner',-1)">−</button><input id="o-dinner" type="number" min="0" value="${o ? o.dinner : 0}"><button type="button" onclick="qty('o-dinner',1)">＋</button></div></div>
      <div class="field"><label>Kurir</label><select id="o-kurir">${kOpts}</select></div>
      <div class="field"><label>Status</label><select id="o-status">
        ${['pending:Belum Kirim', 'otw:Dalam Perjalanan', 'delivered:Terkirim', 'failed:Gagal'].map(s => { const [v, l] = s.split(':'); return `<option value="${v}" ${o && o.status === v ? 'selected' : ''}>${l}</option>`; }).join('')}
      </select></div>
      <div class="field full"><label style="display:flex;align-items:center;gap:10px"><label class="switch"><input type="checkbox" id="o-cut" ${o && o.cutlery ? 'checked' : ''}><span></span></label> Sertakan sendok & garpu</label></div>

      <div class="section-sep">Request untuk Kitchen</div>
      <div class="field full">
        <div class="req-list" id="req-list"></div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input class="inp" id="req-new" placeholder="Ketik request lalu Enter… (contoh: NO PEDAS)" style="text-transform:uppercase" onkeydown="if(event.key==='Enter'){event.preventDefault();addReq(this.value)}">
          <button class="btn btn-ghost" type="button" onclick="addReq($('req-new').value)">Tambah</button>
        </div>
        <div class="presets">${PRESETS.map(p => `<button type="button" class="preset" onclick="addReq('${p}')">＋ ${p}</button>`).join('')}</div>
        <div class="hint">Warna otomatis disarankan: <b>cyan</b> protein/ikan, <b>merah</b> replace, <b>abu</b> nasi/karbo, <b>kuning</b> lainnya. Klik kotak warna untuk mengganti.</div>
        <div class="req-preview" id="req-preview"></div>
      </div>
    </div>`,
    `${o ? `<button class="btn btn-danger" onclick="closeModal();deleteOrder('${o.id}')">Hapus</button><div style="flex:1"></div>` : ''}
     <button class="btn btn-ghost" onclick="closeModal()">Batal</button>
     <button class="btn btn-primary" id="btn-save-order" onclick="saveOrder('${o ? o.id : ''}')">💾 Simpan Order</button>`);
  if (!o && !db.customers.length) $('o-cust').value = '__new';
  else if (!o) $('o-cust').selectedIndex = 1;
  onCustChange();
  renderReqEditor();
}
function onCustChange() { $('o-new').classList.toggle('hide', $('o-cust').value !== '__new'); renderReqPreview(); }
function qty(id, d) { const i = $(id); i.value = Math.max(0, (+i.value || 0) + d); }
function addReq(t) {
  t = (t || '').trim().toUpperCase(); if (!t) return;
  mReqs.push({ t, c: suggestColor(t) });
  $('req-new').value = '';
  renderReqEditor();
}
function renderReqEditor() {
  $('req-list').innerHTML = mReqs.map((r, i) => `
    <div class="req-row">
      <input class="inp" value="${esc(r.t)}" oninput="mReqs[${i}].t=this.value.toUpperCase();renderReqPreview()">
      <div class="swatches">${COLORS.map(c => `<button type="button" class="sw ${r.c === c.k ? 'on' : ''}" style="background:${c.hex}" title="${c.name}" onclick="mReqs[${i}].c='${c.k}';renderReqEditor()"></button>`).join('')}</div>
      <button type="button" class="icon-btn del" onclick="mReqs.splice(${i},1);renderReqEditor()">✕</button>
    </div>`).join('') || '<div class="hint">Belum ada request.</div>';
  renderReqPreview();
}
function renderReqPreview() {
  const el = $('req-preview'); if (!el) return;
  const cid = $('o-cust').value;
  const name = cid === '__new' ? ($('n-name')?.value || 'NAMA CUSTOMER') : cust(cid).name;
  const meal = (+$('o-lunch')?.value ? 'LUNCH' : 'DINNER');
  el.innerHTML = `<div class="hint" style="margin-bottom:6px;text-align:center">Preview label request</div>` +
    requestLabelHTML({ name, category: $('o-cat').value, meal, requests: mReqs }, false);
}

function saveOrder(id) {
  let customerId = $('o-cust').value;
  if (customerId === '__new') {
    const name = $('n-name').value.trim();
    if (!name) return toast('Nama customer wajib diisi', 'error');
    const username = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') || ('user' + Math.floor(Math.random()*1000));
    const password = Math.random().toString(36).slice(-6);
    const c = { id: uid(), name, phone: $('n-phone').value.trim(), address: $('n-address').value.trim(), kecamatan: $('n-kec').value.trim(), kota: $('n-kota').value.trim(), note: $('n-note').value.trim(), username, password };
    db.customers.push(c); customerId = c.id;
  }
  const lunch = Math.max(0, +$('o-lunch').value || 0), dinner = Math.max(0, +$('o-dinner').value || 0);
  if (!lunch && !dinner) return toast('Minimal 1 box lunch atau dinner', 'error');
  const data = {
    date: $('o-date').value || state.date, customerId, category: $('o-cat').value, lunch, dinner,
    kurir: $('o-kurir').value, status: $('o-status').value, cutlery: $('o-cut').checked,
    requests: mReqs.filter(r => r.t.trim()).map(r => ({ t: r.t.trim().toUpperCase(), c: r.c })),
  };
  let order;
  const isMulti = $('o-multi') && $('o-multi').checked;
  if (!id && isMulti) {
    let lLeft = lunch, dLeft = dinner;
    let curDate = new Date($('o-date').value || state.date);
    
    while (lLeft > 0 || dLeft > 0) {
      const day = curDate.getDay();
      if (day !== 0 && day !== 6) { // Skip Minggu (0) dan Sabtu (6)
        const curL = lLeft > 0 ? 1 : 0;
        const curD = dLeft > 0 ? 1 : 0;
        
        db.orders.push({
          id: uid(), date: fmt(curDate), customerId, category: $('o-cat').value,
          lunch: curL, dinner: curD, kurir: $('o-kurir').value, status: $('o-status').value,
          cutlery: $('o-cut').checked, requests: mReqs.filter(r => r.t.trim()).map(r => ({ t: r.t.trim().toUpperCase(), c: r.c }))
        });
        
        lLeft -= curL; dLeft -= curD;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
  } else {
    if (id) { order = db.orders.find(x => x.id === id); Object.assign(order, data); }
    else { order = { id: uid(), ...data }; db.orders.push(order); }
  }
  
  persist(); closeModal(); fillFilters(); renderAll();
  toast(id ? 'Order diperbarui ✓' : (isMulti ? 'Jadwal order berhasil dibuat ✓' : 'Order ditambahkan ✓'));

  const ap = db.settings.autoPrintOnSave;
  if (ap !== 'none' && order) setTimeout(() => printOrderLabels(order.id, ap), 350);
}

// =============================================
//  LABEL BUILDERS
// =============================================
function expandBoxes(orders, meal = 'all') {
  const out = [];
  orders.forEach(o => {
    const c = cust(o.customerId);
    ['lunch', 'dinner'].forEach(m => {
      if (meal !== 'all' && meal !== m) return;
      for (let i = 0; i < o[m]; i++) out.push({ o, c, meal: m, n: i + 1, of: o[m] });
    });
  });
  // urutkan: lunch dulu, lalu nama
  return out.sort((a, b) => (a.meal === b.meal ? 0 : a.meal === 'lunch' ? -1 : 1) || a.c.name.localeCompare(b.c.name));
}

function renderRequestsHTML(requests, cutlery) {
  const items = [];
  if (requests && requests.length) {
    requests.forEach(r => {
      const text = (r.t || '').trim();
      const textLines = text.split('\n').map(s => s.trim()).filter(Boolean);
      textLines.forEach(tl => {
        items.push({ t: tl, c: r.c || 'yellow' });
      });
    });
  }
  if (cutlery) {
    items.push({ t: 'SENDOK GARPU', c: 'yellow' });
  }
  if (!items.length) {
    return '<span class="none">TANPA REQUEST</span>';
  }

  const hasBullets = items.some(it => it.t.startsWith('-'));

  if (hasBullets) {
    return items.map(it => `<div class="rq-line"><mark class="${it.c}">${esc(it.t)}</mark></div>`).join('');
  } else {
    return items.map((it, idx) => `<mark class="${it.c}">${esc(it.t)}</mark>${idx < items.length - 1 ? ' ' : ''}`).join('');
  }
}

function requestLabelHTML({ name, category, meal, requests, cutlery }, copyable = true, copyIdx) {
  const cat = (category || '').toUpperCase().replace(/\s+GROWTH/g, '');
  const m = (meal || '').toUpperCase();
  const reqHtml = renderRequestsHTML(requests, cutlery);

  return `<div class="rlabel">
    ${copyable ? `<button class="copy-btn" onclick="copyRequest(${copyIdx})">📋 Copy</button>` : ''}
    <div class="rn">${esc(name)}</div>
    <div class="rc">${esc(cat)}, ${esc(m)}</div>
    <div class="rq">${reqHtml}</div>
  </div>`;
}

function nutritionLabelHTML(b) {
  const m = findMenu(b.o.date, b.meal, b.o.category);
  const cat = category(b.o.category);
  const k = courier(b.o.kurir);
  const nf = m ? `
    <div class="nf-dish">${esc(m.name)}</div>
    <div class="nf-row"><span class="k">Calories</span><span class="dots"></span><span class="v">${m.cal}</span></div>
    <div class="nf-row"><span class="k">Protein</span><span class="dots"></span><span class="v">${m.pro}</span></div>
    <div class="nf-row"><span class="k">Carbohydrates</span><span class="dots"></span><span class="v">${m.carb}</span></div>
    <div class="nf-row"><span class="k">Fat</span><span class="dots"></span><span class="v">${m.fat}</span></div>`
    : `<div class="nf-missing">⚠ Menu ${MEAL_LABEL[b.meal]} ${esc(b.o.category)} belum diisi</div>`;
  return `<div class="nlabel">
    <div class="nf-head"><div class="t">NUTRITION FACTS</div><div class="m">${esc(cat.name)} ${MEAL_LABEL[b.meal]} MENU</div></div>
    ${nf}
    <div class="ship">
      <div class="to"><b>${esc(b.c.name)}</b><span class="tag">${MEAL_LABEL[b.meal]}${b.of > 1 ? ` ${b.n}/${b.of}` : ''}</span></div>
      <div class="ad">${esc(b.c.address)}</div>
      <div class="meta"><span>${esc(b.c.kecamatan)}${b.c.kota ? ', ' + esc(b.c.kota) : ''}</span><span>📞 ${esc(b.c.phone)}</span></div>
      ${b.c.note ? `<div class="nt">Note: ${esc(b.c.note)}</div>` : ''}
      <div class="meta"><span>${fmtShort(b.o.date)}</span><span>${k ? '🛵 ' + esc(k.name) : ''}${b.o.cutlery ? ' • 🍴' : ''}</span></div>
    </div>
  </div>`;
}

// =============================================
//  VIEW: LABEL REQUEST
// =============================================
let reqBoxes = [];
function requestBoxes() {
  const meal = $('rf-meal').value, only = $('rf-only').value;
  let orders = dayOrders();
  if (only === 'req') orders = orders.filter(o => o.requests.length || o.cutlery);
  return expandBoxes(orders, meal);
}
function renderRequest() {
  reqBoxes = requestBoxes();
  $('grid-request').style.setProperty('--cols', db.settings.cols);
  $('grid-request').innerHTML = reqBoxes.length
    ? reqBoxes.map((b, i) => requestLabelHTML({ name: b.c.name, category: b.o.category, meal: MEAL_LABEL[b.meal], requests: b.o.requests, cutlery: b.o.cutlery }, true, i)).join('')
    : `<div class="empty" style="grid-column:1/-1"><div class="big">🏷️</div>Tidak ada label request untuk ${fmtLong(state.date)}.</div>`;
}
const reqText = b => {
  const cat = (b.o.category || '').toUpperCase().replace(/\s+GROWTH/g, '');
  const meal = (MEAL_LABEL[b.meal] || b.meal).toUpperCase();
  const reqs = b.o.requests.map(r => r.t).concat(b.o.cutlery ? ['SENDOK GARPU'] : []).join('\n') || '-';
  return `${b.c.name.toUpperCase()}\n${cat}, ${meal}\n${reqs}`;
};
function copyRequest(i) { copyText(reqText(reqBoxes[i]), 'Request disalin ke clipboard'); }
function copyAllRequests() {
  if (!reqBoxes.length) return toast('Tidak ada data untuk disalin', 'error');
  copyText(`LABEL REQUEST — ${fmtLong(state.date).toUpperCase()}\n\n` + reqBoxes.map(reqText).join('\n\n'), `${reqBoxes.length} label request disalin`);
}
function copyText(t, msg) {
  (navigator.clipboard?.writeText(t) || Promise.reject()).then(() => toast(msg)).catch(() => {
    const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove(); toast(msg);
  });
}

// =============================================
//  VIEW: NUTRITION + PENGIRIMAN
// =============================================
function nutritionBoxes() {
  const k = $('nf-kurir').value;
  let orders = dayOrders();
  if (k !== 'all') orders = orders.filter(o => (o.kurir || '') === k);
  return expandBoxes(orders, $('nf-meal').value);
}
function renderNutrition() {
  const boxes = nutritionBoxes();
  const missing = new Set(boxes.filter(b => !findMenu(b.o.date, b.meal, b.o.category)).map(b => `${b.o.category} ${MEAL_LABEL[b.meal]}`));
  $('nf-warn').innerHTML = missing.size ? `<div class="warn-box">⚠️ <div><b>Menu belum lengkap:</b> ${[...missing].map(esc).join(', ')}. <a href="#" onclick="goView('menus');return false" style="color:inherit;font-weight:700">Tambahkan di Menu & Nutrisi →</a></div></div>` : '';
  $('nf-count').textContent = `${boxes.length} label`;
  $('grid-nutrition').style.setProperty('--cols', db.settings.cols);
  $('grid-nutrition').innerHTML = boxes.length ? boxes.map(nutritionLabelHTML).join('')
    : `<div class="empty" style="grid-column:1/-1"><div class="big">🧾</div>Tidak ada box untuk ${fmtLong(state.date)}.</div>`;
}

// =============================================
//  PRINTING
// =============================================
let printChain = Promise.resolve();
function printJob(html) {
  printChain = printChain.then(() => new Promise(res => {
    const area = $('print-area');
    area.innerHTML = html;
    area.style.setProperty('--cols', db.settings.cols);
    let done = false;
    const finish = () => { if (done) return; done = true; window.removeEventListener('afterprint', finish); area.innerHTML = ''; setTimeout(res, 300); };
    window.addEventListener('afterprint', finish);
    setTimeout(() => { window.print(); setTimeout(finish, 800); }, 120);
  }));
  return printChain;
}

function sourceOrders(fromKurir) {
  if (fromKurir) {
    const list = kurirFiltered();
    const picked = list.filter(o => state.sel.has(o.id));
    return picked.length ? picked : list;
  }
  return null;
}

function printRequest(fromKurir) {
  let boxes;
  if (fromKurir) boxes = expandBoxes(sourceOrders(true), $('f-meal').value);
  else boxes = requestBoxes();
  if (!boxes.length) return toast('Tidak ada label request untuk dicetak', 'error');
  printJob(buildRequestPrint(boxes));
}
function buildRequestPrint(boxes) {
  const pageSize = 12; // 3 kolom x 4 baris per lembar A4
  const pages = [];
  for (let i = 0; i < boxes.length; i += pageSize) {
    pages.push(boxes.slice(i, i + pageSize));
  }
  return pages.map(pageBoxes => {
    const slots = [...pageBoxes];
    while (slots.length < 12) {
      slots.push(null);
    }
    const htmlSlots = slots.map(b => {
      if (!b) return `<div class="rlabel empty-slot"></div>`;
      const cat = (b.o.category || '').toUpperCase().replace(/\s+GROWTH/g, '');
      const meal = (MEAL_LABEL[b.meal] || b.meal).toUpperCase();
      return requestLabelHTML({
        name: b.c.name,
        category: cat,
        meal: meal,
        requests: b.o.requests,
        cutlery: b.o.cutlery
      }, false);
    }).join('');

    return `<div class="p-page-request"><div class="p-grid-request">${htmlSlots}</div></div>`;
  }).join('');
}

function printShipping(fromKurir) {
  const boxes = fromKurir ? expandBoxes(sourceOrders(true), $('f-meal').value) : nutritionBoxes();
  if (!boxes.length) return toast('Tidak ada label untuk dicetak', 'error');
  printJob(buildShippingPrint(boxes));
}
const buildShippingPrint = boxes => `<div class="p-grid">${boxes.map(nutritionLabelHTML).join('')}</div>`;

function printOrderLabels(id, mode = 'both') {
  const o = db.orders.find(x => x.id === id); if (!o) return;
  const boxes = expandBoxes([o]);
  if (mode === 'both' || mode === 'request') printJob(buildRequestPrint(boxes));
  if (mode === 'both' || mode === 'shipping') printJob(buildShippingPrint(boxes));
}

function printManifest() {
  const list = sourceOrders(true);
  if (!list.length) return toast('Tidak ada data pengiriman', 'error');
  const groups = {};
  list.forEach(o => (groups[o.kurir || ''] ||= []).push(o));
  const html = Object.entries(groups).map(([kid, orders]) => {
    const k = courier(kid);
    const addrCount = {};
    orders.forEach(o => { const a = cust(o.customerId).address.toUpperCase(); addrCount[a] = (addrCount[a] || 0) + 1; });
    const box = orders.reduce((a, o) => a + o.lunch + o.dinner, 0);
    return `<div class="group">
      <h1>MANIFEST PENGIRIMAN — ${esc(k ? k.name.toUpperCase() : 'BELUM DI-ASSIGN')}</h1>
      <div class="ph"><span>${fmtLong(state.date)}</span><span>${orders.length} alamat • ${box} box</span><span>BellyWell Catering</span></div>
      <table><thead><tr><th>No</th><th>Name</th><th>Menu</th><th>Total Box</th><th>Address</th><th>Kecamatan</th><th>Kota</th><th>Phone</th><th>TTD</th></tr></thead><tbody>
      ${orders.map((o, i) => { const c = cust(o.customerId); return `<tr>
        <td class="c">${i + 1}</td><td>${esc(c.name)}</td><td class="menu">${menuQtyText(o)}</td><td class="c">${o.lunch + o.dinner}</td>
        <td class="${addrCount[c.address.toUpperCase()] > 1 ? 'dup' : ''}">${esc(c.address)}${c.note ? `<br><br>NOTE : ${esc(c.note)}` : ''}</td>
        <td class="c">${esc(c.kecamatan)}</td><td class="c">${esc(c.kota)}</td><td class="c">${esc(c.phone)}</td><td style="width:22mm"></td></tr>`; }).join('')}
      </tbody></table>
      <div class="sign"><span>Admin: ____________________</span><span>Kurir: ____________________</span></div>
    </div>`;
  }).join('');
  printJob(`<div class="p-manifest">${html}</div>`);
}

// =============================================
//  AUTO PRINT (jadwal)
// =============================================
function runAutoPrint(date) {
  const orders = dayOrders(date);
  if (!orders.length) return toast(`Tidak ada order pada ${fmtLong(date)}`, 'error');
  const boxes = expandBoxes(orders);
  const withReq = expandBoxes(orders.filter(o => o.requests.length || o.cutlery));
  if (withReq.length) printJob(buildRequestPrint(withReq));
  printJob(buildShippingPrint(boxes));
  toast(`Mencetak label ${fmtLong(date)}…`);
}
function checkSchedule() {
  const s = db.settings;
  if (!s.schedOn || !s.schedTime) return;
  const now = new Date(), hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`, td = todayStr();
  if (hm === s.schedTime && s.lastAuto !== td) {
    s.lastAuto = td; persist();
    runAutoPrint(addDays(td, 1));
  }
}

// =============================================
//  CUSTOMERS
// =============================================
function renderCustomers() {
  const q = $('q-cust').value.trim().toLowerCase();
  const list = db.customers.filter(c => !q || `${c.name} ${c.phone} ${c.address} ${c.kecamatan} ${c.kota}`.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  $('tb-cust').innerHTML = list.length ? list.map(c => {
    const n = db.orders.filter(o => o.customerId === c.id).length;
    return `<tr>
      <td class="strong nowrap">${esc(c.name)}</td>
      <td class="nowrap">${c.username ? `<div style="font-size:11px;background:#f8fafc;padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0;line-height:1.5">👤 ${esc(c.username)}<br>🔑 ${esc(c.password)}</div>` : '<span style="color:#94a3b8;font-size:12px;font-style:italic">Belum diset</span>'}</td>
      <td class="nowrap">${esc(c.phone)}</td>
      <td class="addr" style="font-weight:600">${esc(c.address)}</td><td>${esc(c.kecamatan)}</td><td>${esc(c.kota)}</td>
      <td style="max-width:200px;color:#B45309;font-size:12px">${esc(c.note)}</td>
      <td class="c"><span class="pill gray">${n}</span></td>
      <td class="actions">
        <button class="icon-btn" title="Buat order" onclick="openOrderModal();$('o-cust').value='${c.id}';onCustChange()">＋</button>
        <button class="icon-btn" title="Edit" onclick="openCustomerModal('${c.id}')">✏️</button>
        <button class="icon-btn del" title="Hapus" onclick="deleteCustomer('${c.id}')">🗑</button>
      </td></tr>`;
  }).join('') : `<tr><td colspan="8"><div class="empty"><div class="big">👥</div>Belum ada customer.</div></td></tr>`;
}
function openCustomerModal(id) {
  const c = id ? db.customers.find(x => x.id === id) : {};
  openModal(id ? 'Edit Customer' : 'Tambah Customer', `
    <div class="form-grid">
      <div class="field"><label>Nama</label><input class="inp" id="c-name" value="${esc(c.name)}"></div>
      <div class="field"><label>Phone / WhatsApp</label><input class="inp" id="c-phone" value="${esc(c.phone)}"></div>
      <div class="field full"><label>Alamat lengkap</label><textarea id="c-address">${esc(c.address)}</textarea></div>
      <div class="field"><label>Kecamatan</label><input class="inp" id="c-kec" value="${esc(c.kecamatan)}"></div>
      <div class="field"><label>Kota</label><input class="inp" id="c-kota" value="${esc(c.kota)}"></div>
      <div class="field full"><label>Catatan untuk kurir</label><input class="inp" id="c-note" value="${esc(c.note)}" placeholder="Contoh: Titip security lobby"></div>
      <div class="section-sep">Akses Login Portal Customer</div>
      <div class="field"><label>Username</label><input class="inp" id="c-user" value="${esc(c.username)}" placeholder="Opsional"></div>
      <div class="field"><label>Password</label><input class="inp" id="c-pass" value="${esc(c.password)}" placeholder="Opsional"></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="btn-save-cust" onclick="saveCustomer('${id || ''}')">💾 Simpan</button>`, 'sm');
}
function saveCustomer(id) {
  const name = $('c-name').value.trim();
  let username = $('c-user').value.trim();
  let password = $('c-pass').value.trim();
  
  if (!username) username = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') || ('user' + Math.floor(Math.random()*1000));
  if (!password) password = Math.random().toString(36).slice(-6);

  const data = { name, phone: $('c-phone').value.trim(), address: $('c-address').value.trim(), kecamatan: $('c-kec').value.trim(), kota: $('c-kota').value.trim(), note: $('c-note').value.trim(), username, password };
  if (!data.name) return toast('Nama wajib diisi', 'error');
  if (id) Object.assign(db.customers.find(c => c.id === id), data);
  else db.customers.push({ id: uid(), ...data });
  persist(); closeModal(); renderAll(); toast('Customer disimpan ✓');
}
function deleteCustomer(id) {
  const c = db.customers.find(x => x.id === id);
  const n = db.orders.filter(o => o.customerId === id).length;
  if (!confirm(`Hapus customer ${c.name}?${n ? `\n${n} order miliknya juga akan dihapus.` : ''}`)) return;
  db.customers = db.customers.filter(x => x.id !== id);
  db.orders = db.orders.filter(o => o.customerId !== id);
  persist(); renderAll(); toast('Customer dihapus');
}

// =============================================
//  MENUS & NUTRITION
// =============================================
function renderMenus() {
  const scope = $('mf-scope').value;
  const list = db.menus.filter(m => scope === 'all' || m.date === state.date)
    .sort((a, b) => b.date.localeCompare(a.date) || a.meal.localeCompare(b.meal) * -1 || a.category.localeCompare(b.category));
  $('tb-menu').innerHTML = list.length ? list.map(m => `<tr>
    <td class="nowrap">${fmtShort(m.date)}</td>
    <td>${m.meal === 'lunch' ? '<span class="pill blue">☀️ Lunch</span>' : '<span class="pill orange">🌙 Dinner</span>'}</td>
    <td class="nowrap">${m.category === 'ALL' ? '<span class="pill purple">Semua kategori</span>' : `<span class="cat-dot" style="background:${category(m.category).color}"></span>${esc(m.category)}`}</td>
    <td class="strong">${esc(m.name)}</td>
    <td class="c"><b>${m.cal}</b></td><td class="c">${m.pro}</td><td class="c">${m.carb}</td><td class="c">${m.fat}</td>
    <td class="actions">
      <button class="icon-btn" title="Edit" onclick="openMenuModal('${m.id}')">✏️</button>
      <button class="icon-btn" title="Duplikat" onclick="dupMenu('${m.id}')">⧉</button>
      <button class="icon-btn del" title="Hapus" onclick="deleteMenu('${m.id}')">🗑</button>
    </td></tr>`).join('')
    : `<tr><td colspan="9"><div class="empty"><div class="big">🍱</div>Belum ada menu untuk ${fmtLong(state.date)}.<br><br><button class="btn btn-primary" onclick="openMenuModal()">＋ Tambah Menu</button></div></td></tr>`;
}
function openMenuModal(id) {
  const m = id ? db.menus.find(x => x.id === id) : { date: state.date, meal: 'lunch', category: 'ALL', cal: '', pro: '', carb: '', fat: '' };
  const catOpts = `<option value="ALL" ${m.category === 'ALL' ? 'selected' : ''}>Semua kategori (default)</option>` + db.categories.map(c => `<option ${m.category === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  openModal(id ? 'Edit Menu' : 'Tambah Menu', `
    <div class="form-grid">
      <div class="field"><label>Tanggal</label><input type="date" class="inp" id="m-date" value="${m.date}"></div>
      <div class="field"><label>Meal</label><select id="m-meal"><option value="lunch" ${m.meal === 'lunch' ? 'selected' : ''}>☀️ Lunch</option><option value="dinner" ${m.meal === 'dinner' ? 'selected' : ''}>🌙 Dinner</option></select></div>
      <div class="field full"><label>Kategori</label><select id="m-cat">${catOpts}</select><div class="hint">"Semua kategori" dipakai jika kategori tertentu tidak punya menu khusus.</div></div>
      <div class="field full"><label>Nama menu</label><input class="inp" id="m-name" value="${esc(m.name)}" placeholder="Contoh: Steak Bite Garlic Butter"></div>
      <div class="form-grid g4 full">
        <div class="field"><label>Calories</label><input type="number" class="inp" id="m-cal" value="${m.cal}"></div>
        <div class="field"><label>Protein (g)</label><input type="number" class="inp" id="m-pro" value="${m.pro}"></div>
        <div class="field"><label>Carbs (g)</label><input type="number" class="inp" id="m-carb" value="${m.carb}"></div>
        <div class="field"><label>Fat (g)</label><input type="number" class="inp" id="m-fat" value="${m.fat}"></div>
      </div>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="btn-save-menu" onclick="saveMenu('${id || ''}')">💾 Simpan</button>`, 'sm');
}
function saveMenu(id) {
  const data = { date: $('m-date').value, meal: $('m-meal').value, category: $('m-cat').value, name: $('m-name').value.trim(), cal: +$('m-cal').value || 0, pro: +$('m-pro').value || 0, carb: +$('m-carb').value || 0, fat: +$('m-fat').value || 0 };
  if (!data.name || !data.date) return toast('Tanggal & nama menu wajib diisi', 'error');
  const clash = db.menus.find(m => m.id !== id && m.date === data.date && m.meal === data.meal && m.category === data.category);
  if (clash && !confirm('Sudah ada menu untuk tanggal, meal & kategori yang sama. Ganti?')) return;
  if (clash) db.menus = db.menus.filter(m => m.id !== clash.id);
  if (id) Object.assign(db.menus.find(m => m.id === id), data);
  else db.menus.push({ id: uid(), ...data });
  persist(); closeModal(); renderAll(); toast('Menu disimpan ✓');
}
function dupMenu(id) { const m = db.menus.find(x => x.id === id); openMenuModal(); Object.entries({ 'm-meal': m.meal, 'm-cat': m.category, 'm-name': m.name, 'm-cal': m.cal, 'm-pro': m.pro, 'm-carb': m.carb, 'm-fat': m.fat }).forEach(([k, v]) => $(k).value = v); }
function deleteMenu(id) { if (!confirm('Hapus menu ini?')) return; db.menus = db.menus.filter(m => m.id !== id); persist(); renderAll(); toast('Menu dihapus'); }
function copyMenusFromPrev() {
  let src = null;
  for (let i = 1; i <= 14 && !src; i++) { const d = addDays(state.date, -i); if (db.menus.some(m => m.date === d)) src = d; }
  if (!src) return toast('Tidak ada menu di 14 hari sebelumnya', 'error');
  if (db.menus.some(m => m.date === state.date) && !confirm('Menu tanggal ini sudah ada. Ganti dengan salinan?')) return;
  db.menus = db.menus.filter(m => m.date !== state.date);
  db.menus.filter(m => m.date === src).forEach(m => db.menus.push({ ...m, id: uid(), date: state.date }));
  persist(); renderAll(); toast(`Menu disalin dari ${fmtShort(src)}`);
}

// =============================================
//  COURIERS
// =============================================
function renderCouriers() {
  const d = dayOrders();
  $('tb-courier').innerHTML = db.couriers.length ? db.couriers.map(k => {
    const list = d.filter(o => o.kurir === k.id);
    return `<tr><td class="strong">🛵 ${esc(k.name)}</td><td>${esc(k.phone)}</td><td>${esc(k.area)}</td>
      <td class="c"><span class="pill green">${list.length} alamat • ${list.reduce((a, o) => a + o.lunch + o.dinner, 0)} box</span></td>
      <td class="actions"><button class="icon-btn" onclick="openCourierModal('${k.id}')">✏️</button><button class="icon-btn del" onclick="deleteCourier('${k.id}')">🗑</button></td></tr>`;
  }).join('') : `<tr><td colspan="5"><div class="empty"><div class="big">🧑‍✈️</div>Belum ada kurir.</div></td></tr>`;
}
function openCourierModal(id) {
  const k = id ? db.couriers.find(x => x.id === id) : {};
  openModal(id ? 'Edit Kurir' : 'Tambah Kurir', `
    <div class="form-grid">
      <div class="field"><label>Nama</label><input class="inp" id="k-name" value="${esc(k.name)}"></div>
      <div class="field"><label>Phone</label><input class="inp" id="k-phone" value="${esc(k.phone)}"></div>
      <div class="field full"><label>Area</label><input class="inp" id="k-area" value="${esc(k.area)}" placeholder="Contoh: BSD / Serpong"></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="btn-save-courier" onclick="saveCourier('${id || ''}')">💾 Simpan</button>`, 'sm');
}
function saveCourier(id) {
  const data = { name: $('k-name').value.trim(), phone: $('k-phone').value.trim(), area: $('k-area').value.trim() };
  if (!data.name) return toast('Nama kurir wajib diisi', 'error');
  if (id) Object.assign(db.couriers.find(k => k.id === id), data); else db.couriers.push({ id: uid(), ...data });
  persist(); closeModal(); fillFilters(); renderAll(); toast('Kurir disimpan ✓');
}
function deleteCourier(id) {
  if (!confirm('Hapus kurir ini? Order yang di-assign akan menjadi "belum di-assign".')) return;
  db.couriers = db.couriers.filter(k => k.id !== id);
  db.orders.forEach(o => { if (o.kurir === id) o.kurir = ''; });
  persist(); fillFilters(); renderAll(); toast('Kurir dihapus');
}

// =============================================
//  CATEGORIES & SETTINGS
// =============================================
function renderCategories() {
  $('tb-cat').innerHTML = db.categories.map(c => `<tr>
    <td style="background:${c.color};font-weight:800">${esc(c.name)}</td><td>${esc(c.abbr) || '—'}</td><td><code>${c.color}</code></td>
    <td class="actions"><button class="icon-btn" onclick="openCategoryModal('${c.id}')">✏️</button><button class="icon-btn del" onclick="deleteCategory('${c.id}')">🗑</button></td></tr>`).join('');
}
function openCategoryModal(id) {
  const c = id ? db.categories.find(x => x.id === id) : { color: '#FFFFFF' };
  openModal(id ? 'Edit Kategori' : 'Tambah Kategori', `
    <div class="form-grid">
      <div class="field full"><label>Nama kategori</label><input class="inp" id="cat-name" value="${esc(c.name)}" style="text-transform:uppercase"></div>
      <div class="field"><label>Singkatan (di kolom menu)</label><input class="inp" id="cat-abbr" value="${esc(c.abbr)}" placeholder="S"></div>
      <div class="field"><label>Warna</label><input type="color" class="inp" id="cat-color" value="${c.color}" style="padding:4px"></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="btn-save-cat" onclick="saveCategory('${id || ''}')">💾 Simpan</button>`, 'sm');
}
function saveCategory(id) {
  const name = $('cat-name').value.trim().toUpperCase();
  if (!name) return toast('Nama wajib diisi', 'error');
  const data = { name, abbr: $('cat-abbr').value.trim().toUpperCase(), color: $('cat-color').value };
  if (id) {
    const c = db.categories.find(x => x.id === id), old = c.name;
    Object.assign(c, data);
    if (old !== name) { db.orders.forEach(o => { if (o.category === old) o.category = name; }); db.menus.forEach(m => { if (m.category === old) m.category = name; }); }
  } else db.categories.push({ id: uid(), ...data });
  persist(); closeModal(); fillFilters(); renderAll(); toast('Kategori disimpan ✓');
}
function deleteCategory(id) {
  const c = db.categories.find(x => x.id === id);
  if (db.orders.some(o => o.category === c.name)) return toast('Kategori masih dipakai oleh order', 'error');
  if (!confirm(`Hapus kategori ${c.name}?`)) return;
  db.categories = db.categories.filter(x => x.id !== id); persist(); fillFilters(); renderAll(); toast('Kategori dihapus');
}

function syncSettingsUI() {
  const s = db.settings;
  $('set-autosave').value = s.autoPrintOnSave;
  $('set-sched-on').checked = s.schedOn;
  $('set-sched-time').value = s.schedTime;
  $('set-cols').value = s.cols;
  const on = s.schedOn || s.autoPrintOnSave !== 'none';
  $('auto-chip').classList.toggle('on', on);
  $('auto-chip-txt').textContent = s.schedOn ? `Auto print: ${s.schedTime}` : s.autoPrintOnSave !== 'none' ? 'Auto print: saat simpan' : 'Auto print: off';
}
function saveSetting(k, v) { db.settings[k] = v; persist(); syncSettingsUI(); toast('Pengaturan disimpan'); }

function exportData() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `bellywell-backup-${todayStr()}.json`; a.click();
  toast('Backup diunduh');
}
function importData(inp) {
  const f = inp.files[0]; if (!f) return;
  f.text().then(t => {
    const d = JSON.parse(t);
    if (!d.customers || !d.orders) throw 0;
    db = d; persist(); fillFilters(); syncSettingsUI(); renderAll(); toast('Data berhasil di-import ✓');
  }).catch(() => toast('File tidak valid', 'error'));
  inp.value = '';
}
function exportCSV() {
  const rows = [['CATEGORY', 'NAME', 'MENU', 'REQUEST', 'TOTAL BOX', 'ADDRESS', 'NOTE', 'KECAMATAN', 'KOTA', 'PHONE', 'KURIR', 'STATUS']];
  dayOrders().forEach(o => { const c = cust(o.customerId); rows.push([o.category, c.name, menuQtyText(o), o.requests.map(r => r.t).join('; '), o.lunch + o.dinner, c.address, c.note, c.kecamatan, c.kota, c.phone, courier(o.kurir)?.name || '', o.status]); });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = `pengiriman-${state.date}.csv`; a.click();
  toast('CSV diunduh');
}
function resetData() {
  if (!confirm('Reset semua data ke data contoh? Data saat ini akan hilang.')) return;
  db = seed(); persist(); state.sel.clear(); fillFilters(); syncSettingsUI(); renderAll(); toast('Data direset');
}

// =============================================
//  MODAL & TOAST
// =============================================
function openModal(title, body, foot, size = '') {
  $('modal-title').textContent = title;
  $('modal-body').innerHTML = body;
  $('modal-foot').innerHTML = foot;
  $('modal').className = 'modal ' + size;
  $('modal-bg').classList.add('show');
  setTimeout(() => $('modal-body').querySelector('input:not([type=date]),textarea')?.focus(), 60);
}
function closeModal() { $('modal-bg').classList.remove('show'); }

let toastT;
function toast(msg, type = 'success') {
  const t = $('toast');
  t.className = 'toast show ' + type;
  $('toast-i').textContent = type === 'error' ? '✕' : '✓';
  $('toast-m').textContent = msg;
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
