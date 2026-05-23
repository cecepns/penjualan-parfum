-- Seeder: Products parfum (+ gambar)
-- Jalankan setelah seed_categories.sql
--
--   node scripts/seed-images.js
--   mysql -u root -p penjualan_parfum < sql/seed_products.sql

USE penjualan_parfum;

-- ===================== PARFUM UMUM =====================
INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Vanilla Dream', 'parfum-vanilla-dream',
  'Aroma vanilla manis dan elegan, cocok untuk sehari-hari.',
  'seed-parfum-vanilla-dream.svg', 0, 1500, 'Botol Spray', '30ml', 50, 1
FROM categories c WHERE c.slug = 'parfum';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Ocean Breeze', 'parfum-ocean-breeze',
  'Aroma segar seperti angin laut, ringan dan menyegarkan.',
  'seed-parfum-ocean-breeze.svg', 0, 1800, 'Botol Roll-On', '10ml', 40, 1
FROM categories c WHERE c.slug = 'parfum';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Fresh Cotton', 'parfum-fresh-cotton',
  'Aroma bersih seperti cucian baru, fresh dan netral.',
  'seed-parfum-fresh-cotton.svg', 0, 1200, 'Botol Spray', '15ml', 60, 1
FROM categories c WHERE c.slug = 'parfum';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Citrus Burst', 'parfum-citrus-burst',
  'Aroma jeruk dan lemon segar, energik di pagi hari.',
  'seed-parfum-citrus-burst.svg', 0, 1600, 'Botol Roll-On', '10ml', 45, 1
FROM categories c WHERE c.slug = 'parfum';

-- ===================== WANGI WANITA =====================
INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Rose Garden', 'parfum-rose-garden',
  'Aroma mawar romantis, feminine dan tahan lama.',
  'seed-parfum-rose-garden.svg', 0, 2000, 'Botol Kaca', '50ml', 35, 1
FROM categories c WHERE c.slug = 'wangi-wanita';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Cherry Blossom', 'parfum-cherry-blossom',
  'Aroma bunga sakura lembut, manis dan feminin.',
  'seed-parfum-cherry-blossom.svg', 0, 1900, 'Botol Spray', '30ml', 38, 1
FROM categories c WHERE c.slug = 'wangi-wanita';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Baby Powder', 'parfum-baby-powder',
  'Aroma bayi lembut, cocok untuk semua usia.',
  'seed-parfum-baby-powder.svg', 0, 1300, 'Botol Spray', '50ml', 55, 1
FROM categories c WHERE c.slug = 'wangi-wanita';

-- ===================== WANGI PRIA =====================
INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Black Opium', 'parfum-black-opium',
  'Aroma oriental bold dengan sentuhan kopi dan vanilla.',
  'seed-parfum-black-opium.svg', 0, 2500, 'Botol Spray', '30ml', 30, 1
FROM categories c WHERE c.slug = 'wangi-pria';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Midnight Musk', 'parfum-midnight-musk',
  'Aroma musk hangat untuk malam hari, maskulin dan elegan.',
  'seed-parfum-midnight-musk.svg', 0, 2200, 'Botol Kaca', '30ml', 25, 1
FROM categories c WHERE c.slug = 'wangi-pria';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Sport Active', 'parfum-sport-active',
  'Aroma fresh sporty, cocok setelah aktivitas.',
  'seed-parfum-sport-active.svg', 0, 1700, 'Botol Roll-On', '10ml', 42, 1
FROM categories c WHERE c.slug = 'wangi-pria';

-- ===================== WANGI UNISEX =====================
INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum White Tea', 'parfum-white-tea',
  'Aroma teh putih halus, clean dan modern.',
  'seed-parfum-white-tea.svg', 0, 1800, 'Botol Spray', '30ml', 40, 1
FROM categories c WHERE c.slug = 'wangi-unisex';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Sandalwood', 'parfum-sandalwood',
  'Aroma kayu cendana hangat, earthy dan menenangkan.',
  'seed-parfum-sandalwood.svg', 0, 2100, 'Botol Kaca', '50ml', 28, 1
FROM categories c WHERE c.slug = 'wangi-unisex';

INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, bottle_type, bottle_size, stock, is_active)
SELECT c.id, 'Parfum Green Apple', 'parfum-green-apple',
  'Aroma apel hijau segar, ringan dan universal.',
  'seed-parfum-green-apple.svg', 0, 1400, 'Botol Roll-On', '10ml', 48, 1
FROM categories c WHERE c.slug = 'wangi-unisex';
