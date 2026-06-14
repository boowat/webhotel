import Link from "next/link";
import { hotels } from "@/lib/hotels";
import { HotelCard } from "@/components/HotelCard";
import { SafeImage } from "@/components/SafeImage";

const steps = [
  {
    title: "Find your stay",
    body: "Browse a small, hand-picked collection. No endless scroll, no fake urgency.",
    icon: (
      <path d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
    ),
  },
  {
    title: "Pick your dates",
    body: "Choose a room, set your dates and guests, and see the full price up front.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  {
    title: "Book in seconds",
    body: "Confirm your details and you are done. Instant confirmation, no surprises.",
    icon: <path d="M20 6 9 17l-5-5" />,
  },
];

export default function HomePage() {
  const featured = hotels[0];
  const rest = hotels.slice(1);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={featured.gallery[0].src}
            fallbackSeed="home-hero"
            alt="Featured destination"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/45 to-slate-900/30" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-200">
            Lumi Stays
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Stay somewhere worth the trip.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-200">
            A curated collection of hotels around the world, booked in a few taps.
            No clutter, no noise — just places we would actually stay.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#stays"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Explore stays
            </Link>
            <Link
              href={`/hotels/${featured.id}`}
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              View the featured villa
            </Link>
          </div>
        </div>
      </section>

      {/* Featured stay strip */}
      <section className="mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
        <Link
          href={`/hotels/${featured.id}`}
          className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lift sm:flex-row"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-auto sm:w-2/5">
            <SafeImage
              src={featured.heroImage}
              fallbackSeed={featured.heroSeed}
              alt={featured.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Featured stay
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {featured.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {featured.city}, {featured.country}
            </p>
            <p className="mt-3 max-w-lg text-slate-600">{featured.tagline}.</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              See rooms & availability
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      </section>

      {/* Stays grid */}
      <section id="stays" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              More places to stay
            </h2>
            <p className="mt-1 text-slate-500">
              Hand-picked hotels across six destinations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <p className="mt-1 text-slate-500">
            From browsing to booked in three steps.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {step.icon}
                  </svg>
                </div>
                <h3 className="mt-4 flex items-center gap-2 font-semibold text-slate-900">
                  <span className="text-sm text-slate-400">0{i + 1}</span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
