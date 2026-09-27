import i18n from "./i18n";
import trainingTranslations from "./locales/trainingTranslations.json";

export function translateTraining(text) {
  if (!text) return text;

  const language = i18n.language || "en";

  return trainingTranslations?.[language]?.[text] || text;
}
