import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

/**
 * Prev/next chevrons for Cally calendars. Rendered into the calendar's
 * `previous` / `next` slots — drop it directly inside <calendar-date> /
 * <calendar-range>.
 */
export function CalendarArrows() {
  return (
    <>
      <PiCaretLeft slot="previous" className="h-4 w-4" aria-hidden />
      <PiCaretRight slot="next" className="h-4 w-4" aria-hidden />
    </>
  );
}
