"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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

// "YYYY-MM-DD" -> "DD Month" (e.g. "12 July"), month name in the active locale.
function formatDate(iso: string, locale: string) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  const monthName = new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
  return `${day} ${monthName}`;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  placeholder,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  placeholder?: string;
}) {
  const t = useTranslations("home.booking");
  const locale = useLocale();
  const rangeRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState({ checkIn, checkOut });

  function open() {
    setDraft({ checkIn, checkOut });
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function done() {
    onChange(draft.checkIn, draft.checkOut);
    close();
  }

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
      setDraft({ checkIn: start ?? "", checkOut: end ?? "" });
    };
    el.addEventListener("change", handle);
    return () => el.removeEventListener("change", handle);
  }, []);

  const rangeValue =
    draft.checkIn && draft.checkOut ? `${draft.checkIn}/${draft.checkOut}` : "";

  const nights = nightsBetween(checkIn, checkOut);

  return (
    <>
      <label className="text-base-content text-xs font-medium">
        {t("setDate")}
      </label>
      {/* custom input that trigger dropdown */}

      <button
        type="button"
        onClick={open}
        className="input input-bordered bg-base-200 flex w-full items-center justify-between gap-2"
      >
        <span className="flex flex-row items-center gap-2">
          <PiCalendarDotsDuotone className="text-primary/80 h-4 w-4 shrink-0" />
          {checkIn && checkOut ? (
            <span className="flex flex-row items-center justify-center gap-1">
              {formatDate(checkIn, locale)}
              <PiCaretRight className="text-primary/90 h-4 w-4" />
              {formatDate(checkOut, locale)}
              <span className="text-base-content/50 ml-1">
                ({t("nights", { count: nights })})
              </span>
            </span>
          ) : (
            <span className="text-base-content/40">
              {placeholder ?? t("dateRangePlaceholder")}
            </span>
          )}
        </span>
      </button>

      <dialog ref={dialogRef} className="modal modal-middle">
        <div className="modal-box w-fit">
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

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={close}>
              {t("cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={done}
              disabled={!draft.checkIn || !draft.checkOut}
            >
              {t("done")}
            </button>
          </div>
        </div>

        <button type="button" className="modal-backdrop" onClick={close}>
          {t("close")}
        </button>
      </dialog>
    </>
  );
}
