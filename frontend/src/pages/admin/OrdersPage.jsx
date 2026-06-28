import { useEffect, useState } from "react";
import { Search, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate, ORDER_STATUS } from "@/utils/format";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusDraft, setStatusDraft] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  const fetchOrders = () => {
    setLoading(true);
    api
      .get(API_ENDPOINTS.ADMIN.ORDERS.LIST, {
        params: { page, limit, search: debouncedSearch, status: statusFilter },
      })
      .then((res) => {
        const data = res.data.data || [];
        setOrders(data);
        setPagination(res.data.pagination);
        const draft = {};
        data.forEach((order) => {
          draft[order.id] = order.status;
        });
        setStatusDraft(draft);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, debouncedSearch, statusFilter]);

  const handleStatusDraftChange = (orderId, newStatus) => {
    setStatusDraft((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const saveStatus = async (order) => {
    const newStatus = statusDraft[order.id];
    if (!newStatus || newStatus === order.status) {
      toast.error("Pilih status yang berbeda");
      return;
    }

    const runUpdate = async () => {
      setUpdatingId(order.id);
      try {
        await api.patch(API_ENDPOINTS.ADMIN.ORDERS.UPDATE_STATUS(order.id), {
          status: newStatus,
        });
        toast.success(`Status ${order.order_code} diperbarui`);
        fetchOrders();
      } catch (err) {
        toast.error(err.response?.data?.message || "Gagal memperbarui status");
      } finally {
        setUpdatingId(null);
      }
    };

    if (newStatus === "cancelled") {
      toast(
        (t) => (
          <span className="flex flex-col gap-2">
            Batalkan pesanan {order.order_code}?
            <span className="flex gap-2">
              <button
                className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                onClick={async () => {
                  toast.dismiss(t.id);
                  await runUpdate();
                }}
              >
                Ya, Batalkan
              </button>
              <button
                className="rounded bg-gray-200 px-3 py-1 text-sm"
                onClick={() => toast.dismiss(t.id)}
              >
                Batal
              </button>
            </span>
          </span>
        ),
        { duration: 10000 }
      );
      return;
    }

    await runUpdate();
  };

  const handleDelete = (order) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2">
          Hapus pesanan {order.order_code}?
          <span className="flex gap-2">
            <button
              className="rounded bg-red-600 px-3 py-1 text-sm text-white"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(API_ENDPOINTS.ADMIN.ORDERS.DELETE(order.id));
                  toast.success("Pesanan dihapus");
                  fetchOrders();
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
      <h2 className="text-2xl font-bold text-gray-900">Lihat Pesanan</h2>
      <p className="mt-1 text-gray-600">
        Kelola pesanan customer — ubah status proses pesanan dari sini
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari kode, nama, produk..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">Semua Status</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
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
          <option value={100}>100</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : orders.length === 0 ? (
        <EmptyState title="Belum ada pesanan" />
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
            const draftStatus = statusDraft[order.id] ?? order.status;
            const hasStatusChange = draftStatus !== order.status;
            const isUpdating = updatingId === order.id;

            return (
              <div key={order.id} className="card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-900">{order.order_code}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
                        {order.delivery_type === "delivery" ? "Pengantaran Cepu" : "Pick-Up Store"}
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{order.product_name}</p>
                    <p className="text-sm text-gray-500">{order.category_name}</p>
                    {order.items?.length > 0 && (
                      <div className="mt-2 rounded-lg bg-gray-50 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Detail Produk</p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              • {item.product_name} — {item.quantity}x — {formatCurrency(item.subtotal)}
                              {item.bottle_type && (
                                <span className="text-gray-500"> ({item.bottle_type} {item.bottle_size})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-3 grid gap-1 text-sm text-gray-600 sm:grid-cols-2">
                      <p>
                        <strong>Customer:</strong> {order.customer_name}
                      </p>
                      <p>
                        <strong>Telepon:</strong> {order.customer_phone}
                      </p>
                      {order.delivery_area_name && (
                        <p>
                          <strong>Area:</strong> {order.delivery_area_name}
                        </p>
                      )}
                      {order.customer_address && (
                        <p>
                          <strong>Alamat:</strong> {order.customer_address}
                        </p>
                      )}
                      <p>
                        <strong>Jumlah:</strong> {order.quantity}
                      </p>
                      {order.bottle_type && (
                        <p>
                          <strong>Botol:</strong> {order.bottle_type} {order.bottle_size}
                        </p>
                      )}
                      <p>
                        <strong>Total:</strong> {formatCurrency(order.total_price)}
                      </p>
                      {order.delivery_fee > 0 && (
                        <p>
                          <strong>Ongkir:</strong> {formatCurrency(order.delivery_fee)}
                        </p>
                      )}
                    </div>
                    {order.notes && (
                      <p className="mt-2 text-sm text-gray-500">
                        <strong>Catatan:</strong> {order.notes}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>

                  {isAuthenticated && (
                    <div className="w-full shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-4 lg:w-64">
                      <p className="mb-2 text-sm font-medium text-gray-700">Update Status</p>
                      <select
                        value={draftStatus}
                        onChange={(e) => handleStatusDraftChange(order.id, e.target.value)}
                        className="input-field w-full text-sm"
                        disabled={isUpdating}
                      >
                        {Object.entries(ORDER_STATUS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => saveStatus(order)}
                        disabled={isUpdating || !hasStatusChange}
                        className="btn-primary mt-3 w-full text-sm"
                      >
                        <Save className="h-4 w-4" />
                        {isUpdating ? "Menyimpan..." : "Simpan Status"}
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(order)}
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus Pesanan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
