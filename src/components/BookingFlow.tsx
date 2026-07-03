"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Hotel } from "@/lib/types";
import { SafeImage } from "./SafeImage";
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
  card: string;
  expiry: string;
  cvc: string;
}

const emptyForm: GuestForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  card: "",
  expiry: "",
  cvc: "",
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
  // Credit card unvisualized hanya untuk mengirim nomor kartu ke server
  const [creditCardUnvisualizedNumber, setCreditCardUnvisualizedNumber] = useState<number>();
  // Untuk dinamis input ke user
  const [creditCardVisualized, setCreditCardVisualized] = useState<string>("");
  const [form, setForm] = useState<GuestForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<{ ref: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const luhnCheck = (value: string): boolean => {
    // Remove any non‑digit characters (e.g., spaces or dashes) to ensure a clean numeric string
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return false;
    let sum = 0;
    let shouldDouble = false;
    // Iterate from right‑most digit to left‑most
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      next.email = "Enter a valid email";
    if (!form.card.trim()) next.card = "Required (use any Luhn-verified number)";
    if (!luhnCheck(form.card)) next.card = "Invalid credit card number";
    if (!/^[0-1][0-9]\/\d{2}$/.test(form.expiry)) {
      next.expiry = "Format: MM/YY";
    } else {
      const [mm, yy] = form.expiry.split("/").map((v) => parseInt(v, 10));
      const expYear = 2000 + yy;
      const expMonth = mm;
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      if (
        expYear < currentYear ||
        (expYear === currentYear && expMonth < currentMonth)
      ) {
        next.expiry = "Expired card. Please use a valid card.";
      }
    }
    if (!form.cvc.match(/^[0-9]{3,4}$/)) next.cvc = "Enter valid 3 or 4-digit CVC";
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
          card_number: form.card.replace(/\D/g, ""),
          card_expiry: form.expiry,
          card_cvc: form.cvc,
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
              .replace("card_number", "card")
              .replace("card_expiry", "expiry")
              .replace("card_cvc", "cvc")
              .replace("check_in_date", "dates")
              .replace("check_out_date", "dates") ?? "_general";
            fieldMap[key] = err.message;
          }
          setErrors(fieldMap);
        } else {
          setErrors({ _general: data.message || "Booking failed" });
        }
        return;
      }

      setConfirmed({ ref: data.data.booking_ref });
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    } catch {
      setErrors({ _general: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const changeCreditCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const visualization = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCreditCardVisualized(visualization);
    setCreditCardUnvisualizedNumber(Number(digits));
    setErrors((er) => ({ ...er, card: "" }));
    update("card", digits);
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500";
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
        guestName={`${form.firstName} ${form.lastName}`.trim()}
        guestEmail={form.email}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Stays
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/hotels/${hotel.id}`} className="hover:text-slate-900">
          {hotel.name}
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

          {/* Payment (mock) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Payment</h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                Demo — no real charge
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={labelCls}>Card number</span>
                <input
                  value={creditCardVisualized}
                  onChange={(e) => changeCreditCardNumber(e)}
                  className={inputCls}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                />
                {errors.card && (
                  <p className="mt-1 text-xs text-red-500">{errors.card}</p>
                )}
              </label>
              <label className="block">
                <span className={labelCls}>Expiry</span>
                <input
                  value={form.expiry}
                  onChange={(e) => update("expiry", e.target.value)}
                  className={inputCls}
                  placeholder="12/28"
                />
                {errors.expiry && (
                  <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>
                )}
              </label>
              <label className="block">
                <span className={labelCls}>CVC</span>
                <input
                  value={form.cvc}
                  onChange={(e) => update("cvc", e.target.value)}
                  className={inputCls}
                  placeholder="123"
                  inputMode="numeric"
                />
                {errors.cvc && (
                  <p className="mt-1 text-xs text-red-500">{errors.cvc}</p>
                )}
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
            className="w-full rounded-full bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed lg:hidden"
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
                  className="w-full rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  guestName: string;
  guestEmail: string;
}) {
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
          className="rounded-full bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Back to all stays
        </Link>
        <Link
          href={`/hotels/${hotel.id}`}
          className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View stay again
        </Link>
      </div>
    </div>
  );
}
