import createNextIntlPlugin from "next-intl/plugin";

// Default plugin path is ./i18n/request.ts; our config lives under lib/, so point to it.
const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
