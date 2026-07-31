"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Hotel } from "@/lib/types";
import { SafeImage } from "./SafeImage";
import Script from "next/script";
import {
  addDays,
  formatCurrency,
  nightsBetween,
  priceBreakdown,
  todayISO,
} from "@/lib/pricing";

interface BookingFlowProps {
  hotel: Hotel;
  initialRoomId?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

interface GuestForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const emptyForm: GuestForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export function BookingFlow({
  hotel,
  initialRoomId,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: BookingFlowProps) {
  const validInitialRoom = hotel.rooms.some((r) => r.id === initialRoomId)
    ? (initialRoomId as string)
    : hotel.rooms[0].id;

  const [roomId, setRoomId] = useState(validInitialRoom);
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? "");
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? "");
  const [guests, setGuests] = useState(initialGuests ?? 2);
  const [form, setForm] = useState<GuestForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<{ ref: string; id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const syncBookingStatus = useCallback(
    async (bookingId: string, fallbackRef?: string) => {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.status !== "success") {
        return null;
      }

      const status = data.data.status;
      console.log("[Payment Sync] Current status:", status);

      if (status === "CONFIRMED") {
        setConfirmed({
          ref: data.data.booking_ref ?? fallbackRef ?? "",
          id: bookingId,
        });
        setPendingBookingId(null);
        setSubmitting(false);
        window.scrollTo({ top: 0 });
      } else if (status === "EXPIRED" || status === "CANCELLED") {
        setErrors({
          _general: "Payment period expired. Please try booking again.",
        });
        setPendingBookingId(null);
        setSubmitting(false);
      }

      return status;
    },
    []
  );

  // Polling mechanism to actively check booking status from the server.
  // This is extremely reliable, especially in local development where Midtrans
  // redirects and callbacks might be blocked or fail.
  useEffect(() => {
    if (!pendingBookingId) return;

    console.log(`[Polling] Started polling status for booking: ${pendingBookingId}`);
    syncBookingStatus(pendingBookingId).catch((err) => {
      console.error("[Polling] Initial status check failed:", err);
    });

    const interval = setInterval(async () => {
      try {
        await syncBookingStatus(pendingBookingId);
      } catch (err) {
        console.error("[Polling] Error checking status:", err);
      }
    }, 3000);

    return () => {
      console.log("[Polling] Stopped polling");
      clearInterval(interval);
    };
  }, [pendingBookingId, syncBookingStatus]);

  // Fill sensible default dates on the client if none were passed in.
  useEffect(() => {
    if (!initialCheckIn || !initialCheckOut) {
      const today = todayISO();
      if (!initialCheckIn) setCheckIn(addDays(today, 7));
      if (!initialCheckOut) setCheckOut(addDays(today, 9));
    }
  }, [initialCheckIn, initialCheckOut]);

  const room = hotel.rooms.find((r) => r.id === roomId) ?? hotel.rooms[0];
  const nights = nightsBetween(checkIn, checkOut);
  const breakdown = useMemo(
    () => priceBreakdown(room.pricePerNight, nights),
    [room.pricePerNight, nights]
  );

  function update(field: keyof GuestForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }



  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      next.email = "Enter a valid email";
    if (nights <= 0) next.dates = "Choose valid dates";
    if (guests > room.maxGuests)
      next.guests = `This room sleeps up to ${room.maxGuests}`;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          room_id: roomId,
          check_in_date: checkIn,
          check_out_date: checkOut,
          guests,
          guest_first_name: form.firstName,
          guest_last_name: form.lastName,
          guest_email: form.email,
          guest_phone: form.phone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Map server validation errors back to form fields
        if (data.errors && Array.isArray(data.errors)) {
          const fieldMap: Record<string, string> = {};
          for (const err of data.errors) {
            const key = err.field
              ?.replace("guest_first_name", "firstName")
              .replace("guest_last_name", "lastName")
              .replace("guest_email", "email")
              .replace("check_in_date", "dates")
              .replace("check_out_date", "dates") ?? "_general";
            fieldMap[key] = err.message;
          }
          setErrors(fieldMap);
        } else {
          setErrors({ _general: data.message || "Booking failed" });
        }
        setSubmitting(false);
        return;
      }

      // Open Midtrans Snap popup and start polling
      if (typeof window !== "undefined" && (window as any).snap) {
        const bookingId = data.data.booking_id;
        const bookingRef = data.data.booking_ref;

        // Set pendingBookingId to trigger the active polling useEffect
        setPendingBookingId(bookingId);

        (window as any).snap.pay(data.data.snap_token, {
          onSuccess: async function (result: any) {
            console.log("[Snap] onSuccess fired", result);
            try {
              await syncBookingStatus(bookingId, bookingRef);
            } catch (err) {
              console.error("[Snap] Status check failed:", err);
            }
          },
          onPending: function (result: any) {
            console.log("[Snap] onPending fired", result);
            syncBookingStatus(bookingId, bookingRef).catch((err) => {
              console.error("[Snap] Pending status check failed:", err);
            });
          },
          onError: function (result: any) {
            console.log("[Snap] onError fired", result);
            setErrors({ _general: "Payment failed. Please try again." });
            setPendingBookingId(null);
            setSubmitting(false);
          },
          onClose: function () {
            console.log("[Snap] onClose fired");
            syncBookingStatus(bookingId, bookingRef).catch((err) => {
              console.error("[Snap] Close status check failed:", err);
            });
            // Do not reset pendingBookingId on close, because the user
            // might have completed payment through another window/tab,
            // or we want to keep checking status. But if they just closed it
            // without paying, we let the polling run for a bit or let them retry.
            // Let's keep polling running to catch any late payments.
          },
        });
      } else {
        setErrors({ _general: "Payment gateway is not loaded. Please refresh the page." });
        setSubmitting(false);
      }

    } catch {
      setErrors({ _general: "Network error. Please try again." });
      setSubmitting(false);
    }
  }



  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500";

  if (confirmed) {
    return (
      <ConfirmationView
        hotel={hotel}
        room={room}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        nights={nights}
        total={breakdown.total}
        bookingRef={confirmed.ref}
        bookingId={confirmed.id}
        guestName={`${form.firstName} ${form.lastName}`.trim()}
        guestEmail={form.email}
      />
    );
  }

  return (
    <>
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Stays
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/rooms/${room.id}`} className="hover:text-slate-900">
          {room.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Book</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900">
        Confirm and pay
      </h1>
      <p className="mt-1 text-slate-500">
        Review your trip, then add your details.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {/* Left: editable trip + guest details */}
        <div className="space-y-8 lg:col-span-2">
          {/* Trip */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Your trip</h2>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className={labelCls}>Room type</span>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className={inputCls}
                >
                  {hotel.rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} —{" "}
                      {formatCurrency(r.pricePerNight, hotel.currency)}/night
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelCls}>Check-in</span>
                  <input
                    type="date"
                    value={checkIn}
                    min={todayISO()}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut)
                        setCheckOut(addDays(e.target.value, 2));
                      setErrors((er) => ({ ...er, dates: "" }));
                    }}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Check-out</span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn ? addDays(checkIn, 1) : todayISO()}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      setErrors((er) => ({ ...er, dates: "" }));
                    }}
                    className={inputCls}
                  />
                </label>
              </div>
              {errors.dates && (
                <p className="text-xs text-red-500">{errors.dates}</p>
              )}

              <label className="block">
                <span className={labelCls}>Guests</span>
                <select
                  value={guests}
                  onChange={(e) => {
                    setGuests(Number(e.target.value));
                    setErrors((er) => ({ ...er, guests: "" }));
                  }}
                  className={inputCls}
                >
                  {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    )
                  )}
                </select>
                {errors.guests && (
                  <p className="mt-1 text-xs text-red-500">{errors.guests}</p>
                )}
              </label>
            </div>
          </section>

          {/* Guest details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Guest details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelCls}>First name</span>
                <input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className={inputCls}
                  placeholder="Jordan"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                )}
              </label>
              <label className="block">
                <span className={labelCls}>Last name</span>
                <input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className={inputCls}
                  placeholder="Lee"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                )}
              </label>
              <label className="block">
                <span className={labelCls}>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </label>
              <label className="block">
                <span className={labelCls}>Phone (optional)</span>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputCls}
                  placeholder="+1 555 123 4567"
                />
              </label>
            </div>
          </section>



          {errors._general && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors._general}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed lg:hidden"
          >
            {submitting ? <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-white-600"></div> : <></>}
            {submitting ? "Processing…" : `Confirm booking · ${formatCurrency(breakdown.total, hotel.currency)}`}
          </button>
        </div>

        {/* Right: sticky summary */}
        <div className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex gap-3 p-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                  <SafeImage
                    src={room.image}
                    fallbackSeed={room.imageSeed}
                    alt={room.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {hotel.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {room.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {hotel.city}, {hotel.country}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 px-4 py-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Dates</span>
                  <span className="font-medium text-slate-900">
                    {checkIn && checkOut
                      ? `${checkIn} → ${checkOut}`
                      : "Select dates"}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-slate-600">
                  <span>Guests</span>
                  <span className="font-medium text-slate-900">{guests}</span>
                </div>
              </div>

              {nights > 0 && (
                <div className="space-y-2 border-t border-slate-100 px-4 py-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {formatCurrency(room.pricePerNight, hotel.currency)} ×{" "}
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span>
                      {formatCurrency(breakdown.roomTotal, hotel.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Service fee</span>
                    <span>
                      {formatCurrency(breakdown.serviceFee, hotel.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes</span>
                    <span>
                      {formatCurrency(breakdown.taxes, hotel.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                    <span>Total</span>
                    <span>
                      {formatCurrency(breakdown.total, hotel.currency)}
                    </span>
                  </div>
                </div>
              )}

              <div className="hidden p-4 lg:block">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing…" : "Confirm booking"}
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">
              Free cancellation up to 48 hours before check-in.
            </p>
          </div>
        </div>
      </form>
    </div>
    </>
  );
}

function ConfirmationView({
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
  nights,
  total,
  bookingRef,
  bookingId,
  guestName,
  guestEmail,
}: {
  hotel: Hotel;
  room: Hotel["rooms"][number];
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
  bookingRef: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
}) {
  // Auto-check status on mount to sync with Midtrans
  // This is the safety net: even if onSuccess didn't trigger the check,
  // this will ensure the DB gets updated.
  useEffect(() => {
    if (!bookingId) return;
    console.log("[ConfirmationView] Auto-checking status for:", bookingId);
    fetch(`/api/bookings/${bookingId}/status`)
      .then(res => res.json())
      .then(data => console.log("[ConfirmationView] Status result:", data))
      .catch(err => console.error("[ConfirmationView] Status check failed:", err));
  }, [bookingId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          You&apos;re booked!
        </h1>
        <p className="mt-2 text-slate-600">
          A confirmation has been sent to{" "}
          <span className="font-medium text-slate-900">
            {guestEmail || "your email"}
          </span>
          .
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Booking reference{" "}
          <span className="font-semibold text-slate-900">{bookingRef}</span>
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative h-40 w-full">
          <SafeImage
            src={hotel.heroImage}
            fallbackSeed={hotel.heroSeed}
            alt={hotel.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">{hotel.name}</h2>
          <p className="text-sm text-slate-500">
            {hotel.city}, {hotel.country}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Guest</dt>
              <dd className="font-medium text-slate-900">
                {guestName || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Room</dt>
              <dd className="font-medium text-slate-900">{room.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Check-in</dt>
              <dd className="font-medium text-slate-900">{checkIn}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Check-out</dt>
              <dd className="font-medium text-slate-900">{checkOut}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Guests</dt>
              <dd className="font-medium text-slate-900">{guests}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Nights</dt>
              <dd className="font-medium text-slate-900">{nights}</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-slate-600">Total paid</span>
            <span className="text-xl font-bold text-slate-900">
              {formatCurrency(total, hotel.currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Back to all stays
        </Link>
        <Link
          href={`/rooms/${room.id}`}
          className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View room again
        </Link>
      </div>
    </div>
  );
}
