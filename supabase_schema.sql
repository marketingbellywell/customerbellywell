-- Hapus tabel jika sudah ada (hati-hati, ini akan menghapus data)
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS couriers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;

-- 1. Tabel Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    kecamatan TEXT,
    kota TEXT,
    note TEXT,
    username TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    abbr TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Couriers
CREATE TABLE couriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    area TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Menus
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    meal TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    cal INTEGER DEFAULT 0,
    pro INTEGER DEFAULT 0,
    carb INTEGER DEFAULT 0,
    fat INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    lunch INTEGER DEFAULT 0,
    dinner INTEGER DEFAULT 0,
    kurir TEXT, -- Menyimpan ID kurir (bisa direlasikan ke tabel couriers, tapi menggunakan TEXT agar fleksibel dengan data kosong)
    status TEXT DEFAULT 'pending',
    cutlery BOOLEAN DEFAULT false,
    requests JSONB DEFAULT '[]'::jsonb, -- Array dari objek { t: "teks", c: "warna" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mengaktifkan Row Level Security (RLS) namun memperbolehkan akses penuh untuk anon (karena ini tanpa sistem login/auth sementara)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow anon all on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow anon all on couriers" ON couriers FOR ALL USING (true);
CREATE POLICY "Allow anon all on menus" ON menus FOR ALL USING (true);
CREATE POLICY "Allow anon all on orders" ON orders FOR ALL USING (true);
