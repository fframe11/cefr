import json
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-universe-10k.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total items in 10k dataset: {len(items):,}")

# Check for known problematic words in 10k dataset
check_words = [
    'general', 'common', 'about', 'animal', 'cat', 'dog', 'tell', 'tree', 
    'begin', 'contract', 'second', 'third', 'steak', 'cancer', 'hardly'
]

print("\n--- Check 15 Known Critical Words in 10k Dataset ---")
for x in items:
    w = x.get('word', '').lower().strip()
    if w in check_words:
        print(f"  [{x.get('cefr_level')}] {x.get('word')} ({x.get('part_of_speech')}):")
        print(f"    TH: {x.get('meaning_th')}")
        print(f"    EN: {x.get('meaning_en')[:60]}")
        print(f"    Topic: {x.get('topic')}")

# Check for scraper boilerplate in meaning_en
scraper_pats = [
    r'the state,?\s+fact,?\s+or\s+instance\s+of',
    r'to\s+act,?\s+perform,?\s+or\s+engage\s+in',
    r'a\s+person\s+who\s+or\s+thing\s+that',
    r'WordNet Synset Entry'
]
scraper_hits = 0
for x in items:
    en = x.get('meaning_en', '') or ''
    for p in scraper_pats:
        if re.search(p, en, re.I):
            scraper_hits += 1
            break

print(f"\nScraper boilerplate in 10k: {scraper_hits}")
