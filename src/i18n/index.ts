import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import intervalPlural from 'i18next-intervalplural-postprocessor';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import knTranslations from './locales/kn.json';

const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  },
  kn: {
    translation: knTranslations
  }
};

// Get saved language preference or use browser default
const savedLanguage = localStorage.getItem('preferredLanguage');

i18n
  .use(intervalPlural)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || undefined,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage'
    },

    // Pluralization
    pluralSeparator: '_',

    // Show missing keys in development
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, _ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },

    // Return key if translation is missing
    returnEmptyString: false,
    returnNull: false
  });

export default i18n;
