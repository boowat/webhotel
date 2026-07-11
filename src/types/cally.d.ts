import type { DetailedHTMLProps, HTMLAttributes } from "react";

// Cally ships web components (no React wrapper). Declare the custom elements
// we use so TSX accepts <calendar-range> / <calendar-month>.
type CallyElement<Extra> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Extra;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-range": CallyElement<{
        class?: string;
        value?: string;
        min?: string;
        max?: string;
        months?: number | string;
        today?: string;
      }>;
      "calendar-month": CallyElement<{ class?: string; offset?: number | string }>;
    }
  }
}
