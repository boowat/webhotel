import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <span className="text-5xl font-bold text-primary">404</span>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 text-slate-600">
        The stay you&apos;re looking for may have moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        Back to all stays
      </Link>
    </div>
  );
}
