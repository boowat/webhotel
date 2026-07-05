import { NextRequest, NextResponse } from "next/server";
import { findRoomById } from "@/lib/hotels";
import { nightsBetween, priceBreakdown } from "@/lib/pricing";
import { createBooking } from "@/lib/db/booking-service";
import { sendBookingConfirmation } from "@/lib/email";
import {
  BookingRequestSchema,
  formatZodErrors,
} from "@/lib/schemas/booking";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function makeBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LUMI-${out}`;
}

function uuid(): string {
  return crypto.randomUUID();
}

/* ------------------------------------------------------------------ */
/*  POST /api/bookings                                                 */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    /* --- Parse body ------------------------------------------------ */
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid JSON body",
          code: "INVALID_JSON",
        },
        { status: 400 }
      );
    }

    /* --- Schema validation (Zod) ---------------------------------- */
    const parsed = BookingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Validation failed",
          errors: formatZodErrors(parsed.error),
        },
        { status: 400 }
      );
    }

    const {
      room_id,
      check_in_date,
      check_out_date,
      guests,
      guest_first_name,
      guest_last_name,
      guest_email,
      guest_phone,
    } = parsed.data;

    /* --- Business logic validation -------------------------------- */

    // check_in_date must not be in the past
    const todayStr = new Date().toISOString().split("T")[0];
    if (check_in_date < todayStr) {
      return NextResponse.json(
        {
          status: "error",
          message: "The check-in date cannot be in the past",
          code: "CHECKIN_DATE_IN_PAST",
        },
        { status: 422 }
      );
    }

    // check_out_date must be after check_in_date
    if (check_out_date <= check_in_date) {
      return NextResponse.json(
        {
          status: "error",
          message: "check_out_date must be after check_in_date",
          code: "INVALID_DATE_RANGE",
        },
        { status: 422 }
      );
    }

    // Room must exist
    const result = findRoomById(room_id);
    if (!result) {
      return NextResponse.json(
        {
          status: "error",
          message: "Room not found",
          code: "ROOM_NOT_FOUND",
        },
        { status: 404 }
      );
    }
    const { hotel, room } = result;

    // The new transactional booking service handles business logic, inventory locking,
    // creating the booking/payment records, and calling Midtrans to get a Snap token.
    const bookingResponse = await createBooking(hotel.id, parsed.data);

    /* --- Success response ----------------------------------------- */
    return NextResponse.json(
      {
        status: "success",
        message: "Booking initiated successfully. Please complete payment.",
        data: {
          booking_id: bookingResponse.bookingId,
          booking_ref: bookingResponse.bookingRef,
          snap_token: bookingResponse.snapToken,
          snap_redirect_url: bookingResponse.snapRedirectUrl,
          payment_deadline: bookingResponse.paymentDeadline,
          status: bookingResponse.status,
          hotel: {
            name: hotel.name,
            city: hotel.city,
            country: hotel.country,
          },
          room: {
            id: room.id,
            name: room.name,
          },
          check_in_date: check_in_date,
          check_out_date: check_out_date,
          guests: guests,
          guest: {
            first_name: guest_first_name,
            last_name: guest_last_name,
            email: guest_email,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    
    // Map specific service errors to HTTP responses
    if (error.message === "ROOM_NOT_AVAILABLE") {
      return NextResponse.json(
        {
          status: "error",
          message: "This room is already booked for the selected dates",
          code: "ROOM_NOT_AVAILABLE",
        },
        { status: 409 }
      );
    }
    
    if (error.message.includes("high traffic")) {
       return NextResponse.json(
        {
          status: "error",
          message: "Too many concurrent requests. Please try again.",
          code: "CONCURRENCY_ERROR",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred. Please try again later.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/bookings (optional — list bookings for debug / admin)     */
/* ------------------------------------------------------------------ */

import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: { guest: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    status: "success",
    message: "Bookings retrieved successfully",
    data: {
      bookings: bookings.map((b) => ({
        booking_id: b.id,
        booking_ref: b.bookingRef,
        room_id: b.roomId,
        check_in_date: b.checkIn.toISOString().split("T")[0],
        check_out_date: b.checkOut.toISOString().split("T")[0],
        nights: b.nights,
        guests: b.guestsCount,
        guest: {
          first_name: b.guest.firstName,
          last_name: b.guest.lastName,
          email: b.guest.email,
        },
        pricing: {
          price_per_night: Number(b.pricePerNight),
          room_total: Number(b.roomTotal),
          service_fee: Number(b.serviceFee),
          taxes: Number(b.taxes),
          total: Number(b.total),
          currency: b.currency,
        },
        status: b.status,
        payment_status: b.payment?.status,
        payment_deadline: b.paymentDeadline,
        created_at: b.createdAt,
      })),
      total_items: bookings.length,
    },
  });
}
