import json
from collections import Counter

files = ['src/i18n/locales/en.json', 'src/i18n/locales/hi.json', 'src/i18n/locales/kn.json']

for file_path in files:
    print(f"Checking {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    keys = []
    for line in lines:
        line = line.strip()
        if line.startswith('"') and '":' in line:
            key = line.split('":')[0].strip('"')
            keys.append(key)
    
    counts = Counter(keys)
    duplicates = [k for k, v in counts.items() if v > 1]
    
    if duplicates:
        print(f"Found duplicates in {file_path}: {duplicates}")
    else:
        print(f"No duplicates found in {file_path}")
