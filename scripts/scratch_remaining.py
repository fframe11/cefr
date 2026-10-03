#!/usr/bin/env python3
"""
export_remaining_pending.py — ดูว่า 1,662 คำที่เหลือเป็นอะไร
"""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    universe = json.load(f)

pending = [w for w in universe if w.get('lifecycle_status') == 'PENDING_THAI_TRANSLATION']
print(f'Remaining pending: {len(pending)}')
for w in pending:
    print(f'{w["word"]}|||{w["part_of_speech"]}|||{w["cefr_level"]}|||{w.get("meaning_en","")[:60]}')
