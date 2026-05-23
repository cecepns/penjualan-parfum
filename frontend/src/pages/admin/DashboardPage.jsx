import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Layers, Clock } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { formatDate, ORDER_STATUS } from "@/utils/format";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(API_ENDPOINTS.ADMIN.DASHBOARD)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const stats = [
    { label: "Total Produk", value: data.totalProducts, icon: Package, color: "bg-blue-500" },
    { label: "Produk Aktif", value: data.activeProducts, icon: Layers, color: "bg-green-500" },
    { label: "Total Pesanan", value: data.totalOrders, icon: ShoppingCart, color: "bg-purple-500" },
    { label: "Pesanan Pending", value: data.pendingOrders, icon: Clock, color: "bg-amber-500" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p className="mt-1 text-gray-600">Ringkasan sistem penjualan parfum UMKM</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pesanan Terbaru</h3>
          <Link to="/admin/pesanan" className="text-sm text-primary-600 hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Kode</th>
                <th className="pb-3 pr-4">Produk</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Metode</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => {
                const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                return (
                  <tr key={order.id} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-medium">{order.order_code}</td>
                    <td className="py-3 pr-4">{order.product_name}</td>
                    <td className="py-3 pr-4">{order.customer_name}</td>
                    <td className="py-3 pr-4 capitalize">
                      {order.delivery_type === "delivery" ? "Antar Cepu" : "Pick-Up"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(order.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
