import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";

const emptyForm = {
  category_id: "",
  name: "",
  description: "",
  price_type: "fixed",
  price: "",
  price_per_ml: "",
  bottle_type: "",
  bottle_size: "",
  stock: "",
  is_active: true,
};

function resolvePriceType(product) {
  if (!product) return "fixed";
  if (product.price_per_ml != null && parseFloat(product.price_per_ml) > 0) {
    return "per_ml";
  }
  return "fixed";
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  loading,
}) {
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (product) {
      const priceType = resolvePriceType(product);
      setForm({
        category_id: String(product.category_id),
        name: product.name || "",
        description: product.description || "",
        price_type: priceType,
        price: priceType === "fixed" ? product.price || "" : "",
        price_per_ml: priceType === "per_ml" ? product.price_per_ml || "" : "",
        bottle_type: product.bottle_type || "",
        bottle_size: product.bottle_size || "",
        stock: product.stock || "",
        is_active: product.is_active !== 0,
      });
      setPreview(product.image_url || null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
    setImage(null);
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      price_type: type,
      price: type === "fixed" ? prev.price : "",
      price_per_ml: type === "per_ml" ? prev.price_per_ml : "",
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "is_active") fd.append(k, v ? "1" : "0");
      else fd.append(k, v);
    });
    if (image) fd.append("image", image);
    onSubmit(fd);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Edit Produk" : "Tambah Produk"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Kategori *</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nama Produk *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Tipe Harga *</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                form.price_type === "fixed"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="price_type_radio"
                checked={form.price_type === "fixed"}
                onChange={() => handlePriceTypeChange("fixed")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">Harga Tetap</p>
                <p className="text-xs text-gray-500">Contoh: Rp 25.000 / botol</p>
              </div>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                form.price_type === "per_ml"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="price_type_radio"
                checked={form.price_type === "per_ml"}
                onChange={() => handlePriceTypeChange("per_ml")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">Harga per ml</p>
                <p className="text-xs text-gray-500">Contoh: Rp 1.500 / ml</p>
              </div>
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {form.price_type === "per_ml" ? (
            <div>
              <label className="mb-1 block text-sm font-medium">Harga per ml *</label>
              <input
                type="number"
                name="price_per_ml"
                value={form.price_per_ml}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
                placeholder="1500"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium">Harga *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
                placeholder="25000"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Stok</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Jenis Botol</label>
            <input
              name="bottle_type"
              value={form.bottle_type}
              onChange={handleChange}
              className="input-field"
              placeholder="Botol Spray, Roll-On, dll"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ukuran</label>
            <input
              name="bottle_size"
              value={form.bottle_size}
              onChange={handleChange}
              className="input-field"
              placeholder="30ml, 50ml, dll"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Gambar Produk</label>
          <input type="file" accept="image/*" onChange={handleImage} className="input-field" />
          {preview && (
            <img src={preview} alt="Preview" className="mt-2 h-32 w-32 rounded-lg object-cover" />
          )}
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="rounded"
          />
          <span className="text-sm">Produk aktif</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Menyimpan..." : product ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
