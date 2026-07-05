import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { expireBooking } from "@/lib/db/booking-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json(
        { status: "error", message: "Booking not found" },
        { status: 404 }
      );
    }

    // Passive expiration check:
    // If the booking is still pending but past its deadline, expire it now.
    if (
      booking.status === "PENDING" &&
      booking.paymentDeadline &&
      booking.paymentDeadline < new Date()
    ) {
      console.log(`[Passive Expire] Expiring booking ${booking.bookingRef}`);
      await expireBooking(booking.id);
      
      // Return the updated status to the client
      return NextResponse.json({
        status: "success",
        data: {
          booking_id: booking.id,
          booking_ref: booking.bookingRef,
          status: "EXPIRED",
          payment_status: "FAILED",
        },
      });
    }

    return NextResponse.json({
      status: "success",
      data: {
        booking_id: booking.id,
        booking_ref: booking.bookingRef,
        status: booking.status,
        payment_status: booking.payment?.status,
        snap_token: booking.snapToken,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
