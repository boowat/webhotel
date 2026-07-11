-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LockStatus" AS ENUM ('ACTIVE', 'RELEASED', 'CONVERTED');

-- CreateTable
CREATE TABLE "room_inventory" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_units" INTEGER NOT NULL,
    "booked_units" INTEGER NOT NULL DEFAULT 0,
    "locked_units" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "room_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_locks" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "room_inventory_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "LockStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "booking_ref" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "nights" INTEGER NOT NULL,
    "guests_count" INTEGER NOT NULL,
    "price_per_night" DECIMAL(12,2) NOT NULL,
    "room_total" DECIMAL(12,2) NOT NULL,
    "service_fee" DECIMAL(12,2) NOT NULL,
    "taxes" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "payment_deadline" TIMESTAMP(3),
    "snap_token" TEXT,
    "snap_redirect_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "gateway_ref" TEXT,
    "midtrans_order_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "room_inventory_room_id_date_idx" ON "room_inventory"("room_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "room_inventory_room_id_date_key" ON "room_inventory"("room_id", "date");

-- CreateIndex
CREATE INDEX "room_locks_status_expires_at_idx" ON "room_locks"("status", "expires_at");

-- CreateIndex
CREATE INDEX "room_locks_booking_id_idx" ON "room_locks"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "guests_email_key" ON "guests"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_ref_key" ON "bookings"("booking_ref");

-- CreateIndex
CREATE INDEX "bookings_status_payment_deadline_idx" ON "bookings"("status", "payment_deadline");

-- CreateIndex
CREATE INDEX "bookings_room_id_check_in_check_out_idx" ON "bookings"("room_id", "check_in", "check_out");

-- CreateIndex
CREATE INDEX "bookings_guest_id_idx" ON "bookings"("guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_midtrans_order_id_key" ON "payments"("midtrans_order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- AddForeignKey
ALTER TABLE "room_locks" ADD CONSTRAINT "room_locks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_locks" ADD CONSTRAINT "room_locks_room_inventory_id_fkey" FOREIGN KEY ("room_inventory_id") REFERENCES "room_inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
