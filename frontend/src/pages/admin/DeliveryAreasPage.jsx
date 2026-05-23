import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/utils/format";
import DeliveryAreaFormModal from "@/components/admin/DeliveryAreaFormModal";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function DeliveryAreasPage() {
  const [areas, setAreas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchAreas = () => {
    setLoading(true);
    api
      .get(API_ENDPOINTS.ADMIN.DELIVERY_AREAS.LIST, {
        params: { page, limit, search: debouncedSearch },
      })
      .then((res) => {
        setAreas(res.data.data);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAreas();
  }, [page, limit, debouncedSearch]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(API_ENDPOINTS.ADMIN.DELIVERY_AREAS.UPDATE(editing.id), data);
        toast.success("Area pengantaran diperbarui");
      } else {
        await api.post(API_ENDPOINTS.ADMIN.DELIVERY_AREAS.CREATE, data);
        toast.success("Area pengantaran ditambahkan");
      }
      setModalOpen(false);
      setEditing(null);
      fetchAreas();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan area");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (area) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2">
          Hapus area &quot;{area.name}&quot;?
          <span className="flex gap-2">
            <button
              className="rounded bg-red-600 px-3 py-1 text-sm text-white"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(API_ENDPOINTS.ADMIN.DELIVERY_AREAS.DELETE(area.id));
                  toast.success("Area dihapus");
                  fetchAreas();
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
          <h2 className="text-2xl font-bold text-gray-900">Area Pengantaran</h2>
          <p className="text-gray-600">Kelola area & ongkir sekitar Kota Cepu</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Tambah Area
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
            placeholder="Cari area..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : areas.length === 0 ? (
        <EmptyState title="Belum ada area pengantaran" />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Kecamatan</th>
                <th className="px-4 py-3">Ongkir</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{area.name}</td>
                  <td className="px-4 py-3">{area.kecamatan}</td>
                  <td className="px-4 py-3">{formatCurrency(area.delivery_fee)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        area.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {area.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(area);
                          setModalOpen(true);
                        }}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(area)}
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

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      <DeliveryAreaFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        area={editing}
        loading={submitting}
      />
    </div>
  );
}
