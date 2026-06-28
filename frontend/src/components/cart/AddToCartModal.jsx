import { useState, useMemo, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useCart } from "@/context/CartContext";
import {
  formatCurrency,
  getBottleTypes,
  getSizesForBottleType,
  isCustomSale,
} from "@/utils/format";

export default function AddToCartModal({ isOpen, onClose, product }) {
  const { addItem } = useCart();
  const [bottleType, setBottleType] = useState("");
  const [bottleOptionId, setBottleOptionId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const bottleOptions = product?.bottle_options || [];
  const bottleTypes = useMemo(() => getBottleTypes(bottleOptions), [bottleOptions]);
  const sizeOptions = useMemo(
    () => getSizesForBottleType(bottleOptions, bottleType),
    [bottleOptions, bottleType]
  );
  const selectedOption = bottleOptions.find((o) => String(o.id) === String(bottleOptionId));

  useEffect(() => {
    if (!isOpen) return;
    setBottleType("");
    setBottleOptionId("");
    setQuantity(1);
  }, [isOpen, product?.id]);

  const handleAdd = () => {
    if (!product) return;

    if (isCustomSale(product)) {
      if (!bottleType || !bottleOptionId) return;
      addItem(product, { quantity, bottleOption: selectedOption });
    } else {
      addItem(product, { quantity });
    }
    onClose();
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah ke Keranjang" size="md">
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-500">{product.category_name}</p>
        </div>

        {isCustomSale(product) && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Botol *</label>
              <select
                value={bottleType}
                onChange={(e) => {
                  setBottleType(e.target.value);
                  setBottleOptionId("");
                }}
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
                value={bottleOptionId}
                onChange={(e) => setBottleOptionId(e.target.value)}
                className="input-field"
                disabled={!bottleType}
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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="input-field"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isCustomSale(product) && (!bottleType || !bottleOptionId)}
            className="btn-primary flex-1"
          >
            <ShoppingCart className="h-4 w-4" />
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </Modal>
  );
}
