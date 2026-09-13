"use client";

import { PiUsersDuotone, PiMinusBold, PiPlusBold } from "react-icons/pi";
import { useRef, useState } from "react";

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
    <div className="mb-4 flex items-center justify-between gap-4 py-1.5">
      <div className="flex flex-col">
        <span className="text-base-content text-sm font-medium">{label}</span>
        {hint ? (
          <span className="text-base-content/50 text-xs">{hint}</span>
        ) : null}
      </div>
      <div className="join">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="join-item border-primary bg-base-100 text-base-content hover:bg-base-200 disabled:hover:bg-base-100 flex h-9 w-9 items-center justify-center border transition-colors disabled:opacity-40"
          aria-label={`Decrease ${label}`}
        >
          <PiMinusBold />
        </button>
        <span className="join-item border-primary bg-base-100 flex h-9 w-10 items-center justify-center border text-sm font-medium">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="join-item border-primary bg-base-100 text-base-content hover:bg-base-200 flex h-9 w-9 items-center justify-center border transition-colors"
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState({ rooms, adults, childrenCount }); //temporary state to hold the values while the dialog is open

  function open() {
    setDraft({ rooms, adults, childrenCount });
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function done() {
    onChange(draft.rooms, draft.adults, draft.childrenCount);
    close();
  }

  return (
    <>
      <label className="text-base-content text-xs font-medium">{label}</label>
      {/* trigger — shows the current selection summary */}
      <button
        type="button"
        onClick={open}
        className="input input-bordered bg-base-200 flex w-full items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 truncate">
          <PiUsersDuotone className="text-primary/80 h-4 w-4 shrink-0" />
          <span className="truncate">
            {summarize(rooms, adults, childrenCount)}
          </span>
        </span>
      </button>

      <dialog ref={dialogRef} className="modal modal-middle">
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-semibold">{label}</h3>

          <Stepper
            label="Rooms"
            value={draft.rooms}
            min={1}
            onChange={(v) => setDraft((d) => ({ ...d, rooms: v }))}
          />
          <Stepper
            label="Adults"
            hint="Ages 13+"
            value={draft.adults}
            min={1}
            onChange={(v) => setDraft((d) => ({ ...d, adults: v }))}
          />
          <Stepper
            label="Children"
            hint="Ages 0–12"
            value={draft.childrenCount}
            min={0}
            onChange={(v) => setDraft((d) => ({ ...d, childrenCount: v }))}
          />

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={done}>
              Done
            </button>
          </div>
        </div>

        {/* click outside to close */}
        <button type="button" className="modal-backdrop" onClick={close}>
          close
        </button>
      </dialog>
    </>
  );
}
