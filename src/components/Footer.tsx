export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
                <svg
                  width="15"
                  height="15"
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
                </svg>
              </span>
              <span className="font-semibold text-slate-900">Lumi Stays</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              A curated collection of hotels worth traveling for. Booked in a few
              taps.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-slate-600 sm:grid-cols-3">
            <a href="#" className="hover:text-slate-900">About</a>
            <a href="#" className="hover:text-slate-900">Careers</a>
            <a href="#" className="hover:text-slate-900">Press</a>
            <a href="#" className="hover:text-slate-900">Help center</a>
            <a href="#" className="hover:text-slate-900">Cancellation</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© 2026 Lumi Stays. Prototype demo — no real bookings are made.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600">Privacy</a>
            <a href="#" className="hover:text-slate-600">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
