import { NextRequest, NextResponse } from "next/server";
import { getBookingDetail } from "@/lib/db/booking-service";
import { getRoom } from "@/lib/hotels";

// ------------------------------------------------------------------
//  GET /api/bookings/[id]
//  Retrieve a single booking by ID or booking ref (e.g. LUMI-QV3VCT)
// ------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await getBookingDetail(id);

    if (!booking) {
      return NextResponse.json(
        {
          status: "error",
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Resolve hotel/room names
    const roomResult = await getRoom(booking.hotelId, booking.roomId);

    return NextResponse.json({
      status: "success",
      data: {
        booking_id: booking.id,
        booking_ref: booking.bookingRef,
        hotel: {
          id: booking.hotelId,
          name: roomResult?.hotel.name ?? booking.hotelId,
          city: roomResult?.hotel.city,
          country: roomResult?.hotel.country,
        },
        room: {
          id: booking.roomId,
          name: roomResult?.room.name ?? booking.roomId,
        },
        check_in_date: booking.checkIn.toISOString().split("T")[0],
        check_out_date: booking.checkOut.toISOString().split("T")[0],
        nights: booking.nights,
        guests: booking.guestsCount,
        guest: {
          first_name: booking.guest.firstName,
          last_name: booking.guest.lastName,
          email: booking.guest.email,
        },
        pricing: {
          price_per_night: Number(booking.pricePerNight),
          room_total: Number(booking.roomTotal),
          service_fee: Number(booking.serviceFee),
          taxes: Number(booking.taxes),
          total: Number(booking.total),
          currency: booking.currency,
        },
        status: booking.status,
        payment_status: booking.payment?.status ?? null,
        payment_deadline: booking.paymentDeadline,
        created_at: booking.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("[GET /api/bookings/[id]] Error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
