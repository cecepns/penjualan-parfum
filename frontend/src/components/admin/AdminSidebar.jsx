import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  X,
  Sparkles,
  Tags,
  Truck,
  Settings,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/kategori", label: "Kategori", icon: Tags },
  { to: "/admin/produk", label: "Katalog", icon: Package },
  { to: "/admin/pengantaran", label: "Area Pengantaran", icon: Truck },
  { to: "/admin/pesanan", label: "Lihat Pesanan", icon: ShoppingCart },
  { to: "/admin/laporan", label: "Laporan Penjualan", icon: BarChart3 },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function AdminSidebar({ open, onClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Admin Panel</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <p className="mb-2 truncate text-sm font-medium text-gray-900">{user?.name}</p>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
