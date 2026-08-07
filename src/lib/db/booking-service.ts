import { prisma } from "./prisma";
import {
  ensureInventory,
  checkAvailability,
  lockInventory,
  confirmInventory,
  releaseInventory,
} from "./inventory";
import {
  createSnapTransaction,
  getBookingRefFromMidtransOrderId,
} from "./midtrans";
import { getRoom } from "../hotels";
import { nightsBetween, priceBreakdown } from "../pricing";
import type { BookingRequest } from "../schemas/booking";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface BookingResponse {
  bookingId: string;
  bookingRef: string;
  status: "PENDING" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
  paymentDeadline: string | null;
  snapToken: string | null;
  snapRedirectUrl: string | null;
}

// ------------------------------------------------------------------
// Create Booking
// ------------------------------------------------------------------

function makeBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LUMI-${out}`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function createBooking(
  hotelId: string,
  data: BookingRequest
): Promise<BookingResponse> {
  const { hotel, room } = (await getRoom(hotelId, data.room_id)) || {};
  if (!hotel || !room) {
    throw new Error("Room not found");
  }

  // Calculate pricing
  const nights = nightsBetween(data.check_in_date, data.check_out_date);
  const breakdown = priceBreakdown(room.pricePerNight, nights);

  // Generate dates array for inventory locking
  const dates: Date[] = [];
  const start = new Date(data.check_in_date + "T00:00:00");
  for (let i = 0; i < nights; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const timeoutMinutes = Number(process.env.PAYMENT_TIMEOUT_MINUTES) || 15;
  const paymentDeadline = new Date();
  paymentDeadline.setMinutes(paymentDeadline.getMinutes() + timeoutMinutes);

  // We wrap the DB creation in a transaction
  // But we fetch the Midtrans token AFTER the transaction commits
  // to avoid keeping the DB transaction open during an external network call.
  
  let bookingId = "";
  let bookingRef = "";

  // ==========================================
  // TRANSACTION: Create Booking & Lock Inventory
  // ==========================================
  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    attempt++;
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Ensure inventory exists for these dates
        await ensureInventory(room.id, dates, room.totalUnits || 1, tx);

        // 2. Check availability
        const isAvailable = await checkAvailability(room.id, dates, tx);
        if (!isAvailable) {
          throw new Error("ROOM_NOT_AVAILABLE");
        }

        // 3. Upsert guest
        const guest = await tx.guest.upsert({
          where: { email: data.guest_email },
          update: {
            firstName: data.guest_first_name,
            lastName: data.guest_last_name,
            phone: data.guest_phone,
          },
          create: {
            email: data.guest_email,
            firstName: data.guest_first_name,
            lastName: data.guest_last_name,
            phone: data.guest_phone,
          },
        });

        // 4. Create pending booking
        bookingRef = makeBookingRef();
        const booking = await tx.booking.create({
          data: {
            bookingRef,
            hotelId: hotel.id,
            roomId: room.id,
            guestId: guest.id,
            checkIn: new Date(data.check_in_date + "T00:00:00"),
            checkOut: new Date(data.check_out_date + "T00:00:00"),
            nights,
            guestsCount: data.guests,
            pricePerNight: room.pricePerNight,
            roomTotal: breakdown.roomTotal,
            serviceFee: breakdown.serviceFee,
            taxes: breakdown.taxes,
            total: breakdown.total,
            currency: hotel.currency,
            status: "PENDING",
            paymentDeadline,
            
            // Payment record linked
            payment: {
              create: {
                amount: breakdown.total,
                currency: hotel.currency,
                status: "PENDING",
              }
            }
          },
        });
        
        bookingId = booking.id;

        // 5. Lock inventory (optimistic update)
        await lockInventory(booking.id, room.id, dates, paymentDeadline, tx);
      });
      
      success = true;
    } catch (error) {
      if (getErrorMessage(error) === "ROOM_NOT_AVAILABLE") {
        throw error; // Don't retry if it's genuinely full
      }
      if (attempt >= MAX_RETRIES) {
        throw new Error("Failed to lock inventory due to high traffic. Please try again.");
      }
      // Wait a bit before retrying (exponential backoff)
      await new Promise(res => setTimeout(res, attempt * 200));
    }
  }

  // ==========================================
  // EXTERNAL CALL: Get Midtrans Snap Token
  // ==========================================
  try {
    // Fetch the full booking with relations needed for Midtrans
    const fullBooking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { guest: true, payment: true },
    });

    const snapData = await createSnapTransaction(fullBooking);

    // Save snap token to booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        snapToken: snapData.token,
        snapRedirectUrl: snapData.redirect_url,
      },
    });

    return {
      bookingId,
      bookingRef,
      status: "PENDING",
      paymentDeadline: paymentDeadline.toISOString(),
      snapToken: snapData.token,
      snapRedirectUrl: snapData.redirect_url,
    };
  } catch {
    // If midtrans fails, we should ideally expire the booking
    // so it doesn't hold the lock pointlessly.
    await expireBooking(bookingId);
    throw new Error("Failed to communicate with payment gateway.");
  }
}

// ------------------------------------------------------------------
// Confirm Booking (Payment Success)
// ------------------------------------------------------------------

export interface ConfirmBookingPaymentResult {
  bookingId: string;
  bookingRef: string;
  confirmedNow: boolean;
}

export async function confirmBookingPayment(
  midtransOrderId: string,
  gatewayRef?: string,
  paymentMethod?: string
): Promise<ConfirmBookingPaymentResult> {
  const bookingRef = getBookingRefFromMidtransOrderId(midtransOrderId);
  let result: ConfirmBookingPaymentResult | null = null;

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { bookingRef },
      include: { payment: true },
    });

    if (!booking) throw new Error("Booking not found");
    
    // Idempotency: if already confirmed, do nothing
    if (booking.status === "CONFIRMED" || booking.payment?.status === "PAID") {
      result = {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        confirmedNow: false,
      };
      return;
    }

    // Update payment
    await tx.payment.update({
      where: { bookingId: booking.id },
      data: {
        status: "PAID",
        gatewayRef,
        method: paymentMethod,
        midtransOrderId,
        paidAt: new Date(),
      },
    });

    // Update booking status
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    });

    // Confirm inventory (convert lock to booking)
    await confirmInventory(booking.id, tx);

    result = {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      confirmedNow: true,
    };
  });

  if (!result) {
    throw new Error("Booking confirmation failed");
  }

  return result;
}

// ------------------------------------------------------------------
// Expire Booking (Timeout / Payment Failed)
// ------------------------------------------------------------------

export async function expireBooking(bookingIdOrRef: string) {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        OR: [
          { id: bookingIdOrRef },
          { bookingRef: bookingIdOrRef }
        ]
      },
      include: { payment: true },
    });

    if (!booking) return;

    // Idempotency: only expire if it's currently pending
    if (booking.status !== "PENDING") {
      return; 
    }

    // Update payment
    await tx.payment.update({
      where: { bookingId: booking.id },
      data: { status: "FAILED" },
    });

    // Update booking
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: "EXPIRED" },
    });

    // Release inventory lock
    await releaseInventory(booking.id, tx);
  });
}

// ------------------------------------------------------------------
// Cron Sweep: Expire Stale Locks
// ------------------------------------------------------------------

export async function expireStaleBookings(): Promise<number> {
  const expiredLocks = await prisma.roomLock.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: new Date() },
    },
    select: { bookingId: true },
    distinct: ['bookingId'],
  });

  let count = 0;
  for (const lock of expiredLocks) {
    await expireBooking(lock.bookingId);
    count++;
  }
  return count;
}
