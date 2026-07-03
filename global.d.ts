import type en_nav from "./messages/en/nav.json";
import type en_home from "./messages/en/home.json";

// Gives `useTranslations`/`getTranslations` autocomplete on message keys and
// flags typos at compile time. `en` is the source of truth for the shape.
declare module "next-intl" {
  interface AppConfig {
    Messages: {
      nav: typeof en_nav;
      home: typeof en_home;
    };
  }
}
