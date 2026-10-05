import zipfile
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("1. Extracting WordNet 2024 glosses...")
zip_path = 'scripts/content-pipeline/sources/oewn/english-wordnet-2024.zip'

pos_files = {
    'noun': 'oewn2024/data.noun',
    'verb': 'oewn2024/data.verb',
    'adjective': 'oewn2024/data.adj',
    'adverb': 'oewn2024/data.adv'
}

wordnet_glosses = {} # (word.lower(), pos) -> gloss

with zipfile.ZipFile(zip_path, 'r') as z:
    for pos, filename in pos_files.items():
        with z.open(filename) as f:
            for line_b in f:
                line = line_b.decode('utf-8', errors='ignore')
                if line.startswith('  ') or '|' not in line:
                    continue
                parts = line.split('|')
                gloss = parts[1].strip()
                # Clean example sentences out of gloss (keep definition up to first ;)
                clean_gloss = gloss.split(';')[0].strip().strip('"')
                
                header = parts[0].strip().split()
                if len(header) >= 5:
                    try:
                        w_cnt = int(header[3], 16)
                        idx = 4
                        for _ in range(w_cnt):
                            w = header[idx].replace('_', ' ').lower()
                            key = (w, pos)
                            if key not in wordnet_glosses:
                                wordnet_glosses[key] = clean_gloss
                            idx += 2
                    except Exception:
                        pass

print(f"Loaded {len(wordnet_glosses):,} synset glosses from WordNet.")

print("2. Loading vocabulary-extended-universe-v3.json...")
with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

updated_count = 0
for x in univ:
    en = (x.get('meaning_en') or '').strip()
    if 'WordNet Synset Entry' in en or not en:
        w = x['word'].lower().strip()
        pos = (x.get('part_of_speech') or '').lower().strip()
        gloss = wordnet_glosses.get((w, pos))
        if not gloss:
            # Fallback across POS
            for p in ['noun', 'verb', 'adjective', 'adverb']:
                if (w, p) in wordnet_glosses:
                    gloss = wordnet_glosses[(w, p)]
                    break
        if gloss:
            x['meaning_en'] = gloss
            updated_count += 1

print(f"Updated {updated_count:,} stub/empty English definitions with real WordNet glosses!")

# Sample spot-check of words that previously had 'WordNet Synset Entry'
test_words = ['clayware', 'pumpernickel', 'angler', 'hyperextend', 'grapheme', 'cyclooxygenase', 'immunofluorescence']
print("\n--- Spot-Check Restored English Definitions ---")
for x in univ:
    if x['word'].lower() in test_words:
        print(f"  {x['word']} ({x.get('part_of_speech')}):")
        print(f"    EN: {x.get('meaning_en')}")
        print(f"    TH (Current MT): {x.get('meaning_th')}")

print("\nSaving updated dataset to data/vocabulary-extended-universe-v3.json...")
with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
    json.dump(univ, f, ensure_ascii=False)

print("Saving updated dataset to data/vocabulary-extended-universe.json...")
with open('data/vocabulary-extended-universe.json', 'w', encoding='utf-8') as f:
    json.dump(univ, f, ensure_ascii=False)

print("Done!")
