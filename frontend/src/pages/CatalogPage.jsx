import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { useDebounce } from "@/hooks/useDebounce";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import ProductCard from "@/components/ui/ProductCard";
import CategorySidebar from "@/components/catalog/CategorySidebar";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Terbaru" },
  { value: "created_at:asc", label: "Terlama" },
  { value: "name:asc", label: "Nama A-Z" },
  { value: "name:desc", label: "Nama Z-A" },
  { value: "price:asc", label: "Harga Terendah" },
  { value: "price:desc", label: "Harga Tertinggi" },
];

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
  const sortParam = searchParams.get("sort") || "created_at:desc";
  const [sortField, sortOrder] = sortParam.split(":");

  const activeCategory = categories.find((c) => c.slug === category);

  useScrollToTop(page, category, debouncedSearch);

  useEffect(() => {
    api.get(API_ENDPOINTS.CATEGORIES.LIST).then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get(API_ENDPOINTS.PRODUCTS.LIST, {
        params: { page, limit, search: debouncedSearch, category, sort: sortField, order: sortOrder },
      })
      .then((res) => {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch, category, sortField, sortOrder]);

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
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Kategori */}
        <div className="lg:w-56 xl:w-64 shrink-0">
          <CategorySidebar categories={categories} className="lg:sticky lg:top-24" />
        </div>

        {/* Main Katalog */}
        <div className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">
              Beranda
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/katalog" className="hover:text-primary-600">
              Katalog
            </Link>
            {activeCategory && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-gray-900">{activeCategory.name}</span>
              </>
            )}
          </nav>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold uppercase text-gray-900 sm:text-3xl">
                {activeCategory ? activeCategory.name : "Semua Produk"}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {activeCategory?.description ||
                  "Menampilkan koleksi parfum terbaik dari Parfum Rajawali Cepu."}
              </p>
            </div>
            <select
              value={sortParam}
              onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}
              className="input-field w-full sm:w-auto"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Urutkan: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search & Limit */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
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

          {loading ? (
            <LoadingSpinner className="py-20" />
          ) : products.length === 0 ? (
            <EmptyState title="Produk tidak ditemukan" description="Coba kata kunci atau kategori lain" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} showCartButton />
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
      </div>
    </div>
  );
}
