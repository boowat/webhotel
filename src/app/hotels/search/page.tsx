import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PiCalendarCheckDuotone } from "react-icons/pi";
import { SafeImage } from "@/components/SafeImage";
import { hotels } from "@/lib/hotels";
import { formatCurrency, nightsBetween, priceBreakdown } from "@/lib/pricing";

type SearchParamValue = string | string[] | undefined;

type RoomSearchPageProps = {
  searchParams: Promise<Record<string, SearchParamValue>>;
};

const BED_TYPE_KEYS = [
  "king",
  "queen",
  "twin",
  "double",
  "single",
  "sofa",
  "daybed",
] as const;

function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: SearchParamValue, fallback: number) {
  const parsed = Number(firstParam(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toNonNegativeInt(value: SearchParamValue, fallback: number) {
  const parsed = Number(firstParam(value));
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function toOptionalPrice(value: SearchParamValue) {
  const rawValue = firstParam(value);
  if (!rawValue?.trim()) return undefined;

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function getBedTypeOptions() {
  const roomBeds = hotels[0].rooms.map((room) => room.beds.toLowerCase());

  return BED_TYPE_KEYS.filter((key) =>
    roomBeds.some((beds) => beds.includes(key)),
  );
}

function buildBaseSearchParams({
  checkIn,
  checkOut,
  rooms,
  adults,
  children,
  guests,
}: {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  guests: number;
}) {
  return new URLSearchParams({
    checkIn,
    checkOut,
    rooms: String(rooms),
    adults: String(adults),
    children: String(children),
    guests: String(guests),
  });
}

const GuestIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
  </svg>
);

const BedIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SizeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 3 3 21M21 3v6M21 3h-6M3 21v-6M3 21h6" />
  </svg>
);

export async function generateMetadata() {
  const t = await getTranslations("search");
  return { title: t("metaTitle") };
}

export default async function RoomSearchPage(props: RoomSearchPageProps) {
  const t = await getTranslations("search");
  const searchParams = await props.searchParams;
  const checkIn = firstParam(searchParams.checkIn) ?? "";
  const checkOut = firstParam(searchParams.checkOut) ?? "";
  const rooms = toPositiveInt(searchParams.rooms, 1);
  const adults = toPositiveInt(searchParams.adults, 2);
  const children = toNonNegativeInt(searchParams.children, 0);
  const guests = toPositiveInt(searchParams.guests, adults + children);
  const totalGuests = Math.max(1, guests);
  const nights = nightsBetween(checkIn, checkOut);
  const hasValidDates = nights > 0;
  const hotel = hotels[0];
  const allRooms = hotel.rooms.map((room) => ({ hotel, room }));
  const minRoomPrice = Math.min(...allRooms.map(({ room }) => room.pricePerNight));
  const maxRoomPrice = Math.max(...allRooms.map(({ room }) => room.pricePerNight));
  const rawMinPrice = toOptionalPrice(searchParams.minPrice);
  const rawMaxPrice = toOptionalPrice(searchParams.maxPrice);
  const minPrice =
    rawMinPrice !== undefined && rawMaxPrice !== undefined
      ? Math.min(rawMinPrice, rawMaxPrice)
      : rawMinPrice;
  const maxPrice =
    rawMinPrice !== undefined && rawMaxPrice !== undefined
      ? Math.max(rawMinPrice, rawMaxPrice)
      : rawMaxPrice;
  const bedTypeOptions = getBedTypeOptions();
  const bedTypeParam = firstParam(searchParams.bedType)?.toLowerCase() ?? "";
  const selectedBedType = bedTypeOptions.some((key) => key === bedTypeParam)
    ? bedTypeParam
    : "";
  const activeFilterCount =
    (rawMinPrice !== undefined ? 1 : 0) +
    (rawMaxPrice !== undefined ? 1 : 0) +
    (selectedBedType ? 1 : 0);
  const baseSearchParams = buildBaseSearchParams({
    checkIn,
    checkOut,
    rooms,
    adults,
    children,
    guests: totalGuests,
  });

  const availableRooms = hasValidDates
    ? allRooms.filter(({ room }) => room.maxGuests >= totalGuests)
    : [];
  const filteredRooms = availableRooms.filter(({ room }) => {
    const matchesMinPrice =
      minPrice === undefined || room.pricePerNight >= minPrice;
    const matchesMaxPrice =
      maxPrice === undefined || room.pricePerNight <= maxPrice;
    const matchesBedType =
      !selectedBedType || room.beds.toLowerCase().includes(selectedBedType);
    return matchesMinPrice && matchesMaxPrice && matchesBedType;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          {t("breadcrumbHome")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{t("breadcrumbCurrent")}</span>
      </nav>

      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("heading")}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {hasValidDates
              ? t("staySummary", {
                  checkIn,
                  checkOut,
                  nights,
                  rooms,
                  guests: totalGuests,
                })
              : t("noDatesYet")}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t("changeSearch")}
        </Link>
      </div>

      {!hasValidDates ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          {t("invalidDateRange")}
        </div>
      ) : null}

      {hasValidDates && availableRooms.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("noRoomsTitle")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{t("noRoomsBody")}</p>
        </div>
      ) : null}

      {hasValidDates && availableRooms.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <form
              method="get"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <input type="hidden" name="checkIn" value={checkIn} />
              <input type="hidden" name="checkOut" value={checkOut} />
              <input type="hidden" name="rooms" value={rooms} />
              <input type="hidden" name="adults" value={adults} />
              <input type="hidden" name="children" value={children} />
              <input type="hidden" name="guests" value={totalGuests} />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("filtersTitle")}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t("filtersActive", { count: activeFilterCount })}
                  </p>
                </div>
                <Link
                  href={`/hotels/search?${baseSearchParams.toString()}`}
                  className="text-sm font-semibold text-primary hover:text-primary/80"
                >
                  {t("filtersClear")}
                </Link>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">
                  {t("pricePerNight")}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      {t("priceMin")}
                    </span>
                    <input
                      type="number"
                      name="minPrice"
                      min={0}
                      placeholder={String(minRoomPrice)}
                      defaultValue={rawMinPrice ?? ""}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      {t("priceMax")}
                    </span>
                    <input
                      type="number"
                      name="maxPrice"
                      min={0}
                      placeholder={String(maxRoomPrice)}
                      defaultValue={rawMaxPrice ?? ""}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </label>
                </div>
              </div>

              <label className="mt-5 block border-t border-slate-100 pt-5">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  {t("bedType")}
                </span>
                <select
                  name="bedType"
                  defaultValue={selectedBedType}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="">{t("bedTypeAny")}</option>
                  {bedTypeOptions.map((key) => (
                    <option key={key} value={key}>
                      {t(`bedLabels.${key}`)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="mt-5 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                {t("applyFilters")}
              </button>
            </form>
          </aside>

          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-600">
              {t("matchCount", {
                filtered: filteredRooms.length,
                total: availableRooms.length,
                withFilters: activeFilterCount > 0 ? "yes" : "no",
              })}
            </p>

            {filteredRooms.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("noMatchTitle")}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{t("noMatchBody")}</p>
              </div>
            ) : null}

          {filteredRooms.map(({ hotel, room }) => {
            const breakdown = priceBreakdown(room.pricePerNight, nights);
            const bookingParams = new URLSearchParams({
              room: room.id,
              checkIn,
              checkOut,
              guests: String(totalGuests),
            });

            return (
              <article
                key={`${hotel.id}-${room.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:border-primary/40 hover:shadow-lg focus-within:border-primary/40 focus-within:shadow-lg"
              >
                <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr]">
                  <div className="relative aspect-16/10 overflow-hidden sm:aspect-auto">
                    <SafeImage
                      src={room.image}
                      fallbackSeed={room.imageSeed}
                      alt={room.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                          <Link
                            href={`/rooms/${room.id}?${baseSearchParams.toString()}`}
                            className="outline-hidden after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
                          >
                            {room.name}
                          </Link>
                        </h2>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {room.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <GuestIcon /> {t("upToGuests", { count: room.maxGuests })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BedIcon /> {room.beds}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <SizeIcon /> {room.size}
                      </span>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-slate-900">
                          <span className="text-lg font-semibold">
                            {formatCurrency(
                              room.pricePerNight,
                              hotel.currency,
                            )}
                          </span>{" "}
                          <span className="text-sm text-slate-500">
                            {t("perNight")}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t("totalWithFees", {
                            total: formatCurrency(
                              breakdown.total,
                              hotel.currency,
                            ),
                          })}
                        </p>
                      </div>

                      <Link
                        href={`/book/${hotel.id}?${bookingParams.toString()}`}
                        className="relative z-10 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                      >
                        <PiCalendarCheckDuotone size={18} />
                        {t("reserve")}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
