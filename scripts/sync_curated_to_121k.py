import json
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("1. Loading production 3860 verified vocabulary...")
with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    prod_items = json.load(f)

print(f"Loaded {len(prod_items):,} production items.")

# Index production items by (word, pos) and by word
prod_by_word_pos = {}
prod_by_word = {}

for p in prod_items:
    w = p.get('word', '').lower().strip()
    pos = (p.get('part_of_speech') or '').lower().strip()
    prod_by_word_pos[(w, pos)] = p
    if w not in prod_by_word:
        prod_by_word[w] = p

print("2. Loading vocabulary-extended-universe-v3.json...")
with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

print(f"Loaded {len(univ):,} items from extended universe.")

# Specific Tier 2 non-prod homonym / vulgar / sports cleanups
tier2_cleanups = {
    'conquest': {
        'meaning_th': 'การพิชิต, การเอาชนะ',
        'meaning_en': 'the act of conquering or overcoming an obstacle or opponent'
    },
    'virginal': {
        'meaning_th': 'บริสุทธิ์, ไร้เดียงสา, คล้ายหญิงพรหมจารี',
        'meaning_en': 'characteristic of or befitting a virgin; pure or untouched'
    },
    'morality': {
        'meaning_th': 'ศีลธรรม, คุณธรรม',
        'meaning_en': 'principles concerning the distinction between right and wrong behavior'
    },
    'other': {
        'meaning_th': 'อื่นๆ, อีกอันหนึ่ง, สิ่งอื่น',
        'meaning_en': 'used to refer to a person or thing that is different or distinct from one already mentioned'
    },
    'heater': {
        'meaning_th': 'เครื่องทำความร้อน, ฮีตเตอร์',
        'meaning_en': 'a device that provides heat to a room, building, or vehicle'
    },
    'curve': {
        'meaning_th': 'เส้นโค้ง, ส่วนโค้ง',
        'meaning_en': 'a line or outline that bends smoothly without sharp angles'
    },
    'safety': {
        'meaning_th': 'ความปลอดภัย',
        'meaning_en': 'the condition of being protected from harm, danger, or risk'
    },
    'diamond': {
        'meaning_th': 'เพชร',
        'meaning_en': 'a precious stone consisting of clear and colorless crystalline carbon'
    },
    'bullet': {
        'meaning_th': 'กระสุน, กระสุนปืน',
        'meaning_en': 'a small metal projectile fired from a firearm'
    },
    'bat': {
        'meaning_th': 'ค้างคาว (สัตว์) หรือ ไม้ตีลูกบอล',
        'meaning_en': 'a nocturnal flying mammal, or a wooden stick used for hitting a ball'
    }
}

updated_from_prod = 0
updated_tier2_fixes = 0

for item in univ:
    w = item.get('word', '').lower().strip()
    pos = (item.get('part_of_speech') or '').lower().strip()

    # Priority 1: Check production exact match
    target_prod = prod_by_word_pos.get((w, pos))
    if not target_prod and item.get('tier') == 'TIER_1_VERIFIED':
        target_prod = prod_by_word.get(w)

    if target_prod:
        item['meaning_th'] = target_prod['meaning_th']
        item['meaning_en'] = target_prod['meaning_en']
        item['part_of_speech'] = target_prod.get('part_of_speech', item.get('part_of_speech'))
        item['cefr_level'] = target_prod.get('cefr_level', item.get('cefr_level'))
        if target_prod.get('ipa'):
            item['ipa'] = target_prod['ipa']
        if target_prod.get('example_sentence_en'):
            item['example_sentence_en'] = target_prod['example_sentence_en']
        if target_prod.get('example_sentence_th'):
            item['example_sentence_th'] = target_prod['example_sentence_th']
        if target_prod.get('collocations'):
            item['collocations'] = target_prod['collocations']
        item['tier'] = 'TIER_1_VERIFIED'
        item['production_status'] = 'VERIFIED_PRODUCTION'
        item['validation_status'] = 'VALIDATED_READY'
        item['lifecycle_status'] = 'VERIFIED_PRODUCTION'
        updated_from_prod += 1

    # Priority 2: Tier 2 cleanups
    elif w in tier2_cleanups:
        c = tier2_cleanups[w]
        item['meaning_th'] = c['meaning_th']
        item['meaning_en'] = c['meaning_en']
        updated_tier2_fixes += 1

print(f"Updated from production core: {updated_from_prod:,} items")
print(f"Applied Tier 2 cleanups: {updated_tier2_fixes:,} items")

# Spot check key words
check_words = ['animal', 'cat', 'dog', 'about', 'general', 'common', 'contract', 'tell', 'tree', 'begin', 'conquest', 'virginal', 'morality']
print("\n--- Spot Check Cleaned Words in 121k Universe ---")
for it in univ:
    if it.get('word', '').lower() in check_words:
        print(f"  [{it.get('cefr_level')}] {it.get('word')} ({it.get('part_of_speech')}):")
        print(f"    TH: {it.get('meaning_th')}")
        print(f"    EN: {it.get('meaning_en')[:60]}")
        check_words.remove(it.get('word', '').lower())
        if not check_words:
            break

# Save to both v3 and v1
print("\nSaving updated dataset to data/vocabulary-extended-universe-v3.json...")
with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
    json.dump(univ, f, ensure_ascii=False)

print("Saving updated dataset to data/vocabulary-extended-universe.json...")
with open('data/vocabulary-extended-universe.json', 'w', encoding='utf-8') as f:
    json.dump(univ, f, ensure_ascii=False)

print("Synchronization complete!")
