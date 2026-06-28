import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, Minus, Plus, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency, getImageUrl } from "@/utils/format";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import CartCheckoutModal from "@/components/cart/CartCheckoutModal";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [settings, setSettings] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    api.get(API_ENDPOINTS.SETTINGS.GET).then((res) => setSettings(res.data.data));
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title="Keranjang kosong"
          description="Tambahkan produk dari katalog untuk mulai berbelanja"
        />
        <div className="mt-6 text-center">
          <Link to="/katalog" className="btn-primary">
            Lihat Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/katalog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Lanjut Belanja
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
      <p className="mt-1 text-gray-600">{items.length} produk dalam keranjang</p>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.cartId} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.image_url ? (
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.product_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">No img</div>
              )}
            </div>
            <div className="flex-1">
              <Link to={`/produk/${item.slug}`} className="font-medium hover:text-primary-600">
                {item.product_name}
              </Link>
              <p className="text-sm text-gray-500">{item.category_name}</p>
              {item.bottle_type && (
                <p className="text-xs text-gray-500">
                  {item.bottle_type} {item.bottle_size}
                </p>
              )}
              <p className="mt-1 font-bold text-primary-700">{formatCurrency(item.subtotal)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                  className="p-2 text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.cartId)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">Total</span>
          <span className="text-2xl font-bold text-primary-700">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Belum termasuk ongkir (jika pengantaran)</p>
        <button
          type="button"
          onClick={() => setCheckoutOpen(true)}
          className="btn-primary mt-4 w-full py-3"
        >
          <ShoppingBag className="h-5 w-5" />
          Checkout & Pesan
        </button>
      </div>

      <CartCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        settings={settings}
      />
    </div>
  );
}
