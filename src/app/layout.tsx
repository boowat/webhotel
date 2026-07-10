import type { Metadata } from "next";
import { Gloock, Raleway } from "next/font/google";
import "./globals.css";
import { HeaderBar } from "@/components/navigations/Header";
import { Footer } from "@/components/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

const gloock = Gloock({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

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
    <html
      lang={locale}
      data-theme="desindes"
      className={`${raleway.variable} ${gloock.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider>
          <HeaderBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
