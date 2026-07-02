import { useState, useEffect, useMemo } from "react";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import OrderConfirmationModal from "@/components/order/OrderConfirmationModal";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import {
  buildOrderMessage,
  calculateOrderPrice,
  formatCurrency,
  getBottleTypes,
  getSizesForBottleType,
  isCustomSale,
  isRegularSale,
} from "@/utils/format";

const emptyForm = {
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  quantity: 1,
  delivery_type: "pickup",
  kecamatan: "",
  delivery_area_id: "",
  bottle_type: "",
  bottle_option_id: "",
  notes: "",
};

export default function OrderModal({ isOpen, onClose, product, settings }) {
  const [form, setForm] = useState(emptyForm);
  const [areas, setAreas] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const whatsappNumber = settings?.whatsapp_number || "62882007832073";

  const bottleOptions = product?.bottle_options || [];
  const bottleTypes = useMemo(() => getBottleTypes(bottleOptions), [bottleOptions]);
  const sizeOptions = useMemo(
    () => getSizesForBottleType(bottleOptions, form.bottle_type),
    [bottleOptions, form.bottle_type]
  );
  const selectedOption = bottleOptions.find(
    (o) => String(o.id) === String(form.bottle_option_id)
  );

  useEffect(() => {
    if (!isOpen) return;
    api.get(API_ENDPOINTS.DELIVERY_AREAS.KECAMATAN).then((res) => {
      setKecamatanList(res.data.data || []);
    });
    setForm(emptyForm);
    setConfirmation(null);
  }, [isOpen, product?.id]);

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
  const basePrice = isRegularSale(product)
    ? calculateOrderPrice(product, { quantity: form.quantity })
    : calculateOrderPrice(product, { bottleOption: selectedOption, quantity: form.quantity });
  const totalPrice = basePrice + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "kecamatan") {
        next.delivery_area_id = "";
      }
      if (name === "bottle_type") {
        next.bottle_option_id = "";
      }
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
    if (isCustomSale(product)) {
      if (!form.bottle_type) {
        toast.error("Pilih jenis botol");
        return false;
      }
      if (!form.bottle_option_id) {
        toast.error("Pilih ukuran botol");
        return false;
      }
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
    if (!validate() || !product) return;

    const qty = parseInt(form.quantity) || 1;
    const bottlePrice = selectedOption ? parseFloat(selectedOption.bottle_price) || 0 : 0;
    const perfumePrice = selectedOption
      ? (parseFloat(product.price_per_ml) || 0) * (parseInt(selectedOption.size_ml) || 0)
      : 0;

    setLoading(true);
    try {
      const res = await api.post(API_ENDPOINTS.ORDERS.CREATE, {
        product_id: product.id,
        product_name: product.name,
        category_name: product.category_name,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_address: form.customer_address,
        quantity: qty,
        total_price: totalPrice,
        delivery_type: form.delivery_type,
        delivery_area_id: form.delivery_area_id || null,
        sale_type: isRegularSale(product) ? "regular" : "custom",
        bottle_type: selectedOption?.bottle_type || "",
        bottle_size: selectedOption ? `${selectedOption.size_ml}ml` : "",
        size_ml: selectedOption?.size_ml || null,
        bottle_price: bottlePrice,
        perfume_price: perfumePrice,
        notes: form.notes,
      });

      const orderCode = res.data.data.order_code;
      const waMessage = buildOrderMessage(product, {
        customerName: form.customer_name,
        customerPhone: form.customer_phone,
        quantity: qty,
        deliveryType: form.delivery_type,
        kecamatan: form.kecamatan,
        deliveryArea: selectedArea?.kelurahan || selectedArea?.name,
        address: form.customer_address,
        notes: form.notes,
        bottleType: selectedOption?.bottle_type,
        bottleSize: selectedOption ? `${selectedOption.size_ml}ml` : "",
        sizeMl: selectedOption?.size_ml,
        totalPrice,
        orderCode,
        saleType: isRegularSale(product) ? "regular" : "custom",
      });

      setConfirmation({
        order_code: orderCode,
        total_price: totalPrice,
        delivery_type: form.delivery_type,
        waMessage,
      });
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

  if (!product) return null;

  return (
    <>
      <Modal isOpen={isOpen && !confirmation} onClose={onClose} title="Form Pemesanan" size="lg">
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

          {isCustomSale(product) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Botol *</label>
                <select
                  name="bottle_type"
                  value={form.bottle_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Pilih jenis botol...</option>
                  {bottleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ukuran Botol *</label>
                <select
                  name="bottle_option_id"
                  value={form.bottle_option_id}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!form.bottle_type}
                >
                  <option value="">Pilih ukuran...</option>
                  {sizeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.size_ml}ml — Botol {formatCurrency(opt.bottle_price)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {isRegularSale(product) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <strong>Penjualan Reguler:</strong> {formatCurrency(product.price || 25000)} / pcs
            </div>
          )}

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
                  <select
                    name="kecamatan"
                    value={form.kecamatan}
                    onChange={handleChange}
                    className="input-field"
                  >
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
