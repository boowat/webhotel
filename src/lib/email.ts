import nodemailer from "nodemailer";
import { prisma } from "./db/prisma";
import { getRoom } from "./hotels";

export interface Booking {
  id: string;
  bookingRef: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  pricing: {
    pricePerNight: number;
    roomTotal: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: string;
  };
  status: "confirmed" | "pending" | "expired" | "cancelled";
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Transporter                                                        */
/*                                                                     */
/*  • Production  → set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS    */
/*    in your .env file.                                               */
/*  • Development → leave those vars empty and the module will         */
/*    auto-create an Ethereal test account (mails are viewable at      */
/*    https://ethereal.email).                                         */
/* ------------------------------------------------------------------ */

let _transporter: nodemailer.Transporter | null = null;
let _isJsonTransport = false;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const rejectUnauthorized =
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "false"
      ? false
      : process.env.NODE_ENV === "production";

  if (host && user && pass) {
    // Production / custom SMTP
    _transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized },
    });
  } else {
    // Development → try Ethereal, fall back to JSON/console transport
    try {
      const testAccount = await nodemailer.createTestAccount();
      _transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        tls: { rejectUnauthorized: false },
      });
      console.log(
        `📧 Ethereal test account created: ${testAccount.user}`
      );
    } catch (err) {
      // Ethereal unavailable (SSL inspection, network, etc.)
      // → fall back to JSON transport that logs to console
      console.warn(
        `📧 Ethereal unavailable (${err instanceof Error ? err.message : "unknown error"}), using console transport`
      );
      _transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      _isJsonTransport = true;
    }
  }

  return _transporter;
}

/* ------------------------------------------------------------------ */
/*  HTML template                                                      */
/* ------------------------------------------------------------------ */

function buildConfirmationHtml(booking: Booking): string {
  const checkInFormatted = new Date(
    booking.checkIn + "T00:00:00"
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const checkOutFormatted = new Date(
    booking.checkOut + "T00:00:00"
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currency = booking.pricing.currency;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation</title>
</head>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6); padding:40px 32px; text-align:center;">
              <div style="width:56px; height:56px; margin:0 auto 16px; background:rgba(255,255,255,0.2); border-radius:50%; line-height:56px; font-size:28px;">
                ✓
              </div>
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">Booking Confirmed!</h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
                Your reservation is all set. We look forward to welcoming you.
              </p>
            </td>
          </tr>

          <!-- Booking Reference -->
          <tr>
            <td style="padding:28px 32px 0; text-align:center;">
              <p style="margin:0; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Booking Reference</p>
              <p style="margin:6px 0 0; font-size:28px; font-weight:800; color:#1e293b; letter-spacing:2px;">${booking.bookingRef}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:20px 32px;">
              <hr style="border:none; border-top:1px solid #e2e8f0; margin:0;" />
            </td>
          </tr>

          <!-- Hotel & Room -->
          <tr>
            <td style="padding:0 32px;">
              <h2 style="margin:0 0 4px; font-size:18px; color:#1e293b;">${booking.hotelName}</h2>
              <p style="margin:0; font-size:14px; color:#64748b;">${booking.roomName}</p>
            </td>
          </tr>

          <!-- Stay details grid -->
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="padding:12px; background:#f8fafc; border-radius:10px 0 0 0;">
                    <p style="margin:0; font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Check-in</p>
                    <p style="margin:4px 0 0; font-size:14px; font-weight:600; color:#1e293b;">${checkInFormatted}</p>
                  </td>
                  <td width="50%" style="padding:12px; background:#f8fafc; border-radius:0 10px 0 0;">
                    <p style="margin:0; font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Check-out</p>
                    <p style="margin:4px 0 0; font-size:14px; font-weight:600; color:#1e293b;">${checkOutFormatted}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:12px; background:#f8fafc; border-radius:0 0 0 10px; border-top:1px solid #e2e8f0;">
                    <p style="margin:0; font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Guests</p>
                    <p style="margin:4px 0 0; font-size:14px; font-weight:600; color:#1e293b;">${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}</p>
                  </td>
                  <td width="50%" style="padding:12px; background:#f8fafc; border-radius:0 0 10px 0; border-top:1px solid #e2e8f0;">
                    <p style="margin:0; font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Duration</p>
                    <p style="margin:4px 0 0; font-size:14px; font-weight:600; color:#1e293b;">${booking.nights} ${booking.nights === 1 ? "night" : "nights"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none; border-top:1px solid #e2e8f0; margin:0;" />
            </td>
          </tr>

          <!-- Pricing breakdown -->
          <tr>
            <td style="padding:20px 32px;">
              <h3 style="margin:0 0 12px; font-size:14px; color:#1e293b;">Price Breakdown</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
                <tr>
                  <td style="padding:6px 0; color:#64748b;">${fmt(booking.pricing.pricePerNight)} × ${booking.nights} nights</td>
                  <td style="padding:6px 0; color:#1e293b; text-align:right;">${fmt(booking.pricing.roomTotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b;">Service fee</td>
                  <td style="padding:6px 0; color:#1e293b; text-align:right;">${fmt(booking.pricing.serviceFee)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b;">Taxes</td>
                  <td style="padding:6px 0; color:#1e293b; text-align:right;">${fmt(booking.pricing.taxes)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:8px 0 0;">
                    <hr style="border:none; border-top:1px solid #e2e8f0; margin:0;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0 0; font-size:16px; font-weight:700; color:#1e293b;">Total</td>
                  <td style="padding:10px 0 0; font-size:16px; font-weight:700; color:#1e293b; text-align:right;">${fmt(booking.pricing.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest info -->
          <tr>
            <td style="padding:0 32px 24px;">
              <div style="background:#f8fafc; border-radius:10px; padding:16px;">
                <p style="margin:0; font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Guest</p>
                <p style="margin:4px 0 0; font-size:14px; font-weight:600; color:#1e293b;">
                  ${booking.guest.firstName} ${booking.guest.lastName}
                </p>
                <p style="margin:2px 0 0; font-size:13px; color:#64748b;">${booking.guest.email}</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px; text-align:center;">
              <p style="margin:0 0 16px; font-size:13px; color:#94a3b8;">
                Free cancellation up to 48 hours before check-in.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc; padding:20px 32px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:13px; color:#94a3b8;">
                Des Indes · Your stay starts here
              </p>
              <p style="margin:4px 0 0; font-size:11px; color:#cbd5e1;">
                This is an automated confirmation. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/* ------------------------------------------------------------------ */
/*  Plain-text fallback                                                */
/* ------------------------------------------------------------------ */

function buildConfirmationText(booking: Booking): string {
  const currency = booking.pricing.currency;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  return [
    `BOOKING CONFIRMED`,
    ``,
    `Booking Ref: ${booking.bookingRef}`,
    ``,
    `Hotel:      ${booking.hotelName}`,
    `Room:       ${booking.roomName}`,
    `Check-in:   ${booking.checkIn}`,
    `Check-out:  ${booking.checkOut}`,
    `Guests:     ${booking.guests}`,
    `Nights:     ${booking.nights}`,
    ``,
    `--- Price Breakdown ---`,
    `Room:        ${fmt(booking.pricing.roomTotal)}`,
    `Service fee: ${fmt(booking.pricing.serviceFee)}`,
    `Taxes:       ${fmt(booking.pricing.taxes)}`,
    `Total:       ${fmt(booking.pricing.total)}`,
    ``,
    `Guest: ${booking.guest.firstName} ${booking.guest.lastName}`,
    `Email: ${booking.guest.email}`,
    ``,
    `Free cancellation up to 48 hours before check-in.`,
    ``,
    `— Des Indes`,
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/*  Send confirmation email                                            */
/* ------------------------------------------------------------------ */

export interface EmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}

export async function sendBookingConfirmationByRef(
  bookingRef: string
): Promise<EmailResult> {
  const booking = await prisma.booking.findUnique({
    where: { bookingRef },
    include: { guest: true, payment: true },
  });

  if (!booking) {
    return {
      success: false,
      error: `Booking not found: ${bookingRef}`,
    };
  }

  const result = await getRoom(booking.hotelId, booking.roomId);
  if (!result) {
    return {
      success: false,
      error: `Room not found: ${booking.roomId}`,
    };
  }

  const { hotel, room } = result;
  return sendBookingConfirmation({
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
    status: "confirmed",
    createdAt: booking.createdAt.toISOString(),
  });
}

export async function sendBookingConfirmation(
  booking: Booking
): Promise<EmailResult> {
  try {
    const transporter = await getTransporter();

    const fromName = process.env.SMTP_FROM_NAME || "Des Indes";
    const fromEmail =
      process.env.SMTP_FROM_EMAIL || "bookings@lumistays.com";

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: booking.guest.email,
      subject: `Booking Confirmed — ${booking.bookingRef} | ${booking.hotelName}`,
      text: buildConfirmationText(booking),
      html: buildConfirmationHtml(booking),
    });

    if (_isJsonTransport) {
      // JSON transport → log email summary to console
      const envelope = JSON.parse(info.message);
      console.log(`📧 ─────────────────────────────────────────`);
      console.log(`📧 Email sent (console mode)`);
      console.log(`📧 To:      ${envelope.to}`);
      console.log(`📧 Subject: ${envelope.subject}`);
      console.log(`📧 Ref:     ${booking.bookingRef}`);
      console.log(`📧 ─────────────────────────────────────────`);
      return {
        success: true,
        messageId: info.messageId,
      };
    }

    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log(`📧 Preview email: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown email error";
    console.error("📧 Email send failed:", message);
    return {
      success: false,
      error: message,
    };
  }
}
