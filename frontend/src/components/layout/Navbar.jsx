import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sparkles, ShoppingBag } from "lucide-react";

const navLinks = [
  { to: "/", label: "Beranda" },
  { to: "/katalog", label: "Katalog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">Parfum UMKM</span>
            <p className="text-xs text-gray-500">Cepu • Pick-Up & Delivery</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-primary-600" : "text-gray-600 hover:text-primary-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/katalog" className="btn-primary">
            <ShoppingBag className="h-4 w-4" />
            Belanja Sekarang
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-gray-600 md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium ${
                  isActive ? "text-primary-600" : "text-gray-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/katalog" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full">
            Belanja Sekarang
          </Link>
        </div>
      )}
    </header>
  );
}
