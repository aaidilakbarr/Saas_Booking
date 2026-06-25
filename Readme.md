# STAY — Platform Booking Hotel & Penginapan PTPN IV

Sistem booking terpusat untuk hotel, villa, dan homestay milik PTPN IV Sumatera Utara. Aplikasi ini dikembangkan untuk memfasilitasi proses pemesanan penginapan secara modern, efisien, dan transparan di lingkungan asri perkebunan kelapa sawit dan teh PTPN IV.

---

## 🎨 Design System & Estetika (Green Pastels)

Aplikasi ini menggunakan sistem desain bertema **Green Pastels** premium yang mencerminkan nuansa perkebunan asri PTPN IV dengan menggunakan color palette berikut:
*   **Primary Accent / Muted Sage (`#659287` / `ptpn-600`)**: Digunakan untuk elemen penekanan utama, tombol primary, link aktif, dan ikon.
*   **Medium-light Sage (`#88BDA4` / `ptpn-400`)**: Digunakan untuk border sekunder dan ilustrasi.
*   **Light Pastel Sage (`#B1D3B9` / `ptpn-200`)**: Digunakan untuk border card, status badges, dan badge background.
*   **Mint Cream Background (`#E6F2DD` / `ptpn-50`)**: Digunakan sebagai ambient background tint dan panel highlights.

### Fitur Visual:
*   **Glassmorphism Cards & Panels**: Menggunakan visual semi-transparan dengan efek backdrop blur halus untuk memberikan kesan minimalis dan profesional.
*   **Ambient Glow Spheres**: Gradasi background radial halus yang menyatu dengan tema pastel hijau.
*   **Custom Date Inputs**: Mask tanggal default (`dd/mm/yyyy`) disembunyikan saat kosong dan digantikan oleh placeholder yang elegan: *"Masukkan Tanggal"*.

---

## 🚀 Fitur Utama Sistem

Sistem ini terbagi menjadi 3 panel utama berdasarkan otorisasi pengguna:

### 1. Panel Customer (Public Site)
*   **Beranda & Pencarian**: Pencarian penginapan berdasarkan nama properti, lokasi (kota), rentang tanggal check-in/check-out, serta jumlah tamu.
*   **Detail Properti & Kamar**: Informasi ketersediaan kamar, kapasitas tamu, luas kamar (m²), fasilitas, galeri foto properti, dan ulasan customer.
*   **Alur Booking Online**: Pengisian data pemesanan, konfirmasi harga otomatis, instruksi transfer bank, dan formulir pengunggahan bukti pembayaran.
*   **Riwayat Booking & Akun**: Pemantauan status reservasi (*Belum Bayar*, *Butuh Verifikasi*, *Dikonfirmasi*, *Checked In*, *Checked Out*, *Batal*).

### 2. Panel Property Manager
*   **Ringkasan Operasional**: Dashboard statistik jumlah properti aktif, kamar tersedia, reservasi masuk, tamu check-in hari ini, dan total pendapatan.
*   **Manajemen Kamar & Properti**: Kelola penambahan, pengunggahan foto, kapasitas, harga per malam, tipe kasur, dan detail fasilitas properti/kamar.
*   **Daftar Reservasi**: Pemantauan detail check-in/check-out tamu serta pengelolaan status penginapan secara langsung.

### 3. Panel Finance (Verifikasi Keuangan)
*   **Antrean Pembayaran**: Verifikasi bukti transfer bank yang diunggah oleh customer secara *real-time*.
*   **Detail Transaksi**: Validasi kesesuaian nominal transfer, data rekening bank pengirim, dan persetujuan/penolakan pembayaran reservasi.
*   **Laporan Keuangan**: Filter pencarian laporan berdasarkan rentang tanggal tertentu, pilihan properti, dan status reservasi untuk mempermudah ekspor data keuangan.

---

## 🛠️ Tech Stack

### Frontend App (`stay-frontend`)
*   **Core**: React 19, JavaScript (ES Module), React Router DOM v7
*   **Styling**: Tailwind CSS v3, Custom CSS Variables & Animations (Glassmorphism effects)
*   **State Management**: Zustand
*   **Icons**: Lucide React
*   **Animation**: Framer Motion
*   **HTTP Client**: Axios

### Backend API (`stay-api`)
*   **Core**: Laravel (REST API)
*   **Database**: MySQL / MariaDB (Migrations & Seeders included)
*   **Server**: Artisan Development Server

---

## 📁 Struktur Proyek

```text
SaaS Booking/
├── stay-api/               # Laravel Backend (REST API)
│   ├── app/
│   ├── database/           # Migrations, Seeders, & Factories
│   └── routes/api.php      # Endpoint API Routing
│
├── stay-frontend/          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, Footer, ProtectedRoute)
│   │   ├── pages/          # Halaman public, customer, manager, finance, & auth
│   │   ├── stores/         # Zustand stores (Auth & UI states)
│   │   ├── App.jsx         # Root router provider
│   │   ├── index.css       # Tailwind entry point & custom visual effects
│   │   └── main.jsx        # App entry point
│   ├── tailwind.config.js  # Redefinisi tema warna & typography
│   └── vite.config.js      # Konfigurasi bundler Vite
│
└── .gitignore              # Konfigurasi pengabaian file Git (.agent, .agents, vendor, node_modules)
```

---

## ⚙️ Petunjuk Instalasi & Cara Menjalankan

### Persyaratan Sistem
*   Node.js (versi 18+)
*   PHP (versi 8.1+) & Composer
*   Database Server (MariaDB / MySQL)

### 1. Konfigurasi Backend API
1.  Masuk ke direktori backend:
    ```bash
    cd stay-api
    ```
2.  Instal dependensi php:
    ```bash
    composer install
    ```
3.  Salin file lingkungan `.env.example` ke `.env` dan konfigurasikan koneksi database Anda:
    ```bash
    copy .env.example .env
    ```
4.  Generate app key dan jalankan database migration beserta data seeder awal:
    ```bash
    php artisan key:generate
    php artisan migrate --seed
    ```
5.  Jalankan server Laravel:
    ```bash
    php artisan serve
    ```

### 2. Konfigurasi Frontend Client
1.  Masuk ke direktori frontend:
    ```bash
    cd ../stay-frontend
    ```
2.  Instal dependensi JavaScript:
    ```bash
    npm install
    ```
3.  Jalankan development server:
    ```bash
    npm run dev
    ```
    Aplikasi web dapat diakses melalui browser pada alamat port default yang tertera di terminal (biasanya `http://localhost:5173`).
