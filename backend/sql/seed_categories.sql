-- Seeder: Categories (khusus parfum)
-- Jalankan setelah database.sql, sebelum seed_products.sql
-- Lengkap: cd backend && npm run db:seed

USE penjualan_parfum;

-- Hapus data lama (urutan: orders dulu, baru products & categories)
-- Pakai DELETE + FOREIGN_KEY_CHECKS=0 agar tidak error #1701 di phpMyAdmin
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `orders`;
DELETE FROM `products`;
DELETE FROM `categories`;

ALTER TABLE `orders` AUTO_INCREMENT = 1;
ALTER TABLE `products` AUTO_INCREMENT = 1;
ALTER TABLE `categories` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categories (name, slug, description, icon) VALUES
(
  'Parfum',
  'parfum',
  'Parfum refill dengan harga per ml. Tersedia berbagai aroma, jenis botol (spray, roll-on, kaca), dan ukuran.',
  'sparkles'
),
(
  'Wangi Wanita',
  'wangi-wanita',
  'Koleksi parfum dengan aroma feminin — floral, manis, dan elegan.',
  'sparkles'
),
(
  'Wangi Pria',
  'wangi-pria',
  'Koleksi parfum dengan aroma maskulin — fresh, woody, dan sporty.',
  'sparkles'
),
(
  'Wangi Unisex',
  'wangi-unisex',
  'Parfum netral cocok untuk semua gender — citrus, clean, dan musk.',
  'sparkles'
);
