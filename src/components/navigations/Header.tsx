"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PiBedDuotone, PiBuildingApartmentDuotone } from "react-icons/pi";
import { useTranslations } from "next-intl";

export function HeaderBar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-base-300 bg-base-100/80 backdrop-blur-sm"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="flex max-w-[1920px] items-center justify-between px-6 lg:px-8 py-2 mx-auto ">
        <Link href="/" className="flex items-center justify-center gap-2">
          <PiBuildingApartmentDuotone className="w-6 h-6 text-primary" />
          {/* <Image
            src="/logo.png"
            alt="Hotel Des Indes"
            width={60}
            height={30}
            priority
          /> */}
          <span className="text-lg font-bold text-primary font-serif">
            Hotel Des Indes
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="flex flex-row items-center gap-2 px-4 py-2 text-base text-primary font-me transition-colors duration-200"
          >
            {t("login")}
          </Link>
          <Link
            href="#"
            className="flex flex-row items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          >
            <PiBedDuotone className="w-6 h-6" />
            {t("register")}
          </Link>
        </div>
      </div>
    </header>
  );
}
