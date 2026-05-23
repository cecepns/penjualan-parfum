import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";

const emptyForm = {
  name: "",
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
        name: area.name || "",
        kecamatan: area.kecamatan || "Cepu",
        delivery_fee: area.delivery_fee || "",
        is_active: area.is_active !== 0,
      });
    } else {
      setForm(emptyForm);
    }
  }, [area, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
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
          <label className="mb-1 block text-sm font-medium">Nama Area *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Kelurahan Cepu"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kecamatan</label>
          <input
            name="kecamatan"
            value={form.kecamatan}
            onChange={handleChange}
            className="input-field"
            placeholder="Cepu"
          />
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
