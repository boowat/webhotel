"use client";

import {
  PiBuildingApartmentDuotone,
  PiCaretDownBold,
  PiCheckBold,
} from "react-icons/pi";
import { VENUES } from "@/lib/venues";

export function DropDownVenues({
  value,
  onChange,
  label = "Venue",
  placeholder = "Select a venue",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  return (
    <div className="dropdown flex w-full flex-col gap-1">
      <label className="text-xs font-medium text-base-content">{label}</label>
      {/* trigger — shows the current selection */}
      <div
        tabIndex={0}
        role="button"
        className="input input-bordered flex w-full items-center justify-between gap-2 bg-base-200"
      >
        <span className="flex items-center gap-2 truncate">
          <PiBuildingApartmentDuotone className="h-4 w-4 shrink-0 text-primary/80" />
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-base-content/40">{placeholder}</span>
          )}
        </span>
        <PiCaretDownBold className="h-3.5 w-3.5 shrink-0 text-base-content/40" />
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu z-10 mt-2 w-full rounded-box bg-base-100 p-2 shadow-lg"
      >
        {VENUES.map((venue) => (
          <li key={venue}>
            <button
              type="button"
              className={
                value === venue ? "bg-primary/10 font-medium text-primary" : ""
              }
              onClick={(e) => {
                onChange(venue);
                // blur to close the CSS (focus-based) dropdown
                e.currentTarget.blur();
              }}
            >
              {venue}
              {value === venue ? (
                <PiCheckBold className="ml-auto h-4 w-4" />
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
