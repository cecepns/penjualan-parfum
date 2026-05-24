import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Sparkles } from "lucide-react";

export default function Footer({ settings }) {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                {settings?.store_name || "Parfum Rajawali Cepu"}
              </span>
            </div>
            <p className="mt-4 text-sm">
              Sistem Informasi Penjualan Parfum berbasis website dengan integrasi WhatsApp,
              Pick-Up Store, dan pengantaran sekitar Kota Cepu.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Menu</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400">Beranda</Link></li>
              <li><Link to="/katalog" className="hover:text-primary-400">Katalog Produk</Link></li>
              <li><Link to="/katalog?category=parfum" className="hover:text-primary-400">Parfum</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Kontak & Layanan</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                {settings?.store_address || "Kota Cepu, Kab. Blora, Jateng"}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-400" />
                {settings?.store_phone || "-"}
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                <span>
                  Pick-Up Store & Pengantaran area Cepu
                  <br />
                  {settings?.pickup_info || "Jam: 08.00 - 20.00 WIB"}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          © {new Date().getFullYear()} Sistem Penjualan Parfum Rajawali Cepu — Rancang Bangun Sistem Informasi
        </div>
      </div>
    </footer>
  );
}
