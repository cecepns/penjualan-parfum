-- Database: penjualan_parfum
-- Sistem Informasi Penjualan Parfum UMKM

CREATE DATABASE IF NOT EXISTS penjualan_parfum;
USE penjualan_parfum;

-- Admin users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'package',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description TEXT,
  image VARCHAR(255) DEFAULT NULL,
  price DECIMAL(12,2) DEFAULT 0,
  price_per_ml DECIMAL(12,2) DEFAULT NULL COMMENT 'Harga per ml untuk parfum',
  bottle_type VARCHAR(100) DEFAULT NULL COMMENT 'Jenis botol',
  bottle_size VARCHAR(100) DEFAULT NULL COMMENT 'Ukuran botol',
  stock INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_active (is_active)
);

-- Delivery areas (sekitar kota Cepu)
CREATE TABLE IF NOT EXISTS delivery_areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  kecamatan VARCHAR(100) DEFAULT 'Cepu',
  delivery_fee DECIMAL(12,2) DEFAULT 5000,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(20) NOT NULL UNIQUE,
  product_id INT DEFAULT NULL,
  product_name VARCHAR(200) NOT NULL,
  category_name VARCHAR(100) DEFAULT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT,
  quantity INT DEFAULT 1,
  total_price DECIMAL(12,2) DEFAULT 0,
  delivery_type ENUM('pickup', 'delivery') DEFAULT 'pickup',
  delivery_area_id INT DEFAULT NULL,
  delivery_fee DECIMAL(12,2) DEFAULT 0,
  status ENUM('pending', 'confirmed', 'processing', 'ready', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (delivery_area_id) REFERENCES delivery_areas(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- Settings (WhatsApp number, store info)
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories, products & gambar: jalankan seeder
--   cd backend && npm run db:seed
-- Atau manual:
--   node scripts/seed-images.js
--   mysql -u root -p penjualan_parfum < sql/seed_categories.sql
--   mysql -u root -p penjualan_parfum < sql/seed_products.sql

-- Delivery areas (Kota Cepu dan sekitarnya)
INSERT INTO delivery_areas (name, kecamatan, delivery_fee) VALUES
('Kelurahan Cepu', 'Cepu', 5000),
('Kelurahan Ngroto', 'Cepu', 5000),
('Kelurahan Kedungwinong', 'Cepu', 5000),
('Kelurahan Jati', 'Cepu', 5000),
('Kelurahan Ngelo', 'Cepu', 7000),
('Kelurahan Tambakromo', 'Cepu', 7000),
('Kelurahan Kasreman', 'Cepu', 7000),
('Kelurahan Balong', 'Cepu', 8000),
('Kelurahan Sumberagung', 'Cepu', 8000),
('Kelurahan Padangan', 'Cepu', 10000);

-- Default admin dibuat otomatis oleh server (username: admin, password: admin123)

-- Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('whatsapp_number', '6281234567890'),
('store_name', 'Toko Parfum UMKM'),
('store_address', 'Jl. Raya Cepu, Kab. Blora, Jawa Tengah'),
('store_phone', '081234567890'),
('pickup_info', 'Pick-up store tersedia di lokasi toko. Jam operasional: 08.00 - 20.00 WIB');
