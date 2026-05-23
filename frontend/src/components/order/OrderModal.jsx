import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import {
  buildWhatsAppUrl,
  buildOrderMessage,
  formatCurrency,
  getProductUnitPrice,
} from "@/utils/format";

export default function OrderModal({ isOpen, onClose, product, whatsappNumber }) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    quantity: 1,
    delivery_type: "pickup",
    delivery_area_id: "",
    notes: "",
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get(API_ENDPOINTS.DELIVERY_AREAS.LIST).then((res) => setAreas(res.data.data));
      setForm({
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        quantity: 1,
        delivery_type: "pickup",
        delivery_area_id: "",
        notes: "",
      });
    }
  }, [isOpen]);

  const selectedArea = areas.find((a) => a.id === parseInt(form.delivery_area_id));
  const deliveryFee = form.delivery_type === "delivery" ? (selectedArea?.delivery_fee || 0) : 0;
  const basePrice = getProductUnitPrice(product) * (parseInt(form.quantity) || 1);
  const totalPrice = basePrice + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.customer_name.trim()) {
      toast.error("Nama wajib diisi");
      return false;
    }
    if (!form.customer_phone.trim()) {
      toast.error("Nomor telepon wajib diisi");
      return false;
    }
    if (form.delivery_type === "delivery") {
      if (!form.delivery_area_id) {
        toast.error("Pilih area pengantaran (khusus sekitar Kota Cepu)");
        return false;
      }
      if (!form.customer_address.trim()) {
        toast.error("Alamat pengantaran wajib diisi");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !product) return;

    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.ORDERS.CREATE, {
        product_id: product.id,
        product_name: product.name,
        category_name: product.category_name,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_address: form.customer_address,
        quantity: parseInt(form.quantity) || 1,
        total_price: totalPrice,
        delivery_type: form.delivery_type,
        delivery_area_id: form.delivery_area_id || null,
        notes: form.notes,
      });

      const message = buildOrderMessage(product, {
        customerName: form.customer_name,
        quantity: form.quantity,
        deliveryType: form.delivery_type,
        deliveryArea: selectedArea?.name,
        address: form.customer_address,
        notes: form.notes,
      });

      const waUrl = buildWhatsAppUrl(whatsappNumber, message);
      window.open(waUrl, "_blank");
      toast.success("Pesanan dicatat! Membuka WhatsApp...");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses pesanan");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pesan via WhatsApp" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-primary-50 p-4">
          <p className="font-medium text-primary-900">{product.name}</p>
          <p className="text-sm text-primary-700">{product.category_name}</p>
          <p className="mt-1 text-lg font-bold text-primary-800">
            Estimasi: {formatCurrency(totalPrice)}
            {deliveryFee > 0 && (
              <span className="text-sm font-normal"> (termasuk ongkir {formatCurrency(deliveryFee)})</span>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nama *</label>
            <input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              className="input-field"
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">No. Telepon *</label>
            <input
              name="customer_phone"
              value={form.customer_phone}
              onChange={handleChange}
              className="input-field"
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah</label>
          <input
            type="number"
            name="quantity"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Metode Pengambilan</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                form.delivery_type === "pickup"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="delivery_type"
                value="pickup"
                checked={form.delivery_type === "pickup"}
                onChange={handleChange}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Pick-Up Store</p>
                <p className="text-xs text-gray-500">Ambil sendiri di toko</p>
              </div>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                form.delivery_type === "delivery"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="delivery_type"
                value="delivery"
                checked={form.delivery_type === "delivery"}
                onChange={handleChange}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Pengantaran</p>
                <p className="text-xs text-gray-500">Area sekitar Kota Cepu saja</p>
              </div>
            </label>
          </div>
        </div>

        {form.delivery_type === "delivery" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Area Pengantaran (Kota Cepu) *
              </label>
              <select
                name="delivery_area_id"
                value={form.delivery_area_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Pilih area...</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} — Ongkir {formatCurrency(area.delivery_fee)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Alamat Lengkap *</label>
              <textarea
                name="customer_address"
                value={form.customer_address}
                onChange={handleChange}
                rows={2}
                className="input-field"
                placeholder="Jl., RT/RW, patokan..."
              />
            </div>
          </>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Catatan (opsional)</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="input-field"
            placeholder="Varian aroma, ukuran khusus, dll."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn-whatsapp flex-1">
            <MessageCircle className="h-4 w-4" />
            {loading ? "Memproses..." : "Pesan via WhatsApp"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
