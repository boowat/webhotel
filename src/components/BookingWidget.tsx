"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Hotel } from "@/lib/types";
import {
  addDays,
  formatCurrency,
  nightsBetween,
  priceBreakdown,
  todayISO,
} from "@/lib/pricing";
import { StarRating } from "./StarRating";
import { useTranslations } from "next-intl";
import { PiDoorOpenDuotone } from "react-icons/pi";

export function BookingWidget({ hotel }: { hotel: Hotel }) {
  const t = useTranslations("home");
  const router = useRouter();
  const [roomId, setRoomId] = useState(hotel.rooms[0].id);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // Default dates are set on the client only, to avoid hydration mismatch.
  useEffect(() => {
    const today = todayISO();
    setCheckIn(addDays(today, 7));
    setCheckOut(addDays(today, 9));
  }, []);

  const room = hotel.rooms.find((r) => r.id === roomId) ?? hotel.rooms[0];
  const nights = nightsBetween(checkIn, checkOut);
  const breakdown = useMemo(
    () => priceBreakdown(room.pricePerNight, nights),
    [room.pricePerNight, nights],
  );

  const datesValid = nights > 0;
  const guestsValid = guests <= room.maxGuests;

  function reserve() {
    const params = new URLSearchParams({
      room: room.id,
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/book/${hotel.id}?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between">
        <p className="text-slate-900">
          <span className="text-2xl font-bold">
            {formatCurrency(room.pricePerNight, hotel.currency)}
          </span>{" "}
          <span className="text-sm text-slate-500">/ night</span>
        </p>
        <StarRating rating={hotel.rating} size={14} />
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">
            Room type
          </span>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            {hotel.rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {formatCurrency(r.pricePerNight, hotel.currency)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Check-in
            </span>
            <input
              type="date"
              value={checkIn}
              min={todayISO()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  setCheckOut(addDays(e.target.value, 2));
                }
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Check-out
            </span>
            <input
              type="date"
              value={checkOut}
              min={checkIn ? addDays(checkIn, 1) : todayISO()}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">
            Guests
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      {datesValid && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>
              {formatCurrency(room.pricePerNight, hotel.currency)} × {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </span>
            <span>{formatCurrency(breakdown.roomTotal, hotel.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Service fee</span>
            <span>{formatCurrency(breakdown.serviceFee, hotel.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Taxes</span>
            <span>{formatCurrency(breakdown.taxes, hotel.currency)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(breakdown.total, hotel.currency)}</span>
          </div>
        </div>
      )}

      {!guestsValid && (
        <p className="mt-3 text-xs text-amber-600">
          This room sleeps up to {room.maxGuests}. Pick a larger room for{" "}
          {guests} guests.
        </p>
      )}

      <button
        onClick={reserve}
        disabled={!datesValid || !guestsValid}
        className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 hover:cursor-pointer"
      >
        <PiDoorOpenDuotone className="mr-2 inline-block h-4 w-4" />
        {t("booking.bookNow")}
      </button>
      <p className="mt-2 text-center text-xs text-slate-400">
        You won&apos;t be charged — this is a demo.
      </p>
    </div>
  );
}
