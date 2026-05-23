import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate, ORDER_STATUS } from "@/utils/format";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 300);

  const fetchOrders = () => {
    setLoading(true);
    api
      .get(API_ENDPOINTS.ADMIN.ORDERS.LIST, {
        params: { page, limit, search: debouncedSearch, status },
      })
      .then((res) => {
        setOrders(res.data.data);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, debouncedSearch, status]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(API_ENDPOINTS.ADMIN.ORDERS.UPDATE_STATUS(id), { status: newStatus });
      toast.success("Status diperbarui");
      fetchOrders();
    } catch {
      toast.error("Gagal memperbarui status");
    }
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
      <p className="mt-1 text-gray-600">Kelola pesanan dari customer via WhatsApp</p>

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
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
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
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="input-field w-auto">
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
            return (
              <div key={order.id} className="card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
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
                    <div className="mt-3 grid gap-1 text-sm text-gray-600 sm:grid-cols-2">
                      <p><strong>Customer:</strong> {order.customer_name}</p>
                      <p><strong>Telepon:</strong> {order.customer_phone}</p>
                      {order.delivery_area_name && (
                        <p><strong>Area:</strong> {order.delivery_area_name}</p>
                      )}
                      {order.customer_address && (
                        <p><strong>Alamat:</strong> {order.customer_address}</p>
                      )}
                      <p><strong>Jumlah:</strong> {order.quantity}</p>
                      <p><strong>Total:</strong> {formatCurrency(order.total_price)}</p>
                      {order.delivery_fee > 0 && (
                        <p><strong>Ongkir:</strong> {formatCurrency(order.delivery_fee)}</p>
                      )}
                    </div>
                    {order.notes && (
                      <p className="mt-2 text-sm text-gray-500"><strong>Catatan:</strong> {order.notes}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="input-field w-auto text-sm"
                    >
                      {Object.entries(ORDER_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(order)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
