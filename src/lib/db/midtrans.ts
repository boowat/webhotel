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

// Bypass TLS verification for local development (fixes self-signed cert errors)
if (!isProduction) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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

const ORDER_PREFIX = "LUMI-";

export function getMidtransOrderId(bookingRef: string): string {
  return bookingRef.startsWith(ORDER_PREFIX)
    ? bookingRef
    : `${ORDER_PREFIX}${bookingRef}`;
}

export function getLegacyMidtransOrderId(bookingRef: string): string {
  return `${ORDER_PREFIX}${getMidtransOrderId(bookingRef)}`;
}

export function getMidtransOrderIdCandidates(
  bookingRef: string,
  recordedOrderId?: string | null
): string[] {
  return Array.from(
    new Set(
      [
        recordedOrderId,
        getMidtransOrderId(bookingRef),
        getLegacyMidtransOrderId(bookingRef),
      ].filter((value): value is string => Boolean(value))
    )
  );
}

export function getBookingRefFromMidtransOrderId(orderId: string): string {
  const trimmed = orderId.trim();
  const legacyDoublePrefix = `${ORDER_PREFIX}${ORDER_PREFIX}`;
  const bookingRef = trimmed.startsWith(legacyDoublePrefix)
    ? trimmed.slice(ORDER_PREFIX.length)
    : trimmed;

  return bookingRef.startsWith(ORDER_PREFIX)
    ? bookingRef
    : `${ORDER_PREFIX}${bookingRef}`;
}

export function isMidtransPaymentSuccessful(statusResponse: any): boolean {
  const transactionStatus = statusResponse?.transaction_status;
  const fraudStatus = statusResponse?.fraud_status;

  return (
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept")
  );
}

export function isMidtransPaymentFailed(statusResponse: any): boolean {
  return ["cancel", "deny", "expire"].includes(
    statusResponse?.transaction_status
  );
}

export function isMidtransNotFoundError(error: any): boolean {
  return Number(error?.httpStatusCode ?? error?.ApiResponse?.status_code) === 404;
}

function getMidtransErrorSummary(error: any): string {
  const code = error?.httpStatusCode ?? error?.ApiResponse?.status_code;
  const message = String(error?.message ?? error);
  return code ? `${message} (code ${code})` : message;
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

  const orderId = getMidtransOrderId(booking.bookingRef);
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
    console.error(
      "❌ Failed to create Midtrans Snap transaction:",
      getMidtransErrorSummary(error)
    );
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
    console.error(
      "❌ Failed to verify Midtrans notification:",
      getMidtransErrorSummary(error)
    );
    throw error;
  }
}

// ------------------------------------------------------------------
// Active Status Check (for local dev where webhooks can't reach)
// ------------------------------------------------------------------

/**
 * Actively queries Midtrans API for the current transaction status.
 * This is the fallback for when webhooks can't reach our server
 * (e.g. localhost development).
 */
export async function checkTransactionStatus(
  midtransOrderId: string
): Promise<any> {
  try {
    const statusResponse = await (core as any).transaction.status(midtransOrderId);
    return statusResponse;
  } catch (error) {
    if (!isMidtransNotFoundError(error)) {
      console.error(
        "❌ Failed to check Midtrans transaction status:",
        getMidtransErrorSummary(error)
      );
    }
    throw error;
  }
}
