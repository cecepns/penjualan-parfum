/**
 * Generate & copy gambar placeholder produk parfum ke folder uploads.
 * Usage: node scripts/seed-images.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMAGES_SRC = path.join(ROOT, "sql", "images");
const UPLOAD_DIR = path.join(ROOT, process.env.UPLOAD_DIR || "uploads-penjualan-parfum");

const CATEGORY_COLORS = {
  parfum: { bg: "#7c3aed", accent: "#a78bfa", label: "Parfum" },
  "wangi-wanita": { bg: "#db2777", accent: "#f9a8d4", label: "Wangi Wanita" },
  "wangi-pria": { bg: "#1d4ed8", accent: "#93c5fd", label: "Wangi Pria" },
  "wangi-unisex": { bg: "#0d9488", accent: "#5eead4", label: "Wangi Unisex" },
};

const PRODUCTS = [
  { slug: "parfum-vanilla-dream", name: "Vanilla Dream", category: "parfum" },
  { slug: "parfum-ocean-breeze", name: "Ocean Breeze", category: "parfum" },
  { slug: "parfum-fresh-cotton", name: "Fresh Cotton", category: "parfum" },
  { slug: "parfum-citrus-burst", name: "Citrus Burst", category: "parfum" },
  { slug: "parfum-rose-garden", name: "Rose Garden", category: "wangi-wanita" },
  { slug: "parfum-cherry-blossom", name: "Cherry Blossom", category: "wangi-wanita" },
  { slug: "parfum-baby-powder", name: "Baby Powder", category: "wangi-wanita" },
  { slug: "parfum-black-opium", name: "Black Opium", category: "wangi-pria" },
  { slug: "parfum-midnight-musk", name: "Midnight Musk", category: "wangi-pria" },
  { slug: "parfum-sport-active", name: "Sport Active", category: "wangi-pria" },
  { slug: "parfum-white-tea", name: "White Tea", category: "wangi-unisex" },
  { slug: "parfum-sandalwood", name: "Sandalwood", category: "wangi-unisex" },
  { slug: "parfum-green-apple", name: "Green Apple", category: "wangi-unisex" },
];

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars = 18) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + word).length > maxChars) {
      if (line) lines.push(line.trim());
      line = word + " ";
    } else {
      line += word + " ";
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 2);
}

function createSvg(product) {
  const colors = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.parfum;
  const lines = wrapText(product.name);
  const line1 = escapeXml(lines[0] || product.name);
  const line2 = lines[1] ? escapeXml(lines[1]) : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg}"/>
      <stop offset="100%" style="stop-color:${colors.accent}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <circle cx="200" cy="130" r="56" fill="rgba(255,255,255,0.2)"/>
  <text x="200" y="125" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="42">✨</text>
  <text x="200" y="178" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="system-ui,sans-serif" font-size="13" font-weight="600" letter-spacing="1">${escapeXml(colors.label.toUpperCase())}</text>
  <text x="200" y="${line2 ? 218 : 228}" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="22" font-weight="700">${line1}</text>
  ${line2 ? `<text x="200" y="238" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="22" font-weight="700">${line2}</text>` : ""}
  <text x="200" y="360" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="system-ui,sans-serif" font-size="11">Parfum UMKM Cepu</text>
</svg>`;
}

function imageFilename(slug) {
  return `seed-${slug}.svg`;
}

function cleanupOldImages(dir) {
  if (!fs.existsSync(dir)) return;
  const keep = new Set(PRODUCTS.map((p) => imageFilename(p.slug)));
  for (const file of fs.readdirSync(dir)) {
    if (file.startsWith("seed-") && !keep.has(file)) {
      fs.unlinkSync(path.join(dir, file));
    }
  }
}

function main() {
  [IMAGES_SRC, UPLOAD_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cleanupOldImages(dir);
  });

  let count = 0;
  for (const product of PRODUCTS) {
    const filename = imageFilename(product.slug);
    const content = createSvg(product);
    fs.writeFileSync(path.join(IMAGES_SRC, filename), content, "utf8");
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), content, "utf8");
    count++;
  }

  console.log(`✓ ${count} gambar parfum dibuat di:`);
  console.log(`  - ${IMAGES_SRC}`);
  console.log(`  - ${UPLOAD_DIR}`);
}

main();
