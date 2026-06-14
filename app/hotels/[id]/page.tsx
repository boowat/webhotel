import Link from "next/link";
import { notFound } from "next/navigation";
import { getHotel, hotels } from "@/lib/hotels";
import { Gallery } from "@/components/Gallery";
import { AmenityList } from "@/components/AmenityList";
import { RoomCard } from "@/components/RoomCard";
import { BookingWidget } from "@/components/BookingWidget";
import { StarRating } from "@/components/StarRating";

export function generateStaticParams() {
  return hotels.map((h) => ({ id: h.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const hotel = getHotel(params.id);
  return {
    title: hotel ? `${hotel.name} — Lumi Stays` : "Stay not found — Lumi Stays",
  };
}

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function HotelDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const hotel = getHotel(params.id);
  if (!hotel) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Stays
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{hotel.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-slate-900">{hotel.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <StarRating rating={hotel.rating} size={15} />
            <span className="text-slate-500">
              ({hotel.reviewCount.toLocaleString()} reviews)
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PinIcon />
            {hotel.address}
          </span>
        </div>
      </div>

      <Gallery hotel={hotel} />

      {/* Body: two columns */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* About */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              About this stay
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {hotel.description}
            </p>
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {hotel.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 rounded-xl bg-brand-50/60 px-3 py-2.5 text-sm text-slate-700"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {/* Amenities */}
          <section className="border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              What this place offers
            </h2>
            <div className="mt-4">
              <AmenityList amenities={hotel.amenities} />
            </div>
          </section>

          {/* Rooms */}
          <section id="rooms" className="border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Choose your room
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {hotel.rooms.length} room types available.
            </p>
            <div className="mt-5 space-y-4">
              {hotel.rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  hotelId={hotel.id}
                  currency={hotel.currency}
                />
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="border-t border-slate-200 pt-8">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900">
                Guest reviews
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                <StarRating rating={hotel.rating} size={13} showNumber />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hotel.reviews.map((review) => (
                <div
                  key={review.author}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                        {review.author.charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.author}
                        </p>
                        <p className="text-xs text-slate-500">
                          {review.location}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size={13} showNumber={false} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    “{review.text}”
                  </p>
                  <p className="mt-3 text-xs text-slate-400">{review.date}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky booking widget */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <BookingWidget hotel={hotel} />
          </div>
        </div>
      </div>
    </div>
  );
}
