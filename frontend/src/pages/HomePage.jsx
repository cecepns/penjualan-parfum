import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  MessageCircle,
  Store,
  Truck,
  ArrowRight,
} from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import ProductCard from "@/components/ui/ProductCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import heroImage from "@/assets/hero.png";

const features = [
  {
    icon: Sparkles,
    title: "Parfum Refill",
    desc: "Harga per ml, berbagai jenis botol & ukuran",
  },
  {
    icon: Store,
    title: "Pick-Up Store",
    desc: "Ambil pesanan langsung di toko",
  },
  {
    icon: Truck,
    title: "Pengantaran Cepu",
    desc: "Layanan antar barang sekitar Kota Cepu",
  },
  {
    icon: MessageCircle,
    title: "Order via WhatsApp",
    desc: "Pesan mudah lewat WhatsApp",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(API_ENDPOINTS.PRODUCTS.LIST, { params: { limit: 8 } }),
      api.get(API_ENDPOINTS.CATEGORIES.LIST),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.data);
        setCategories(catRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAzNGg2djZoLTZ6bTAtMzBoNnY2aC02em0zMCAzMGg2djZoLTZ6bTAtMzBoNnY2aC02em0zMCAzMGg2djZoLTZ6eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                UMKM Kota Cepu
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-5xl xl:text-6xl">
                Sistem Informasi Penjualan Parfum
              </h1>
              <p className="mt-6 text-lg text-primary-100">
                Katalog parfum refill dengan harga per ml, berbagai aroma, jenis botol, dan ukuran.
                Pesan via WhatsApp dengan Pick-Up Store atau pengantaran sekitar Kota Cepu.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/katalog"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary-700 transition hover:bg-primary-50"
                >
                  Lihat Katalog
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#layanan"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10"
                >
                  Layanan Kami
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <img
                src={heroImage}
                alt="Ilustrasi botol parfum dan bunga mawar"
                className="w-full max-w-sm object-contain drop-shadow-2xl sm:max-w-md lg:max-w-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="layanan" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Layanan Kami</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-gray-600">
          Integrasi WhatsApp, Pick-Up Store, dan pengantaran barang sekitar Kota Cepu
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100">
                <f.icon className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Kategori Parfum</h2>
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/katalog?category=${cat.slug}`}
                  className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:border-primary-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <Sparkles className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="mt-3 text-sm font-medium text-gray-900">{cat.name}</span>
                </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Produk Unggulan</h2>
          <Link to="/katalog" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Lihat Semua →
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner className="py-20" />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <MessageCircle className="mx-auto h-12 w-12" />
          <h2 className="mt-4 text-2xl font-bold">Siap Memesan?</h2>
          <p className="mt-2 text-primary-100">
            Pilih produk, isi data pesanan, dan langsung terhubung ke WhatsApp kami!
          </p>
          <Link
            to="/katalog"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            Mulai Belanja
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
