"use client";

import { PiCalendarDotsDuotone } from "react-icons/pi";
import { todayISO } from "@/lib/pricing";
import { formatDate } from "@/lib/date";
import { useCallyValue } from "@/hooks/useCallyValue";
import { CalendarArrows } from "./CalendarArrows";

export function DatePicker({
  value,
  onChange,
  label = "Date",
  placeholder = "Select a date",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const dateRef = useCallyValue(onChange);

  return (
    <div className="dropdown flex w-full flex-col gap-1">
      <label className="text-xs font-medium text-base-content">{label}</label>
      {/* custom input that triggers the dropdown */}
      <div
        tabIndex={0}
        role="button"
        className="input input-bordered flex w-full items-center gap-2 bg-base-200"
      >
        <PiCalendarDotsDuotone className="h-4 w-4 shrink-0 text-primary/80" />
        {value ? (
          <span className="truncate">{formatDate(value)}</span>
        ) : (
          <span className="text-base-content/40">{placeholder}</span>
        )}
      </div>

      <div
        tabIndex={0}
        className="dropdown-content z-10 mt-2 rounded-box border border-base-300 bg-base-100 p-3 shadow-lg"
      >
        <calendar-date
          ref={dateRef}
          className="cally bg-base-100"
          value={value}
          min={todayISO()}
        >
          <CalendarArrows />
          <calendar-month></calendar-month>
        </calendar-date>
      </div>
    </div>
  );
}
