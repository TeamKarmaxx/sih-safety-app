import json
from pathlib import Path

BASE = Path("src/locales/trainingTranslations.json")
BACKEND = Path("src/locales/backendTranslations.json")

with open(BASE, "r", encoding="utf-8") as f:
    training = json.load(f)

with open(BACKEND, "r", encoding="utf-8") as f:
    backend = json.load(f)

for language in ["hi", "sa"]:
    if language not in training:
        training[language] = {}

    added = 0
    updated = 0

    for english_text, translated_text in backend.get(language, {}).items():

        # Only replace an existing English value.
        # Never overwrite a real translation.
        if english_text in training[language]:
            old_value = training[language][english_text]

            if old_value == english_text and translated_text != english_text:
                training[language][english_text] = translated_text
                updated += 1

        else:
            # Add backend translation if the frontend dictionary
            # doesn't have this English key yet.
            training[language][english_text] = translated_text
            added += 1

    print(f"{language}:")
    print(f"  Updated English entries: {updated}")
    print(f"  Added entries: {added}")

with open(BASE, "w", encoding="utf-8") as f:
    json.dump(training, f, ensure_ascii=False, indent=2)

print()
print("======================================")
print("FRONTEND TRANSLATIONS MERGED")
print("======================================")
print("Updated:", BASE)
print("======================================")
