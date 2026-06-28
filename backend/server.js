require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "penjualan_parfum_secret";
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads-penjualan-parfum";
const STOCK_ML_PER_UNIT = 400;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(`/uploads`, express.static(UPLOAD_DIR));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "penjualan_parfum",
  waitForConnections: true,
  connectionLimit: 10,
});

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error("Hanya file gambar yang diizinkan"), ext && mime);
  },
});

function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>'"]/g, "");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateOrderCode() {
  const date = new Date();
  const ymd =
    date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD${ymd}${rand}`;
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Akses ditolak untuk role ini" });
    }
    next();
  };
}

function formatStockDisplay(stock, remainingMl) {
  return `${stock || 0} buah - ${remainingMl || 0}ml`;
}

function getTotalAvailableMl(stock, remainingMl) {
  return (parseInt(stock) || 0) * STOCK_ML_PER_UNIT + (parseInt(remainingMl) || 0);
}

function deductStock(stock, remainingMl, mlToDeduct) {
  let units = parseInt(stock) || 0;
  let remaining = parseInt(remainingMl) || 0;
  let needed = parseInt(mlToDeduct) || 0;

  if (getTotalAvailableMl(units, remaining) < needed) {
    return null;
  }

  if (remaining >= needed) {
    remaining -= needed;
  } else {
    needed -= remaining;
    remaining = 0;
    while (needed > 0) {
      if (units <= 0) return null;
      units -= 1;
      if (needed <= STOCK_ML_PER_UNIT) {
        remaining = STOCK_ML_PER_UNIT - needed;
        needed = 0;
      } else {
        needed -= STOCK_ML_PER_UNIT;
      }
    }
  }

  return { stock: units, remaining_ml: remaining };
}

async function getBottleOptions(productId) {
  const [rows] = await pool.query(
    "SELECT id, bottle_type, size_ml, bottle_price, sort_order FROM product_bottle_options WHERE product_id = ? ORDER BY sort_order ASC, size_ml ASC",
    [productId]
  );
  return rows;
}

async function saveBottleOptions(productId, options) {
  await pool.query("DELETE FROM product_bottle_options WHERE product_id = ?", [productId]);
  if (!Array.isArray(options) || options.length === 0) return;

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    if (!opt.bottle_type || !opt.size_ml) continue;
    await pool.query(
      "INSERT INTO product_bottle_options (product_id, bottle_type, size_ml, bottle_price, sort_order) VALUES (?, ?, ?, ?, ?)",
      [
        productId,
        sanitize(String(opt.bottle_type)),
        parseInt(opt.size_ml) || 0,
        parseFloat(opt.bottle_price) || 0,
        parseInt(opt.sort_order) ?? i,
      ]
    );
  }
}

function mapProductRow(p, bottleOptions = []) {
  return {
    ...p,
    image_url: p.image ? `/uploads/${p.image}` : null,
    bottle_options: bottleOptions,
    stock_display: formatStockDisplay(p.stock, p.remaining_ml),
    total_available_ml: getTotalAvailableMl(p.stock, p.remaining_ml),
  };
}

function parseBottleOptionsInput(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildPagination(page, limit, total) {
  const totalPages = Math.ceil(total / limit) || 1;
  return { page, limit, total, totalPages };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token tidak valid" });
  }
}

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

async function tableExists(table) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as cnt FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows[0].cnt > 0;
}

async function ensureColumn(table, column, definition) {
  if (!(await columnExists(table, column))) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`Schema: added ${table}.${column}`);
  }
}

async function ensureSchema() {
  await ensureColumn("users", "role", "ENUM('admin', 'operator') NOT NULL DEFAULT 'operator'");
  await ensureColumn("products", "remaining_ml", "INT NOT NULL DEFAULT 0");
  await ensureColumn("products", "sale_type", "ENUM('regular', 'custom') NOT NULL DEFAULT 'custom'");
  await ensureColumn("delivery_areas", "kelurahan", "VARCHAR(150) DEFAULT NULL");

  await ensureColumn("orders", "sale_type", "ENUM('regular', 'custom') DEFAULT 'custom'");
  await ensureColumn("orders", "bottle_type", "VARCHAR(100) DEFAULT NULL");
  await ensureColumn("orders", "bottle_size", "VARCHAR(50) DEFAULT NULL");
  await ensureColumn("orders", "size_ml", "INT DEFAULT NULL");
  await ensureColumn("orders", "bottle_price", "DECIMAL(12,2) DEFAULT 0");
  await ensureColumn("orders", "perfume_price", "DECIMAL(12,2) DEFAULT 0");
  await ensureColumn("orders", "ml_used", "INT DEFAULT 0");

  if (!(await tableExists("product_bottle_options"))) {
    await pool.query(`
      CREATE TABLE product_bottle_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        bottle_type VARCHAR(100) NOT NULL,
        size_ml INT NOT NULL,
        bottle_price DECIMAL(12,2) NOT NULL DEFAULT 0,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product (product_id)
      )
    `);
    console.log("Schema: created product_bottle_options");
  }

  if (!(await tableExists("order_items"))) {
    await pool.query(`
      CREATE TABLE order_items (
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
      )
    `);
    console.log("Schema: created order_items");
  }

  if (await columnExists("products", "sale_type")) {
    await pool.query(`
      UPDATE products SET sale_type = 'custom'
      WHERE sale_type IS NULL AND price_per_ml IS NOT NULL AND price_per_ml > 0
    `);
    await pool.query(`
      UPDATE products SET sale_type = 'regular'
      WHERE sale_type IS NULL OR sale_type = ''
    `);
  }

  if (await columnExists("delivery_areas", "kelurahan")) {
    await pool.query(`
      UPDATE delivery_areas SET kelurahan = TRIM(REPLACE(name, 'Kelurahan ', ''))
      WHERE kelurahan IS NULL OR kelurahan = ''
    `);
  }

  await pool.query("UPDATE users SET role = 'admin' WHERE username = 'admin' AND (role IS NULL OR role = '')");
}

async function ensureAdminPassword() {
  const [rows] = await pool.query("SELECT id, password, role FROM users WHERE username = ?", ["admin"]);
  if (rows.length === 0) {
    const hash = await bcrypt.hash("admin123", 10);
    await pool.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", [
      "admin",
      hash,
      "Administrator",
      "admin",
    ]);
  } else {
    const valid = await bcrypt.compare("admin123", rows[0].password);
    if (!valid && rows[0].password.length < 50) {
      const hash = await bcrypt.hash("admin123", 10);
      await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, rows[0].id]);
    }
    if (!rows[0].role) {
      await pool.query("UPDATE users SET role = 'admin' WHERE id = ?", [rows[0].id]);
    }
  }
}

// ============ AUTH ============
app.post("/api/auth/login", async (req, res) => {
  try {
    const username = sanitize(req.body.username);
    const password = req.body.password;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Username atau password salah" });
    }
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Username atau password salah" });
    }
    const token = jwt.sign(
      { id: rows[0].id, username: rows[0].username, name: rows[0].name, role: rows[0].role || "operator" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: rows[0].id,
          username: rows[0].username,
          name: rows[0].name,
          role: rows[0].role || "operator",
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, name, role FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ CATEGORIES ============
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/admin/categories", authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = sanitize(req.query.search || "");
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params = [];
    if (search) {
      where += " AND (name LIKE ? OR slug LIKE ? OR description LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM categories ${where}`, params);
    const [rows] = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
       FROM categories c ${where} ORDER BY c.id ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: buildPagination(page, limit, countRows[0].total),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/admin/categories", authMiddleware, async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Nama kategori wajib diisi" });
    }
    const slug = slugify(name) + "-" + Date.now().toString(36);
    const [result] = await pool.query(
      "INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)",
      [sanitize(name), slug, sanitize(description || ""), sanitize(icon || "sparkles")]
    );
    res.status(201).json({ success: true, data: { id: result.insertId }, message: "Kategori ditambahkan" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/admin/categories/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }

    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Nama kategori wajib diisi" });
    }

    await pool.query("UPDATE categories SET name=?, description=?, icon=? WHERE id=?", [
      sanitize(name),
      sanitize(description || ""),
      sanitize(icon || "sparkles"),
      id,
    ]);
    res.json({ success: true, message: "Kategori diperbarui" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/admin/categories/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [countRows] = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE category_id = ?",
      [id]
    );
    if (countRows[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori masih memiliki produk. Pindahkan atau hapus produk terlebih dahulu.",
      });
    }
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ success: true, message: "Kategori dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ PRODUCTS (Public) ============
app.get("/api/products", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = sanitize(req.query.search || "");
    const category = sanitize(req.query.category || "");
    const sort = ["name", "price", "created_at"].includes(req.query.sort)
      ? req.query.sort
      : "created_at";
    const order = req.query.order === "asc" ? "ASC" : "DESC";
    const offset = (page - 1) * limit;

    let where = "WHERE p.is_active = 1";
    const params = [];

    if (search) {
      where += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where += " AND c.slug = ?";
      params.push(category);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM products p JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON p.category_id = c.id
       ${where} ORDER BY p.${sort} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const data = await Promise.all(
      rows.map(async (p) => mapProductRow(p, await getBottleOptions(p.id)))
    );

    res.json({
      success: true,
      data,
      pagination: buildPagination(page, limit, total),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = 1`,
      [req.params.slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }
    const p = rows[0];
    const bottleOptions = await getBottleOptions(p.id);
    res.json({
      success: true,
      data: mapProductRow(p, bottleOptions),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ PRODUCTS (Admin) ============
app.get("/api/admin/products", authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = sanitize(req.query.search || "");
    const category = sanitize(req.query.category || "");
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params = [];
    if (search) {
      where += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where += " AND c.slug = ?";
      params.push(category);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM products p JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON p.category_id = c.id
       ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const data = await Promise.all(
      rows.map(async (p) => mapProductRow(p, await getBottleOptions(p.id)))
    );

    res.json({
      success: true,
      data,
      pagination: buildPagination(page, limit, countRows[0].total),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/admin/products", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      price_per_ml,
      sale_type,
      bottle_type,
      bottle_size,
      stock,
      remaining_ml,
      is_active,
      bottle_options,
    } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ success: false, message: "Kategori dan nama wajib diisi" });
    }

    const type = sale_type === "regular" ? "regular" : "custom";
    const priceValue = type === "regular" ? parseFloat(price) || 25000 : 0;
    const pricePerMl = type === "custom" ? parseFloat(price_per_ml) || 0 : null;

    if (type === "custom" && !pricePerMl) {
      return res.status(400).json({ success: false, message: "Harga per ml wajib diisi untuk penjualan custom" });
    }
    if (type === "regular" && !priceValue) {
      return res.status(400).json({ success: false, message: "Harga reguler wajib diisi" });
    }

    const slug = slugify(name) + "-" + Date.now().toString(36);
    const image = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      `INSERT INTO products (category_id, name, slug, description, image, price, price_per_ml, sale_type, bottle_type, bottle_size, stock, remaining_ml, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(category_id),
        sanitize(name),
        slug,
        sanitize(description || ""),
        image,
        priceValue,
        pricePerMl,
        type,
        sanitize(bottle_type || ""),
        sanitize(bottle_size || ""),
        parseInt(stock) || 0,
        parseInt(remaining_ml) || 0,
        is_active === "0" || is_active === false ? 0 : 1,
      ]
    );

    await saveBottleOptions(result.insertId, parseBottleOptionsInput(bottle_options));

    res.status(201).json({ success: true, data: { id: result.insertId }, message: "Produk berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/admin/products/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    const {
      category_id,
      name,
      description,
      price,
      price_per_ml,
      sale_type,
      bottle_type,
      bottle_size,
      stock,
      remaining_ml,
      is_active,
      bottle_options,
    } = req.body;

    const type = sale_type === "regular" ? "regular" : "custom";
    const priceValue = type === "regular" ? parseFloat(price) || 0 : 0;
    const pricePerMl = type === "custom" ? parseFloat(price_per_ml) || 0 : null;

    if (type === "custom" && !pricePerMl) {
      return res.status(400).json({ success: false, message: "Harga per ml wajib diisi untuk penjualan custom" });
    }
    if (type === "regular" && !priceValue) {
      return res.status(400).json({ success: false, message: "Harga reguler wajib diisi" });
    }

    let image = existing[0].image;
    if (req.file) {
      if (image && fs.existsSync(path.join(UPLOAD_DIR, image))) {
        fs.unlinkSync(path.join(UPLOAD_DIR, image));
      }
      image = req.file.filename;
    }

    await pool.query(
      `UPDATE products SET category_id=?, name=?, description=?, image=?, price=?, price_per_ml=?, sale_type=?,
       bottle_type=?, bottle_size=?, stock=?, remaining_ml=?, is_active=? WHERE id=?`,
      [
        parseInt(category_id) || existing[0].category_id,
        sanitize(name) || existing[0].name,
        sanitize(description || ""),
        image,
        priceValue,
        pricePerMl,
        type,
        sanitize(bottle_type || ""),
        sanitize(bottle_size || ""),
        parseInt(stock) ?? existing[0].stock,
        parseInt(remaining_ml) ?? existing[0].remaining_ml ?? 0,
        is_active === "0" || is_active === false ? 0 : 1,
        id,
      ]
    );

    await saveBottleOptions(id, parseBottleOptionsInput(bottle_options));

    res.json({ success: true, message: "Produk berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/admin/products/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }
    if (existing[0].image && fs.existsSync(path.join(UPLOAD_DIR, existing[0].image))) {
      fs.unlinkSync(path.join(UPLOAD_DIR, existing[0].image));
    }
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ DELIVERY AREAS ============
app.get("/api/delivery-areas/kecamatan", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT kecamatan FROM delivery_areas WHERE is_active = 1 ORDER BY kecamatan ASC"
    );
    res.json({ success: true, data: rows.map((r) => r.kecamatan) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/delivery-areas", async (req, res) => {
  try {
    const kecamatan = sanitize(req.query.kecamatan || "");
    let query = "SELECT * FROM delivery_areas WHERE is_active = 1";
    const params = [];
    if (kecamatan) {
      query += " AND kecamatan = ?";
      params.push(kecamatan);
    }
    query += " ORDER BY delivery_fee ASC, kelurahan ASC, name ASC";
    const [rows] = await pool.query(query, params);
    res.json({
      success: true,
      data: rows.map((r) => ({
        ...r,
        kelurahan: r.kelurahan || r.name?.replace(/^Kelurahan\s+/i, "") || r.name,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/admin/delivery-areas", authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = sanitize(req.query.search || "");
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params = [];
    if (search) {
      where += " AND (name LIKE ? OR kelurahan LIKE ? OR kecamatan LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM delivery_areas ${where}`,
      params
    );
    const [rows] = await pool.query(
      `SELECT * FROM delivery_areas ${where} ORDER BY delivery_fee ASC, name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: buildPagination(page, limit, countRows[0].total),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/admin/delivery-areas", authMiddleware, async (req, res) => {
  try {
    const { name, kelurahan, kecamatan, delivery_fee, is_active } = req.body;
    const kel = sanitize(kelurahan || name || "");
    if (!kel) {
      return res.status(400).json({ success: false, message: "Kelurahan wajib diisi" });
    }
    const displayName = name ? sanitize(name) : `Kelurahan ${kel}`;
    const [result] = await pool.query(
      "INSERT INTO delivery_areas (name, kelurahan, kecamatan, delivery_fee, is_active) VALUES (?, ?, ?, ?, ?)",
      [
        displayName,
        kel,
        sanitize(kecamatan || "Cepu"),
        parseFloat(delivery_fee) || 0,
        is_active === "0" || is_active === false || is_active === 0 ? 0 : 1,
      ]
    );
    res.status(201).json({ success: true, data: { id: result.insertId }, message: "Area ditambahkan" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/admin/delivery-areas/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await pool.query("SELECT * FROM delivery_areas WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Area tidak ditemukan" });
    }

    const { name, kelurahan, kecamatan, delivery_fee, is_active } = req.body;
    const kel = sanitize(kelurahan || name || existing[0].kelurahan || "");
    if (!kel) {
      return res.status(400).json({ success: false, message: "Kelurahan wajib diisi" });
    }
    const displayName = name ? sanitize(name) : `Kelurahan ${kel}`;

    await pool.query(
      "UPDATE delivery_areas SET name=?, kelurahan=?, kecamatan=?, delivery_fee=?, is_active=? WHERE id=?",
      [
        displayName,
        kel,
        sanitize(kecamatan || "Cepu"),
        parseFloat(delivery_fee) ?? existing[0].delivery_fee,
        is_active === "0" || is_active === false || is_active === 0 ? 0 : 1,
        id,
      ]
    );
    res.json({ success: true, message: "Area diperbarui" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/admin/delivery-areas/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("DELETE FROM delivery_areas WHERE id = ?", [id]);
    res.json({ success: true, message: "Area dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

async function getOrderItems(orderIds) {
  if (!orderIds.length) return {};
  const placeholders = orderIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`,
    orderIds
  );
  const map = {};
  rows.forEach((row) => {
    if (!map[row.order_id]) map[row.order_id] = [];
    map[row.order_id].push(row);
  });
  return map;
}

async function deductProductStock(conn, productId, saleType, qty, mlPerItem) {
  const [products] = await conn.query("SELECT * FROM products WHERE id = ? FOR UPDATE", [productId]);
  if (products.length === 0) return { error: "Produk tidak ditemukan" };

  const product = products[0];
  let updatedStock;

  if (saleType === "custom" && mlPerItem > 0) {
    const deductMl = mlPerItem * qty;
    updatedStock = deductStock(product.stock, product.remaining_ml, deductMl);
    if (!updatedStock) return { error: "Stok parfum tidak mencukupi" };
  } else {
    if ((parseInt(product.stock) || 0) < qty) {
      return { error: "Stok produk tidak mencukupi" };
    }
    updatedStock = {
      stock: (parseInt(product.stock) || 0) - qty,
      remaining_ml: parseInt(product.remaining_ml) || 0,
    };
  }

  await conn.query("UPDATE products SET stock = ?, remaining_ml = ? WHERE id = ?", [
    updatedStock.stock,
    updatedStock.remaining_ml,
    productId,
  ]);

  return { ok: true };
}

// ============ ORDERS ============
app.post("/api/orders", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      items,
      product_id,
      product_name,
      category_name,
      customer_name,
      customer_phone,
      customer_address,
      quantity,
      total_price,
      delivery_type,
      delivery_area_id,
      notes,
      sale_type,
      bottle_type,
      bottle_size,
      size_ml,
      bottle_price,
      perfume_price,
    } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(400).json({
        success: false,
        message: "Nama customer dan nomor telepon wajib diisi",
      });
    }

    const orderItems = Array.isArray(items) && items.length > 0
      ? items
      : product_name
        ? [{
            product_id,
            product_name,
            category_name,
            quantity,
            sale_type,
            bottle_type,
            bottle_size,
            size_ml,
            bottle_price,
            perfume_price,
            subtotal: total_price,
          }]
        : [];

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal satu produk wajib diisi",
      });
    }

    let delivery_fee = 0;
    if (delivery_type === "delivery") {
      if (!delivery_area_id) {
        return res.status(400).json({
          success: false,
          message: "Pilih kelurahan pengantaran (khusus sekitar Kota Cepu)",
        });
      }
      const [area] = await conn.query(
        "SELECT * FROM delivery_areas WHERE id = ? AND is_active = 1",
        [delivery_area_id]
      );
      if (area.length === 0) {
        return res.status(400).json({ success: false, message: "Area pengantaran tidak valid" });
      }
      delivery_fee = parseFloat(area[0].delivery_fee);
    }

    await conn.beginTransaction();

    for (const item of orderItems) {
      if (!item.product_id) continue;
      const qty = parseInt(item.quantity) || 1;
      const mlPerItem = parseInt(item.size_ml) || 0;
      const itemSaleType = item.sale_type === "regular" ? "regular" : "custom";
      const result = await deductProductStock(conn, item.product_id, itemSaleType, qty, mlPerItem);
      if (result.error) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: `${item.product_name}: ${result.error}`,
        });
      }
    }

    const firstItem = orderItems[0];
    const isMulti = orderItems.length > 1;
    const headerProductName = isMulti
      ? `${orderItems.length} produk`
      : sanitize(firstItem.product_name);
    const headerCategory = isMulti ? "Multi Kategori" : sanitize(firstItem.category_name || "");
    const headerQty = orderItems.reduce((s, i) => s + (parseInt(i.quantity) || 1), 0);
    const headerSaleType = firstItem.sale_type === "regular" ? "regular" : "custom";

    const order_code = generateOrderCode();
    const [result] = await conn.query(
      `INSERT INTO orders (order_code, product_id, product_name, category_name, customer_name,
       customer_phone, customer_address, quantity, sale_type, bottle_type, bottle_size, size_ml,
       bottle_price, perfume_price, ml_used, total_price, delivery_type, delivery_area_id,
       delivery_fee, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        order_code,
        isMulti ? null : (firstItem.product_id || null),
        headerProductName,
        headerCategory,
        sanitize(customer_name),
        sanitize(customer_phone),
        sanitize(customer_address || ""),
        headerQty,
        headerSaleType,
        sanitize(firstItem.bottle_type || ""),
        sanitize(firstItem.bottle_size || ""),
        parseInt(firstItem.size_ml) || null,
        parseFloat(firstItem.bottle_price) || 0,
        parseFloat(firstItem.perfume_price) || 0,
        orderItems.reduce((s, i) => {
          const ml = parseInt(i.size_ml) || 0;
          const qty = parseInt(i.quantity) || 1;
          return s + (ml > 0 ? ml * qty : qty * STOCK_ML_PER_UNIT);
        }, 0),
        parseFloat(total_price) || 0,
        delivery_type === "delivery" ? "delivery" : "pickup",
        delivery_area_id || null,
        delivery_fee,
        sanitize(notes || ""),
      ]
    );

    const orderId = result.insertId;

    for (const item of orderItems) {
      const qty = parseInt(item.quantity) || 1;
      const mlPerItem = parseInt(item.size_ml) || 0;
      const mlUsed = mlPerItem > 0 ? mlPerItem * qty : qty * STOCK_ML_PER_UNIT;
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, category_name, quantity,
         sale_type, bottle_type, bottle_size, size_ml, bottle_price, perfume_price, ml_used, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id || null,
          sanitize(item.product_name),
          sanitize(item.category_name || ""),
          qty,
          item.sale_type === "regular" ? "regular" : "custom",
          sanitize(item.bottle_type || ""),
          sanitize(item.bottle_size || ""),
          mlPerItem || null,
          parseFloat(item.bottle_price) || 0,
          parseFloat(item.perfume_price) || 0,
          mlUsed,
          parseFloat(item.subtotal) || 0,
        ]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      data: { id: orderId, order_code, delivery_fee },
      message: "Pesanan berhasil dicatat",
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

app.get("/api/admin/orders", authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = sanitize(req.query.search || "");
    const status = sanitize(req.query.status || "");
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params = [];
    if (search) {
      where += " AND (o.order_code LIKE ? OR o.customer_name LIKE ? OR o.product_name LIKE ? OR o.customer_phone LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status) {
      where += " AND o.status = ?";
      params.push(status);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM orders o ${where}`, params);

    const [rows] = await pool.query(
      `SELECT o.*, da.name as delivery_area_name
       FROM orders o
       LEFT JOIN delivery_areas da ON o.delivery_area_id = da.id
       ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const orderIds = rows.map((r) => r.id);
    const itemsMap = await getOrderItems(orderIds);
    const data = rows.map((row) => ({
      ...row,
      items: itemsMap[row.id] || [],
    }));

    res.json({
      success: true,
      data,
      pagination: buildPagination(page, limit, countRows[0].total),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch("/api/admin/orders/:id/status", authMiddleware, roleMiddleware("admin", "operator"), async (req, res) => {
  try {
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "ready",
      "delivered",
      "completed",
      "cancelled",
    ];
    const status = req.body.status;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Status tidak valid" });
    }
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ success: true, message: "Status pesanan diperbarui" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/admin/orders/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    await pool.query("DELETE FROM orders WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Pesanan berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ SALES REPORT ============
app.get("/api/admin/sales-report", authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = sanitize(req.query.search || "");
    const startDate = sanitize(req.query.start_date || "");
    const endDate = sanitize(req.query.end_date || "");
    const offset = (page - 1) * limit;

    let where = "WHERE o.status != 'cancelled'";
    const params = [];

    if (startDate) {
      where += " AND DATE(o.created_at) >= ?";
      params.push(startDate);
    }
    if (endDate) {
      where += " AND DATE(o.created_at) <= ?";
      params.push(endDate);
    }
    if (search) {
      where += " AND (o.order_code LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const [[summaryRow]] = await pool.query(
      `SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(o.total_price), 0) as total_revenue,
        SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_price ELSE 0 END), 0) as completed_revenue
       FROM orders o ${where}`,
      params
    );

    const [dailyRows] = await pool.query(
      `SELECT DATE(o.created_at) as date, COUNT(*) as order_count, COALESCE(SUM(o.total_price), 0) as revenue
       FROM orders o ${where}
       GROUP BY DATE(o.created_at) ORDER BY date DESC`,
      params
    );

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM orders o ${where}`, params);

    const [rows] = await pool.query(
      `SELECT o.*, da.name as delivery_area_name
       FROM orders o
       LEFT JOIN delivery_areas da ON o.delivery_area_id = da.id
       ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const orderIds = rows.map((r) => r.id);
    const itemsMap = await getOrderItems(orderIds);
    const orders = rows.map((row) => ({
      ...row,
      items: itemsMap[row.id] || [],
    }));

    res.json({
      success: true,
      data: {
        summary: {
          total_orders: summaryRow.total_orders,
          total_revenue: parseFloat(summaryRow.total_revenue) || 0,
          completed_orders: summaryRow.completed_orders,
          completed_revenue: parseFloat(summaryRow.completed_revenue) || 0,
          daily: dailyRows.map((d) => ({
            date: d.date,
            order_count: d.order_count,
            revenue: parseFloat(d.revenue) || 0,
          })),
        },
        orders,
        pagination: buildPagination(page, limit, countRows[0].total),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ DASHBOARD STATS ============
app.get("/api/admin/dashboard", authMiddleware, async (req, res) => {
  try {
    const [[products]] = await pool.query("SELECT COUNT(*) as total FROM products");
    const [[activeProducts]] = await pool.query(
      "SELECT COUNT(*) as total FROM products WHERE is_active = 1"
    );
    const [[orders]] = await pool.query("SELECT COUNT(*) as total FROM orders");
    const [[pendingOrders]] = await pool.query(
      "SELECT COUNT(*) as total FROM orders WHERE status = 'pending'"
    );
    const [[categories]] = await pool.query("SELECT COUNT(*) as total FROM categories");
    const [recentOrders] = await pool.query(
      `SELECT o.*, da.name as delivery_area_name FROM orders o
       LEFT JOIN delivery_areas da ON o.delivery_area_id = da.id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        totalProducts: products.total,
        activeProducts: activeProducts.total,
        totalOrders: orders.total,
        pendingOrders: pendingOrders.total,
        totalCategories: categories.total,
        recentOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ SETTINGS ============
app.get("/api/settings", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT setting_key, setting_value FROM settings");
    const settings = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });
    const waNumber =
      settings.whatsapp_number || process.env.WHATSAPP_NUMBER || "6281234567890";
    res.json({
      success: true,
      data: {
        ...settings,
        whatsapp_number: waNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/admin/settings", authMiddleware, async (req, res) => {
  try {
    const { whatsapp_number, store_name, store_address, store_phone, pickup_info } = req.body;
    const updates = [
      ["whatsapp_number", whatsapp_number],
      ["store_name", store_name],
      ["store_address", store_address],
      ["store_phone", store_phone],
      ["pickup_info", pickup_info],
    ];
    for (const [key, value] of updates) {
      if (value !== undefined) {
        await pool.query(
          `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [key, sanitize(String(value)), sanitize(String(value))]
        );
      }
    }
    res.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check
app.get("/api/health", (_, res) => {
  res.json({ success: true, message: "API Penjualan Parfum Rajawali Cepu berjalan" });
});

app.use((err, _, res, __) => {
  res.status(500).json({ success: false, message: err.message || "Terjadi kesalahan server" });
});

app.listen(PORT, async () => {
  try {
    await ensureSchema();
    await ensureAdminPassword();
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Admin default: username=admin, password=admin123`);
  } catch (err) {
    console.error("Database connection error:", err.message);
    console.log(`Server berjalan di http://localhost:${PORT} (pastikan MySQL sudah diimport)`);
  }
});
