/**
 * Maps the app's i18next language code to the string the backend expects for
 * lesson/question translation lookups (matched server-side via SQL ILIKE
 * against LessonTranslation.language / QuestionTranslation.language).
 *
 * The backend's own default parameter value is "English", which is the only
 * concrete value we've directly confirmed from main.py. "Hindi" and
 * "Santali" are inferred from that same naming convention, not confirmed
 * against seeded data. The backend already handles an unmatched language
 * gracefully — get_lesson_content falls back to the original English lesson
 * and reports translated:false — so requesting "Santali" when no such
 * translation row exists is safe and will not error; it just won't show
 * translated content until one is added on the backend. If Hindi or Santali
 * content doesn't appear, verify the exact `language` string stored in the
 * database and update this map to match — do not guess further beyond this.
 */
const I18N_TO_BACKEND_LANGUAGE = {
  en: "en",
  hi: "hi",
  sa: "sa",
};

export function toBackendLanguage(i18nCode) {
  return I18N_TO_BACKEND_LANGUAGE[i18nCode] || "English";
}
