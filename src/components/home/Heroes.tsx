import { getTranslations } from "next-intl/server";
// import { SafeImage } from "@/components/SafeImage";
import { BookingWidget } from "../BookingWidget";
import Image from "next/image";
import Link from "next/link";
import { hotels } from "@/lib/hotels";

const featured = hotels[0];

export default async function HeroesSection() {
  const t = await getTranslations("home");
  return (
    <section className="relative max-w-[2160px] min-h-180 overflow-hidden mx-auto">
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
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/85 via-slate-900/45 to-slate-900/30" />
      </div>
      <div className="relative bg-black mx-auto max-w-10/12 px-8 py-24">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl whitespace-pre-line">
          {t("hero.heading-one")}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-200">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#stays"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            {t("hero.exploreCta")}
          </Link>
          <Link
            href={`/hotels/${featured.id}`}
            className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            {t("hero.featuredCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
