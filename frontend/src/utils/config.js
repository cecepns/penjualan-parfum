// const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const rawApiUrl = "https://api.kingcreativestudio.my.id/penjualan-parfum";

/** Base URL backend (tanpa trailing slash) */
export const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

/** URL untuk file upload dari backend */
export const UPLOAD_BASE_URL = API_BASE_URL;

export function getUploadUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${UPLOAD_BASE_URL}${normalized}`;
}
