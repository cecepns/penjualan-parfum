import { Link, useSearchParams } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { getCategoryIcon } from "@/utils/categoryIcons";

export default function CategorySidebar({ categories = [], className = "" }) {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  return (
    <aside className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">Kategori</h2>
      <nav className="space-y-1">
        <Link
          to="/katalog"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            !activeCategory
              ? "bg-primary-50 text-primary-700"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <LayoutGrid className="h-5 w-5 shrink-0" />
          Semua Produk
        </Link>
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const isActive = activeCategory === cat.slug;
          return (
            <Link
              key={cat.id}
              to={`/katalog?category=${cat.slug}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {cat.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
