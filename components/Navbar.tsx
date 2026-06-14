import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Lumi Stays
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/#stays" className="hover:text-slate-900">
            Stays
          </Link>
          <Link href="/#how" className="hover:text-slate-900">
            How it works
          </Link>
          <a href="#" className="hover:text-slate-900">
            List your property
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
          >
            Sign in
          </a>
          <a
            href="#"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
