const URL = 'https://jhiczetiklushxvmforb.supabase.co/rest/v1';
const KEY = 'sb_publishable_lRkfbX0LAcMO8kD1yiUbKg__e5muxBN';

const headers = {
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const pad = n => String(n).padStart(2, '0');
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const D0 = fmt(new Date());
const addDays = (ds, n) => { const d = new Date(ds + 'T00:00:00'); d.setDate(d.getDate() + n); return fmt(d); };
const D1 = addDays(D0, 1);

function suggestColor(t) {
  const u = t.toUpperCase();
  if (/REPLACE/.test(u)) return 'red';
  if (/\b(NASI|KARBO|CARBO)\b/.test(u)) return 'gray';
  if (/\b(IKAN|SEAFOOD|SAPI|BEEF|AYAM|UDANG|SALMON|TUNA|CUMI)\b/.test(u)) return 'cyan';
  return 'yellow';
}

async function insert(table, data) {
  const res = await fetch(`${URL}/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Error inserting to ${table}:`, err);
    throw new Error(err);
  }
  return await res.json();
}

async function run() {
  console.log('Clearing old data...');
  await fetch(`${URL}/orders?id=not.is.null`, { method: 'DELETE', headers });
  await fetch(`${URL}/menus?id=not.is.null`, { method: 'DELETE', headers });
  await fetch(`${URL}/customers?id=not.is.null`, { method: 'DELETE', headers });
  await fetch(`${URL}/couriers?id=not.is.null`, { method: 'DELETE', headers });
  await fetch(`${URL}/categories?id=not.is.null`, { method: 'DELETE', headers });

  console.log('Seeding data...');
  // 1. Categories
  const categories = [
    { name: 'HEALTHY', abbr: '', color: '#FFFFFF' },
    { name: 'SLIMMING', abbr: 'S', color: '#4A86E8' },
    { name: 'MUSCLE GROWTH', abbr: 'MG', color: '#F6B26B' },
    { name: 'VEGAN HEALTHY', abbr: 'VH', color: '#93C47D' },
    { name: 'GERD SLIMM', abbr: 'GS', color: '#D5A6BD' },
  ];
  await insert('categories', categories);
  
  // 2. Couriers
  const couriersData = [
    { name: 'Pak Joko', phone: '081211110001', area: 'Alam Sutera / Serpong / BSD' },
    { name: 'Mas Andi', phone: '081211110002', area: 'Bintaro / Pondok Aren' },
    { name: 'Bang Rudi', phone: '081211110003', area: 'Tangerang Kota / Karang Tengah' },
  ];
  const couriers = await insert('couriers', couriersData);
  const kurirMap = { 'k1': couriers[0].id, 'k2': couriers[1].id, 'k3': couriers[2].id };

  // 3. Customers
  const cs = [
    { name:'Rizki Adila Ramadhan', phone:'081298787705', address:'Brooklyn Apartment Alam Sutera B 23 I', kecamatan:'Tangerang', kota:'Kota Tangerang' },
    { name:'Shindunata', phone:'08123545683', address:'BSD Sky House Leonie Tower Room L2-35J', kecamatan:'Pagedangan', kota:'Kab. Tangerang', note:'Tiba max jam 11.30' },
    { name:'Ayudi', phone:'081231993409', address:'Emerald View, Jl. Emerald Citra VII Blok F No.17 Periigi', kecamatan:'Pondok Aren', kota:'Tangerang Selatan' },
    { name:'Ida Halya', phone:'0819-9358-9091', address:'Global Islamic School 2 Serpong', kecamatan:'Serpong', kota:'Tangerang Selatan', note:'Dikirim ke security' },
    { name:'H.Rhe', phone:'0811444630', address:'Jl. Parkit IV Blok Z1 No.3 Bintaro Jaya Sektor 2', kecamatan:'Bintaro', kota:'Tangerang Selatan' },
    { name:'Dwi Fuad', phone:'082112345642', address:'Kantor Lapas Kelas I Tangerang', kecamatan:'Tangerang', kota:'Kota Tangerang' },
    { name:'Sandra Lexi', phone:'081290159949', address:'Metro Permata 1 Blok N3/31 Karang Tengah', kecamatan:'Karang Tengah', kota:'Kota Tangerang' },
    { name:'Elysia Verona', phone:'08999150561', address:'Pacific Garden Campus Town, Alam Sutera', kecamatan:'Pinang', kota:'Kota Tangerang' },
    { name:'Yetty Agus', phone:'08158014991', address:'Perumahan The Caspia, Blok A2/33 BSD', kecamatan:'Cisauk', kota:'Kab. Tangerang' },
    { name:'Anita Anwar', phone:'081377712345', address:'Cluster Avani, Jl. Avani Raya No. 8 BSD City', kecamatan:'Serpong', kota:'Tangerang Selatan' },
    { name:'Amanda', phone:'081399923456', address:'Apartemen Paddington Heights Tower A 1205', kecamatan:'Pinang', kota:'Kota Tangerang' },
    { name:'Bagus Susanto', phone:'081288834567', address:'Jl. Bintaro Utama 3A No. 21', kecamatan:'Pondok Aren', kota:'Tangerang Selatan' },
    { name:'Vera Rismawati', phone:'081255545678', address:'Graha Raya Bintaro Cluster Sanur Blok J2/10', kecamatan:'Serpong Utara', kota:'Tangerang Selatan' },
    { name:'Mutiara', phone:'081266656789', address:'The Breeze BSD, Ruko Kios B-12', kecamatan:'Serpong', kota:'Tangerang Selatan' },
    { name:'Ethika', phone:'081277767890', address:'Sutera Renata 2 No. 15, Alam Sutera', kecamatan:'Serpong Utara', kota:'Tangerang Selatan' },
  ];
  const genUser = n => n.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 100);
  const genPass = () => Math.random().toString(36).slice(-6);
  const customers = await insert('customers', cs.map(c => ({...c, note: c.note || '', username: genUser(c.name), password: genPass()})));
  const by = n => customers.find(c => c.name.includes(n)).id;
  const R = (...arr) => arr.map(t => ({ t, c: suggestColor(t) }));
  const O = (date, name, category, lunch, dinner, kurirIdKey, requests = [], cutlery = false, status = 'pending') =>
    ({ date, customer_id: by(name), category, lunch, dinner, kurir: kurirMap[kurirIdKey], requests, cutlery, status });

  const orders = [
    O(D0, 'Rizki', 'HEALTHY', 1, 1, 'k1', R('NO SANTAN', 'NO KUNING TELUR', 'NO SEAFOOD, IKAN OK'), true),
    O(D0, 'Shindunata', 'SLIMMING', 0, 1, 'k1', [{ t: 'LESS VEGGIES', c: 'yellow' }]),
    O(D0, 'Ayudi', 'SLIMMING', 1, 1, 'k2', R('NO IKAN', 'NO TIMUN', 'ALL MATANG')),
    O(D0, 'Ida', 'HEALTHY', 1, 0, 'k1', R('NO SAPI REPLACE IKAN')),
    O(D0, 'H.Rhe', 'HEALTHY', 1, 1, 'k2'),
    O(D0, 'Dwi', 'SLIMMING', 1, 0, 'k3'),
    O(D0, 'Sandra', 'GERD SLIMM', 1, 1, 'k3'),
    O(D0, 'Elysia', 'HEALTHY', 1, 1, 'k1'),
    O(D0, 'Yetty', 'SLIMMING', 1, 1, 'k1'),
    O(D0, 'Anita', 'MUSCLE GROWTH', 1, 1, 'k1', R('NO PEDAS')),
    O(D0, 'Amanda', 'HEALTHY', 0, 1, 'k1', R('NO SAPI REPLACE AYAM', 'MIE GLUTEN FREE', 'TANPA GULA', 'NO SANTAN')),
    O(D0, 'Bagus', 'VEGAN HEALTHY', 0, 1, 'k2', R('MENU DINNER JANGAN PAKAI SAYUR')),
    O(D0, 'Vera', 'SLIMMING', 1, 0, 'k2', R('NO MIE', 'NO DAUN PEPAYA', 'NO PEDAS', 'NO TELUR BULAT')),
    O(D0, 'Mutiara', 'HEALTHY', 1, 1, 'k1', R('NO NASI PUTIH GANTI NASI MERAH', 'NO IKAN KECUALI SALMON', 'GLUTEN FREE')),
    O(D0, 'Ethika', 'SLIMMING', 1, 0, 'k1', R('NO IKAN', 'OLIVE OIL ONLY', 'NO SANTAN', 'NO KARBO GANTI SAYUR', 'NO KENTANG')),
    O(D1, 'Rizki', 'HEALTHY', 1, 1, 'k1', R('NO SANTAN'), true),
    O(D1, 'Ayudi', 'SLIMMING', 1, 1, 'k2', R('NO IKAN', 'ALL MATANG')),
    O(D1, 'Anita', 'MUSCLE GROWTH', 1, 1, 'k1', R('NO PEDAS')),
  ];
  await insert('orders', orders);

  const M = (date, meal, category, name, cal, pro, carb, fat) => ({ date, meal, category, name, cal, pro, carb, fat });
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
  await insert('menus', menus);

  console.log('Done!');
}
run();
