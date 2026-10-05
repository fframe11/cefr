import json
import csv
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 1. 10k universe
with open('data/vocabulary-universe-10k.json', 'r', encoding='utf-8') as f:
    items10k = json.load(f)
words10k = set(x['word'].lower().strip() for x in items10k)
print(f"1. vocabulary-universe-10k: {len(words10k):,} unique words")

# 2. NAWL (Academic / IELTS / TOEFL)
with open('data/lexical-sources/frequency/1.2/NAWL_12_stats.csv', 'r', encoding='utf-8') as f:
    r = csv.reader(f)
    next(r)
    nawl = set(row[0].lower().strip() for row in r if row)
print(f"2. NAWL (Academic Word List for IELTS/TOEFL): {len(nawl):,} words")

# 3. NGSL (General Service List for TOEIC/CEFR)
with open('data/lexical-sources/frequency/1.2/NGSL_12_stats.csv', 'r', encoding='utf-8') as f:
    r = csv.reader(f)
    next(r)
    ngsl = set(row[0].lower().strip() for row in r if row)
print(f"3. NGSL (General Service List for TOEIC/CEFR): {len(ngsl):,} words")

# 4. CEFR-J (A1-B2)
with open('data/lexical-sources/cefrj/1.5/cefrj-vocabulary-profile-1.5.csv', 'r', encoding='utf-8') as f:
    r = csv.reader(f)
    next(r)
    cefrj = set(row[0].lower().strip() for row in r if row)
print(f"4. CEFR-J (A1-B2): {len(cefrj):,} words")

# 5. Octanove (C1-C2)
with open('data/lexical-sources/octanove/1.0/octanove-vocabulary-profile-c1c2-1.0.csv', 'r', encoding='utf-8') as f:
    r = csv.reader(f)
    next(r)
    octanove = set(row[0].lower().strip() for row in r if row)
print(f"5. Octanove (C1-C2): {len(octanove):,} words")

# Combined exam universe
all_exam_words = words10k | nawl | ngsl | cefrj | octanove
print(f"\n---> Total Combined Exam Vocabulary Universe: {len(all_exam_words):,} unique words!")
print(f"Overlap with 10k file: {len(words10k & (nawl | ngsl | cefrj | octanove)):,} words")
