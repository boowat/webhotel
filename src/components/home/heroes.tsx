import { getTranslations } from "next-intl/server";
import { BookingWidget } from "../BookingWidget";
import Image from "next/image";
import { hotels } from "@/lib/hotels";

const featured = hotels[0];

export default async function HeroesSection() {
  const t = await getTranslations("home");
  return (
    <section className="relative max-w-[2160px] min-h-120 -mt-24 overflow-hidden mx-auto">
      <div className="absolute inset-0">
        <Image
          src="/banner.jpg"
          alt={t("hero.heroAlt")}
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/60 to-secondary/50" />
      </div>
      <div className="relative mx-auto flex max-w-10/12 flex-col gap-10 px-4 py-4 lg:px-8 lg:py-24 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl whitespace-pre-line">
            {t("hero.heading-one")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-200">
            {t("hero.subtitle")}
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-96">
          <BookingWidget hotel={featured} />
        </div>
      </div>
    </section>
  );
}
