import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const INITIAL_FORM = {
  whatsapp_number: "",
  store_name: "",
  store_address: "",
  store_phone: "",
  pickup_info: "",
};

export default function SettingsPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(API_ENDPOINTS.SETTINGS.GET)
      .then((res) => {
        const settings = res?.data?.data || {};
        setForm({
          whatsapp_number: settings.whatsapp_number || "",
          store_name: settings.store_name || "",
          store_address: settings.store_address || "",
          store_phone: settings.store_phone || "",
          pickup_info: settings.pickup_info || "",
        });
      })
      .catch(() => toast.error("Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.whatsapp_number.trim()) {
      toast.error("Nomor WhatsApp wajib diisi");
      return;
    }

    setSaving(true);
    try {
      await api.put(API_ENDPOINTS.ADMIN.SETTINGS, {
        whatsapp_number: form.whatsapp_number.trim(),
        store_name: form.store_name.trim(),
        store_address: form.store_address.trim(),
        store_phone: form.store_phone.trim(),
        pickup_info: form.pickup_info.trim(),
      });
      toast.success("Pengaturan berhasil disimpan");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan Toko</h2>
        <p className="mt-1 text-gray-600">Kelola nomor WhatsApp dan informasi toko untuk frontend.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nomor WhatsApp Penjual *</label>
          <input
            name="whatsapp_number"
            value={form.whatsapp_number}
            onChange={handleChange}
            className="input-field"
            placeholder="Contoh: 62882007832073"
          />
          <p className="mt-1 text-xs text-gray-500">
            Nomor ini ditampilkan ke customer untuk konfirmasi pesanan via WhatsApp (manual, tanpa gateway)
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Toko</label>
          <input
            name="store_name"
            value={form.store_name}
            onChange={handleChange}
            className="input-field"
            placeholder="Nama toko"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">No. Telepon Toko</label>
          <input
            name="store_phone"
            value={form.store_phone}
            onChange={handleChange}
            className="input-field"
            placeholder="No. telepon toko"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Alamat Toko</label>
          <textarea
            name="store_address"
            value={form.store_address}
            onChange={handleChange}
            rows={3}
            className="input-field"
            placeholder="Alamat lengkap toko"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Info Pick-Up</label>
          <textarea
            name="pickup_info"
            value={form.pickup_info}
            onChange={handleChange}
            rows={3}
            className="input-field"
            placeholder="Contoh: Buka setiap hari 09.00 - 21.00"
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
