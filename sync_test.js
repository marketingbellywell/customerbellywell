// ==========================================
// SUPABASE SYNC LAYER
// Mengganti fungsi-fungsi penyimpanan lokal
// menjadi penyimpanan cloud ke Supabase
// ==========================================

let sbClient = null;
if (window.supabase) {
  sbClient = window.supabase.createClient(
    'https://jhiczetiklushxvmforb.supabase.co',
    'sb_publishable_lRkfbX0LAcMO8kD1yiUbKg__e5muxBN'
  );
}

// Matikan fungsi persist lokal (hanya simpan settings)
window.persist = function() {
  localStorage.setItem('bw_admin_settings', JSON.stringify(db.settings));
};

async function reloadSupabase() {
  const [cs, cgs, crs, ms, os] = await Promise.all([
    sbClient.from('customers').select('*'),
    sbClient.from('categories').select('*'),
    sbClient.from('couriers').select('*'),
    sbClient.from('menus').select('*'),
    sbClient.from('orders').select('*')
  ]);
  
  if (cs.error) throw cs.error;

  db.customers = cs.data || [];
  db.categories = cgs.data || [];
  db.couriers = crs.data || [];
  db.menus = ms.data || [];
  db.orders = os.data || [];
  
  // Mapping penamaan kolom supabase -> format JS lama
  db.orders.forEach(o => { o.customerId = o.customer_id; });
}

// Override fungsi load utama saat pertama buka aplikasi
window.load = async function() {
  // Munculkan layar loading
  document.body.insertAdjacentHTML('beforeend', '<div id="sb-loading" style="position:fixed;inset:0;background:rgba(255,255,255,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#166534;flex-direction:column;font-family:system-ui;"><div style="font-size:50px;margin-bottom:15px;animation: pulse 1.5s infinite;">🚀</div>Menyinkronkan data ke Supabase...</div>');
  
  try {
    await reloadSupabase();
    // Kembalikan settings dari komputer lokal
    try { const s = JSON.parse(localStorage.getItem('bw_admin_settings')); if(s) db.settings = s; } catch{}
  } catch(e) { 
    console.error("SYNC ERROR:", e);
    alert('Koneksi ke Supabase gagal. Pastikan Anda sudah membuat tabel sesuai schema SQL!');
  }
  
  document.getElementById('sb-loading').remove();
  renderAll(); 
  fillFilters();
};

// Pastikan load ditimpa setelah admin.js berjalan
document.addEventListener('DOMContentLoaded', () => setTimeout(window.load, 100));


/* =========================================
   OVERRIDE FUNGSI-FUNGSI CRUD KESELURUHAN
   ========================================= */

// --- ORDERS ---
window.setOrderField = async function(id, field, val) {
  const o = db.orders.find(x => x.id === id); if (!o) return;
  o[field] = val; renderKurir(); // update UI instan
  await sbClient.from('orders').update({ [field]: val }).eq('id', id);
  toast(field === 'status' ? 'Status diperbarui' : 'Kurir diperbarui');
};

window.deleteOrder = async function(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o || !confirm(`Hapus order ${cust(o.customerId).name}?`)) return;
  db.orders = db.orders.filter(x => x.id !== id); state.sel.delete(id); renderAll();
  await sbClient.from('orders').delete().eq('id', id);
  toast('Order dihapus');
};

window.bulkDelete = async function() {
  if (!confirm(`Hapus ${state.sel.size} order terpilih?`)) return;
  const ids = Array.from(state.sel);
  db.orders = db.orders.filter(o => !state.sel.has(o.id)); state.sel.clear(); renderAll();
  await sbClient.from('orders').delete().in('id', ids);
  toast('Order terpilih dihapus');
};

window.duplicateOrder = async function(id) {
  const o = db.orders.find(x => x.id === id); if (!o) return;
  const data = { ...o, customer_id: o.customerId, status: 'pending' };
  delete data.id; delete data.customerId; delete data.created_at;
  const { data: ret } = await sbClient.from('orders').insert([data]).select();
  if(ret) { db.orders.push({ ...ret[0], customerId: ret[0].customer_id }); renderAll(); toast('Order diduplikat'); }
};

window.saveOrder = async function(id) {
  let cid = $('o-cust').value;
  if (cid === '__new') {
    const name = $('n-name').value.trim();
    if (!name) return toast('Nama customer wajib diisi', 'error');
    const { data } = await sbClient.from('customers').insert([{ name, phone: $('n-phone').value.trim(), address: $('n-address').value.trim(), kecamatan: $('n-kec').value.trim(), kota: $('n-kota').value.trim(), note: $('n-note').value.trim() }]).select();
    cid = data[0].id;
    db.customers.push(data[0]);
  }
  const lunch = Math.max(0, +$('o-lunch').value || 0), dinner = Math.max(0, +$('o-dinner').value || 0);
  if (!lunch && !dinner) return toast('Minimal 1 box', 'error');
  
  const data = {
    date: $('o-date').value || state.date, customer_id: cid, category: $('o-cat').value, lunch, dinner,
    kurir: $('o-kurir').value || null, status: $('o-status').value, cutlery: $('o-cut').checked,
    requests: mReqs.filter(r => r.t.trim()).map(r => ({ t: r.t.trim().toUpperCase(), c: r.c }))
  };
  
  let order;
  if (id) {
    const { data: ret } = await sbClient.from('orders').update(data).eq('id', id).select();
    if(!ret) return toast('Gagal update ke Supabase', 'error');
    order = ret[0];
    Object.assign(db.orders.find(x => x.id === id), { ...order, customerId: order.customer_id });
  } else {
    const { data: ret } = await sbClient.from('orders').insert([data]).select();
    order = ret[0];
    db.orders.push({ ...order, customerId: order.customer_id });
  }
  closeModal(); fillFilters(); renderAll(); toast('Order disimpan ✓');
  const ap = db.settings.autoPrintOnSave;
  if (ap !== 'none') setTimeout(() => printOrderLabels(order.id, ap), 350);
};

// --- CUSTOMERS ---
window.saveCustomer = async function(id) {
  let uName = $('c-user').value.trim();
  let uPass = $('c-pass').value.trim();
  const nameVal = $('c-name').value.trim();
  
  if (!uName && nameVal) {
    uName = nameVal.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);
  }
  if (!uPass && nameVal) {
    uPass = Math.random().toString().slice(2, 8); // 6 angka random
  }

  const data = { 
    name: nameVal, 
    phone: $('c-phone').value.trim(), 
    address: $('c-address').value.trim(), 
    kecamatan: $('c-kec').value.trim(), 
    kota: $('c-kota').value.trim(), 
    note: $('c-note').value.trim(),
    username: uName || null,
    password: uPass || null
  };
  if (!data.name) return toast('Nama wajib diisi', 'error');
  if (id) {
    const { error } = await sbClient.from('customers').update(data).eq('id', id);
    if (error) {
      console.error(error);
      return toast('Gagal menyimpan (pastikan tabel sudah terupdate di Supabase)', 'error');
    }
    Object.assign(db.customers.find(c => c.id === id), data);
  } else {
    const { data: ret, error } = await sbClient.from('customers').insert([data]).select();
    if (error) {
      console.error(error);
      return toast('Gagal menambah data', 'error');
    }
    db.customers.push(ret[0]);
  }
  closeModal(); renderAll(); toast('Customer disimpan ✓');
};

window.deleteCustomer = async function(id) {
  const c = db.customers.find(x => x.id === id);
  if (!confirm(`Hapus customer ${c.name}?`)) return;
  await sbClient.from('customers').delete().eq('id', id);
  db.customers = db.customers.filter(x => x.id !== id);
  db.orders = db.orders.filter(o => o.customerId !== id);
  renderAll(); toast('Customer dihapus');
};

// --- MENUS ---
window.saveMenu = async function(id) {
  const data = { date: $('m-date').value, meal: $('m-meal').value, category: $('m-cat').value, name: $('m-name').value.trim(), cal: +$('m-cal').value || 0, pro: +$('m-pro').value || 0, carb: +$('m-carb').value || 0, fat: +$('m-fat').value || 0 };
  if (!data.name) return toast('Nama menu wajib diisi', 'error');
  if (id) {
    await sbClient.from('menus').update(data).eq('id', id);
    Object.assign(db.menus.find(m => m.id === id), data);
  } else {
    const { data: ret } = await sbClient.from('menus').insert([data]).select();
    db.menus.push(ret[0]);
  }
  closeModal(); renderAll(); toast('Menu disimpan');
};

window.deleteMenu = async function(id) {
  if (!confirm('Hapus menu ini?')) return;
  await sbClient.from('menus').delete().eq('id', id);
  db.menus = db.menus.filter(x => x.id !== id); renderAll(); toast('Menu dihapus');
};

window.dupMenu = async function(id) {
  const m = db.menus.find(x => x.id === id); if (!m) return;
  const data = { ...m }; delete data.id; delete data.created_at;
  const { data: ret } = await sbClient.from('menus').insert([data]).select();
  db.menus.push(ret[0]); renderAll(); toast('Menu diduplikat');
};

window.copyMenusFromPrev = async function() {
  const prev = addDays(state.date, -1);
  const ms = db.menus.filter(m => m.date === prev).map(m => {
    const d = { ...m, date: state.date }; delete d.id; delete d.created_at; return d;
  });
  if (!ms.length) return toast(`Tidak ada menu di tanggal ${fmtShort(prev)}`, 'error');
  if (!confirm(`Copy ${ms.length} menu dari ${fmtShort(prev)}?`)) return;
  const { data: ret } = await supabase.from('menus').insert(ms).select();
  db.menus.push(...ret); renderAll(); toast(`${ms.length} menu disalin`);
};

// --- COURIERS ---
window.saveCourier = async function(id) {
  const data = { name: $('k-name').value.trim(), phone: $('k-phone').value.trim(), area: $('k-area').value.trim() };
  if (!data.name) return toast('Nama wajib', 'error');
  if (id) {
    await supabase.from('couriers').update(data).eq('id', id);
    Object.assign(db.couriers.find(c => c.id === id), data);
  } else {
    const { data: ret } = await supabase.from('couriers').insert([data]).select();
    db.couriers.push(ret[0]);
  }
  closeModal(); fillFilters(); renderAll(); toast('Kurir disimpan');
};

window.deleteCourier = async function(id) {
  if (!confirm('Hapus kurir ini?')) return;
  await supabase.from('couriers').delete().eq('id', id);
  db.couriers = db.couriers.filter(x => x.id !== id); fillFilters(); renderAll(); toast('Kurir dihapus');
};

// --- CATEGORIES ---
window.saveCategory = async function(id) {
  const data = { name: $('cg-name').value.trim().toUpperCase(), abbr: $('cg-abbr').value.trim().toUpperCase(), color: $('cg-color').value };
  if (!data.name) return toast('Nama wajib', 'error');
  if (id) {
    await supabase.from('categories').update(data).eq('id', id);
    Object.assign(db.categories.find(c => c.id === id), data);
  } else {
    const { data: ret } = await supabase.from('categories').insert([data]).select();
    db.categories.push(ret[0]);
  }
  closeModal(); fillFilters(); renderAll(); toast('Kategori disimpan');
};

window.deleteCategory = async function(id) {
  if (!confirm('Hapus kategori ini?')) return;
  await supabase.from('categories').delete().eq('id', id);
  db.categories = db.categories.filter(x => x.id !== id); fillFilters(); renderAll(); toast('Kategori dihapus');
};
