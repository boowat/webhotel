import { useEffect, useRef } from "react";

/**
 * Wires a Cally calendar web component (`<calendar-date>` / `<calendar-range>`)
 * to React:
 *  - registers Cally's custom elements on the client (they touch `window`),
 *  - forwards the element's native `change` event to `onValue` with its raw
 *    string value ("YYYY-MM-DD", or "YYYY-MM-DD/YYYY-MM-DD" for a range).
 *
 * Returns a ref to attach to the calendar element. Custom-element events don't
 * bind reliably through React props on React 18, hence the manual listener.
 */
export function useCallyValue(onValue: (value: string) => void) {
  const ref = useRef<HTMLElement>(null);
  const callback = useRef(onValue);
  callback.current = onValue;

  useEffect(() => {
    import("cally");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e: Event) =>
      callback.current((e.target as HTMLElement & { value?: string }).value ?? "");
    el.addEventListener("change", handle);
    return () => el.removeEventListener("change", handle);
  }, []);

  return ref;
}
