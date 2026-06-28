import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { getCategoryIcon } from "@/utils/categoryIcons";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CATEGORY_DEFINITION } from "@/utils/format";

export default function CategoriesPublicPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(API_ENDPOINTS.CATEGORIES.LIST)
      .then((res) => setCategories(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kategori Produk</h1>
        <p className="mt-2 text-gray-600">{CATEGORY_DEFINITION}</p>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <Link
                key={cat.id}
                to={`/katalog?category=${cat.slug}`}
                className="group card flex items-start gap-4 transition hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{cat.name}</h3>
                  {cat.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{cat.description}</p>
                  )}
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600">
                    Lihat produk
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
