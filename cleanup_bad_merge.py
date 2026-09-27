import json

FILE = "src/locales/trainingTranslations.json"

with open(FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

for lang in ["hi", "sa"]:
    section = data.get(lang, {})

    # Remove entries where the key and value are identical.
    # These are the untranslated entries added by the bad merge.
    bad = [
        key
        for key, value in section.items()
        if key == value
    ]

    for key in bad:
        del section[key]

    print(f"{lang}: removed {len(bad)} key=value entries")

with open(FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print()
print("======================================")
print("CLEANUP COMPLETE")
print("======================================")
