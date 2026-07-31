import type en_nav from "./messages/en/nav.json";
import type en_home from "./messages/en/home.json";
import type en_search from "./messages/en/search.json";
import type en_room from "./messages/en/room.json";

// Gives `useTranslations`/`getTranslations` autocomplete on message keys and
// flags typos at compile time. `en` is the source of truth for the shape.
// (Cally custom-element JSX types live in src/types/cally.d.ts.)
declare module "next-intl" {
  interface AppConfig {
    Messages: {
      nav: typeof en_nav;
      home: typeof en_home;
      search: typeof en_search;
      room: typeof en_room;
    };
  }
}
