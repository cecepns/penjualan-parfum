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
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-primary-600">{product.category_name}</span>
        <h3 className="mt-1 line-clamp-2 font-semibold text-gray-900 group-hover:text-primary-600">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-bold text-primary-700">{priceDisplay}</p>
        {usesPricePerMl(product) && product.bottle_type && (
          <p className="mt-1 text-xs text-gray-500">
            {product.bottle_type} • {product.bottle_size}
          </p>
        )}
      </div>
    </Link>
  );
}
