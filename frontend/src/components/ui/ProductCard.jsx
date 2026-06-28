import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { getProductPriceDisplay, getImageUrl, isCustomSale } from "@/utils/format";
import { useCart } from "@/context/CartContext";
import AddToCartModal from "@/components/cart/AddToCartModal";

export default function ProductCard({ product, showCartButton = false }) {
  const { addItem } = useCart();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const priceDisplay = getProductPriceDisplay(product);
  const inStock = (product.total_available_ml ?? product.stock) > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      toast.error("Stok habis");
      return;
    }
    if (isCustomSale(product)) {
      setCartModalOpen(true);
      return;
    }
    addItem(product, { quantity: 1 });
  };

  return (
    <>
      <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-primary-200">
        <Link to={`/produk/${product.slug}`} className="block">
          <div className="aspect-square overflow-hidden bg-gray-100">
            {product.image_url ? (
              <img
                src={getImageUrl(product.image_url)}
                alt={product.name}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-10 w-10 text-gray-300 sm:h-16 sm:w-16" />
              </div>
            )}
          </div>
          <div className="p-3 sm:p-4">
            <span className="text-[10px] font-medium text-primary-600 sm:text-xs">{product.category_name}</span>
            <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-primary-600 sm:mt-1 sm:text-base">
              {product.name}
            </h3>
            <p className="mt-1.5 text-base font-bold text-red-600 sm:mt-2 sm:text-lg">{priceDisplay}</p>
            {inStock ? (
              <p className="mt-1 text-xs font-medium text-green-600">
                Stok: {product.stock ?? 0}
              </p>
            ) : (
              <p className="mt-1 text-xs font-medium text-red-500">Stok habis</p>
            )}
            {isCustomSale(product) && product.bottle_options?.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {[...new Set(product.bottle_options.map((o) => o.bottle_type))].join(", ")}
              </p>
            )}
          </div>
        </Link>
        {showCartButton && (
          <div className="border-t border-gray-100 px-3 pb-3 sm:px-4 sm:pb-4">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="btn-primary w-full text-xs sm:text-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              Tambah ke Keranjang
            </button>
          </div>
        )}
      </div>

      <AddToCartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        product={product}
      />
    </>
  );
}
