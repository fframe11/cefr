import json
import re

with open('data/vocabularyBank.ts', 'r', encoding='utf-8') as f:
    orig_ts = f.read()

with open('data/vocabulary-exam-10k.json', 'r', encoding='utf-8') as f:
    exam_10k = json.load(f)

# Find words already in vocabularyBank.ts
existing_words = set(re.findall(r"word:\s*['\"]([^'\"]+)['\"]", orig_ts))
print(f"Existing words in vocabularyBank: {len(existing_words)}")

# Categories to pull from
daily = [w for w in exam_10k if w.get('is_daily_life') and w['word'].lower() not in existing_words][:50]
existing_words.update(w['word'].lower() for w in daily)

toeic = [w for w in exam_10k if 'TOEIC' in w.get('target_exams', []) and w['word'].lower() not in existing_words][:50]
existing_words.update(w['word'].lower() for w in toeic)

ielts = [w for w in exam_10k if 'IELTS' in w.get('target_exams', []) and w['word'].lower() not in existing_words][:50]
existing_words.update(w['word'].lower() for w in ielts)

toefl = [w for w in exam_10k if 'TOEFL' in w.get('target_exams', []) and w['word'].lower() not in existing_words][:50]

selected = daily + toeic + ielts + toefl
print(f"Selected new words: {len(selected)}")

# Format into TypeScript objects
def escape_str(s):
    if not s:
        return ""
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ')

new_entries = []
for idx, w in enumerate(selected, start=23):
    word = escape_str(w.get('word', ''))
    lemma = escape_str(w.get('lemma', word))
    cefr = w.get('cefr_level', 'B1')
    pos = escape_str(w.get('part_of_speech', 'noun'))
    ipa = escape_str(w.get('ipa', ''))
    meaning_th = escape_str(w.get('meaning_th', ''))
    meaning_en = escape_str(w.get('meaning_en', ''))
    ex_en = escape_str(w.get('example_sentence_en', ''))
    ex_th = escape_str(w.get('example_sentence_th', ''))
    topic = escape_str(w.get('topic', 'General'))
    colls = json.dumps(w.get('collocations', []))
    target_exams = json.dumps(w.get('target_exams', []))
    ielts_band = escape_str(w.get('ielts_band', ''))
    is_daily = 'true' if w.get('is_daily_life') else 'false'

    entry = f"""  {{
    id: 'vocab-exam-{idx:04d}',
    word: '{word}',
    lemma: '{lemma}',
    cefrLevel: '{cefr}',
    partOfSpeech: '{pos}',
    ipa: '{ipa}',
    meaningTh: '{meaning_th}',
    meaningEn: '{meaning_en}',
    exampleSentenceEn: '{ex_en}',
    exampleSentenceTh: '{ex_th}',
    topic: '{topic}',
    collocations: {colls},
    synonyms: [],
    antonyms: [],
    targetExams: {target_exams},
    ieltsBand: '{ielts_band}',
    isDailyLife: {is_daily},
    masteryPercentage: 0,
    reviewCount: 0,
  }},"""
    new_entries.append(entry)

# Insert before closing ];
insert_idx = orig_ts.rfind('];')
if insert_idx != -1:
    updated_ts = orig_ts[:insert_idx].rstrip() + "\n\n  // Curated High-Yield Exam & Daily Life Additions (200 Core Units)\n" + "\n".join(new_entries) + "\n];\n"
    with open('data/vocabularyBank.ts', 'w', encoding='utf-8') as f:
        f.write(updated_ts)
    print("Updated data/vocabularyBank.ts successfully!")
else:
    print("Could not find closing ]; in data/vocabularyBank.ts")
