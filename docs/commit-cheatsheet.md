# Cheatsheet: Commit Bersih di Repo Ini

Sejak husky terpasang, tiap `git commit` lewat dua gerbang:

| Hook         | Jalanin                                                                           | Kalau gagal                                                |
| ------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `pre-commit` | `lint-staged` — `eslint --fix` + `prettier --write` di file yang di-**stage** aja | Commit batal, perubahan lu aman (lint-staged auto-restore) |
| `commit-msg` | `commitlint` — cek format pesan commit                                            | Commit batal, pesan ditolak                                |

---

## 1. Format pesan commit

```
<type>: <subject>
```

**Tipe yang diterima:**

`feat` · `feature` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `config` · `revert` · `i18n`

`feature` dan `config` sengaja ditambahin karena udah jadi kebiasaan di repo ini — bukan bagian dari conventional commits standar.

**Lolos:**

```
feat: add mini room cards on detail page
feature: pakai gaya lama juga boleh
fix: load .env.local in prisma.config.ts
config: install husky dan commitlint
i18n: pindahin copy search ke message file
```

**Ditolak:**

```
fix error                                  <- ga ada titik dua, type kosong
arahakan tombol search ke halaman hasil    <- ga ada type sama sekali
Update page.tsx                            <- sama, ga ada type
```

Subject boleh bahasa Indonesia dan boleh huruf besar — aturan `subject-case` dimatiin. Yang wajib cuma `type: ` di depan.

Scope opsional: `feat(search): ...` juga valid.

---

## 2. Jebakan paling sering: file lama yang lint-nya udah merah

Ada **24 error eslint** yang udah ada sebelum husky dipasang. Kalau file di bawah ini masuk ke commit lu, `pre-commit` bakal nolak — walaupun error-nya bukan lu yang bikin:

| File                                        | Jumlah | Isunya                                   |
| ------------------------------------------- | ------ | ---------------------------------------- |
| `src/lib/db/midtrans.ts`                    | 10     | `no-explicit-any`                        |
| `src/app/api/bookings/route.ts`             | 7      | `no-unused-vars`, `no-explicit-any`      |
| `src/components/BookingFlow.tsx`            | 7      | `no-explicit-any`, `set-state-in-effect` |
| `src/lib/db/booking-service.ts`             | 3      | `no-unused-vars`, `no-explicit-any`      |
| `src/app/api/bookings/[id]/status/route.ts` | 2      | `no-explicit-any`                        |
| `src/app/api/cron/expire-locks/route.ts`    | 1      | `no-explicit-any`                        |
| `src/app/api/midtrans/webhook/route.ts`     | 1      | `no-explicit-any`                        |
| `src/components/BookingWidget.tsx`          | 1      | `set-state-in-effect`                    |
| `src/components/navigations/Header.tsx`     | 1      | `no-unused-vars`                         |
| `src/hooks/useCallyValue.ts`                | 1      | `refs`                                   |

Cek dulu sebelum commit:

```bash
npx eslint <file-yang-mau-di-commit>
```

Kalau kena, tiga pilihan:

1. **Beresin error-nya** — paling bener, sekalian ngurangin utang. `no-unused-vars` biasanya tinggal hapus import.
2. **Pisahin commit** — commit file yang bersih dulu, file bermasalah belakangan.
3. **Lewati hook** (darurat aja): `git commit --no-verify -m "..."`. Jangan dijadiin kebiasaan; ini juga ngelewatin commitlint.

---

## 3. Alur commit yang aman

```bash
# 1. lihat apa yang berubah
git status --short

# 2. stage yang mau dicommit aja, jangan git add -A kalau lagi campur
git add src/app/rooms/[roomId]/page.tsx

# 3. cek lint file itu duluan (opsional tapi ngirit waktu)
npx eslint src/app/rooms/[roomId]/page.tsx

# 4. commit
git commit -m "feat: tambah thumbnail di other room types"
```

Kalau `pre-commit` ngerapihin format, hasilnya otomatis ikut ke-stage — ga perlu `git add` ulang.

---

## 4. Kalau hook-nya kelihatan ga jalan

```bash
git config core.hooksPath        # harus: .husky/_
bunx husky                       # pasang ulang kalau kosong
```

Habis clone baru atau `bun install`, script `prepare` yang masang husky. Kalau ternyata ga kepasang, jalanin `bunx husky` manual sekali.

---

## 5. Catatan lingkungan

**Cloudflare WARP + install paket.** `bun add` bakal gagal `SELF_SIGNED_CERT_IN_CHAIN` karena WARP nandatanganin ulang TLS pakai root-nya sendiri. Jalan keluarnya udah dipasang di `~/.bunfig.toml`, nunjuk ke `~/.bun/win-root-ca.pem` (hasil ekspor root store Windows). Kalau suatu saat error itu balik lagi, generate ulang PEM-nya — WARP kemungkinan ganti CA. npm ga kena karena `~/.npmrc` udah `strict-ssl=false`.

**Dua lockfile.** Repo punya `bun.lock` dan `package-lock.json`. husky, lint-staged, dan commitlint cuma tercatat di `bun.lock`. Selama belum dibuang salah satu, pakai `bun install` biar konsisten — `npm ci` bakal beda isi.

**Dev server.** Kalau `npm run dev` output-nya kosong, itu karena rtk nge-buffer proses yang jalan lama. Pakai `rtk proxy npm run dev` buat lihat log-nya live.

---

## 6. Referensi cepat

| Mau                            | Perintah                                    |
| ------------------------------ | ------------------------------------------- |
| Cek pesan commit tanpa commit  | `echo "feat: coba" \| bunx commitlint`      |
| Jalanin hook pre-commit manual | `bunx lint-staged`                          |
| Lint seluruh project           | `npm run lint` (24 error lama bakal muncul) |
| Lint file tertentu             | `npx eslint <file>`                         |
| Typecheck                      | `npx tsc --noEmit --incremental false`      |
| Test fixture                   | `npm test`                                  |
| Build                          | `npm run build`                             |

Kalau `tsc` ngeluh soal `.next/dev/types/validator.ts`, itu file generated yang lagi ditulis dev server — matiin dev server, `rm -rf .next/dev`, ulangi.
