import midtransClient from "midtrans-client";
import { Booking, Guest, Payment } from "@prisma/client";
import { getHotel, getRoom } from "../hotels";

// ------------------------------------------------------------------
// Midtrans Client Setup
// ------------------------------------------------------------------

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

if (!serverKey || !clientKey) {
  console.warn(
    "⚠️ Midtrans keys are missing. Payment integration will not work."
  );
}

// Snap instance for creating transactions
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey: serverKey || "",
  clientKey: clientKey || "",
});

// CoreApi instance for verifying webhooks
export const core = new midtransClient.CoreApi({
  isProduction,
  serverKey: serverKey || "",
  clientKey: clientKey || "",
});

// ------------------------------------------------------------------
// Helper Types
// ------------------------------------------------------------------

export interface SnapResponse {
  token: string;
  redirect_url: string;
}

// ------------------------------------------------------------------
// Transaction Creation
// ------------------------------------------------------------------

/**
 * Creates a Midtrans Snap transaction for a given booking.
 * Returns the Snap token and redirect URL.
 */
export async function createSnapTransaction(
  booking: Booking & { guest: Guest; payment: Payment | null }
): Promise<SnapResponse> {
  const result = getRoom(booking.hotelId, booking.roomId);
  if (!result) {
    throw new Error(`Room not found: ${booking.roomId}`);
  }
  const { hotel, room } = result;

  const orderId = `LUMI-${booking.bookingRef}`;
  const timeoutMinutes = Number(process.env.PAYMENT_TIMEOUT_MINUTES) || 15;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Build the payload
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Number(booking.total),
    },
    customer_details: {
      first_name: booking.guest.firstName,
      last_name: booking.guest.lastName,
      email: booking.guest.email,
      phone: booking.guest.phone || "",
    },
    item_details: [
      {
        id: room.id,
        name: `${room.name} (${booking.nights} nights)`,
        price: Number(booking.pricePerNight),
        quantity: booking.nights,
        category: "Room",
      },
      {
        id: "service-fee",
        name: "Service Fee (8%)",
        price: Number(booking.serviceFee),
        quantity: 1,
        category: "Fee",
      },
      {
        id: "tax",
        name: "Tax (10%)",
        price: Number(booking.taxes),
        quantity: 1,
        category: "Tax",
      },
    ],
    expiry: {
      start_time: new Date().toISOString().replace("T", " ").substring(0, 19) + " +0000",
      unit: "minute",
      duration: timeoutMinutes,
    },
    callbacks: {
      // Where Midtrans redirects the user after payment attempt
      finish: `${baseUrl}/book/${hotel.id}/status/${booking.id}`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    console.error("❌ Failed to create Midtrans Snap transaction:", error);
    throw new Error("Failed to initialize payment gateway");
  }
}

// ------------------------------------------------------------------
// Webhook Verification
// ------------------------------------------------------------------

/**
 * Verifies the authenticity of a Midtrans webhook notification.
 * This is CRITICAL for security. We use the SDK to perform the verification.
 */
export async function verifyMidtransNotification(
  notificationJson: any
): Promise<any> {
  try {
    const statusResponse = await (core as any).transaction.notification(notificationJson);
    return statusResponse;
  } catch (error) {
    console.error("❌ Failed to verify Midtrans notification:", error);
    throw error;
  }
}
