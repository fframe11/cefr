import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

c_quality = sum(1 for i in items if 'the quality, state, or action of' in (i.get('meaning_en') or '').lower())
c_garment = sum(1 for i in items if 'a garment size for' in (i.get('meaning_en') or '').lower())
c_music = sum(1 for i in items if 'without musical accompaniment' in (i.get('meaning_en') or '').lower())

print(f"Total words: {len(items)}")
print(f"Quality/state/action placeholder: {c_quality}")
print(f"Garment size placeholder: {c_garment}")
print(f"Without musical accompaniment: {c_music}")

# Check words with 'verb' POS that are function words
preps = {'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by', 'down', 'during', 'for', 'from', 'in', 'into', 'near', 'of', 'off', 'on', 'onto', 'out', 'over', 'through', 'to', 'toward', 'towards', 'under', 'until', 'up', 'with', 'within', 'without'}
c_prep_verbs = sum(1 for i in items if i.get('word') in preps and i.get('part_of_speech') == 'verb')
print(f"Prepositions tagged as verb: {c_prep_verbs}")
