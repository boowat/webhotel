"use client";

import { useEffect, useRef } from "react";
import {
  PiCalendarDotsDuotone,
  PiCaretLeft,
  PiCaretRight,
} from "react-icons/pi";
import { todayISO } from "@/lib/pricing";

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(
    0,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    ),
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// "YYYY-MM-DD" -> "DD Month YYYY" (e.g. "12 July 2026").
function formatDate(iso: string) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  placeholder = "Check-in - Check-out",
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  placeholder?: string;
}) {
  const rangeRef = useRef<HTMLElement>(null);

  // Register Cally's custom elements on the client only (they touch `window`).
  useEffect(() => {
    import("cally");
  }, []);

  // Cally's <calendar-range> emits a native `change` event; its value is
  // "YYYY-MM-DD/YYYY-MM-DD". Custom-element events don't bind reliably through
  // React props on React 18, so wire it up via a ref.
  useEffect(() => {
    const el = rangeRef.current;
    if (!el) return;
    const handle = (e: Event) => {
      const value = (e.target as HTMLElement & { value?: string }).value ?? "";
      const [start, end] = value.split("/");
      onChange(start ?? "", end ?? "");
    };
    el.addEventListener("change", handle);
    return () => el.removeEventListener("change", handle);
  }, [onChange]);

  const rangeValue = checkIn && checkOut ? `${checkIn}/${checkOut}` : "";
  const nights = nightsBetween(checkIn, checkOut);

  return (
    <div className="dropdown mb-4 flex w-full flex-col gap-1">
      <label className="text-base-content text-xs font-medium">Set Date</label>
      {/* custom input that trigger dropdown */}
      <div
        tabIndex={0}
        role="button"
        className="input input-bordered bg-base-200 flex w-full items-center justify-between gap-2"
      >
        <span className="flex flex-row items-center gap-2">
          <PiCalendarDotsDuotone className="text-primary/80 h-4 w-4 shrink-0" />
          {checkIn && checkOut ? (
            <span className="flex flex-row items-center justify-center gap-1">
              {formatDate(checkIn)}
              <PiCaretRight className="text-primary/90 h-4 w-4" />
              {formatDate(checkOut)}
              <span className="text-base-content/50 ml-1">
                ({nights} {nights === 1 ? "night" : "nights"})
              </span>
            </span>
          ) : (
            <span className="text-base-content/40">{placeholder}</span>
          )}
        </span>
      </div>

      <div
        tabIndex={0}
        className="dropdown-content rounded-box border-base-300 bg-base-100 z-10 mt-2 border p-3 shadow-lg"
      >
        <calendar-range
          ref={rangeRef}
          className="cally bg-base-100"
          value={rangeValue}
          min={todayISO()}
          months={1}
        >
          <PiCaretLeft slot="previous" className="h-4 w-4" aria-hidden />
          <PiCaretRight slot="next" className="h-4 w-4" aria-hidden />
          <calendar-month></calendar-month>
        </calendar-range>
      </div>
    </div>
  );
}
