import type { DetailedHTMLProps, HTMLAttributes } from "react";

// Cally ships web components (no React wrapper), so we declare the custom
// elements we use for TSX. @types/react 18.3 scopes the JSX namespace under the
// `react` module (React.JSX) — with `"jsx": "react-jsx"`, TS resolves intrinsic
// elements from there, NOT global JSX — so we augment the module, not `global`.
type CallyElement<Extra> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Extra;

type CallyDateProps = {
  value?: string;
  min?: string;
  max?: string;
  today?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-date": CallyElement<CallyDateProps>;
      "calendar-range": CallyElement<CallyDateProps & { months?: number | string }>;
      "calendar-month": CallyElement<{ offset?: number | string }>;
    }
  }
}
