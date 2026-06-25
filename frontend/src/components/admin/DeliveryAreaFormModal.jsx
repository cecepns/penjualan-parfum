import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { CEPU_KECAMATAN, CEPU_KELURAHAN } from "@/utils/cepuAreas";

const emptyForm = {
  kelurahan: "",
  kecamatan: "Cepu",
  delivery_fee: "",
  is_active: true,
};

export default function DeliveryAreaFormModal({
  isOpen,
  onClose,
  onSubmit,
  area,
  loading,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (area) {
      setForm({
        kelurahan: area.kelurahan || area.name?.replace(/^Kelurahan\s+/i, "") || "",
        kecamatan: area.kecamatan || "Cepu",
        delivery_fee: area.delivery_fee || "",
        is_active: area.is_active !== 0,
      });
    } else {
      setForm(emptyForm);
    }
  }, [area, isOpen]);

  const kelurahanOptions = CEPU_KELURAHAN[form.kecamatan] || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "kecamatan") {
        next.kelurahan = "";
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      kelurahan: form.kelurahan,
      name: `Kelurahan ${form.kelurahan}`,
      kecamatan: form.kecamatan,
      delivery_fee: form.delivery_fee,
      is_active: form.is_active ? 1 : 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={area ? "Edit Area Pengantaran" : "Tambah Area Pengantaran"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Kecamatan *</label>
          <select
            name="kecamatan"
            value={form.kecamatan}
            onChange={handleChange}
            required
            className="input-field"
          >
            {CEPU_KECAMATAN.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kelurahan *</label>
          <select
            name="kelurahan"
            value={form.kelurahan}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Pilih kelurahan...</option>
            {kelurahanOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ongkir (Rp) *</label>
          <input
            type="number"
            name="delivery_fee"
            value={form.delivery_fee}
            onChange={handleChange}
            required
            min="0"
            className="input-field"
            placeholder="5000"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="rounded"
          />
          <span className="text-sm">Area aktif (tampil di form pesanan)</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Menyimpan..." : area ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
