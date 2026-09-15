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
- Yesterday:
- Today:
- Blockers:
- Notes:
- Connections: Epic X / Story X.Y
```

---

### Sandi Miftah - 2026-09-15

- Yesterday: Patch update to system, renaming and make sure zod installed
- Today: Since the system work till email, I can directly handle dashboard admin as well. On Hotel Admin
- Blockers: I have not made the admin area for hotel owner and admin for dash.boowat.com
- Notes: Turnout it already success till the checkout. Just make sure to fix some logic and also validation.
- Connections: EPIC 1 / Story 1, Story 2, Story 3

### Sandi Miftah - 2026-09-14

- Yesterday: Fixing search result, fixing detail page
- Today:
  - Add back button on pages
  - Rename Stays with Home
  - If possible, change input dropdown into modal/popup
- Blockers:
  - Still not working till checkout, need simulation payment gateway, whether midtrans or xendit
  - Still not finishing homepage
- Notes:
  - First focusing on small changes
  - Make sure validation applied, the detail sometime got missed

### Sandi Miftah - 2026-09-13

- Yesteday: git checkout on old log to see whats not working?
- Today: Several things I will do today: - fix error on search result, add await on const match. - fix detail room, do several db migrate, seed etc.
- Blockers: Still not working till checkout, need simulation payment gateway, whether midtrans or xendit
- Notes: - Next step, focus on redesign checkout form if click reserve now on detail page, make the modal as in homepage. - Make sure to install validation using zod (make sure the max capacity of a room/guest before clicking search). - Make sure to maintain styling consistency across every pages, like buttons, input fields rtc. - Make sure to give interactive and necessity button (back/previous/home) that easier for visitor to surf your page - Fix mobile view, let the order button on checkout becoming sticky on the bottom.

### Sandi Miftah - 2026-07-28

- Yesterday: Finalizing result search filter
- Today: create room detail. Fix dummy data. This webhotel only meant for 1 hotel, not an OTA apps
- Blockers: Daisy UI need to implement, yet not now
- Notes:
- Connections: Epic: Reservation System & Room Booking / Story 2

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
