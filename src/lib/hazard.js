/**
 * The backend TrainingModule schema has no "category"/"hazard type" field —
 * only id, title, description, difficulty, language. To give module cards a
 * distinct icon/color without inventing backend data, we derive a purely
 * cosmetic hazard category from keywords in the module title. This affects
 * ONLY icon/color choice, never progress, completion, or any real data.
 */
const HAZARD_RULES = [
  { keywords: ["fire", "explosion", "flame"], icon: "🔥", color: "var(--color-hazard-fire)" },
  { keywords: ["gas", "confined", "leak", "ventilation"], icon: "💨", color: "var(--color-hazard-gas)" },
  { keywords: ["machine", "mechanical", "equipment", "guarding"], icon: "⚙️", color: "var(--color-hazard-mechanical)" },
  { keywords: ["chemical", "hazmat", "toxic", "spill"], icon: "🧪", color: "var(--color-hazard-chemical)" },
  { keywords: ["mine", "mining", "tunnel", "shaft"], icon: "⛏️", color: "var(--color-hazard-mechanical)" },
  { keywords: ["electric", "electrical", "voltage"], icon: "⚡", color: "var(--color-hazard-fire)" },
];

function matchRule(title = "") {
  const lower = title.toLowerCase();
  return HAZARD_RULES.find((rule) => rule.keywords.some((keyword) => lower.includes(keyword))) || null;
}

export function hazardIconFor(title) {
  return matchRule(title)?.icon || "🛡️";
}

export function hazardColorFor(title) {
  return matchRule(title)?.color || "var(--color-hazard-generic)";
}
