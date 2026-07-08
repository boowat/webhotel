import Link from "next/link";
import { PiBedDuotone } from "react-icons/pi";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="flex max-w-[2160px] items-center justify-between px-6 lg:px-8 py-3.5 mx-auto ">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Hotel Des Indes"
            width={120}
            height={50}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/#stays" className="hover:text-slate-900">
            {t("stays")}
          </Link>
          <Link href="/#how" className="hover:text-slate-900">
            {t("howItWorks")}
          </Link>
          <a href="#" className="hover:text-slate-900">
            {t("listProperty")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="flex flex-row items-center gap-2 rounded-md btn btn-accent text-black px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <PiBedDuotone className="w-6 h-6" />
            {t("book")}
          </Link>
        </div>
      </div>
    </header>
  );
}
