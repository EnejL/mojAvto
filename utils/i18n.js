import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import slTranslations from "./translations/sl.json";
import enTranslations from "./translations/en.json";

// Configure resources
const resources = {
  sl: {
    translation: slTranslations
  },
  en: {
    translation: enTranslations
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "sl",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
