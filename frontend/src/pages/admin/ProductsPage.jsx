import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { useDebounce } from "@/hooks/useDebounce";
import { getImageUrl, getProductPriceDisplay } from "@/utils/format";
import ProductFormModal from "@/components/admin/ProductFormModal";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = () => {
    setLoading(true);
    api
      .get(API_ENDPOINTS.ADMIN.PRODUCTS.LIST, {
        params: { page, limit, search: debouncedSearch },
      })
      .then((res) => {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get(API_ENDPOINTS.CATEGORIES.LIST).then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, limit, debouncedSearch]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(API_ENDPOINTS.ADMIN.PRODUCTS.UPDATE(editing.id), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Produk diperbarui");
      } else {
        await api.post(API_ENDPOINTS.ADMIN.PRODUCTS.CREATE, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Produk ditambahkan");
      }
      setModalOpen(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (product) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2">
          Hapus &quot;{product.name}&quot;?
          <span className="flex gap-2">
            <button
              className="rounded bg-red-600 px-3 py-1 text-sm text-white"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(API_ENDPOINTS.ADMIN.PRODUCTS.DELETE(product.id));
                  toast.success("Produk dihapus");
                  fetchProducts();
                } catch {
                  toast.error("Gagal menghapus");
                }
              }}
            >
              Ya, Hapus
            </button>
            <button className="rounded bg-gray-200 px-3 py-1 text-sm" onClick={() => toast.dismiss(t.id)}>
              Batal
            </button>
          </span>
        </span>
      ),
      { duration: 10000 }
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Produk</h2>
          <p className="text-gray-600">Tambah, edit, dan hapus produk katalog</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari produk..."
            className="input-field pl-10"
          />
        </div>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="input-field w-auto">
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : products.length === 0 ? (
        <EmptyState title="Belum ada produk" />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={getImageUrl(p.image_url)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100" />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category_name}</td>
                  <td className="px-4 py-3">{getProductPriceDisplay(p)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <div className="mt-6">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        product={editing}
        categories={categories}
        loading={submitting}
      />
    </div>
  );
}
