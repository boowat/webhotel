import type { Metadata } from "next";
import { Gloock, Raleway } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigations/Navbar";
import { Footer } from "@/components/Footer";
import { OptionalLoginPopup } from "@/components/OptionalLoginPopup";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });
const gloock = Gloock({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("website.title"),
    description: t("website.description"),
    icons: {
      icon: "/favicon.jpg",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${raleway.variable} ${gloock.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <OptionalLoginPopup />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
