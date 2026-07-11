"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  PiBedDuotone,
  PiDoorOpenDuotone,
  PiCalendarDotsDuotone,
  PiClockDuotone,
  PiUsersDuotone,
  PiMagnifyingGlassBold,
  PiMinusBold,
  PiPlusBold,
  PiCaretDownBold,
} from "react-icons/pi";
import { addDays, todayISO } from "@/lib/pricing";

type Tab = "rooms" | "venue";

// No venue data source yet — a small local list of meeting spaces for the dropdown.
const VENUES = [
  { id: "grand-ballroom", name: "Grand Ballroom" },
  { id: "menteng-hall", name: "Menteng Hall" },
  { id: "boardroom-a", name: "Boardroom A" },
  { id: "garden-pavilion", name: "Garden Pavilion" },
];

function Counter({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-base-content/80">{label}</span>
      <div className="join">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="btn btn-sm btn-outline join-item"
          aria-label={`Decrease ${label}`}
        >
          <PiMinusBold />
        </button>
        <span className="join-item flex w-10 items-center justify-center border border-base-300 text-sm font-medium">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="btn btn-sm btn-outline join-item"
          aria-label={`Increase ${label}`}
        >
          <PiPlusBold />
        </button>
      </div>
    </div>
  );
}

export default function BookingForm() {
  const t = useTranslations("home");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("rooms");

  // Rooms tab
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const rangeRef = useRef<HTMLElement>(null);

  // Venue tab
  const [venueId, setVenueId] = useState(VENUES[0].id);
  const [venueDate, setVenueDate] = useState("");
  const [venueTime, setVenueTime] = useState("10:00");
  const [venueGuests, setVenueGuests] = useState(10);

  // Register Cally's web components on the client only (they touch `window`).
  useEffect(() => {
    import("cally");
  }, []);

  // Default dates are set on the client only, to avoid hydration mismatch.
  useEffect(() => {
    const today = todayISO();
    setCheckIn(addDays(today, 7));
    setCheckOut(addDays(today, 9));
    setVenueDate(addDays(today, 14));
  }, []);

  // Cally <calendar-range> emits a native `change` event; its value is
  // "YYYY-MM-DD/YYYY-MM-DD". Wire it via a ref (custom-element events don't
  // reliably bind through React props on React 18).
  useEffect(() => {
    const el = rangeRef.current;
    if (!el) return;
    const onChange = (e: Event) => {
      const value = (e.target as HTMLElement & { value?: string }).value ?? "";
      const [start, end] = value.split("/");
      if (start) setCheckIn(start);
      if (end) setCheckOut(end);
    };
    el.addEventListener("change", onChange);
    return () => el.removeEventListener("change", onChange);
  }, []);

  const rangeValue = checkIn && checkOut ? `${checkIn}/${checkOut}` : "";
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              86400000,
          ),
        )
      : 0;

  function searchRooms() {
    const params = new URLSearchParams({
      type: "rooms",
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
    });
    // TODO: point to the real search results route once it exists.
    router.push(`/#stays?${params.toString()}`);
  }

  function searchVenue() {
    const params = new URLSearchParams({
      type: "venue",
      venue: venueId,
      date: venueDate,
      time: venueTime,
      guests: String(venueGuests),
    });
    router.push(`/#stays?${params.toString()}`);
  }

  const fieldLabel = "mb-1 block text-xs font-medium text-base-content/60";
  const inputCls = "input input-bordered w-full";

  return (
    <div className="card mx-auto w-full max-w-3xl bg-base-100 shadow-xl">
      <div className="card-body w-full gap-5 p-4 sm:p-6">
        {/* Tabs */}
        <div role="tablist" className="tabs tabs-box w-full bg-base-100">
          <button
            role="tab"
            onClick={() => setTab("rooms")}
            className={`tab gap-2 ${tab === "rooms" ? "tab-active" : ""}`}
          >
            <PiBedDuotone className="h-5 w-5" />
            {t("booking.rooms")}
          </button>
          <button
            role="tab"
            onClick={() => setTab("venue")}
            className={`tab gap-2 ${tab === "venue" ? "tab-active" : ""}`}
          >
            <PiDoorOpenDuotone className="h-5 w-5" />
            {t("booking.venues")}
          </button>
        </div>

        {/* Rooms panel */}
        {tab === "rooms" && (
          <div className="flex flex-col gap-4">
            <div className="block">
              <span className={fieldLabel}>
                {t("booking.checkIn")} — {t("booking.checkOut")}
              </span>
              <div className="dropdown w-full">
                <div
                  tabIndex={0}
                  role="button"
                  className={`${inputCls} flex items-center justify-between gap-2`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <PiCalendarDotsDuotone className="h-4 w-4 shrink-0 text-base-content/40" />
                    {checkIn && checkOut ? (
                      <span className="truncate">
                        {checkIn} → {checkOut}
                        <span className="ml-1 text-base-content/50">
                          ({nights} {nights === 1 ? "night" : "nights"})
                        </span>
                      </span>
                    ) : (
                      <span className="text-base-content/50">
                        {t("booking.checkIn")} — {t("booking.checkOut")}
                      </span>
                    )}
                  </span>
                  <PiCaretDownBold className="h-3.5 w-3.5 shrink-0 text-base-content/40" />
                </div>
                <div
                  tabIndex={0}
                  className="dropdown-content z-10 mt-2 rounded-box border border-base-300 bg-base-100 p-3 shadow-lg"
                >
                  <calendar-range
                    ref={rangeRef}
                    class="cally bg-base-100"
                    value={rangeValue}
                    min={todayISO()}
                    months={1}
                  >
                    <span slot="previous" className="inline-flex">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M15.75 19.5 8.25 12l7.5-7.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span slot="next" className="inline-flex">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <calendar-month></calendar-month>
                  </calendar-range>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Counter
                label={t("booking.adults")}
                value={adults}
                min={1}
                onChange={setAdults}
              />
              <Counter
                label={t("booking.children")}
                value={children}
                min={0}
                onChange={setChildren}
              />
            </div>

            <button
              type="button"
              onClick={searchRooms}
              className="btn btn-primary"
            >
              <PiMagnifyingGlassBold className="h-4 w-4" />
              {t("booking.search")}
            </button>
          </div>
        )}

        {/* Venue panel */}
        {tab === "venue" && (
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className={fieldLabel}>{t("booking.venues")}</span>
              <div className="relative">
                <PiDoorOpenDuotone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="select select-bordered w-full pl-9"
                >
                  {VENUES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block">
              <span className={fieldLabel}>{t("booking.date")}</span>
              <div className="relative">
                <PiCalendarDotsDuotone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                <input
                  type="date"
                  value={venueDate}
                  min={todayISO()}
                  onChange={(e) => setVenueDate(e.target.value)}
                  className={`${inputCls} pl-9`}
                />
              </div>
            </label>

            <label className="block">
              <span className={fieldLabel}>{t("booking.time")}</span>
              <div className="relative">
                <PiClockDuotone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                <input
                  type="time"
                  value={venueTime}
                  onChange={(e) => setVenueTime(e.target.value)}
                  className={`${inputCls} pl-9`}
                />
              </div>
            </label>

            <label className="block">
              <span className={fieldLabel}>
                <PiUsersDuotone className="mr-1 inline h-3.5 w-3.5" />
                {t("booking.guests")}
              </span>
              <Counter
                label=""
                value={venueGuests}
                min={1}
                onChange={setVenueGuests}
              />
            </label>

            <button
              type="button"
              onClick={searchVenue}
              className="btn btn-primary"
            >
              <PiMagnifyingGlassBold className="h-4 w-4" />
              {t("booking.search")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
