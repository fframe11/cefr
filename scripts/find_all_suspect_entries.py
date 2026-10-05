import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

suspect_entries = []

suspect_phrases = [
    'the quality, state, or action of',
    'a garment size for',
    'without musical accompaniment',
    'heraldry',
    'the fleshy part of the human body',
    'thorny eurasian shrub',
    'a piece of open land for recreational use',
    'terrorist organization',
    'english statesman who opposed',
    'language of nomadic lapps',
    'type genus of the mantidae',
    'deep hole or shaft dug',
    'apparatus used for the distillation',
    'raw material that is sold in large quantities',
    'fielding position of the player',
    'latter part of the day',
    'airtight sealed metal container',
    'verb tense that expresses',
    'dose of medicine in the form of a small pellet',
]

for item in items:
    w = item.get('word', '')
    m_en = (item.get('meaning_en') or '').lower()
    pos = item.get('part_of_speech', '')
    
    # Check suspect phrases
    for sp in suspect_phrases:
        if sp in m_en:
            suspect_entries.append((item.get('id'), w, pos, item.get('cefr_level'), item.get('meaning_th'), item.get('meaning_en'), sp))
            break

print(f"Total suspect entries found: {len(suspect_entries)}")
with open('scripts/suspect_entries.json', 'w', encoding='utf-8') as f_out:
    json.dump(suspect_entries, f_out, ensure_ascii=False, indent=2)

for s in suspect_entries:
    print(f"{s[1]:15} | {s[2]:10} | {s[3]:2} | TH: {s[4]} | EN: {s[5][:60]}")
