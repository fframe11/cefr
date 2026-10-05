import json
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("1. Loading production 3860 verified vocabulary...")
with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    prod_items = json.load(f)

prod_by_word_pos = {}
prod_by_word = {}
for p in prod_items:
    w = p.get('word', '').lower().strip()
    pos = (p.get('part_of_speech') or '').lower().strip()
    prod_by_word_pos[(w, pos)] = p
    if w not in prod_by_word:
        prod_by_word[w] = p

print(f"Loaded {len(prod_items):,} production items.")

print("2. Loading vocabulary-universe-10k.json...")
with open('data/vocabulary-universe-10k.json', 'r', encoding='utf-8') as f:
    items10k = json.load(f)

print(f"Loaded {len(items10k):,} items from 10k dataset.")

# Load NAWL (Academic Word List for IELTS/TOEFL)
nawl_words = set()
try:
    import csv
    with open('data/lexical-sources/frequency/1.2/NAWL_12_stats.csv', 'r', encoding='utf-8') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            if row:
                nawl_words.add(row[0].lower().strip())
except Exception as e:
    print(f"Warning loading NAWL: {e}")

print(f"Loaded {len(nawl_words)} NAWL academic words.")

# Specific cleanups for non-prod words that had crude or awkward WordNet definitions
NON_PROD_CLEANUPS = {
    'decent': {
        'meaning_th': 'เหมาะสม, น่านับถือ, สุภาพเรียบร้อย',
        'meaning_en': 'conforming with generally accepted standards of respectable or moral behavior'
    },
    'modest': {
        'meaning_th': 'ถ่อมตัว, ไม่โอ้อวด, เรียบง่าย',
        'meaning_en': 'unassuming or moderate in the estimation of one\'s abilities or achievements'
    },
    'breeding': {
        'meaning_th': 'การเพาะพันธุ์ (สัตว์/พืช), การอบรมเลี้ยงดู',
        'meaning_en': 'the mating and production of offspring by animals, or good manners resulting from proper upbringing'
    },
    'deviant': {
        'meaning_th': 'ที่เบี่ยงเบนจากมาตรฐาน, ที่ผิดปกติ',
        'meaning_en': 'departing from usual or accepted standards, especially in social or sexual behavior'
    },
    'aborigine': {
        'meaning_th': 'ชนพื้นเมืองดั้งเดิม',
        'meaning_en': 'an indigenous person who lived in a land from the earliest known times'
    },
    'aboriginal': {
        'meaning_th': 'ที่เป็นชนพื้นเมืองดั้งเดิม',
        'meaning_en': 'inhabiting or existing in a land from the earliest times or from before the arrival of colonists'
    }
}

synced_from_prod = 0
enriched_count = 0

for item in items10k:
    w = item.get('word', '').lower().strip()
    pos = (item.get('part_of_speech') or '').lower().strip()
    cefr = item.get('cefr_level', 'B1')
    topic = item.get('topic', 'General English')

    # Step A: Sync from verified 3860 production data
    target_prod = prod_by_word_pos.get((w, pos)) or prod_by_word.get(w)
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
        synced_from_prod += 1
    elif w in NON_PROD_CLEANUPS:
        c = NON_PROD_CLEANUPS[w]
        item['meaning_th'] = c['meaning_th']
        item['meaning_en'] = c['meaning_en']

    # Step B: Tag Exam Relevance
    target_exams = ['CEFR']
    
    # IELTS suitability
    ielts_bands = {
        'A1': 'Band 3.0 - 4.0 (Foundation)',
        'A2': 'Band 4.0 - 5.0 (Elementary)',
        'B1': 'Band 5.0 - 6.0 (General Training / Intermediate)',
        'B2': 'Band 6.0 - 7.0 (Academic / Competent User)',
        'C1': 'Band 7.0 - 8.0 (Academic Advanced / Good User)',
        'C2': 'Band 8.5 - 9.0 (Expert / Native-like Nuance)'
    }
    item['ielts_band'] = ielts_bands.get(cefr, 'Band 6.0')
    if cefr in ['B1', 'B2', 'C1', 'C2'] or w in nawl_words:
        target_exams.append('IELTS')

    # TOEIC suitability: Business, Work, Travel, Economy, Office
    toeic_topics = [
        'Business & Economy', 'Education & Work', 'Technology & Media', 
        'Law & Ethics', 'Holidays & Travel', 'Shopping & Money', 'Daily Life'
    ]
    if topic in toeic_topics or cefr in ['A2', 'B1', 'B2']:
        target_exams.append('TOEIC')

    # TOEFL / EOELT suitability: Academic Discourse, Science, Arts, Psychology
    toefl_topics = [
        'Academic Discourse', 'Science', 'Arts & Literature', 
        'Psychology & Behaviour', 'Global Issues', 'Critical Analysis'
    ]
    if topic in toefl_topics or w in nawl_words or cefr in ['B2', 'C1', 'C2']:
        target_exams.append('TOEFL')

    item['target_exams'] = target_exams
    item['is_exam_core'] = True
    item['is_nawl_academic'] = (w in nawl_words)
    enriched_count += 1

print(f"Synced {synced_from_prod:,} items from production verified core!")
print(f"Enriched {enriched_count:,} items with CEFR, IELTS, TOEIC, TOEFL exam metadata!")

# Check distribution of exam tags
from collections import Counter
exam_counts = Counter()
for item in items10k:
    for ex in item['target_exams']:
        exam_counts[ex] += 1

print("\n--- Exam Coverage Distribution (Total 10,021 words) ---")
for ex, cnt in exam_counts.most_common():
    print(f"  {ex:8}: {cnt:,} words ({cnt/len(items10k)*100:.1f}%)")

# Spot check key words
spot_words = ['general', 'common', 'about', 'animal', 'contract', 'schedule', 'procrastination', 'stimulate', 'decent', 'modest']
print("\n--- Spot-Check Key Exam Words in 10k Dataset ---")
for x in items10k:
    if x['word'].lower() in spot_words:
        print(f"  [{x['cefr_level']}] {x['word']} ({x['part_of_speech']}):")
        print(f"    TH: {x['meaning_th']}")
        print(f"    Exams: {x['target_exams']} | IELTS: {x['ielts_band']}")
        spot_words.remove(x['word'].lower())
        if not spot_words:
            break

# Save to data/vocabulary-universe-10k.json and data/vocabulary-exam-10k.json
print("\nSaving to data/vocabulary-universe-10k.json...")
with open('data/vocabulary-universe-10k.json', 'w', encoding='utf-8') as f:
    json.dump(items10k, f, ensure_ascii=False, indent=2)

print("Saving to data/vocabulary-exam-10k.json...")
with open('data/vocabulary-exam-10k.json', 'w', encoding='utf-8') as f:
    json.dump(items10k, f, ensure_ascii=False, indent=2)

print("Exam Vocabulary 10k Build Complete!")
