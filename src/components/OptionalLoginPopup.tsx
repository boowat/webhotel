"use client";

import { FormEvent, useEffect, useState } from "react";

type PopupStep = "choice" | "create" | "login" | "success";

const storageKey = "lumi-login-discount-popup-dismissed";

function hasDismissedOffer() {
  try {
    return window.sessionStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

function rememberDismissedOffer() {
  try {
    window.sessionStorage.setItem(storageKey, "true");
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
}

export function OptionalLoginPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<PopupStep>("choice");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (hasDismissedOffer()) return;

    const timer = window.setTimeout(() => setIsVisible(true), 900);

    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    rememberDismissedOffer();
    setIsVisible(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("success");
  }

  if (!isVisible) return null;

  const isFormStep = step === "create" || step === "login";

  return (
    <aside
      aria-labelledby="optional-login-popup-title"
      aria-modal="false"
      role="dialog"
      className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:max-w-sm"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift">
        <div className="relative bg-slate-900 px-5 py-4 text-white">
          <button
            aria-label="Close login offer"
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            onClick={dismiss}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-3 pr-8">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" />
                <path d="M2 7h20v5H2z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 1 1 2.5-2.5C10 6 12 7 12 7Z" />
                <path d="M12 7h4.5A2.5 2.5 0 1 0 14 4.5C14 6 12 7 12 7Z" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Member offer
              </p>
              <h2
                className="mt-1 text-lg font-bold leading-snug"
                id="optional-login-popup-title"
              >
                Get special discount by creating your account
              </h2>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          {step === "choice" && (
            <>
              <p className="text-sm leading-6 text-slate-600">
                Create an account or sign in to receive discount codes and
                limited hotel offers through email notifications.
              </p>

              <div className="mt-5 grid gap-2">
                <button
                  className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                  onClick={() => setStep("create")}
                  type="button"
                >
                  Create account
                </button>
                <button
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => setStep("login")}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  onClick={dismiss}
                  type="button"
                >
                  Maybe later
                </button>
              </div>
            </>
          )}

          {isFormStep && (
            <form onSubmit={handleSubmit}>
              <p className="text-sm leading-6 text-slate-600">
                {step === "create"
                  ? "Use your email to start a Des Indes account and get offer alerts."
                  : "Sign in with your email to unlock member-only discounts."}
              </p>

              <label
                className="mt-4 block text-sm font-semibold text-slate-700"
                htmlFor="optional-login-email"
              >
                Email address
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
                id="optional-login-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />

              <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <input
                  className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary"
                  defaultChecked
                  type="checkbox"
                />
                Send me discounts and selected hotel offers by email.
              </label>

              <div className="mt-5 grid gap-2">
                <button
                  className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                  type="submit"
                >
                  {step === "create" ? "Create account" : "Sign in"}
                </button>
                <button
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => setStep("choice")}
                  type="button"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div aria-live="polite">
              <p className="text-sm font-semibold text-slate-900">
                You are on the list.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                We will send discounts and selected hotel offers to your email.
              </p>
              <button
                className="mt-5 w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                onClick={dismiss}
                type="button"
              >
                Continue browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
