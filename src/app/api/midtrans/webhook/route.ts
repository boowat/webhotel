import { NextRequest, NextResponse } from "next/server";
import {
  getBookingRefFromMidtransOrderId,
  isMidtransPaymentFailed,
  isMidtransPaymentSuccessful,
  verifyMidtransNotification,
} from "@/lib/db/midtrans";
import { confirmBookingPayment, expireBooking } from "@/lib/db/booking-service";
import { sendBookingConfirmationByRef } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const notificationJson = await req.json();

    // 1. Verify notification authenticity using Midtrans SDK
    const statusResponse = await verifyMidtransNotification(notificationJson);

    const midtransOrderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentMethod = statusResponse.payment_type;
    const gatewayRef = statusResponse.transaction_id;

    console.log(`[Midtrans Webhook] order: ${midtransOrderId}, status: ${transactionStatus}, fraud: ${fraudStatus}`);

    const bookingRef = getBookingRefFromMidtransOrderId(midtransOrderId);

    // 2. Map transaction status to actions
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (transactionStatus === "capture" && fraudStatus === "challenge") {
        // Still pending manual review on Midtrans side
        console.log(`[Midtrans] Challenge for ${midtransOrderId}`);
      } else if (isMidtransPaymentSuccessful(statusResponse)) {
        // Success
        const confirmation = await confirmBookingPayment(
          midtransOrderId,
          gatewayRef,
          paymentMethod
        );

        if (confirmation.confirmedNow) {
          const emailResult = await sendBookingConfirmationByRef(bookingRef);
          if (!emailResult.success) {
            console.error(
              `Failed to send email after webhook: ${emailResult.error}`
            );
          }
        }
      }
    } else if (isMidtransPaymentFailed(statusResponse)) {
      // Failed / Expired
      await expireBooking(bookingRef);
    } else if (transactionStatus === "pending") {
      // Waiting for payment, do nothing
    }

    // Midtrans expects a 200 OK
    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("[Midtrans Webhook Error]", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
