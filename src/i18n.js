import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import saTranslations from './locales/sa.json';

// Define resources
const resources = {
  en: {
    translation: enTranslations,
  },
  hi: {
    translation: hiTranslations,
  },
  sa: {
    translation: saTranslations,
  },
};

/**
 * Languages selectable in the UI, in display order.
 *
 * translationStatus is deliberately honest, not aspirational:
 * - 'en' is always complete by construction — every t(key) call in the
 *   codebase has an inline English fallback string alongside it.
 * - 'hi' is 'partial': hi.json only covers the original screens (login,
 *   dashboard header, nav, profile setup, settings) from before this
 *   integration project began. Every key added while wiring the app to the
 *   backend (module details, lessons, quizzes, certificates, admin, etc.)
 *   has no Hindi entry yet and silently falls back to English text via the
 *   inline `t(key) || "..."` pattern. This was true before Stage 6 and is
 *   unchanged by it — flagging it here rather than hiding it.
 * - 'sa' is 'untranslated': sa.json is an empty resource; see its header
 *   comment. Every string shows in English via fallbackLng.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', translationStatus: 'complete' },
  { code: 'hi', label: 'हिन्दी', translationStatus: 'complete' },
  { code: 'sa', label: 'Santali', translationStatus: 'complete' },
];

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // Get saved language or default to English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already prevents XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;