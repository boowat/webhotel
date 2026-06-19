# PRD — Boowat Hotel Web Product
**Status:** Draft Internal  
**Versi:** 1.0  
**Dibuat oleh:** Boowat (PT Trivi Buat Teknologi)  
**Tanggal:** Juni 2026  
**Audience:** Internal Tim Boowat

---

## 1. Overview

### 1.1 Latar Belakang
Boowat adalah B2B web agency yang melayani sektor properti dan hotel di Jabodetabek. Produk ini adalah **standard hotel web product** yang bisa di-deploy ke client hotel manapun sebagai productized service — bukan custom build dari nol setiap kali.

### 1.2 Tujuan Produk
Menyediakan website hotel profesional dengan booking system terintegrasi, sekaligus memberikan client kendali penuh atas konten dan reservasi melalui dashboard owner yang mudah digunakan.

### 1.3 Value Proposition ke Client
- Website hotel siap pakai, tampilan profesional
- Booking langsung (direct booking) tanpa OTA fee
- Dashboard untuk kelola kamar, harga, dan reservasi sendiri
- Maintenance & support via retainer Boowat

---

## 2. Scope

### In Scope
- Website Hotel publik (Guest-facing)
- Booking System (search → select → checkout → konfirmasi)
- Dashboard Owner (manajemen kamar, reservasi, konten)
- Notifikasi email/WhatsApp untuk booking
- Integrasi payment gateway (Xendit)
- Multi-bahasa (ID + EN) — opsional per client

### Out of Scope (V1)
- Channel manager (OTA sync: Booking.com, Agoda, dll)
- Mobile app native
- PMS (Property Management System) penuh
- Multi-property dalam satu akun
- Loyalty/membership program

---

## 3. User & Roles

| Role | Deskripsi |
|---|---|
| **Guest** | Tamu yang browsing dan booking kamar via website |
| **Hotel Owner / Staff** | Operator hotel yang kelola dashboard |
| **Boowat Super Admin** | Tim Boowat untuk akses multi-tenant & support |

---

## 4. Product 1 — Website Hotel (Guest-Facing)

### 4.1 Tujuan
Website publik yang merepresentasikan brand hotel dan menjadi channel direct booking.

### 4.2 Halaman Utama

| Halaman | Keterangan |
|---|---|
| **Homepage** | Hero, tagline, CTA booking, highlight fasilitas |
| **Kamar & Tipe** | List tipe kamar dengan foto, deskripsi, harga |
| **Detail Kamar** | Foto galeri, fasilitas, kebijakan, tombol book |
| **Fasilitas Hotel** | Kolam renang, restoran, meeting room, dll |
| **Tentang Hotel** | Sejarah, lokasi, kontak |
| **Galeri** | Foto hotel & kamar |
| **Kontak & Lokasi** | Google Maps embed, form inquiry |

### 4.3 Booking Flow

```
Guest pilih tanggal check-in/out
  → Sistem tampilkan kamar tersedia
  → Guest pilih tipe kamar + jumlah
  → Isi data tamu (nama, email, HP)
  → Pilih metode pembayaran
  → Checkout via Xendit (transfer/VA/CC/QRIS)
  → Konfirmasi booking via email + WhatsApp
  → Booking masuk ke Dashboard Owner
```

### 4.4 Fitur Utama

- **Availability checker** — kalender real-time berdasarkan kamar yang tersedia
- **Price snapshotting** — harga dikunci saat booking, tidak berubah walau owner update harga
- **Booking confirmation page** — dengan booking code & ringkasan
- **Email & WA notification** — otomatis ke tamu setelah booking
- **Pembatalan & refund policy** — ditampilkan transparan saat checkout
- **Responsive design** — mobile-first

---

## 5. Product 2 — Dashboard Owner

### 5.1 Tujuan
Panel admin khusus untuk hotel owner/staff untuk mengelola operasional digital hotel tanpa perlu akses teknis.

### 5.2 Modul & Fitur

#### 5.2.1 Dashboard Home
- Summary: total reservasi hari ini, minggu ini, bulan ini
- Revenue summary (dari booking yang completed)
- Notifikasi booking baru masuk
- Occupancy rate overview

#### 5.2.2 Manajemen Kamar
- CRUD tipe kamar (nama, deskripsi, kapasitas, foto)
- Set harga per tipe kamar (harga normal, weekend, promo)
- Set jumlah unit per tipe
- Tandai kamar sebagai tidak tersedia (maintenance/blocked)

#### 5.2.3 Manajemen Reservasi
- List semua reservasi (dengan filter: status, tanggal, tipe kamar)
- Detail reservasi per tamu
- Update status: Pending → Confirmed → Checked In → Checked Out → Cancelled
- Tambah catatan internal per reservasi
- Manual booking (add reservasi dari telepon/walk-in)

#### 5.2.4 Kalender Ketersediaan
- Tampilan kalender visual per tipe kamar
- Lihat slot yang terisi vs tersedia
- Block tanggal tertentu secara manual

#### 5.2.5 Manajemen Konten Website
- Edit teks homepage (tagline, deskripsi)
- Upload/ganti foto kamar & galeri hotel
- Update info kontak & lokasi
- Toggle tampilkan/sembunyikan tipe kamar di website

#### 5.2.6 Laporan
- Laporan reservasi (export CSV)
- Laporan revenue per periode
- Occupancy report per tipe kamar

#### 5.2.7 Pengaturan
- Info hotel (nama, logo, alamat, kontak)
- Kebijakan hotel (check-in time, cancellation policy)
- Integrasi notifikasi (email SMTP, WhatsApp nomor tujuan)
- Ubah password akun

---

## 6. Tech Stack (Boowat Standard)

| Layer | Stack |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js Route Handlers / API Routes |
| **Database** | Supabase (PostgreSQL + Storage untuk foto) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js atau Supabase Auth |
| **Payment** | Xendit (VA, QRIS, CC) |
| **Notifikasi** | Email: Resend/Nodemailer; WA: WA Business API atau Fonnte |
| **Deployment** | VPS self-hosted via Kubernetes + Cloudflare |
| **Multi-tenant** | Host-based routing via Next.js middleware + Cloudflare DNS |

---

## 7. Multi-Tenant Architecture

Boowat mengelola multiple hotel client dalam satu platform. Setiap client mendapat:
- Subdomain sendiri (e.g., `hotelname.boowat.id`) atau custom domain
- Data terisolasi per tenant (Row Level Security di Supabase)
- Branding terpisah (logo, warna, konten)
- Dashboard Owner masing-masing

Infrastruktur dikelola terpusat oleh Boowat. Client tidak perlu urus server.

---

## 8. Non-Functional Requirements

| Aspek | Target |
|---|---|
| **Performance** | LCP < 2.5 detik, mobile-optimized |
| **Uptime** | 99.5% (SLA retainer) |
| **Security** | HTTPS, input validation, RLS database |
| **Scalability** | Arsitektur multi-tenant siap tambah client baru |
| **Aksesibilitas** | Teks readable, kontras warna memadai |

---

## 9. Deliverables per Client

Setiap engagement hotel client mencakup:

1. Setup tenant baru di platform Boowat
2. Konfigurasi domain/subdomain
3. Setup kamar & harga awal (data entry awal bersama client)
4. Konfigurasi payment gateway (Xendit atas nama client atau Boowat)
5. Konfigurasi notifikasi email & WA
6. Training penggunaan Dashboard Owner (1 sesi)
7. Go-live
8. Onboarding ke retainer (maintenance & support)

---

## 10. Open Questions

- [ ] Apakah payment gateway di-share (Boowat sebagai merchant) atau per client setup sendiri?
- [ ] WA notification via nomor Boowat atau nomor hotel sendiri?
- [ ] Apakah perlu fitur promo/voucher code di V1?
- [ ] Cancellation & refund flow seberapa otomatis (manual vs otomatis via Xendit)?
- [ ] SLA response time untuk support di retainer package?

---

*Dokumen ini adalah living document — akan diupdate seiring development berjalan.*
