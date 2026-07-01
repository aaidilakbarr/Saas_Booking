# STAY — Dokumentasi Teknis

Dokumentasi teknis untuk platform booking hotel & penginapan PTPN IV.

---

## Daftar Isi

1. [Arsitektur](#1-arsitektur)
2. [API Reference](#2-api-reference)
3. [Frontend Routes](#3-frontend-routes)
4. [Database Schema](#4-database-schema)
5. [Role & Permission](#5-role--permission)
6. [Development Workflow](#6-development-workflow)

---

## 1. Arsitektur

```
┌─────────────────────┐       ┌─────────────────────┐
│   stay-frontend     │ HTTP  │     stay-api        │
│   (React + Vite)    │◄─────►│   (Laravel 13)      │
│   Port 5173         │       │   Port 8000         │
└─────────────────────┘       └────────┬────────────┘
                                       │
                              ┌────────▼────────┐
                              │     MySQL /      │
                              │    MariaDB       │
                              └─────────────────┘
```

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 3, Zustand, React Router 7, Framer Motion, Lucide React, Axios |
| Backend | Laravel 13, PHP 8.3+, Sanctum (auth), SQLite/MySQL |
| Database | MySQL / MariaDB |

---

## 2. API Reference

Base URL: `http://localhost:8000/api`

### 2.1 Public Endpoints

#### Authentication

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Registrasi user baru |
| POST | `/auth/login` | Login user |
| POST | `/auth/forgot-password` | Kirim link reset password |
| POST | `/auth/reset-password` | Reset password dengan token |

#### Properties

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/properties` | Daftar properti (filter: `search`, `city`, `check_in`, `check_out`, `guests`) |
| GET | `/properties/{slug}` | Detail properti |
| GET | `/properties/{slug}/availability` | Cek ketersediaan kamar |
| GET | `/properties/{slug}/reviews` | Ulasan properti |
| GET | `/bank-accounts` | Daftar rekening bank aktif |

### 2.2 Authenticated Endpoints

**Headers:** `Authorization: Bearer {token}`

#### Profile

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/auth/me` | Data user saat ini |
| POST | `/auth/profile` | Update profil (multipart) |
| POST | `/auth/logout` | Logout |

#### Customer

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/bookings` | Buat booking baru |
| GET | `/bookings` | Riwayat booking user |
| GET | `/bookings/{booking_code}` | Detail booking |
| DELETE | `/bookings/{booking_code}` | Batalkan booking |
| POST | `/bookings/{booking_code}/payment` | Upload bukti bayar |
| POST | `/bookings/{booking_code}/review` | Kirim ulasan |

#### Property Manager

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/manager/dashboard` | Dashboard statistik |
| GET | `/manager/properties` | Daftar properti milik manager |
| POST | `/manager/properties` | Tambah properti |
| GET | `/manager/properties/{id}` | Detail properti |
| POST | `/manager/properties/{id}` | Update properti (multipart) |
| DELETE | `/manager/properties/{id}` | Hapus properti |
| POST | `/manager/properties/{id}/images` | Upload gambar properti |
| DELETE | `/manager/properties/{propertyId}/images/{imageId}` | Hapus gambar |
| GET | `/manager/properties/{id}/room-types` | Daftar tipe kamar |
| POST | `/manager/properties/{id}/room-types` | Tambah tipe kamar |
| POST | `/manager/room-types/{id}` | Update tipe kamar (multipart) |
| DELETE | `/manager/room-types/{id}` | Hapus tipe kamar |
| POST | `/manager/room-types/{id}/images` | Upload gambar kamar |

#### Manager & Finance (Shared)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/manager/bookings` | Daftar reservasi |
| GET | `/manager/bookings/{booking_code}` | Detail reservasi |
| PUT | `/manager/bookings/{booking_code}/check-in` | Check-in tamu |
| PUT | `/manager/bookings/{booking_code}/check-out` | Check-out tamu |

#### Finance

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/finance/dashboard` | Dashboard keuangan |
| GET | `/finance/payments` | Antrean pembayaran |
| GET | `/finance/payments/{id}` | Detail pembayaran |
| PUT | `/finance/payments/{id}/confirm` | Konfirmasi pembayaran |
| PUT | `/finance/payments/{id}/reject` | Tolak pembayaran |
| GET | `/finance/reports` | Laporan keuangan |
| GET | `/finance/reports/export` | Export laporan |

---

## 3. Frontend Routes

### Public

| Path | Halaman | Deskripsi |
|------|---------|-----------|
| `/` | LandingPage | Beranda |
| `/search` | SearchPage | Pencarian properti |
| `/property/:slug` | PropertyDetailPage | Detail properti & kamar |
| `/login` | LoginPage | Login |
| `/register` | RegisterPage | Registrasi |
| `/forgot-password` | ForgotPasswordPage | Lupa password |
| `/reset-password` | ResetPasswordPage | Reset password |

### Customer (login required, role: `customer`)

| Path | Halaman | Deskripsi |
|------|---------|-----------|
| `/booking/:slug/:roomTypeId` | BookingPage | Form booking |
| `/booking/confirmation/:code` | BookingConfirmationPage | Konfirmasi booking |
| `/account/bookings` | CustomerBookingList | Riwayat booking |
| `/account/bookings/:code` | CustomerBookingDetail | Detail booking |
| `/account/profile` | CustomerProfile | Edit profil |

### Manager (login required, role: `property_manager`)

| Path | Halaman | Deskripsi |
|------|---------|-----------|
| `/manager/dashboard` | ManagerDashboard | Dashboard manager |
| `/manager/properties` | ManagerPropertyList | Daftar properti |
| `/manager/properties/create` | ManagerPropertyForm | Tambah properti |
| `/manager/properties/:id/edit` | ManagerPropertyForm | Edit properti |
| `/manager/properties/:id/rooms` | ManagerRoomTypeList | Kelola tipe kamar |
| `/manager/bookings` | ManagerBookingList | Daftar reservasi |

### Finance (login required, role: `finance`)

| Path | Halaman | Deskripsi |
|------|---------|-----------|
| `/finance/dashboard` | FinanceDashboard | Dashboard finance |
| `/finance/payments` | FinancePaymentQueue | Antrean pembayaran |
| `/finance/payments/:id` | FinancePaymentDetail | Detail pembayaran |
| `/finance/reports` | FinanceReport | Laporan keuangan |

---

## 4. Database Schema

**Teknologi:** Laravel Migrations

### Models

| Model | Tabel | Keterangan |
|-------|-------|-----------|
| `User` | `users` | Semua user (customer, manager, finance) |
| `Property` | `properties` | Properti penginapan |
| `PropertyImage` | `property_images` | Galeri foto properti |
| `RoomType` | `room_types` | Tipe kamar dalam properti |
| `RoomTypeImage` | `room_type_images` | Foto tipe kamar |
| `Booking` | `bookings` | Reservasi tamu |
| `Payment` | `payments` | Pembayaran & bukti transfer |
| `Review` | `reviews` | Ulasan tamu |
| `BankAccount` | `bank_accounts` | Rekening perusahaan |

### Key Relationships

- **Property** has many **RoomType**, **PropertyImage**, **Booking**, **Review**
- **RoomType** has many **RoomTypeImage**, **Booking**
- **User** has many **Booking**, **Review**
- **Booking** has one **Payment**
- **Booking** belongs to **User**, **Property**, **RoomType**

### Booking Status Flow

```
pending → waiting_payment → pending_verification → confirmed → checked_in → checked_out
                                                                     ↓
                                                                  cancelled
```

### Payment Status

```
pending → pending_verification → confirmed / rejected
```

---

## 5. Role & Permission

Sistem menggunakan **role-based middleware** dengan 3 role:

| Role | Akses |
|------|-------|
| `customer` | Booking, riwayat, profil, ulasan |
| `property_manager` | Kelola properti & kamar, kelola reservasi |
| `finance` | Verifikasi pembayaran, laporan keuangan |

Middleware: `app/Http/Middleware/RoleMiddleware.php` — memeriksa `user.role` pada request yang terautentikasi via Sanctum.

---

## 6. Development Workflow

### Prasyarat

- Node.js 18+
- PHP 8.3+ & Composer
- MySQL / MariaDB

### Menjalankan Backend

```bash
cd stay-api
composer install
copy .env.example .env   # atur koneksi database
php artisan key:generate
php artisan migrate --seed
php artisan serve           # http://localhost:8000
php artisan queue:listen    # jalankan queue worker
```

### Menjalankan Frontend

```bash
cd stay-frontend
npm install
npm run dev                 # http://localhost:5173
```

### One-Command Dev (Backend)

```bash
composer dev
```

Menjalankan server, queue listener, logs, dan Vite secara bersamaan.

### Testing

```bash
cd stay-api
composer test
```

### Linting

```bash
cd stay-frontend
npm run lint               # oxlint
```

### Build Produksi

```bash
cd stay-frontend
npm run build              # output di stay-frontend/dist/
```

---

## Design System

Platform menggunakan tema **Green Pastels** dengan palet warna:

| Tailwind Class | Hex | Penggunaan |
|---------------|-----|-----------|
| `ptpn-600` | `#659287` | Tombol primary, aksen |
| `ptpn-400` | `#88BDA4` | Border sekunder |
| `ptpn-200` | `#B1D3B9` | Border card, badge |
| `ptpn-50` | `#E6F2DD` | Background panel |

Efek visual: Glassmorphism (backdrop-blur), ambient glow spheres, custom date input dengan placeholder.
