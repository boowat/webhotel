import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = "en";
  const [nav, home, search, room] = await Promise.all([
    import(`../../../messages/${locale}/nav.json`),
    import(`../../../messages/${locale}/home.json`),
    import(`../../../messages/${locale}/search.json`),
    import(`../../../messages/${locale}/room.json`),
  ]);
  return {
    locale,
    messages: {
      nav: nav.default,
      home: home.default,
      search: search.default,
      room: room.default,
    },
  };
});
