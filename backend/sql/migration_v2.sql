-- Migration v2: stock ml, sale types, bottle options, roles, VA, delivery kelurahan
USE penjualan_parfum;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator';

UPDATE users SET role = 'admin' WHERE username = 'admin';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS remaining_ml INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sale_type ENUM('regular', 'custom') NOT NULL DEFAULT 'custom';

UPDATE products
SET sale_type = CASE
  WHEN price_per_ml IS NOT NULL AND price_per_ml > 0 THEN 'custom'
  ELSE 'regular'
END;

ALTER TABLE delivery_areas
  ADD COLUMN IF NOT EXISTS kelurahan VARCHAR(150) DEFAULT NULL;

UPDATE delivery_areas
SET kelurahan = TRIM(REPLACE(name, 'Kelurahan ', ''))
WHERE kelurahan IS NULL OR kelurahan = '';

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

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS sale_type ENUM('regular', 'custom') DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS bottle_type VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bottle_size VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS size_ml INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bottle_price DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS perfume_price DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ml_used INT DEFAULT 0;

INSERT INTO settings (setting_key, setting_value) VALUES
('va_number', '62882007832073')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
