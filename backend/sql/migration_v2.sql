-- Migration v2 (MySQL 5.7+ compatible)
-- Jalankan sekali: mysql -u root -p penjualan_parfum < sql/migration_v2.sql
-- Atau restart backend — kolom akan ditambahkan otomatis via ensureSchema()

USE penjualan_parfum;

-- users.role
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role');
SET @sql = IF(@exists = 0, "ALTER TABLE users ADD COLUMN role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator'", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- products.remaining_ml
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'remaining_ml');
SET @sql = IF(@exists = 0, 'ALTER TABLE products ADD COLUMN remaining_ml INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- products.sale_type
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'sale_type');
SET @sql = IF(@exists = 0, "ALTER TABLE products ADD COLUMN sale_type ENUM('regular', 'custom') NOT NULL DEFAULT 'custom'", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE products SET sale_type = 'custom' WHERE price_per_ml IS NOT NULL AND price_per_ml > 0;
UPDATE products SET sale_type = 'regular' WHERE price_per_ml IS NULL OR price_per_ml = 0;

-- delivery_areas.kelurahan
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_areas' AND COLUMN_NAME = 'kelurahan');
SET @sql = IF(@exists = 0, 'ALTER TABLE delivery_areas ADD COLUMN kelurahan VARCHAR(150) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE delivery_areas SET kelurahan = TRIM(REPLACE(name, 'Kelurahan ', '')) WHERE kelurahan IS NULL OR kelurahan = '';

-- product_bottle_options table
CREATE TABLE IF NOT EXISTS product_bottle_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  bottle_type VARCHAR(100) NOT NULL,
  size_ml INT NOT NULL,
  bottle_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
);

-- orders new columns
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'sale_type');
SET @sql = IF(@exists = 0, "ALTER TABLE orders ADD COLUMN sale_type ENUM('regular', 'custom') DEFAULT 'custom'", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'bottle_type');
SET @sql = IF(@exists = 0, 'ALTER TABLE orders ADD COLUMN bottle_type VARCHAR(100) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'bottle_size');
SET @sql = IF(@exists = 0, 'ALTER TABLE orders ADD COLUMN bottle_size VARCHAR(50) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'size_ml');
SET @sql = IF(@exists = 0, 'ALTER TABLE orders ADD COLUMN size_ml INT DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'bottle_price');
SET @sql = IF(@exists = 0, 'ALTER TABLE orders ADD COLUMN bottle_price DECIMAL(12,2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'perfume_price');
SET @sql = IF(@exists = 0, 'ALTER TABLE orders ADD COLUMN perfume_price DECIMAL(12,2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'ml_used');
SET @sql = IF(@exists = 0, 'ALTER TABLE orders ADD COLUMN ml_used INT DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE users SET role = 'admin' WHERE username = 'admin';

-- order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT DEFAULT NULL,
  product_name VARCHAR(200) NOT NULL,
  category_name VARCHAR(100) DEFAULT NULL,
  quantity INT DEFAULT 1,
  sale_type ENUM('regular', 'custom') DEFAULT 'custom',
  bottle_type VARCHAR(100) DEFAULT NULL,
  bottle_size VARCHAR(50) DEFAULT NULL,
  size_ml INT DEFAULT NULL,
  bottle_price DECIMAL(12,2) DEFAULT 0,
  perfume_price DECIMAL(12,2) DEFAULT 0,
  ml_used INT DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order (order_id)
);
