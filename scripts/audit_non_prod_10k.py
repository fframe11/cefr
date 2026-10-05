import json
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-universe-10k.json', 'r', encoding='utf-8') as f:
    items10k = json.load(f)

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    prod = json.load(f)

prod_words = set(p['word'].lower() for p in prod)
print(f"Total 10k items: {len(items10k):,}")
print(f"Total prod items: {len(prod):,}")

non_prod = [x for x in items10k if x['word'].lower() not in prod_words]
print(f"Non-prod items in 10k: {len(non_prod):,}")

# Check non-prod items for issues:
# 1. Sports fielding leaks
# 2. Biographical leaks
# 3. Vulgar leaks
# 4. Scraper boilerplate
# 5. Bad Thai translations

bio_regex = re.compile(r'\b(born in|statesman|patriot|theatrical producer|emperor of|king of)\b', re.I)
sports_words = ['second', 'third', 'short', 'point', 'cover', 'slip', 'deep', 'fine', 'square', 'bat', 'diamond', 'heater', 'curve', 'safety', 'bullet']
vulgar_regex = re.compile(r'\b(sexual|genital|copulation|intercourse|penis|vagina)\b', re.I)

bio_hits = []
sports_hits = []
vulgar_hits = []

for x in non_prod:
    w = x['word'].lower()
    en = (x.get('meaning_en') or '').lower()
    th = x.get('meaning_th') or ''
    
    if bio_regex.search(en):
        bio_hits.append((w, x.get('part_of_speech'), th, en[:50]))
    if w in sports_words and ('baseball' in en or 'cricket' in en):
        sports_hits.append((w, x.get('part_of_speech'), th, en[:50]))
    if vulgar_regex.search(en):
        vulgar_hits.append((w, x.get('part_of_speech'), th, en[:50]))

print(f"\nNon-prod biographical leaks: {len(bio_hits)}")
for h in bio_hits[:5]:
    print(f"  {h[0]} ({h[1]}): TH='{h[2]}' | EN='{h[3]}'")

print(f"Non-prod sports leaks: {len(sports_hits)}")
for h in sports_hits[:5]:
    print(f"  {h[0]} ({h[1]}): TH='{h[2]}' | EN='{h[3]}'")

print(f"Non-prod vulgar leaks: {len(vulgar_hits)}")
for h in vulgar_hits[:5]:
    print(f"  {h[0]} ({h[1]}): TH='{h[2]}' | EN='{h[3]}'")
