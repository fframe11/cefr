import json
import re
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("Loading data/vocabulary-extended-universe-v3.json...")
with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

total = len(items)
print(f"Total vocabulary items: {total:,}")

empty_th = []
empty_en = []
empty_pos = []
empty_cefr = []

pure_ascii_th = []
scraper_en_patterns = [
    (r'(?i)the state,?\s+fact,?\s+or\s+instance\s+of', "The state, fact, or instance of"),
    (r'(?i)to\s+act,?\s+perform,?\s+or\s+engage\s+in', "To act, perform, or engage in"),
    (r'(?i)a\s+person\s+who\s+or\s+thing\s+that', "A person who or thing that"),
    (r'(?i)in\s+a\s+manner\s+that\s+is', "In a manner that is"),
    (r'(?i)of,?\s+relating\s+to,?\s+or\s+characteristic\s+of', "Of, relating to, or characteristic of"),
    (r'(?i)serving\s+to\s+or\s+tending\s+to', "Serving to or tending to")
]
scraper_en_matches = {name: [] for _, name in scraper_en_patterns}

# Check for known problematic translations in Thai
known_problematic_words = [
    'general', 'common', 'about', 'animal', 'cat', 'dog', 'tell', 'tree', 
    'begin', 'contract', 'second', 'third', 'steak', 'cancer', 'hardly'
]
problematic_samples = []

# Suspicious Thai tokens / MT artifacts
suspicious_th_keywords = [
    ('ของหรือเกี่ยวกับ', 'Literal MT translation of "of or relating to"'),
    ('การมีเพศสัมพันธ์', 'Vulgar/sexual leak in common word'),
    ('อวัยวะเพศ', 'Vulgar/sexual leak in common word'),
    ('คริกเก็ต', 'Cricket sports leak'),
    ('เบสบอล', 'Baseball sports leak'),
    ('คนผู้ชาย', 'WordNet slang leak (e.g. cat -> guy)'),
    ('คนที่น่าเบื่อ', 'WordNet slang leak (e.g. dog -> boring person)'),
    ('การว่าจ้างเพื่อฆาตกรรม', 'WordNet hitman contract leak')
]
suspicious_th_matches = {desc: [] for _, desc in suspicious_th_keywords}

cefr_counter = Counter()
pos_counter = Counter()
tier_counter = Counter()

thai_char_regex = re.compile(r'[\u0E00-\u0E7F]')

for idx, it in enumerate(items):
    word = it.get('word', '')
    lemma = it.get('lemma', '')
    pos = it.get('part_of_speech', '')
    cefr = it.get('cefr_level', '')
    th = it.get('meaning_th', '') or ''
    en = it.get('meaning_en', '') or ''
    tier = it.get('tier', '')

    cefr_counter[cefr] += 1
    pos_counter[pos] += 1
    tier_counter[tier] += 1

    if not th.strip():
        empty_th.append(word)
    elif not thai_char_regex.search(th):
        pure_ascii_th.append((word, th))

    if not en.strip():
        empty_en.append(word)
    if not pos.strip():
        empty_pos.append(word)
    if not cefr.strip():
        empty_cefr.append(word)

    for pat, name in scraper_en_patterns:
        if re.search(pat, en):
            scraper_en_matches[name].append(word)

    if word.lower() in known_problematic_words:
        problematic_samples.append({
            'word': word,
            'pos': pos,
            'cefr': cefr,
            'meaning_th': th,
            'meaning_en': en
        })

    for kw, desc in suspicious_th_keywords:
        if kw in th:
            suspicious_th_matches[desc].append((word, th))

print("\n--- Summary Statistics ---")
print(f"Empty meaning_th: {len(empty_th)}")
print(f"Pure ASCII (non-Thai) meaning_th: {len(pure_ascii_th)}")
print(f"Empty meaning_en: {len(empty_en)}")
print(f"Empty part_of_speech: {len(empty_pos)}")
print(f"Empty cefr_level: {len(empty_cefr)}")

print("\n--- CEFR Level Distribution ---")
for k, v in sorted(cefr_counter.items()):
    print(f"  {k}: {v:,} ({v/total*100:.1f}%)")

print("\n--- Tier Distribution ---")
for k, v in sorted(tier_counter.items()):
    print(f"  {k}: {v:,} ({v/total*100:.1f}%)")

print("\n--- Scraper Boilerplate in English Definitions ---")
for name, matches in scraper_en_matches.items():
    print(f"  {name}: {len(matches):,} words (e.g. {matches[:5]})")

print("\n--- Suspicious Thai Patterns / Leakage ---")
for desc, matches in suspicious_th_matches.items():
    print(f"  {desc}: {len(matches):,} words (e.g. {[w for w, _ in matches[:6]]})")

print("\n--- Check 15 Known Problematic Words in v3 ---")
for s in problematic_samples:
    print(f"  [{s['cefr']}] {s['word']} ({s['pos']})")
    print(f"    TH: {s['meaning_th']}")
    print(f"    EN: {s['meaning_en'][:60]}")
