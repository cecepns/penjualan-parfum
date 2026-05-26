import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { getProductPriceDisplay, getImageUrl, usesPricePerMl } from "@/utils/format";

export default function ProductCard({ product }) {
  const priceDisplay = getProductPriceDisplay(product);

  return (
    <Link
      to={`/produk/${product.slug}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-primary-200"
    >
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
        <p className="mt-1.5 text-base font-bold text-primary-700 sm:mt-2 sm:text-lg">{priceDisplay}</p>
        {usesPricePerMl(product) && product.bottle_type && (
          <p className="mt-1 text-xs text-gray-500">
            {product.bottle_type} • {product.bottle_size}
          </p>
        )}
      </div>
    </Link>
  );
}
