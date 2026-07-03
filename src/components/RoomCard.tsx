import Link from "next/link";
import { RoomType } from "@/lib/types";
import { SafeImage } from "./SafeImage";
import { formatCurrency } from "@/lib/pricing";

const GuestIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
  </svg>
);
const BedIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const SizeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 3 3 21M21 3v6M21 3h-6M3 21v-6M3 21h6" />
  </svg>
);

export function RoomCard({
  room,
  hotelId,
  currency,
}: {
  room: RoomType;
  hotelId: string;
  currency: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white sm:flex-row">
      <div className="relative aspect-16/10 w-full overflow-hidden sm:aspect-auto sm:w-56 sm:shrink-0">
        <SafeImage
          src={room.image}
          fallbackSeed={room.imageSeed}
          alt={room.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-semibold text-slate-900">{room.name}</h4>
        <p className="mt-1 text-sm text-slate-600">{room.description}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <GuestIcon /> Up to {room.maxGuests} guests
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BedIcon /> {room.beds}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <SizeIcon /> {room.size}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <p className="text-slate-900">
            <span className="text-lg font-semibold">
              {formatCurrency(room.pricePerNight, currency)}
            </span>{" "}
            <span className="text-sm text-slate-500">/ night</span>
          </p>
          <Link
            href={`/book/${hotelId}?room=${room.id}`}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Reserve
          </Link>
        </div>
      </div>
    </div>
  );
}
