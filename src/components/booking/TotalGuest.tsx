"use client";

import { PiUsersDuotone, PiMinusBold, PiPlusBold } from "react-icons/pi";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("home.booking");

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
          aria-label={t("decrease", { label })}
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
          aria-label={t("increase", { label })}
        >
          <PiPlusBold />
        </button>
      </div>
    </div>
  );
}

export function TotalGuest({
  label,
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
  const t = useTranslations("home.booking");
  const heading = label ?? t("guests");
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
      <label className="text-base-content text-xs font-medium">{heading}</label>
      {/* trigger — shows the current selection summary */}
      <button
        type="button"
        onClick={open}
        className="input input-bordered bg-base-200 flex w-full items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 truncate">
          <PiUsersDuotone className="text-primary/80 h-4 w-4 shrink-0" />
          <span className="truncate">
            {t("guestSummary", { rooms, adults, children: childrenCount })}
          </span>
        </span>
      </button>

      <dialog ref={dialogRef} className="modal modal-middle">
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-semibold">{heading}</h3>

          <Stepper
            label={t("rooms")}
            value={draft.rooms}
            min={1}
            onChange={(v) => setDraft((d) => ({ ...d, rooms: v }))}
          />
          <Stepper
            label={t("adults")}
            hint={t("adultsHint")}
            value={draft.adults}
            min={1}
            onChange={(v) => setDraft((d) => ({ ...d, adults: v }))}
          />
          <Stepper
            label={t("children")}
            hint={t("childrenHint")}
            value={draft.childrenCount}
            min={0}
            onChange={(v) => setDraft((d) => ({ ...d, childrenCount: v }))}
          />

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={close}>
              {t("cancel")}
            </button>
            <button type="button" className="btn btn-primary" onClick={done}>
              {t("done")}
            </button>
          </div>
        </div>

        {/* click outside to close */}
        <button type="button" className="modal-backdrop" onClick={close}>
          {t("close")}
        </button>
      </dialog>
    </>
  );
}
