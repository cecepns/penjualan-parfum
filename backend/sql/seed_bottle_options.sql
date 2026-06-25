-- Seed default bottle options for custom products
USE penjualan_parfum;

INSERT INTO product_bottle_options (product_id, bottle_type, size_ml, bottle_price, sort_order)
SELECT p.id, 'Botol Spray', 15, 3000, 1 FROM products p WHERE p.sale_type = 'custom' OR p.price_per_ml > 0
AND NOT EXISTS (SELECT 1 FROM product_bottle_options b WHERE b.product_id = p.id);

INSERT INTO product_bottle_options (product_id, bottle_type, size_ml, bottle_price, sort_order)
SELECT p.id, 'Botol Spray', 20, 3500, 2 FROM products p WHERE p.sale_type = 'custom' OR p.price_per_ml > 0
AND EXISTS (SELECT 1 FROM product_bottle_options b WHERE b.product_id = p.id AND b.size_ml = 15);

INSERT INTO product_bottle_options (product_id, bottle_type, size_ml, bottle_price, sort_order)
SELECT p.id, 'Botol Spray', 30, 4500, 3 FROM products p WHERE p.sale_type = 'custom' OR p.price_per_ml > 0
AND EXISTS (SELECT 1 FROM product_bottle_options b WHERE b.product_id = p.id AND b.size_ml = 15);

INSERT INTO product_bottle_options (product_id, bottle_type, size_ml, bottle_price, sort_order)
SELECT p.id, 'Botol Spray', 50, 6000, 4 FROM products p WHERE p.sale_type = 'custom' OR p.price_per_ml > 0
AND EXISTS (SELECT 1 FROM product_bottle_options b WHERE b.product_id = p.id AND b.size_ml = 15);

INSERT INTO product_bottle_options (product_id, bottle_type, size_ml, bottle_price, sort_order)
SELECT p.id, 'Botol Spray', 100, 9000, 5 FROM products p WHERE p.sale_type = 'custom' OR p.price_per_ml > 0
AND EXISTS (SELECT 1 FROM product_bottle_options b WHERE b.product_id = p.id AND b.size_ml = 15);

INSERT INTO product_bottle_options (product_id, bottle_type, size_ml, bottle_price, sort_order)
SELECT p.id, 'Botol Roll-On', 10, 2500, 6 FROM products p WHERE p.sale_type = 'custom' OR p.price_per_ml > 0
AND EXISTS (SELECT 1 FROM product_bottle_options b WHERE b.product_id = p.id AND b.size_ml = 15);

INSERT INTO product_bottle_options (product_id, bottle_type, size_ml, bottle_price, sort_order)
SELECT p.id, 'Botol Kaca', 50, 8000, 7 FROM products p WHERE p.sale_type = 'custom' OR p.price_per_ml > 0
AND EXISTS (SELECT 1 FROM product_bottle_options b WHERE b.product_id = p.id AND b.size_ml = 15);
