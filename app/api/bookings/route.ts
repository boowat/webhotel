import { NextRequest, NextResponse } from "next/server";
import { getHotel } from "@/lib/hotels";
import { nightsBetween, priceBreakdown } from "@/lib/pricing";
import { addBooking, getBookings, type Booking } from "@/lib/bookings";
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
      hotel_id,
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

    // Hotel must exist
    const hotel = getHotel(hotel_id);
    if (!hotel) {
      return NextResponse.json(
        {
          status: "error",
          message: "Hotel not found",
          code: "HOTEL_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Room must exist on this hotel
    const room = hotel.rooms.find((r) => r.id === room_id);
    if (!room) {
      return NextResponse.json(
        {
          status: "error",
          message: "Room not found in this hotel",
          code: "ROOM_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Guest count must not exceed room capacity
    if (guests > room.maxGuests) {
      return NextResponse.json(
        {
          status: "error",
          message: `This room supports up to ${room.maxGuests} guests`,
          code: "GUESTS_EXCEED_CAPACITY",
        },
        { status: 422 }
      );
    }

    // Check for overlapping bookings on the same room
    const existingBookings = getBookings();
    const hasConflict = existingBookings.some(
      (b) =>
        b.hotelId === hotel_id &&
        b.roomId === room_id &&
        b.status === "confirmed" &&
        check_in_date < b.checkOut &&
        check_out_date > b.checkIn
    );
    if (hasConflict) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "This room is already booked for the selected dates",
          code: "ROOM_NOT_AVAILABLE",
        },
        { status: 409 }
      );
    }

    /* --- Calculate pricing ---------------------------------------- */
    const nights = nightsBetween(check_in_date, check_out_date);
    const breakdown = priceBreakdown(room.pricePerNight, nights);

    /* --- Create booking ------------------------------------------- */
    const booking: Booking = {
      id: uuid(),
      bookingRef: makeBookingRef(),
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomId: room.id,
      roomName: room.name,
      checkIn: check_in_date,
      checkOut: check_out_date,
      nights,
      guests,
      guest: {
        firstName: guest_first_name,
        lastName: guest_last_name,
        email: guest_email,
        phone: guest_phone,
      },
      pricing: {
        pricePerNight: room.pricePerNight,
        roomTotal: breakdown.roomTotal,
        serviceFee: breakdown.serviceFee,
        taxes: breakdown.taxes,
        total: breakdown.total,
        currency: hotel.currency,
      },
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);

    /* --- Send confirmation email ---------------------------------- */
    const emailResult = await sendBookingConfirmation(booking);

    /* --- Success response ----------------------------------------- */
    return NextResponse.json(
      {
        status: "success",
        message: "Booking confirmed successfully",
        data: {
          booking_id: booking.id,
          booking_ref: booking.bookingRef,
          hotel: {
            id: hotel.id,
            name: hotel.name,
            city: hotel.city,
            country: hotel.country,
          },
          room: {
            id: room.id,
            name: room.name,
          },
          check_in_date: booking.checkIn,
          check_out_date: booking.checkOut,
          nights: booking.nights,
          guests: booking.guests,
          guest: {
            first_name: booking.guest.firstName,
            last_name: booking.guest.lastName,
            email: booking.guest.email,
          },
          pricing: {
            price_per_night: booking.pricing.pricePerNight,
            room_total: booking.pricing.roomTotal,
            service_fee: booking.pricing.serviceFee,
            taxes: booking.pricing.taxes,
            total: booking.pricing.total,
            currency: booking.pricing.currency,
          },
          status: booking.status,
          created_at: booking.createdAt,
          notification: {
            email_sent: emailResult.success,
            email_preview_url: emailResult.previewUrl || null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/bookings error:", error);
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

export async function GET() {
  const bookings = getBookings();
  return NextResponse.json({
    status: "success",
    message: "Bookings retrieved successfully",
    data: {
      bookings: bookings.map((b) => ({
        booking_id: b.id,
        booking_ref: b.bookingRef,
        hotel_id: b.hotelId,
        hotel_name: b.hotelName,
        room_id: b.roomId,
        room_name: b.roomName,
        check_in_date: b.checkIn,
        check_out_date: b.checkOut,
        nights: b.nights,
        guests: b.guests,
        guest: {
          first_name: b.guest.firstName,
          last_name: b.guest.lastName,
          email: b.guest.email,
        },
        pricing: b.pricing,
        status: b.status,
        created_at: b.createdAt,
      })),
      total_items: bookings.length,
    },
  });
}
