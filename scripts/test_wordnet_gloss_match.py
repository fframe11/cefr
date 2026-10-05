import zipfile
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("Extracting WordNet lemma -> gloss mapping from zip...")
zip_path = 'scripts/content-pipeline/sources/oewn/english-wordnet-2024.zip'

pos_files = {
    'noun': 'oewn2024/data.noun',
    'verb': 'oewn2024/data.verb',
    'adjective': 'oewn2024/data.adj',
    'adverb': 'oewn2024/data.adv'
}

wordnet_glosses = {} # (word.lower(), pos): first_gloss

with zipfile.ZipFile(zip_path, 'r') as z:
    for pos, filename in pos_files.items():
        with z.open(filename) as f:
            for line_b in f:
                line = line_b.decode('utf-8', errors='ignore')
                if line.startswith('  ') or '|' not in line:
                    continue
                parts = line.split('|')
                gloss = parts[1].strip()
                # Clean example sentences out of gloss if any (after ;)
                clean_gloss = gloss.split(';')[0].strip().strip('"')
                
                header = parts[0].strip().split()
                # header format: synset_offset lex_filenum ss_type w_cnt word1 lex_id1 word2 lex_id2 ...
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

print(f"Loaded {len(wordnet_glosses):,} (word, pos) glosses from WordNet 2024.")

# Now check how many of our 57,919 stub words match!
import json
with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

stubs = [x for x in univ if 'WordNet Synset Entry' in (x.get('meaning_en') or '')]
print(f"Total stub words in universe: {len(stubs):,}")

matched = 0
for x in stubs:
    w = x['word'].lower().strip()
    pos = (x.get('part_of_speech') or '').lower().strip()
    if (w, pos) in wordnet_glosses:
        matched += 1
    elif any((w, p) in wordnet_glosses for p in ['noun', 'verb', 'adjective', 'adverb']):
        matched += 1

print(f"Successfully matched to real WordNet glosses: {matched:,} ({matched/len(stubs)*100:.1f}%)")
