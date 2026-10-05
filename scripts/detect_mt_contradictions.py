import json
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

# Find obvious MT mistranslation patterns
corrupted = []

# Pattern 1: 'ware' translated as 'ซอฟต์แวร์' for physical goods
ware_pat = re.compile(r'ซอฟต์แวร์')

# Pattern 2: 'pump' in non-pump words
pump_pat = re.compile(r'เครื่องสูบลม')

# Pattern 3: 'angle' -> 'ช่องสัญญาณ'
angle_pat = re.compile(r'ช่องสัญญาณ')

# Pattern 4: 'opacity' / 'ทึบแสง' for non-optical words
opacity_pat = re.compile(r'ความทึบแสง')

# Pattern 5: 'cyclone' / 'ไซโคลน' for biochemical/chemical words
cyclone_pat = re.compile(r'ไซโคลน')

# Pattern 6: 'graph' -> 'กราฟ' for linguistic words
graph_pat = re.compile(r'^กราฟ$')

for x in univ:
    w = x['word'].lower()
    th = x.get('meaning_th', '') or ''
    en = (x.get('meaning_en', '') or '').lower()
    
    # 1. Ware bug
    if ware_pat.search(th) and not any(k in en for k in ['software', 'program', 'computer', 'digital']):
        corrupted.append((w, x.get('part_of_speech'), th, en, 'ware_software_bug'))
    
    # 2. Pump bug
    if pump_pat.search(th) and not any(k in en for k in ['pump', 'air', 'tire', 'inflate', 'fluid', 'compress']):
        corrupted.append((w, x.get('part_of_speech'), th, en, 'pump_bug'))
        
    # 3. Channel/angle bug
    if angle_pat.search(th) and not any(k in en for k in ['channel', 'frequency', 'signal', 'broadcast', 'telecommunication']):
        corrupted.append((w, x.get('part_of_speech'), th, en, 'channel_bug'))
        
    # 4. Opacity bug
    if opacity_pat.search(th) and not any(k in en for k in ['opaque', 'light', 'transparent', 'clarity', 'optical']):
        corrupted.append((w, x.get('part_of_speech'), th, en, 'opacity_bug'))

    # 5. Cyclone bug
    if cyclone_pat.search(th) and not any(k in en for k in ['cyclone', 'storm', 'wind', 'hurricane', 'meteorology']):
        corrupted.append((w, x.get('part_of_speech'), th, en, 'cyclone_bug'))

    # 6. Graph bug
    if graph_pat.search(th) and any(k in en for k in ['letter', 'written symbol', 'phoneme', 'linguistics', 'alphabet', 'speech']):
        corrupted.append((w, x.get('part_of_speech'), th, en, 'graph_linguistics_bug'))

print(f"Total obvious MT semantic bugs detected: {len(corrupted)}")
from collections import Counter
bug_types = Counter(c[4] for c in corrupted)
for b, cnt in bug_types.items():
    print(f"  {b}: {cnt}")

print("\nSample detected bugs:")
for c in corrupted[:15]:
    print(f"  {c[0]} ({c[1]}): Current TH='{c[2]}' | EN='{c[3][:50]}' [{c[4]}]")
