import { NextRequest, NextResponse } from "next/server";
import { cancelBooking } from "@/lib/db/booking-service";

// ------------------------------------------------------------------
//  POST /api/bookings/[id]/cancel
//  Cancel a confirmed booking (48h cancellation policy)
// ------------------------------------------------------------------

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Optionally accept booking_ref in body for extra verification
    let bookingRef: string | undefined;
    try {
      const body = await req.json();
      bookingRef = body?.booking_ref;
    } catch {
      // Body is optional — we can cancel by ID alone
    }

    // Use booking_ref if provided, otherwise use the URL param
    const identifier = bookingRef || id;

    const result = await cancelBooking(identifier);

    return NextResponse.json({
      status: "success",
      message: "Booking cancelled successfully",
      data: {
        booking_id: result.bookingId,
        booking_ref: result.bookingRef,
        status: result.status,
        refund_note: result.refundNote,
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);

    const errorMap: Record<string, { status: number; code: string; msg: string }> = {
      BOOKING_NOT_FOUND: {
        status: 404,
        code: "BOOKING_NOT_FOUND",
        msg: "Booking not found",
      },
      ALREADY_CANCELLED: {
        status: 409,
        code: "ALREADY_CANCELLED",
        msg: "This booking has already been cancelled",
      },
      NOT_CONFIRMED: {
        status: 422,
        code: "NOT_CONFIRMED",
        msg: "Only confirmed bookings can be cancelled",
      },
      CANCELLATION_DEADLINE_PASSED: {
        status: 422,
        code: "CANCELLATION_DEADLINE_PASSED",
        msg: "Cancellation is only allowed up to 48 hours before check-in",
      },
    };

    const mapped = errorMap[message];
    if (mapped) {
      return NextResponse.json(
        {
          status: "error",
          message: mapped.msg,
          code: mapped.code,
        },
        { status: mapped.status }
      );
    }

    console.error("[POST /api/bookings/[id]/cancel] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
