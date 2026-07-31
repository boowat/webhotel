import { PiVirtualRealityDuotone } from "react-icons/pi";
import { RoomType } from "@/lib/types";
import { SafeImage } from "./SafeImage";

export function RoomGallery({ room }: { room: RoomType }) {
  const [second, third] = room.gallery ?? [];

  return (
    <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:h-100 sm:grid-cols-[2fr_1fr]">
      <div className="relative aspect-4/3 overflow-hidden sm:aspect-auto sm:h-full">
        <SafeImage
          src={room.image}
          fallbackSeed={room.imageSeed}
          alt={`${room.name} room — main view`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="grid gap-2 sm:h-full sm:grid-rows-2">
        {second ? (
          <div className="relative aspect-4/3 overflow-hidden sm:aspect-auto sm:h-full">
            <SafeImage
              src={second.src}
              fallbackSeed={second.seed}
              alt={`${room.name} room — second view`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        {third ? (
          <div className="relative aspect-4/3 overflow-hidden sm:aspect-auto sm:h-full">
            <SafeImage
              src={third.src}
              fallbackSeed={third.seed}
              alt={`${room.name} room — virtual tour preview`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900/55 text-white">
              <PiVirtualRealityDuotone size={30} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Virtual room
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
