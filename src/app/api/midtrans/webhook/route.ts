import { NextRequest, NextResponse } from "next/server";
import { verifyMidtransNotification } from "@/lib/db/midtrans";
import { confirmBookingPayment, expireBooking } from "@/lib/db/booking-service";
import { sendBookingConfirmation } from "@/lib/email";
import { prisma } from "@/lib/db/prisma";
import { getRoom } from "@/lib/hotels";

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

    // Extract our booking reference from LUMI-XXXXXX
    const bookingRef = midtransOrderId.replace("LUMI-", "");

    // 2. Map transaction status to actions
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (transactionStatus === "capture" && fraudStatus === "challenge") {
        // Still pending manual review on Midtrans side
        console.log(`[Midtrans] Challenge for ${midtransOrderId}`);
      } else {
        // Success
        await confirmBookingPayment(midtransOrderId, gatewayRef, paymentMethod);
        
        // Send email confirmation
        const booking = await prisma.booking.findUnique({
          where: { bookingRef },
          include: { guest: true, payment: true },
        });

        if (booking) {
           const { hotel, room } = getRoom(booking.hotelId, booking.roomId) || {};
           if (hotel && room) {
             // Adapt the Prisma model back to the Booking interface expected by email.ts
             const emailBooking = {
               id: booking.id,
               bookingRef: booking.bookingRef,
               hotelId: booking.hotelId,
               hotelName: hotel.name,
               roomId: booking.roomId,
               roomName: room.name,
               checkIn: booking.checkIn.toISOString().split("T")[0],
               checkOut: booking.checkOut.toISOString().split("T")[0],
               nights: booking.nights,
               guests: booking.guestsCount,
               guest: {
                 firstName: booking.guest.firstName,
                 lastName: booking.guest.lastName,
                 email: booking.guest.email,
                 phone: booking.guest.phone || undefined,
               },
               pricing: {
                 pricePerNight: Number(booking.pricePerNight),
                 roomTotal: Number(booking.roomTotal),
                 serviceFee: Number(booking.serviceFee),
                 taxes: Number(booking.taxes),
                 total: Number(booking.total),
                 currency: booking.currency,
               },
               status: "confirmed" as const,
               createdAt: booking.createdAt.toISOString(),
             };
             
             // Fire and forget
             sendBookingConfirmation(emailBooking).catch(e => 
               console.error("Failed to send email after webhook:", e)
             );
           }
        }
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
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
