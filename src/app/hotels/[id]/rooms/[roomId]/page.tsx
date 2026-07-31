import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PiBedDuotone,
  PiCalendarCheckDuotone,
  PiRulerDuotone,
  PiUsersDuotone,
} from "react-icons/pi";
import { AmenityList } from "@/components/AmenityList";
import { RoomGallery } from "@/components/RoomGallery";
import { getRoom, hotels } from "@/lib/hotels";
import { formatCurrency, nightsBetween, priceBreakdown } from "@/lib/pricing";

type SearchParamValue = string | string[] | undefined;

type RoomDetailPageProps = {
  params: Promise<{ id: string; roomId: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
};

function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

export function generateStaticParams() {
  return hotels.flatMap((hotel) =>
    hotel.rooms.map((room) => ({ id: hotel.id, roomId: room.id })),
  );
}

export async function generateMetadata(props: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const params = await props.params;
  const match = getRoom(params.id, params.roomId);

  return {
    title: match
      ? `${match.room.name} room — ${match.hotel.name}`
      : "Room not found — Des Indes",
  };
}

export default async function RoomDetailPage(props: RoomDetailPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const match = getRoom(params.id, params.roomId);
  if (!match) notFound();

  const { hotel, room } = match;
  const checkIn = firstParam(searchParams.checkIn) ?? "";
  const checkOut = firstParam(searchParams.checkOut) ?? "";
  const guests = firstParam(searchParams.guests) ?? "";
  const nights = nightsBetween(checkIn, checkOut);
  const breakdown = nights > 0 ? priceBreakdown(room.pricePerNight, nights) : null;

  const bookingParams = new URLSearchParams({ room: room.id });
  if (checkIn) bookingParams.set("checkIn", checkIn);
  if (checkOut) bookingParams.set("checkOut", checkOut);
  if (guests) bookingParams.set("guests", guests);

  const backToResults = new URLSearchParams();
  if (checkIn) backToResults.set("checkIn", checkIn);
  if (checkOut) backToResults.set("checkOut", checkOut);
  if (guests) backToResults.set("guests", guests);
  const resultsHref = backToResults.toString()
    ? `/hotels/search?${backToResults.toString()}`
    : "/hotels/search";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Stays
        </Link>
        <span className="mx-2">/</span>
        <Link href={resultsHref} className="hover:text-slate-900">
          Available rooms
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{room.name}</span>
      </nav>

      <div className="mb-5">
        <h1 className="text-3xl font-bold text-slate-900">{room.name} room</h1>
        <p className="mt-2 text-sm text-slate-600">
          {hotel.name} · {hotel.address}
        </p>
      </div>

      <RoomGallery room={room} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <PiUsersDuotone size={18} /> Up to {room.maxGuests} guests
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PiBedDuotone size={18} /> {room.beds}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PiRulerDuotone size={18} /> {room.size}
              </span>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-slate-900">
              About this room
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {room.description}
            </p>
          </section>

          <section className="border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Included with your stay
            </h2>
            <div className="mt-4">
              <AmenityList amenities={hotel.amenities} />
            </div>
          </section>

          <section className="border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Other room types
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {hotel.rooms
                .filter((other) => other.id !== room.id)
                .map((other) => (
                  <Link
                    key={other.id}
                    href={`/hotels/${hotel.id}/rooms/${other.id}${
                      backToResults.toString()
                        ? `?${backToResults.toString()}`
                        : ""
                    }`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-slate-50"
                  >
                    {other.name} · {formatCurrency(other.pricePerNight, hotel.currency)}
                  </Link>
                ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card lg:sticky lg:top-24">
            <p className="text-slate-900">
              <span className="text-2xl font-semibold">
                {formatCurrency(room.pricePerNight, hotel.currency)}
              </span>{" "}
              <span className="text-sm text-slate-500">/ night</span>
            </p>

            {breakdown ? (
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>
                    {formatCurrency(room.pricePerNight, hotel.currency)} ×{" "}
                    {nights} {nights === 1 ? "night" : "nights"}
                  </dt>
                  <dd>{formatCurrency(breakdown.roomTotal, hotel.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Service fee</dt>
                  <dd>{formatCurrency(breakdown.serviceFee, hotel.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Taxes</dt>
                  <dd>{formatCurrency(breakdown.taxes, hotel.currency)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-slate-900">
                  <dt>Total</dt>
                  <dd>{formatCurrency(breakdown.total, hotel.currency)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                Pilih tanggal check-in dan check-out untuk melihat total harga.
              </p>
            )}

            <Link
              href={`/book/${hotel.id}?${bookingParams.toString()}`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              <PiCalendarCheckDuotone size={18} />
              Reserve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
