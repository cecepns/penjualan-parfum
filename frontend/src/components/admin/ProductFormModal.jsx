import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { STOCK_ML_PER_UNIT } from "@/utils/format";

const emptyForm = {
  category_id: "",
  name: "",
  description: "",
  sale_type: "custom",
  price: "25000",
  price_per_ml: "",
  stock: "",
  remaining_ml: "0",
  is_active: true,
};

const emptyBottleOption = { bottle_type: "Botol Spray", size_ml: "", bottle_price: "" };

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  loading,
}) {
  const [form, setForm] = useState(emptyForm);
  const [bottleOptions, setBottleOptions] = useState([{ ...emptyBottleOption }]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (product) {
      setForm({
        category_id: String(product.category_id),
        name: product.name || "",
        description: product.description || "",
        sale_type: product.sale_type || (product.price_per_ml ? "custom" : "regular"),
        price: product.sale_type === "regular" || !product.price_per_ml ? product.price || "25000" : "",
        price_per_ml: product.sale_type === "custom" || product.price_per_ml ? product.price_per_ml || "" : "",
        stock: product.stock ?? "",
        remaining_ml: product.remaining_ml ?? "0",
        is_active: product.is_active !== 0,
      });
      setBottleOptions(
        product.bottle_options?.length
          ? product.bottle_options.map((o) => ({
              bottle_type: o.bottle_type,
              size_ml: String(o.size_ml),
              bottle_price: String(o.bottle_price),
            }))
          : [{ ...emptyBottleOption }]
      );
      setPreview(product.image_url || null);
    } else {
      setForm(emptyForm);
      setBottleOptions([{ ...emptyBottleOption }]);
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

  const handleSaleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      sale_type: type,
      price: type === "regular" ? prev.price || "25000" : "",
      price_per_ml: type === "custom" ? prev.price_per_ml : "",
    }));
  };

  const updateBottleOption = (index, field, value) => {
    setBottleOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const addBottleOption = () => {
    setBottleOptions((prev) => [...prev, { ...emptyBottleOption }]);
  };

  const removeBottleOption = (index) => {
    setBottleOptions((prev) => prev.filter((_, i) => i !== index));
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
    fd.append(
      "bottle_options",
      JSON.stringify(
        bottleOptions
          .filter((o) => o.bottle_type && o.size_ml)
          .map((o, i) => ({
            bottle_type: o.bottle_type,
            size_ml: parseInt(o.size_ml) || 0,
            bottle_price: parseFloat(o.bottle_price) || 0,
            sort_order: i,
          }))
      )
    );
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
          <p className="mt-1 text-xs text-gray-500">Kategori = pengelompokan aroma untuk filter katalog</p>
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
          <label className="mb-2 block text-sm font-medium">Tipe Penjualan *</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                form.sale_type === "regular"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                checked={form.sale_type === "regular"}
                onChange={() => handleSaleTypeChange("regular")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">Reguler</p>
                <p className="text-xs text-gray-500">Harga tetap, contoh Rp 25.000</p>
              </div>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                form.sale_type === "custom"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                checked={form.sale_type === "custom"}
                onChange={() => handleSaleTypeChange("custom")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">Custom</p>
                <p className="text-xs text-gray-500">Harga botol + parfum per ml</p>
              </div>
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {form.sale_type === "custom" ? (
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
                placeholder="2000"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium">Harga Reguler *</label>
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
            <label className="mb-1 block text-sm font-medium">Stok (buah @400ml)</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sisa ml (botol terbuka)</label>
            <input
              type="number"
              name="remaining_ml"
              value={form.remaining_ml}
              onChange={handleChange}
              min="0"
              max="399"
              className="input-field"
            />
            <p className="mt-1 text-xs text-gray-500">1 stok = {STOCK_ML_PER_UNIT}ml. Contoh: 24 buah - 390ml</p>
          </div>
        </div>

        {form.sale_type === "custom" && (
          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Opsi Botol & Ukuran</p>
              <button type="button" onClick={addBottleOption} className="btn-secondary text-xs py-1.5">
                <Plus className="h-3 w-3" />
                Tambah
              </button>
            </div>
            {bottleOptions.map((opt, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-4 items-end">
                <input
                  value={opt.bottle_type}
                  onChange={(e) => updateBottleOption(index, "bottle_type", e.target.value)}
                  className="input-field"
                  placeholder="Jenis botol"
                />
                <input
                  type="number"
                  value={opt.size_ml}
                  onChange={(e) => updateBottleOption(index, "size_ml", e.target.value)}
                  className="input-field"
                  placeholder="Ukuran ml"
                />
                <input
                  type="number"
                  value={opt.bottle_price}
                  onChange={(e) => updateBottleOption(index, "bottle_price", e.target.value)}
                  className="input-field"
                  placeholder="Harga botol"
                />
                <button
                  type="button"
                  onClick={() => removeBottleOption(index)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  disabled={bottleOptions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

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
          <span className="text-sm">Produk aktif (tampil di katalog)</span>
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
