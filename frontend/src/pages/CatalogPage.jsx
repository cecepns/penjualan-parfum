import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { useDebounce } from "@/hooks/useDebounce";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import ProductCard from "@/components/ui/ProductCard";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);

  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  useScrollToTop(page, category, debouncedSearch);

  useEffect(() => {
    api.get(API_ENDPOINTS.CATEGORIES.LIST).then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get(API_ENDPOINTS.PRODUCTS.LIST, {
        params: { page, limit, search: debouncedSearch, category },
      })
      .then((res) => {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch, category]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Katalog Produk</h1>
        <p className="mt-2 text-gray-600">
          Katalog parfum refill — berbagai aroma, harga per ml, jenis botol & ukuran
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateParams({ search: e.target.value, page: "1" });
            }}
            placeholder="Cari produk..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => updateParams({ limit: e.target.value, page: "1" })}
          className="input-field w-auto"
        >
          <option value="12">12 / halaman</option>
          <option value="24">24 / halaman</option>
          <option value="48">48 / halaman</option>
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ category: "", page: "1" })}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !category ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParams({ category: cat.slug, page: "1" })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === cat.slug
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : products.length === 0 ? (
        <EmptyState title="Produk tidak ditemukan" description="Coba kata kunci atau kategori lain" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {pagination && (
            <div className="mt-8">
              <Pagination
                pagination={pagination}
                onPageChange={(p) => updateParams({ page: String(p) })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
