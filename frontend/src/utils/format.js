import { getUploadUrl } from "@/utils/config";

export const STOCK_ML_PER_UNIT = 400;

export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function formatDateOnly(dateStr) {
  if (!dateStr) return "";
  const cleanDateStr = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const [year, month, day] = cleanDateStr.split("-");
  const dateObj = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

export function usesPricePerMl(product) {
  return product?.price_per_ml != null && parseFloat(product.price_per_ml) > 0;
}

export function isCustomSale(product) {
  if (product?.sale_type === "regular") return false;
  if (product?.sale_type === "custom") return true;
  return usesPricePerMl(product);
}

export function isRegularSale(product) {
  if (product?.sale_type === "regular") return true;
  if (product?.sale_type === "custom") return false;
  return parseFloat(product?.price) > 0 && !usesPricePerMl(product);
}

export function formatStockDisplay(product) {
  if (product?.stock_display) return product.stock_display;
  return `${product?.stock || 0} buah - ${product?.remaining_ml || 0}ml`;
}

export function getProductPriceDisplay(product) {
  if (isCustomSale(product)) {
    return `${formatCurrency(product.price_per_ml)}/ml + harga botol`;
  }
  return formatCurrency(product.price || 25000);
}

export function getSaleTypeLabel(product) {
  return isCustomSale(product) ? "Custom (botol + parfum/ml)" : "Reguler (harga tetap)";
}

export function calculateOrderPrice(product, { bottleOption, quantity = 1 }) {
  const qty = parseInt(quantity) || 1;
  if (isRegularSale(product)) {
    return (parseFloat(product.price) || 25000) * qty;
  }
  if (!bottleOption) return 0;
  const bottlePrice = parseFloat(bottleOption.bottle_price) || 0;
  const perfumePrice = (parseFloat(product.price_per_ml) || 0) * (parseInt(bottleOption.size_ml) || 0);
  return (bottlePrice + perfumePrice) * qty;
}

export function getBottleTypes(options = []) {
  return [...new Set(options.map((o) => o.bottle_type).filter(Boolean))];
}

export function getSizesForBottleType(options = [], bottleType) {
  return options.filter((o) => o.bottle_type === bottleType);
}

export function getImageUrl(imageUrl) {
  return getUploadUrl(imageUrl);
}

export function buildWhatsAppUrl(phone, message) {
  const cleanPhone = String(phone).replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function buildOrderMessage(product, orderDetails = {}) {
  const {
    customerName,
    customerPhone,
    quantity,
    deliveryType,
    kecamatan,
    deliveryArea,
    address,
    notes,
    bottleType,
    bottleSize,
    sizeMl,
    totalPrice,
    orderCode,
    saleType,
  } = orderDetails;

  let msg = `Halo kak, saya ingin membeli ${product.name}`;
  msg += `\nKategori: ${product.category_name || "-"}`;

  if (saleType === "regular" || isRegularSale(product)) {
    msg += `\nTipe: Penjualan Reguler`;
    msg += `\nHarga: ${formatCurrency(product.price || 25000)}`;
  } else {
    msg += `\nTipe: Penjualan Custom`;
    msg += `\nHarga parfum: ${formatCurrency(product.price_per_ml)}/ml`;
    if (bottleType) msg += `\nJenis Botol: ${bottleType}`;
    if (bottleSize || sizeMl) msg += `\nUkuran: ${bottleSize || `${sizeMl}ml`}`;
  }

  msg += `\n\nNama: ${customerName || "-"}`;
  if (customerPhone) msg += `\nNo. HP: ${customerPhone}`;
  if (quantity) msg += `\nJumlah: ${quantity}`;
  if (totalPrice) msg += `\nTotal: ${formatCurrency(totalPrice)}`;
  if (orderCode) msg += `\nKode Pesanan: ${orderCode}`;

  if (deliveryType === "pickup") {
    msg += `\nMetode: Pick-Up Store`;
  } else if (deliveryType === "delivery") {
    msg += `\nMetode: Pengantaran (Area Cepu)`;
    if (kecamatan) msg += `\nKecamatan: ${kecamatan}`;
    if (deliveryArea) msg += `\nKelurahan: ${deliveryArea}`;
    if (address) msg += `\nAlamat: ${address}`;
  }

  if (notes) msg += `\nCatatan: ${notes}`;
  return msg;
}

export function buildCartOrderMessage(items = [], orderDetails = {}) {
  const {
    customerName,
    customerPhone,
    deliveryType,
    kecamatan,
    deliveryArea,
    address,
    notes,
    totalPrice,
    deliveryFee,
    orderCode,
  } = orderDetails;

  let msg = `Halo kak, saya ingin memesan:`;
  items.forEach((item, i) => {
    msg += `\n\n${i + 1}. ${item.product_name}`;
    msg += `\n   Kategori: ${item.category_name || "-"}`;
    if (item.sale_type === "regular") {
      msg += `\n   Tipe: Reguler — ${formatCurrency(item.unit_price || item.price)}`;
    } else {
      msg += `\n   Tipe: Custom — ${formatCurrency(item.price_per_ml || 0)}/ml`;
      if (item.bottle_type) msg += `\n   Botol: ${item.bottle_type} ${item.bottle_size || ""}`;
    }
    msg += `\n   Jumlah: ${item.quantity}`;
    msg += `\n   Subtotal: ${formatCurrency(item.subtotal)}`;
  });

  msg += `\n\nNama: ${customerName || "-"}`;
  if (customerPhone) msg += `\nNo. HP: ${customerPhone}`;
  if (deliveryFee > 0) msg += `\nOngkir: ${formatCurrency(deliveryFee)}`;
  if (totalPrice) msg += `\nTotal: ${formatCurrency(totalPrice)}`;
  if (orderCode) msg += `\nKode Pesanan: ${orderCode}`;

  if (deliveryType === "pickup") {
    msg += `\nMetode: Pick-Up Store`;
  } else if (deliveryType === "delivery") {
    msg += `\nMetode: Pengantaran (Area Cepu)`;
    if (kecamatan) msg += `\nKecamatan: ${kecamatan}`;
    if (deliveryArea) msg += `\nKelurahan: ${deliveryArea}`;
    if (address) msg += `\nAlamat: ${address}`;
  }

  if (notes) msg += `\nCatatan: ${notes}`;
  return msg;
}

export const ORDER_STATUS = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Diproses", color: "bg-indigo-100 text-indigo-800" },
  ready: { label: "Siap", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Dikirim", color: "bg-cyan-100 text-cyan-800" },
  completed: { label: "Selesai", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
};

export const CATEGORY_DEFINITION =
  "Kategori adalah pengelompokan aroma/produk (contoh: Wangi Wanita, Wangi Pria) untuk memudahkan filter di katalog.";

export const CATALOG_DEFINITION =
  "Katalog adalah halaman publik yang menampilkan seluruh produk parfum yang bisa dipesan customer, dapat difilter berdasarkan kategori.";
