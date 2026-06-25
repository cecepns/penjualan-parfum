import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Package, Store, Truck } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { formatCurrency, getImageUrl, getProductPriceDisplay, formatStockDisplay, isCustomSale, getSaleTypeLabel } from "@/utils/format";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import OrderModal from "@/components/order/OrderModal";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);

  useScrollToTop(slug);

  useEffect(() => {
    Promise.all([
      api.get(API_ENDPOINTS.PRODUCTS.DETAIL(slug)),
      api.get(API_ENDPOINTS.SETTINGS.GET),
    ])
      .then(([prodRes, setRes]) => {
        setProduct(prodRes.data.data);
        setSettings(setRes.data.data);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner className="py-32" />;
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-gray-600">Produk tidak ditemukan</p>
        <Link to="/katalog" className="btn-primary mt-4">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/katalog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Katalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
          {product.image_url ? (
            <img
              src={getImageUrl(product.image_url)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-24 w-24 text-gray-300" />
            </div>
          )}
        </div>

        <div>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
            {product.category_name}
          </span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-gray-600">{product.description}</p>

          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-500">
              <strong>Tipe:</strong> {getSaleTypeLabel(product)}
            </p>
            {isCustomSale(product) ? (
              <p className="text-3xl font-bold text-primary-700">
                {formatCurrency(product.price_per_ml)}
                <span className="text-lg font-normal text-gray-500"> / ml + harga botol</span>
              </p>
            ) : (
              <p className="text-3xl font-bold text-primary-700">{formatCurrency(product.price || 25000)}</p>
            )}
            {isCustomSale(product) && product.bottle_options?.length > 0 && (
              <div className="text-sm text-gray-600">
                <strong>Pilihan Botol:</strong>
                <ul className="mt-1 list-inside list-disc">
                  {[...new Set(product.bottle_options.map((o) => o.bottle_type))].map((type) => (
                    <li key={type}>
                      {type}: {product.bottle_options
                        .filter((o) => o.bottle_type === type)
                        .map((o) => `${o.size_ml}ml`)
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm text-gray-600">
              <strong>Stok:</strong>{" "}
              {product.total_available_ml > 0
                ? `${formatStockDisplay(product)} (total ${product.total_available_ml}ml)`
                : "Habis"}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
              <Store className="h-5 w-5 text-primary-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">Pick-Up Store</p>
                <p className="text-xs text-gray-500">Ambil di toko</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
              <Truck className="h-5 w-5 text-primary-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">Pengantaran Cepu</p>
                <p className="text-xs text-gray-500">Area sekitar Kota Cepu</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOrderOpen(true)}
            disabled={(product.total_available_ml ?? product.stock) <= 0}
            className="btn-primary mt-8 w-full py-3 text-base"
          >
            <MessageCircle className="h-5 w-5" />
            Pesan Sekarang
          </button>
        </div>
      </div>

      <OrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        product={product}
        settings={settings}
      />
    </div>
  );
}
