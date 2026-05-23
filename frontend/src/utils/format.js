import { getUploadUrl } from "@/utils/config";

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

export function usesPricePerMl(product) {
  return product?.price_per_ml != null && parseFloat(product.price_per_ml) > 0;
}

export function getProductPriceDisplay(product) {
  if (usesPricePerMl(product)) {
    return `${formatCurrency(product.price_per_ml)}/ml`;
  }
  return formatCurrency(product.price);
}

export function getProductUnitPrice(product) {
  if (usesPricePerMl(product)) {
    return parseFloat(product.price_per_ml);
  }
  return parseFloat(product.price) || 0;
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
  const { customerName, quantity, deliveryType, deliveryArea, address, notes } =
    orderDetails;

  let msg = `Hallo kak, saya ingin membeli ${product.category_name?.toLowerCase() || "produk"} (${product.name})`;

  if (usesPricePerMl(product)) {
    msg += `\nHarga: ${formatCurrency(product.price_per_ml)}/ml`;
    if (product.bottle_type) msg += `\nJenis Botol: ${product.bottle_type}`;
    if (product.bottle_size) msg += `\nUkuran: ${product.bottle_size}`;
  } else if (product.price) {
    msg += `\nHarga: ${formatCurrency(product.price)}`;
    if (product.bottle_size) msg += `\nUkuran: ${product.bottle_size}`;
  }

  if (customerName) msg += `\n\nNama: ${customerName}`;
  if (quantity) msg += `\nJumlah: ${quantity}`;
  if (deliveryType === "pickup") {
    msg += `\nMetode: Pick-Up Store (Ambil di toko)`;
  } else if (deliveryType === "delivery") {
    msg += `\nMetode: Pengantaran (Area Cepu)`;
    if (deliveryArea) msg += `\nArea: ${deliveryArea}`;
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

export const CATEGORY_ICONS = {
  parfum: "Sparkles",
  "wangi-wanita": "Sparkles",
  "wangi-pria": "Sparkles",
  "wangi-unisex": "Sparkles",
};
