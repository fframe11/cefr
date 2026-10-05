import json
import re
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

print(f"Loaded {len(univ):,} items from vocabulary-extended-universe-v3.json")

# Category 1: Sports fielding leaks in non-sports words
sports_words = ['second', 'third', 'short', 'point', 'cover', 'slip', 'deep', 'fine', 'square', 'gully', 'bat', 'diamond', 'heater', 'curve', 'safety', 'bullet', 'strike', 'pitcher', 'catcher']
sports_hits = []

# Category 2: Biographical / historical person leaks
bio_regex = re.compile(r'\b(born in|statesman|patriot|theatrical producer|general in|emperor of|king of|queen of|inventor|philosopher)\b', re.I)
bio_hits = []

# Category 3: Vulgar / sexual / crude leaks
vulgar_regex = re.compile(r'\b(sexual|genital|copulation|intercourse|penis|vagina|masturbation)\b', re.I)
vulgar_th_regex = re.compile(r'(มีเพศสัมพันธ์|อวัยวะเพศ|สำเร็จความใคร่|ร่วมเพศ)')
vulgar_hits = []

# Category 4: Meaning TH is pure English / garbage / transliteration / failed MT
garbage_th_hits = []

# Category 5: Scraper artifacts
scraper_regex = re.compile(r'\b(The state,?\s+fact,?\s+or\s+instance\s+of|To act,?\s+perform,?\s+or\s+engage\s+in)\b', re.I)
scraper_hits = []

for idx, item in enumerate(univ):
    word = item.get('word', '').lower()
    th = item.get('meaning_th', '') or ''
    en = item.get('meaning_en', '') or ''
    pos = item.get('part_of_speech', '')

    if word in sports_words and ('cricket' in en.lower() or 'baseball' in en.lower() or 'คริกเก็ต' in th or 'เบสบอล' in th):
        sports_hits.append((word, pos, th, en[:50]))

    if bio_regex.search(en):
        bio_hits.append((word, pos, th, en[:60]))

    if (vulgar_regex.search(en) or vulgar_th_regex.search(th)) and word not in ['penis', 'vagina', 'copulation', 'intercourse', 'fellatio', 'cunnilingus', 'gonad', 'dildo']:
        vulgar_hits.append((word, pos, th, en[:50]))

    if scraper_regex.search(en):
        scraper_hits.append((word, pos, th, en[:50]))

    # Check garbage Thai
    if th and not re.search(r'[\u0e00-\u0e7f]', th):
        garbage_th_hits.append((word, th))

print(f"\n1. Sports fielding leaks: {len(sports_hits)}")
for h in sports_hits[:10]:
    print(f"   {h[0]} ({h[1]}): TH={h[2]} | EN={h[3]}")

print(f"\n2. Biographical person leaks: {len(bio_hits)}")
for h in bio_hits[:15]:
    print(f"   {h[0]} ({h[1]}): TH={h[2]} | EN={h[3]}")

print(f"\n3. Vulgar/sexual leaks in innocent words: {len(vulgar_hits)}")
for h in vulgar_hits[:15]:
    print(f"   {h[0]} ({h[1]}): TH={h[2]} | EN={h[3]}")

print(f"\n4. Scraper artifacts: {len(scraper_hits)}")
for h in scraper_hits[:10]:
    print(f"   {h[0]} ({h[1]}): TH={h[2]} | EN={h[3]}")

print(f"\n5. Non-Thai meaning_th: {len(garbage_th_hits)}")
