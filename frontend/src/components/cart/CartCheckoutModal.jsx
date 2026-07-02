import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import OrderConfirmationModal from "@/components/order/OrderConfirmationModal";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { useCart } from "@/context/CartContext";
import { buildCartOrderMessage, formatCurrency } from "@/utils/format";

const emptyForm = {
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  delivery_type: "pickup",
  kecamatan: "",
  delivery_area_id: "",
  notes: "",
};

export default function CartCheckoutModal({ isOpen, onClose, settings }) {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [areas, setAreas] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const whatsappNumber = settings?.whatsapp_number || "62882007832073";

  useEffect(() => {
    if (!isOpen) return;
    api.get(API_ENDPOINTS.DELIVERY_AREAS.KECAMATAN).then((res) => {
      setKecamatanList(res.data.data || []);
    });
    setForm(emptyForm);
    setConfirmation(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !form.kecamatan) {
      setAreas([]);
      return;
    }
    api
      .get(API_ENDPOINTS.DELIVERY_AREAS.LIST, { params: { kecamatan: form.kecamatan } })
      .then((res) => setAreas(res.data.data || []));
  }, [isOpen, form.kecamatan]);

  const selectedArea = areas.find((a) => a.id === parseInt(form.delivery_area_id));
  const deliveryFee = form.delivery_type === "delivery" ? (parseFloat(selectedArea?.delivery_fee) || 0) : 0;
  const totalPrice = subtotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "kecamatan") next.delivery_area_id = "";
      return next;
    });
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
    if (items.length === 0) {
      toast.error("Keranjang kosong");
      return false;
    }
    if (form.delivery_type === "delivery") {
      if (!form.kecamatan) {
        toast.error("Pilih kecamatan");
        return false;
      }
      if (!form.delivery_area_id) {
        toast.error("Pilih kelurahan pengantaran");
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
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post(API_ENDPOINTS.ORDERS.CREATE, {
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          category_name: item.category_name,
          quantity: item.quantity,
          sale_type: item.sale_type,
          bottle_type: item.bottle_type,
          bottle_size: item.bottle_size,
          size_ml: item.size_ml,
          bottle_price: item.bottle_price,
          perfume_price: item.perfume_price,
          subtotal: item.subtotal,
        })),
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_address: form.customer_address,
        total_price: totalPrice,
        delivery_type: form.delivery_type,
        delivery_area_id: form.delivery_area_id || null,
        notes: form.notes,
      });

      const orderCode = res.data.data.order_code;
      const waMessage = buildCartOrderMessage(items, {
        customerName: form.customer_name,
        customerPhone: form.customer_phone,
        deliveryType: form.delivery_type,
        kecamatan: form.kecamatan,
        deliveryArea: selectedArea?.kelurahan || selectedArea?.name,
        address: form.customer_address,
        notes: form.notes,
        totalPrice,
        deliveryFee,
        orderCode,
      });

      setConfirmation({
        order_code: orderCode,
        total_price: totalPrice,
        delivery_type: form.delivery_type,
        waMessage,
      });
      clearCart();
      toast.success("Pesanan berhasil dibuat");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAll = () => {
    setConfirmation(null);
    onClose();
  };

  if (items.length === 0 && !confirmation) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Checkout Keranjang">
        <p className="py-8 text-center text-gray-500">Keranjang kosong</p>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen && !confirmation} onClose={onClose} title="Checkout Pesanan" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-3 text-sm font-medium text-gray-700">Ringkasan Pesanan ({items.length} produk)</p>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <div key={item.cartId} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-gray-500">
                      {item.quantity}x
                      {item.bottle_type && ` • ${item.bottle_type} ${item.bottle_size}`}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Ongkir</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-primary-700">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
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
            <label className="mb-2 block text-sm font-medium text-gray-700">Metode Pengambilan *</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {["pickup", "delivery"].map((type) => (
                <label
                  key={type}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                    form.delivery_type === type
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_type"
                    value={type}
                    checked={form.delivery_type === type}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{type === "pickup" ? "Pick-Up Store" : "Pengantaran"}</p>
                    <p className="text-xs text-gray-500">
                      {type === "pickup" ? "Ambil sendiri di toko" : "Area sekitar Kota Cepu"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {form.delivery_type === "delivery" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Kecamatan *</label>
                  <select name="kecamatan" value={form.kecamatan} onChange={handleChange} className="input-field">
                    <option value="">Pilih kecamatan...</option>
                    {kecamatanList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Kelurahan *</label>
                  <select
                    name="delivery_area_id"
                    value={form.delivery_area_id}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!form.kecamatan}
                  >
                    <option value="">Pilih kelurahan...</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.kelurahan || area.name} — Ongkir {formatCurrency(area.delivery_fee)}
                      </option>
                    ))}
                  </select>
                </div>
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
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              <ShoppingBag className="h-4 w-4" />
              {loading ? "Memproses..." : "Buat Pesanan"}
            </button>
          </div>
        </form>
      </Modal>

      <OrderConfirmationModal
        isOpen={!!confirmation}
        onClose={handleCloseAll}
        orderData={confirmation}
        whatsappNumber={whatsappNumber}
        waMessage={confirmation?.waMessage || ""}
      />
    </>
  );
}
