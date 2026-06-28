import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import CategoriesPublicPage from "@/pages/CategoriesPublicPage";
import CartPage from "@/pages/CartPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import LoginPage from "@/pages/admin/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ProductsPage from "@/pages/admin/ProductsPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import DeliveryAreasPage from "@/pages/admin/DeliveryAreasPage";
import OrdersPage from "@/pages/admin/OrdersPage";
import SalesReportPage from "@/pages/admin/SalesReportPage";
import SettingsPage from "@/pages/admin/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="kategori" element={<CategoriesPublicPage />} />
            <Route path="katalog" element={<CatalogPage />} />
            <Route path="keranjang" element={<CartPage />} />
            <Route path="produk/:slug" element={<ProductDetailPage />} />
          </Route>

          <Route path="admin/login" element={<LoginPage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="kategori" element={<CategoriesPage />} />
            <Route path="produk" element={<ProductsPage />} />
            <Route path="pengantaran" element={<DeliveryAreasPage />} />
            <Route path="pesanan" element={<OrdersPage />} />
            <Route path="laporan" element={<SalesReportPage />} />
            <Route path="pengaturan" element={<SettingsPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
