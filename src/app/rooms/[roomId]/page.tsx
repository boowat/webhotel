import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  PiBedDuotone,
  PiCalendarCheckDuotone,
  PiRulerDuotone,
  PiUsersDuotone,
} from "react-icons/pi";
import { AmenityList } from "@/components/AmenityList";
import { RoomGallery } from "@/components/RoomGallery";
import { SafeImage } from "@/components/SafeImage";
import { findRoomById } from "@/lib/hotels";
import { formatCurrency, nightsBetween, priceBreakdown } from "@/lib/pricing";

type SearchParamValue = string | string[] | undefined;

type RoomDetailPageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
};

function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata(props: {
  params: Promise<{ roomId: string }>;
}) {
  const params = await props.params;
  const match = findRoomById(params.roomId);
  const t = await getTranslations("room");

  return {
    title: match
      ? t("metaTitle", { room: match.room.name, hotel: match.hotel.name })
      : t("metaTitleNotFound"),
  };
}

export default async function RoomDetailPage(props: RoomDetailPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const match = findRoomById(params.roomId);
  if (!match) notFound();

  const t = await getTranslations("room");
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

  const staySearchParams = new URLSearchParams();
  if (checkIn) staySearchParams.set("checkIn", checkIn);
  if (checkOut) staySearchParams.set("checkOut", checkOut);
  if (guests) staySearchParams.set("guests", guests);
  const stayQuery = staySearchParams.toString();
  const resultsHref = stayQuery
    ? `/hotels/search?${stayQuery}`
    : "/hotels/search";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          {t("breadcrumbHome")}
        </Link>
        <span className="mx-2">/</span>
        <Link href={resultsHref} className="hover:text-slate-900">
          {t("breadcrumbResults")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{room.name}</span>
      </nav>

      <div className="mb-5">
        <h1 className="text-3xl font-bold text-slate-900">
          {t("heading", { room: room.name })}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{hotel.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <RoomGallery room={room} />
        </div>

        <aside>
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-slate-900">
              <span className="text-2xl font-semibold">
                {formatCurrency(room.pricePerNight, hotel.currency)}
              </span>{" "}
              <span className="text-sm text-slate-500">{t("perNight")}</span>
            </p>

            {breakdown ? (
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>
                    {t("nightsLine", {
                      price: formatCurrency(room.pricePerNight, hotel.currency),
                      nights,
                    })}
                  </dt>
                  <dd>{formatCurrency(breakdown.roomTotal, hotel.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t("serviceFee")}</dt>
                  <dd>{formatCurrency(breakdown.serviceFee, hotel.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t("taxes")}</dt>
                  <dd>{formatCurrency(breakdown.taxes, hotel.currency)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-slate-900">
                  <dt>{t("total")}</dt>
                  <dd>{formatCurrency(breakdown.total, hotel.currency)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                {t("pickDates")}
              </p>
            )}

            <div className="mt-auto pt-5">
              <Link
                href={`/book/${hotel.id}?${bookingParams.toString()}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                <PiCalendarCheckDuotone size={18} />
                {t("reserve")}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <PiUsersDuotone size={18} />{" "}
                {t("upToGuests", { count: room.maxGuests })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PiBedDuotone size={18} /> {room.beds}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PiRulerDuotone size={18} /> {room.size}
              </span>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-slate-900">
              {t("aboutTitle")}
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {room.description}
            </p>
          </section>

          <section className="border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              {t("includedTitle")}
            </h2>
            <div className="mt-4">
              <AmenityList amenities={hotel.amenities} />
            </div>
          </section>

          <section className="border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              {t("otherRoomsTitle")}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {hotel.rooms
                .filter((other) => other.id !== room.id)
                .map((other) => (
                  <Link
                    key={other.id}
                    href={`/rooms/${other.id}${stayQuery ? `?${stayQuery}` : ""}`}
                    className="group flex items-center gap-3 overflow-hidden rounded-md border border-slate-300 transition hover:border-primary/40 hover:bg-slate-50"
                  >
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden">
                      <SafeImage
                        src={other.image}
                        fallbackSeed={other.imageSeed}
                        alt={other.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 py-2 pr-3">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-primary">
                        {other.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatCurrency(other.pricePerNight, hotel.currency)}{" "}
                        {t("perNight")}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
