import Link from "next/link";
import { Hotel } from "@/lib/types";
import { SafeImage } from "./SafeImage";
import { StarRating } from "./StarRating";
import { formatCurrency } from "@/lib/pricing";

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage
          src={hotel.heroImage}
          fallbackSeed={hotel.heroSeed}
          alt={hotel.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
          {hotel.country}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug text-slate-900">
            {hotel.name}
          </h3>
          <StarRating rating={hotel.rating} size={14} />
        </div>
        <p className="mt-1 text-sm text-slate-500">{hotel.city}</p>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {hotel.tagline}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            {hotel.reviewCount.toLocaleString()} reviews
          </p>
          <p className="text-sm text-slate-900">
            <span className="text-base font-semibold">
              {formatCurrency(hotel.pricePerNight, hotel.currency)}
            </span>{" "}
            <span className="text-slate-500">/ night</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
