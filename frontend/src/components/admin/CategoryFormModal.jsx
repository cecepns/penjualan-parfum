import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";

const emptyForm = { name: "", description: "" };

export default function CategoryFormModal({ isOpen, onClose, onSubmit, category, loading }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [category, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Kategori" : "Tambah Kategori"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nama Kategori *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Wangi Wanita"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="input-field"
            placeholder="Deskripsi kategori parfum"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Menyimpan..." : category ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
