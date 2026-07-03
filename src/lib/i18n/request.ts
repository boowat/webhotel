import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = "en";
  const [nav, home] = await Promise.all([
    import(`../../../messages/${locale}/nav.json`),
    import(`../../../messages/${locale}/home.json`),
  ]);
  return { locale, messages: { nav: nav.default, home: home.default } };
});
