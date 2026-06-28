import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { formatCurrency, formatDate, ORDER_STATUS } from "@/utils/format";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function SalesReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(monthStartStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const fetchReport = () => {
    setLoading(true);
    api
      .get(API_ENDPOINTS.ADMIN.SALES_REPORT, {
        params: { start_date: startDate, end_date: endDate, page, limit, search },
      })
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, page, limit, search]);

  const summary = data?.summary;
  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h2>
      <p className="mt-1 text-gray-600">Rekap penjualan berdasarkan rentang tanggal</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="input-field w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="input-field w-auto"
          />
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari kode, customer..."
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
          <option value={100}>100</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <>
          {summary && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card">
                <p className="text-sm text-gray-500">Total Pesanan</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_orders}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500">Total Omzet</p>
                <p className="text-2xl font-bold text-primary-700">{formatCurrency(summary.total_revenue)}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500">Pesanan Selesai</p>
                <p className="text-2xl font-bold text-green-600">{summary.completed_orders}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500">Omzet Selesai</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.completed_revenue)}</p>
              </div>
            </div>
          )}

          {summary?.daily?.length > 0 && (
            <div className="mt-6 card overflow-x-auto">
              <h3 className="mb-4 text-lg font-semibold">Rekap Harian</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-4">Tanggal</th>
                    <th className="pb-3 pr-4">Jumlah Pesanan</th>
                    <th className="pb-3">Total Omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.daily.map((row) => (
                    <tr key={row.date} className="border-b border-gray-50">
                      <td className="py-3 pr-4">{row.date}</td>
                      <td className="py-3 pr-4">{row.order_count}</td>
                      <td className="py-3 font-medium">{formatCurrency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Detail Pesanan</h3>
            {orders.length === 0 ? (
              <EmptyState title="Tidak ada pesanan" description="Tidak ada data pada rentang tanggal ini" />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                  return (
                    <div key={order.id} className="card">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{order.order_code}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm">
                        <strong>{order.customer_name}</strong> — {order.customer_phone}
                      </p>
                      {order.items?.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              • {item.product_name} ({item.quantity}x) — {formatCurrency(item.subtotal)}
                              {item.bottle_type && ` — ${item.bottle_type} ${item.bottle_size || ""}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-gray-600">
                          • {order.product_name} ({order.quantity}x)
                        </p>
                      )}
                      <p className="mt-2 font-bold text-primary-700">
                        Total: {formatCurrency(order.total_price)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
