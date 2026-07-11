import createNextIntlPlugin from "next-intl/plugin";

// Default plugin path is ./i18n/request.ts; our config lives under lib/, so point to it.
const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cally ships as ESM-only web components; let Next transpile it so the
  // client-side `import("cally")` registers the custom elements reliably.
  transpilePackages: ["cally"],
};

export default withNextIntl(nextConfig);
