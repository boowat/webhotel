import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { confirmBookingPayment, expireBooking } from "@/lib/db/booking-service";
import { sendBookingConfirmationByRef } from "@/lib/email";
import {
  checkTransactionStatus,
  getMidtransOrderIdCandidates,
  isMidtransNotFoundError,
  isMidtransPaymentFailed,
  isMidtransPaymentSuccessful,
} from "@/lib/db/midtrans";

async function checkBookingTransactionStatus(
  bookingRef: string,
  recordedOrderId?: string | null
) {
  const candidates = getMidtransOrderIdCandidates(bookingRef, recordedOrderId);

  for (const orderId of candidates) {
    try {
      const status = await checkTransactionStatus(orderId);
      return { orderId, status };
    } catch (error) {
      if (isMidtransNotFoundError(error)) {
        console.log(`[Status] Midtrans order not found: ${orderId}`);
        continue;
      }
      throw error;
    }
  }

  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    console.log(`[Status] Checking status for booking: ${bookingId}`);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      console.log(`[Status] Booking not found: ${bookingId}`);
      return NextResponse.json(
        { status: "error", message: "Booking not found" },
        { status: 404 }
      );
    }

    console.log(`[Status] DB status: booking=${booking.status}, payment=${booking.payment?.status}, ref=${booking.bookingRef}`);

    const shouldCheckMidtrans =
      booking.status === "PENDING" ||
      (booking.status === "EXPIRED" && booking.payment?.status !== "PAID");
    let midtransCheckFailed = false;

    if (shouldCheckMidtrans) {
      try {
        const result = await checkBookingTransactionStatus(
          booking.bookingRef,
          booking.payment?.midtransOrderId
        );

        if (!result) {
          console.log(
            `[Status] No Midtrans transaction found for ${booking.bookingRef}`
          );
        } else {
          const { orderId, status: mtStatus } = result;
          const transactionStatus = mtStatus.transaction_status;
          const fraudStatus = mtStatus.fraud_status;

          console.log(
            `[Status] Midtrans response for ${orderId}: transaction_status=${transactionStatus}, fraud_status=${fraudStatus}`
          );

          if (isMidtransPaymentSuccessful(mtStatus)) {
            console.log(`[Status] Payment confirmed! Updating DB...`);
            const confirmation = await confirmBookingPayment(
              mtStatus.order_id || orderId,
              mtStatus.transaction_id,
              mtStatus.payment_type
            );
            const emailResult = confirmation.confirmedNow
              ? await sendBookingConfirmationByRef(confirmation.bookingRef)
              : null;

            if (emailResult && !emailResult.success) {
              console.error(
                `[Status] Confirmation email failed: ${emailResult.error}`
              );
            }

            return NextResponse.json({
              status: "success",
              data: {
                booking_id: booking.id,
                booking_ref: booking.bookingRef,
                status: "CONFIRMED",
                payment_status: "PAID",
                email_sent: emailResult?.success ?? false,
              },
            });
          } else if (isMidtransPaymentFailed(mtStatus)) {
            console.log(`[Status] Payment failed/expired, updating DB...`);
            await expireBooking(booking.id);

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

          console.log(
            `[Status] Midtrans status still: ${transactionStatus}, no DB update needed`
          );
        }
      } catch (err: any) {
        midtransCheckFailed = true;
        console.error("[Status] Midtrans check FAILED:", err?.message || err);
      }
    }

    if (
      booking.status === "PENDING" &&
      booking.paymentDeadline &&
      booking.paymentDeadline < new Date()
    ) {
      if (midtransCheckFailed) {
        return NextResponse.json({
          status: "success",
          data: {
            booking_id: booking.id,
            booking_ref: booking.bookingRef,
            status: booking.status,
            payment_status: booking.payment?.status,
            snap_token: booking.snapToken,
            status_check: "FAILED",
          },
        });
      }

      console.log(`[Status] Deadline passed, expiring booking ${booking.bookingRef}`);
      await expireBooking(booking.id);

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

    // Re-fetch from DB in case we just updated it
    const updated = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    return NextResponse.json({
      status: "success",
      data: {
        booking_id: updated?.id,
        booking_ref: updated?.bookingRef,
        status: updated?.status,
        payment_status: updated?.payment?.status,
        snap_token: updated?.snapToken,
      },
    });
  } catch (error: any) {
    console.error("[Status] Unexpected error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
