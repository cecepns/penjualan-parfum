-- Reset data produk, kategori & pesanan (aman untuk foreign key)
-- Jalankan SELURUH file ini sekaligus (jangan per baris di phpMyAdmin)
--
-- Usage: mysql -u root -p penjualan_parfum < sql/seed_reset.sql

USE penjualan_parfum;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `orders`;
DELETE FROM `products`;
DELETE FROM `categories`;

ALTER TABLE `orders` AUTO_INCREMENT = 1;
ALTER TABLE `products` AUTO_INCREMENT = 1;
ALTER TABLE `categories` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;
