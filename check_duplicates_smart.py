import json
from collections import Counter

def detect_dupes(pairs):
    keys = [k for k, v in pairs]
    counts = Counter(keys)
    dupes = [k for k, v in counts.items() if v > 1]
    if dupes:
        print(f"  Duplicate keys in current object: {dupes}")
    return dict(pairs)

files = ['src/i18n/locales/en.json', 'src/i18n/locales/hi.json', 'src/i18n/locales/kn.json']

for file_path in files:
    print(f"Checking {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f, object_pairs_hook=detect_dupes)
    except Exception as e:
        print(f"  Error parsing JSON: {e}")
