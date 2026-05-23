# Sistem Informasi Penjualan Parfum UMKM

Rancang Bangun Sistem Informasi Penjualan Parfum Berbasis Website dengan Integrasi WhatsApp dan Metode Pick-Up Store pada UMKM — termasuk **sistem pengantaran barang sekitar Kota Cepu**.

## Fitur

### Customer (Publik)
- Halaman Beranda
- Katalog parfum (refill per ml, berbagai aroma, jenis botol & ukuran)
- Detail produk (harga per ml, jenis botol, ukuran)
- Pesan via WhatsApp (pesan otomatis terisi)
- Pick-Up Store atau Pengantaran area Cepu

### Admin
- Login admin
- Dashboard statistik
- Kelola produk (CRUD + upload gambar)
- Lihat & kelola pesanan

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS + PWA + Lucide React + react-hot-toast
- **Backend:** Express.js + MySQL
- **Auth:** JWT

## Instalasi

### 1. Database

```bash
mysql -u root -p < backend/sql/database.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL dan nomor WhatsApp
npm install
npm run dev
```

Server berjalan di `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`

## Login Admin

- **Username:** `admin`
- **Password:** `admin123`

## WhatsApp

Atur nomor WhatsApp di:
- `backend/.env` → `WHATSAPP_NUMBER=628xxxxxxxxxx`
- atau tabel `settings` di database

Pesan default saat order:
> Hallo kak, saya ingin membeli parfum (nama produk)

## Pengantaran Cepu

Area pengantaran tersedia di tabel `delivery_areas` (kelurahan sekitar Kota Cepu). Customer memilih area saat order dengan metode pengantaran.

## Struktur Folder

```
penjualan-parfum/
├── backend/
│   ├── server.js
│   ├── sql/database.sql
│   └── uploads-penjualan-parfum/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── utils/
│       └── hooks/
└── README.md
```
# penjualan-parfum
