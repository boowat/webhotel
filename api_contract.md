# API Contract — Search Available Rooms

| Field        | Value                              |
|--------------|------------------------------------|
| Author       | Madun                              |
| Project      | hotel-bookings                     |
| Version      | v1.0.0                             |
| Status       | Draft                              |
| Last Updated | 2026-06-24                         |

---

## User Story

> **As a** Traveler,  
> **I want to** search rooms by date and number of guests,  
> **So that** I can find available rooms for my stay.

---

## Endpoint

```
GET /api/v1/rooms/available
```

---

## Request

### Headers

| Key             | Value              | Required |
|-----------------|--------------------|----------|
| `Content-Type`  | `application/json` | Yes      |
| `Accept`        | `application/json` | Yes      |

### Query Parameters

| Parameter        | Type     | Required | Format       | Description                                         |
|------------------|----------|----------|--------------|-----------------------------------------------------|
| `check_in_date`  | `string` | Yes      | `YYYY-MM-DD` | Tanggal check-in tamu                               |
| `check_out_date` | `string` | Yes      | `YYYY-MM-DD` | Tanggal check-out tamu                              |
| `guests`         | `integer`| Yes      | `min: 1`     | Jumlah tamu yang akan menginap                      |
| `room_type`      | `string` | No       | enum         | Filter tipe kamar: `standard`, `deluxe`, `suite`    |
| `min_price`      | `number` | No       | `>= 0`       | Filter harga minimum per malam (IDR)                |
| `max_price`      | `number` | No       | `>= 0`       | Filter harga maksimum per malam (IDR)               |
| `page`           | `integer`| No       | `min: 1`     | Nomor halaman untuk pagination (default: `1`)       |
| `limit`          | `integer`| No       | `1–100`      | Jumlah item per halaman (default: `10`, max: `100`) |

### Contoh Request

```http
GET /api/v1/rooms/available?check_in_date=2026-07-01&check_out_date=2026-07-05&guests=2&room_type=deluxe&page=1&limit=10
Accept: application/json
```

---

## Response

### Success `200 OK`

```json
{
  "status": "success",
  "message": "Available rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "id": "room-uuid-001",
        "room_number": "201",
        "room_type": "deluxe",
        "name": "Deluxe Ocean View",
        "description": "Kamar deluxe dengan pemandangan laut dan balkon pribadi.",
        "capacity": 2,
        "bed_type": "king",
        "floor": 2,
        "price_per_night": 850000,
        "total_price": 3400000,
        "currency": "IDR",
        "images": [
          "https://cdn.hotel-bookings.com/rooms/room-201-1.jpg",
          "https://cdn.hotel-bookings.com/rooms/room-201-2.jpg"
        ],
        "amenities": ["AC", "WiFi", "TV", "Mini Bar", "Balcony", "Hot Water"],
        "is_available": true
      }
    ],
    "search_params": {
      "check_in_date": "2026-07-01",
      "check_out_date": "2026-07-05",
      "guests": 2,
      "total_nights": 4
    },
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_items": 1,
      "total_pages": 1
    }
  }
}
```

### Error `400 Bad Request` — Validasi gagal

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "check_out_date",
      "code": "INVALID_DATE_RANGE",
      "message": "check_out_date must be after check_in_date"
    },
    {
      "field": "guests",
      "code": "REQUIRED",
      "message": "guests is required and must be at least 1"
    }
  ]
}
```

### Error `422 Unprocessable Entity` — Logika bisnis gagal

```json
{
  "status": "error",
  "message": "The check-in date cannot be in the past",
  "code": "CHECKIN_DATE_IN_PAST"
}
```

### Error `404 Not Found` — Tidak ada kamar tersedia

```json
{
  "status": "success",
  "message": "No available rooms found for the given criteria",
  "data": {
    "rooms": [],
    "search_params": {
      "check_in_date": "2026-07-01",
      "check_out_date": "2026-07-05",
      "guests": 2,
      "total_nights": 4
    },
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_items": 0,
      "total_pages": 0
    }
  }
}
```

### Error `500 Internal Server Error`

```json
{
  "status": "error",
  "message": "An unexpected error occurred. Please try again later.",
  "code": "INTERNAL_SERVER_ERROR"
}
```

---

## Business Rules & Validation

| # | Rule                                                                 | HTTP Status |
|---|----------------------------------------------------------------------|-------------|
| 1 | `check_in_date` tidak boleh di masa lalu                             | `422`       |
| 2 | `check_out_date` harus setelah `check_in_date`                       | `400`       |
| 3 | Minimum menginap 1 malam                                             | `400`       |
| 4 | `guests` harus minimal 1                                             | `400`       |
| 5 | Hanya tampilkan kamar yang `capacity >= guests`                      | —           |
| 6 | Hanya tampilkan kamar yang tidak punya booking aktif di tanggal tsb  | —           |
| 7 | `total_price` dihitung dari `price_per_night × total_nights`         | —           |
| 8 | `max_price` harus `>= min_price` jika keduanya dikirim               | `400`       |

---

## Response Fields Reference

### Room Object

| Field            | Type       | Description                                      |
|------------------|------------|--------------------------------------------------|
| `id`             | `string`   | UUID unik kamar                                  |
| `room_number`    | `string`   | Nomor kamar                                      |
| `room_type`      | `string`   | Tipe kamar: `standard`, `deluxe`, `suite`        |
| `name`           | `string`   | Nama display kamar                               |
| `description`    | `string`   | Deskripsi singkat kamar                          |
| `capacity`       | `integer`  | Kapasitas maksimum tamu                          |
| `bed_type`       | `string`   | Tipe kasur: `single`, `double`, `twin`, `king`   |
| `floor`          | `integer`  | Nomor lantai                                     |
| `price_per_night`| `number`   | Harga per malam (IDR)                            |
| `total_price`    | `number`   | Total harga selama menginap (IDR)                |
| `currency`       | `string`   | Kode mata uang, default `IDR`                    |
| `images`         | `string[]` | Array URL gambar kamar                           |
| `amenities`      | `string[]` | Daftar fasilitas kamar                           |
| `is_available`   | `boolean`  | Status ketersediaan (selalu `true` di response)  |

---

## Notes

- Semua tanggal menggunakan format **ISO 8601**: `YYYY-MM-DD`
- Harga dalam satuan **IDR (Rupiah)**
- Endpoint ini bersifat **publik** (tidak memerlukan autentikasi)
- Kamar yang sudah di-booking atau `is_available = false` tidak akan muncul di hasil

---
---

# API Contract — Create Booking

| Field        | Value                              |
|--------------|-------------------------------------|
| Author       | Madun                              |
| Project      | hotel-bookings                     |
| Version      | v1.0.0                             |
| Status       | Draft                              |
| Last Updated | 2026-06-26                         |

---

## User Story

> **As a** Traveler,  
> **I want to** submit my booking details and payment information,  
> **So that** I can reserve a room at my chosen hotel.

---

## Endpoint

```
POST /api/bookings
```

---

## Request

### Headers

| Key             | Value              | Required |
|-----------------|--------------------|----------|
| `Content-Type`  | `application/json` | Yes      |
| `Accept`        | `application/json` | Yes      |

### Body (JSON)

| Field              | Type      | Required | Description                                      |
|--------------------|-----------|----------|--------------------------------------------------|
| `hotel_id`         | `string`  | Yes      | ID hotel dari daftar hotel                       |
| `room_id`          | `string`  | Yes      | ID kamar yang dipilih                            |
| `check_in_date`    | `string`  | Yes      | Tanggal check-in (`YYYY-MM-DD`)                  |
| `check_out_date`   | `string`  | Yes      | Tanggal check-out (`YYYY-MM-DD`)                 |
| `guests`           | `integer` | Yes      | Jumlah tamu (`min: 1`)                           |
| `guest_first_name` | `string`  | Yes      | Nama depan tamu                                  |
| `guest_last_name`  | `string`  | Yes      | Nama belakang tamu                               |
| `guest_email`      | `string`  | Yes      | Email tamu (format valid)                        |
| `guest_phone`      | `string`  | No       | Nomor telepon tamu                               |
| `card_number`      | `string`  | Yes      | Nomor kartu kredit (lolos Luhn check)            |
| `card_expiry`      | `string`  | Yes      | Masa berlaku kartu (`MM/YY`)                     |
| `card_cvc`         | `string`  | Yes      | CVC kartu (3–4 digit)                            |

### Contoh Request

```http
POST /api/bookings
Content-Type: application/json
Accept: application/json

{
  "hotel_id": "aurora-bali-resort",
  "room_id": "ocean-villa",
  "check_in_date": "2026-07-01",
  "check_out_date": "2026-07-05",
  "guests": 2,
  "guest_first_name": "Jordan",
  "guest_last_name": "Lee",
  "guest_email": "jordan@example.com",
  "guest_phone": "+62 812 3456 7890",
  "card_number": "4242424242424242",
  "card_expiry": "12/28",
  "card_cvc": "123"
}
```

---

## Response

### Success `201 Created`

```json
{
  "status": "success",
  "message": "Booking confirmed successfully",
  "data": {
    "booking_id": "uuid-string",
    "booking_ref": "LUMI-ABC123",
    "hotel": {
      "id": "aurora-bali-resort",
      "name": "Aurora Bali Resort & Spa",
      "city": "Uluwatu, Bali",
      "country": "Indonesia"
    },
    "room": {
      "id": "ocean-villa",
      "name": "Ocean Cliff Villa"
    },
    "check_in_date": "2026-07-01",
    "check_out_date": "2026-07-05",
    "nights": 4,
    "guests": 2,
    "guest": {
      "first_name": "Jordan",
      "last_name": "Lee",
      "email": "jordan@example.com"
    },
    "pricing": {
      "price_per_night": 210,
      "room_total": 840,
      "service_fee": 67,
      "taxes": 84,
      "total": 991,
      "currency": "USD"
    },
    "status": "confirmed",
    "created_at": "2026-06-26T10:30:00.000Z",
    "notification": {
      "email_sent": true,
      "email_preview_url": "https://ethereal.email/message/..."
    }
  }
}
```

### Error `400 Bad Request` — Validasi gagal

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "guest_email",
      "code": "INVALID_EMAIL",
      "message": "A valid guest_email is required"
    },
    {
      "field": "card_number",
      "code": "INVALID_CARD",
      "message": "card_number failed Luhn check"
    }
  ]
}
```

### Error `404 Not Found` — Hotel / Room tidak ditemukan

```json
{
  "status": "error",
  "message": "Hotel not found",
  "code": "HOTEL_NOT_FOUND"
}
```

### Error `409 Conflict` — Kamar sudah di-booking pada tanggal tersebut

```json
{
  "status": "error",
  "message": "This room is already booked for the selected dates",
  "code": "ROOM_NOT_AVAILABLE"
}
```

### Error `422 Unprocessable Entity` — Logika bisnis gagal

```json
{
  "status": "error",
  "message": "The check-in date cannot be in the past",
  "code": "CHECKIN_DATE_IN_PAST"
}
```

### Error `500 Internal Server Error`

```json
{
  "status": "error",
  "message": "An unexpected error occurred. Please try again later.",
  "code": "INTERNAL_SERVER_ERROR"
}
```

---

## Business Rules & Validation

| # | Rule                                                                   | HTTP Status |
|---|------------------------------------------------------------------------|-------------|
| 1 | Semua field required harus diisi                                       | `400`       |
| 2 | `check_in_date` tidak boleh di masa lalu                               | `422`       |
| 3 | `check_out_date` harus setelah `check_in_date`                         | `422`       |
| 4 | `guests` harus minimal 1                                               | `400`       |
| 5 | `guests` tidak boleh melebihi `maxGuests` kamar                        | `422`       |
| 6 | `card_number` harus lolos Luhn check                                   | `400`       |
| 7 | `card_expiry` harus dalam format `MM/YY` dan belum expired             | `400`       |
| 8 | `hotel_id` harus merujuk ke hotel yang valid                           | `404`       |
| 9 | `room_id` harus merujuk ke kamar yang valid di hotel tersebut          | `404`       |
| 10| Kamar tidak boleh double-booked pada tanggal yang sama                 | `409`       |
| 11| Pricing dihitung server-side: `room_total = price_per_night × nights`  | —           |
| 12| Service fee = 8% dari room total, Tax = 10% dari room total           | —           |

---

## Response Fields Reference

### Booking Object

| Field            | Type       | Description                                      |
|------------------|------------|--------------------------------------------------|
| `booking_id`     | `string`   | UUID unik booking                                |
| `booking_ref`    | `string`   | Referensi booking (format: `LUMI-XXXXXX`)        |
| `hotel`          | `object`   | Info hotel (`id`, `name`, `city`, `country`)      |
| `room`           | `object`   | Info kamar (`id`, `name`)                        |
| `check_in_date`  | `string`   | Tanggal check-in (ISO 8601)                      |
| `check_out_date` | `string`   | Tanggal check-out (ISO 8601)                     |
| `nights`         | `integer`  | Jumlah malam menginap                            |
| `guests`         | `integer`  | Jumlah tamu                                      |
| `guest`          | `object`   | Info tamu (`first_name`, `last_name`, `email`)   |
| `pricing`        | `object`   | Breakdown harga (lihat tabel di bawah)           |
| `status`         | `string`   | Status booking: `confirmed`                      |
| `created_at`     | `string`   | Timestamp pembuatan booking (ISO 8601)           |
| `notification`   | `object`   | Status pengiriman notifikasi email               |

### Pricing Object

| Field            | Type       | Description                                      |
|------------------|------------|--------------------------------------------------|
| `price_per_night`| `number`   | Harga per malam                                  |
| `room_total`     | `number`   | Total harga kamar (price × nights)               |
| `service_fee`    | `number`   | Biaya layanan (8%)                               |
| `taxes`          | `number`   | Pajak (10%)                                      |
| `total`          | `number`   | Total keseluruhan                                |
| `currency`       | `string`   | Kode mata uang                                   |

### Notification Object

| Field              | Type              | Description                                       |
|--------------------|-------------------|---------------------------------------------------|
| `email_sent`       | `boolean`         | `true` jika email konfirmasi berhasil dikirim     |
| `email_preview_url`| `string \| null`  | URL preview Ethereal (hanya di development mode)  |

---

## Notes

- Semua tanggal menggunakan format **ISO 8601**: `YYYY-MM-DD`
- Pricing dihitung di **server-side** untuk memastikan konsistensi
- Data kartu kredit **tidak disimpan** — hanya divalidasi (demo mode)
- Booking reference di-generate server-side dengan format `LUMI-XXXXXX`
- Endpoint ini bersifat **publik** (tidak memerlukan autentikasi)
- Overlap detection: booking ditolak jika kamar yang sama sudah di-booking pada rentang tanggal yang bersinggungan
- **Email konfirmasi** dikirim otomatis ke `guest_email` setelah booking berhasil
- Di **development mode** (tanpa SMTP config), email dikirim via [Ethereal](https://ethereal.email) dan `email_preview_url` berisi link untuk melihat email
- Di **production**, set env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`