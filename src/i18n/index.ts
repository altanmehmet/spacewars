import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dil dosyalarını import et
import en from './locales/en.json';
import tr from './locales/tr.json';
import es from './locales/es.json';

const resources = {
  en: {
    translation: en
  },
  tr: {
    translation: tr
  },
  es: {
    translation: es
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Default dil İngilizce
    lng: 'en', // Başlangıç dili zorla İngilizce olarak ayarla
    debug: false, // Debug modunu kapat
    
    interpolation: {
      escapeValue: false // React zaten XSS'den koruyor
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    
    supportedLngs: ['en', 'tr', 'es'],
    
    react: {
      useSuspense: false
    }
  });

export default i18n; 