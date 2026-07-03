import { Hotel } from "@/lib/types";
import { SafeImage } from "./SafeImage";

export function Gallery({ hotel }: { hotel: Hotel }) {
  const [first, second, third, fourth] = hotel.gallery;

  return (
    <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:grid-cols-2 sm:gap-2">
      <div className="relative aspect-4/3 sm:row-span-2 sm:aspect-auto">
        <SafeImage
          src={hotel.heroImage}
          fallbackSeed={hotel.heroSeed}
          alt={`${hotel.name} — main view`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="hidden grid-cols-2 gap-2 sm:grid">
        {[first, second, third, fourth].filter(Boolean).map((g, i) => (
          <div key={g.seed} className="relative aspect-4/3">
            <SafeImage
              src={g.src}
              fallbackSeed={g.seed}
              alt={`${hotel.name} — view ${i + 2}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
