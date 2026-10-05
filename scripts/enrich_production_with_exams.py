import json
import csv
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load NAWL
nawl_words = set()
try:
    with open('data/lexical-sources/frequency/1.2/NAWL_12_stats.csv', 'r', encoding='utf-8') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            if row:
                nawl_words.add(row[0].lower().strip())
except Exception as e:
    print(f"Warning loading NAWL: {e}")

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    prod = json.load(f)

daily_life_topics = set([
    'Daily Life', 'Food & Drink', 'Family & Friends', 'Shopping & Money',
    'Holidays & Travel', 'Travel & Places', 'Travel & Transport',
    'Free Time & Hobbies', 'Health & Body', 'Home & Environment',
    'Home & Housing', 'Home & Hardware', 'Clothing & Daily', 'Clothing & Style',
    'Communication & Daily', 'Sports & Entertainment'
])

ielts_bands = {
    'A1': 'Band 3.0 - 4.0 (Foundation)',
    'A2': 'Band 4.0 - 5.0 (Elementary)',
    'B1': 'Band 5.0 - 6.0 (General Training / Intermediate)',
    'B2': 'Band 6.0 - 7.0 (Academic / Competent User)',
    'C1': 'Band 7.0 - 8.0 (Academic Advanced / Good User)',
    'C2': 'Band 8.5 - 9.0 (Expert / Native-like Nuance)'
}

daily_count = 0
exam_counts = {'CEFR': 0, 'IELTS': 0, 'TOEIC': 0, 'TOEFL': 0}

for item in prod:
    w = item['word'].lower().strip()
    cefr = item.get('cefr_level', 'B1')
    topic = item.get('topic', 'General')

    # Daily life flag
    is_daily = (topic in daily_life_topics) or (cefr in ['A1', 'A2'])
    item['is_daily_life'] = is_daily
    if is_daily:
        daily_count += 1

    # Target exams
    exams = ['CEFR']
    exam_counts['CEFR'] += 1

    # IELTS
    if cefr in ['B1', 'B2', 'C1', 'C2'] or w in nawl_words:
        exams.append('IELTS')
        exam_counts['IELTS'] += 1

    # TOEIC
    toeic_topics = [
        'Business & Economy', 'Education & Work', 'Technology & Media',
        'Law & Ethics', 'Holidays & Travel', 'Shopping & Money', 'Daily Life',
        'Work & Study', 'Professional Leadership', 'Business & Work'
    ]
    if topic in toeic_topics or cefr in ['A2', 'B1', 'B2']:
        exams.append('TOEIC')
        exam_counts['TOEIC'] += 1

    # TOEFL
    toefl_topics = [
        'Academic Discourse', 'Science', 'Arts & Literature',
        'Psychology & Behaviour', 'Global Issues', 'Critical Analysis',
        'Politics & Philosophy', 'Advanced Science', 'Advanced Research'
    ]
    if topic in toefl_topics or w in nawl_words or cefr in ['B2', 'C1', 'C2']:
        exams.append('TOEFL')
        exam_counts['TOEFL'] += 1

    item['target_exams'] = exams
    item['ielts_band'] = ielts_bands.get(cefr, 'Band 6.0')
    item['is_nawl_academic'] = (w in nawl_words)

print(f"Total production items: {len(prod):,}")
print(f"Daily Life vocabulary: {daily_count:,} ({daily_count/len(prod)*100:.1f}%)")
print("Target Exam Distribution in Core 3,860:")
for ex, cnt in exam_counts.items():
    print(f"  {ex:8}: {cnt:,} ({cnt/len(prod)*100:.1f}%)")

with open('data/vocabulary-production-3860.json', 'w', encoding='utf-8') as f:
    json.dump(prod, f, ensure_ascii=False, indent=2)

print("Saved updated data/vocabulary-production-3860.json successfully!")
