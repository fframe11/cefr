import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print("=== Words with 'ทั่วไป' or 'ทั่วๆ' in meaning_th ===")
for item in items:
    w = item.get('word', '')
    m_th = item.get('meaning_th', '')
    m_en = item.get('meaning_en', '')
    pos = item.get('part_of_speech', '')
    lvl = item.get('cefr_level', '')
    if any(k in m_th for k in ['ทั่วไป', 'ทั่วๆ']):
        print(f"{w:15} | {pos:10} | {lvl:3} | TH: {m_th} | EN: {m_en[:50]}")

print("\n=== Words related to 'general', 'common', 'about', 'able' ===")
check_list = ['about', 'able', 'general', 'common', 'normal', 'regular', 'universal', 'typical', 'overall', 'ordinary', 'around']
for item in items:
    w = item.get('word', '')
    if w in check_list:
        m_th = item.get('meaning_th', '')
        m_en = item.get('meaning_en', '')
        pos = item.get('part_of_speech', '')
        lvl = item.get('cefr_level', '')
        ex_en = item.get('example_sentence_en', '')
        print(f"{w:15} | {pos:10} | {lvl:3} | TH: {m_th} | EN: {m_en}")
        print(f"   Ex: {ex_en}")
