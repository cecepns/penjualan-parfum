import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import LoginPage from "@/pages/admin/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ProductsPage from "@/pages/admin/ProductsPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import DeliveryAreasPage from "@/pages/admin/DeliveryAreasPage";
import OrdersPage from "@/pages/admin/OrdersPage";
import SettingsPage from "@/pages/admin/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="katalog" element={<CatalogPage />} />
          <Route path="produk/:slug" element={<ProductDetailPage />} />
        </Route>

        <Route path="admin/login" element={<LoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="kategori" element={<CategoriesPage />} />
          <Route path="produk" element={<ProductsPage />} />
          <Route path="pengantaran" element={<DeliveryAreasPage />} />
          <Route path="pesanan" element={<OrdersPage />} />
          <Route path="pengaturan" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
