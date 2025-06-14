import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/translation.json";
import ukTranslation from "./locales/uk/translation.json";
import ICU from "i18next-icu";

i18n
    .use(ICU)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslation },
            uk: { translation: ukTranslation },
        },
        fallbackLng: "en",
        lng: localStorage.getItem("lang") || "uk",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
