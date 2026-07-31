import { RoomType } from "@/lib/types";
import { SafeImage } from "./SafeImage";

export function RoomGallery({ room }: { room: RoomType }) {
  const shots = room.gallery ?? [];

  return (
    <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:grid-cols-2">
      <div className="relative aspect-4/3 sm:row-span-2 sm:aspect-auto">
        <SafeImage
          src={room.image}
          fallbackSeed={room.imageSeed}
          alt={`${room.name} room — main view`}
          className="h-full w-full object-cover"
        />
      </div>

      {shots.length > 0 ? (
        <div className="hidden grid-cols-2 gap-2 sm:grid">
          {shots.slice(0, 4).map((shot, index) => (
            <div key={shot.seed} className="relative aspect-4/3">
              <SafeImage
                src={shot.src}
                fallbackSeed={shot.seed}
                alt={`${room.name} room — view ${index + 2}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
