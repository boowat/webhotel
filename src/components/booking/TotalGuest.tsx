"use client";

import { PiUsersDuotone, PiMinusBold, PiPlusBold } from "react-icons/pi";

function Stepper({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 mb-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-base-content">{label}</span>
        {hint ? (
          <span className="text-xs text-base-content/50">{hint}</span>
        ) : null}
      </div>
      <div className="join">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="join-item flex h-9 w-9 items-center justify-center border border-primary bg-base-100 text-base-content transition-colors hover:bg-base-200 disabled:opacity-40 disabled:hover:bg-base-100"
          aria-label={`Decrease ${label}`}
        >
          <PiMinusBold />
        </button>
        <span className="join-item flex h-9 w-10 items-center justify-center border border-primary bg-base-100 text-sm font-medium">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="join-item flex h-9 w-9 items-center justify-center border border-primary bg-base-100 text-base-content transition-colors hover:bg-base-200"
          aria-label={`Increase ${label}`}
        >
          <PiPlusBold />
        </button>
      </div>
    </div>
  );
}

// e.g. "1 Room, 2 Adults, 1 Child"
function summarize(rooms: number, adults: number, childrenCount: number) {
  const room = `${rooms} Room${rooms === 1 ? "" : "s"}`;
  const adult = `${adults} Adult${adults === 1 ? "" : "s"}`;
  const child = `${childrenCount} ${
    childrenCount === 1 ? "Child" : "Children"
  }`;
  return `${room}, ${adult}, ${child}`;
}

export function TotalGuest({
  label = "Guests",
  rooms,
  adults,
  childrenCount,
  onChange,
}: {
  label?: string;
  rooms: number;
  adults: number;
  childrenCount: number;
  onChange: (rooms: number, adults: number, childrenCount: number) => void;
}) {
  return (
    <div className="dropdown flex w-full flex-col gap-1">
      <label className="text-xs font-medium text-base-content">{label}</label>
      {/* trigger — shows the current selection summary */}
      <div
        tabIndex={0}
        role="button"
        className="input input-bordered flex w-full items-center justify-between gap-2 bg-base-200"
      >
        <span className="flex items-center gap-2 truncate">
          <PiUsersDuotone className="h-4 w-4 shrink-0 text-primary/80" />
          <span className="truncate">
            {summarize(rooms, adults, childrenCount)}
          </span>
        </span>
      </div>

      <div
        tabIndex={0}
        className="dropdown-content z-10 mt-2 w-full rounded-box bg-base-100 p-3 shadow-lg"
      >
        <Stepper
          label="Rooms"
          value={rooms}
          min={1}
          onChange={(v) => onChange(v, adults, childrenCount)}
        />
        <Stepper
          label="Adults"
          hint="Ages 13+"
          value={adults}
          min={1}
          onChange={(v) => onChange(rooms, v, childrenCount)}
        />
        <Stepper
          label="Children"
          hint="Ages 0–12"
          value={childrenCount}
          min={0}
          onChange={(v) => onChange(rooms, adults, v)}
        />
      </div>
    </div>
  );
}
