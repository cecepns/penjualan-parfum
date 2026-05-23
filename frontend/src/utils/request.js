import { api } from "@/utils/api";

/**
 * Wrapper request API — semua panggilan lewat utils ini + endpoints.js
 */
export async function apiGet(url, config = {}) {
  const res = await api.get(url, config);
  return res.data;
}

export async function apiPost(url, data, config = {}) {
  const res = await api.post(url, data, config);
  return res.data;
}

export async function apiPut(url, data, config = {}) {
  const res = await api.put(url, data, config);
  return res.data;
}

export async function apiPatch(url, data, config = {}) {
  const res = await api.patch(url, data, config);
  return res.data;
}

export async function apiDelete(url, config = {}) {
  const res = await api.delete(url, config);
  return res.data;
}
