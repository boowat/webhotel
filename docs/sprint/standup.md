# Daily Standup — Async Log

Log update harian tim, async (ga perlu meeting). Board Epic/Story/Task ada di [epics.md](epics.md).

## Cara Pakai

1. Tiap hari kerja, tambah entry baru di bawah tanggal hari ini (buat heading tanggal baru kalau belum ada)
2. Isi 4 poin: Kemarin, Hari ini, Blocker, Terkait (link ke Epic/Story di epics.md)
3. Entry terbaru ditaruh paling atas (newest first)
4. Kalau ada blocker, tandai juga statusnya jadi ⚪ Blocked di epics.md biar kelihatan di board

### Template Jangan diubah

```
### [Name] — [YYYY-MM-DD]
- Yesteday: 
- Today: 
- Blockers: 
- Notes:
- Connections: Epic X / Story X.Y
```

---

## Sandi Miftah - 2026-07-17
- Yesteday: 
- Today: 
- Blockers: 
- Notes:
- Connections: Epic X / Story X.Y

### Sandi Miftah - 2026-07-16
- Kemarin: Testing endpoint booking API (`/api/bookings`), setup awal i18n (next-intl, English dulu)
- Hari ini: Lanjut setup i18n biar scalable buat multi-bahasa, mulai upgrade Tailwind v3 → v4
- Blocker: `SELF_SIGNED_CERT_IN_CHAIN` pas install package (kemungkinan dari Cloudflare WARP) — install `@tailwindcss/upgrade` sempat gagal, lagi dicoba manual
- Terkait: Epic 1 / Story 1 (booking endpoint) + Icebox "Multi-bahasa (ID + EN)"

### Sandi Miftah - 2026-07-06
- Kemarin: Menentukan warna-warna untuk project sesuai dengan mood board
- Hari ini: Memindahkan fitur kalendar ke banner / heroes
- Blocker: Harus dibiasakan melakukan mobile first design
- Terkait: Epic 1 / Story 1
