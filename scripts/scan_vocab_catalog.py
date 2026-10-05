import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total words in catalog: {len(items)}")

flagged = []

# Suspicious English patterns
bad_en_patterns = [
    r'the quality, state, or action of',
    r'a garment size for',
    r'without musical accompaniment',
    r'heraldry',
    r'fleshy part of',
    r'thorny eurasian shrub',
    r'a piece of open land for recreational use',
    r'terrorist organization',
    r'statesman who opposed',
    r'language of nomadic',
    r'type genus of',
    r'deep hole or shaft dug',
    r'apparatus used for the distillation',
    r'raw material that is sold in large quantities',
    r'fielding position of',
    r'latter part of the day',
    r'airtight sealed metal container',
    r'verb tense that expresses',
    r'dose of medicine in the form of a small pellet',
    r'a person of exceptional importance',
    r'an applicant likely to be chosen',
    r'something regarded as a normative example',
    r'something of value',
    r'a kind of person',
    r'an unavoidable event',
    r'something superior in quality',
    r'an adequate quantity',
]

# Function words / Modals that should not be 'verb' or 'noun'
preps_and_conj = {
    'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around',
    'as', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
    'beyond', 'by', 'down', 'during', 'for', 'from', 'in', 'into', 'like', 'near',
    'of', 'off', 'on', 'onto', 'out', 'over', 'since', 'through', 'throughout',
    'till', 'to', 'toward', 'towards', 'under', 'underneath', 'until', 'up',
    'upon', 'with', 'within', 'without', 'and', 'but', 'or', 'so', 'yet',
    'although', 'because', 'if', 'unless', 'while', 'whereas'
}

adverbs_and_pronouns = {
    'all', 'almost', 'also', 'always', 'any', 'anyone', 'anything', 'anywhere',
    'both', 'each', 'either', 'else', 'enough', 'even', 'ever', 'every',
    'everyone', 'everything', 'everywhere', 'here', 'how', 'just', 'more',
    'most', 'much', 'neither', 'never', 'no', 'nobody', 'none', 'no one',
    'nothing', 'now', 'often', 'only', 'other', 'others', 'quite', 'rather',
    'really', 'seldom', 'some', 'somebody', 'someone', 'something', 'sometimes',
    'somewhere', 'soon', 'still', 'such', 'than', 'that', 'then', 'there',
    'these', 'this', 'those', 'together', 'too', 'very', 'well', 'what',
    'whatever', 'when', 'whenever', 'where', 'wherever', 'which', 'who',
    'whoever', 'whom', 'whose', 'why'
}

modals = {'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'}

for idx, item in enumerate(items):
    w = item.get('word', '').lower().strip()
    pos = item.get('part_of_speech', '')
    lvl = item.get('cefr_level', '')
    m_th = item.get('meaning_th', '')
    m_en = item.get('meaning_en', '')
    ex_th = item.get('example_sentence_th', '')
    ex_en = item.get('example_sentence_en', '')

    reasons = []

    # 1. Suspicious EN patterns
    for p in bad_en_patterns:
        if re.search(p, m_en.lower()):
            reasons.append(f"Bad EN def: {p}")
            break

    # 2. Check POS issues
    if w in preps_and_conj and pos == 'verb':
        reasons.append(f"Prep/Conj marked as verb")
    if w in adverbs_and_pronouns and pos == 'verb':
        reasons.append(f"Adverb/Pronoun marked as verb")
    if w in modals and pos == 'noun' and lvl in ['A1', 'A2', 'B1']:
        reasons.append(f"Modal marked as noun")

    # 3. Check for placeholder / repetitive Thai meaning
    if '??' in m_th or not m_th or m_th == w:
        reasons.append(f"Corrupt or missing Thai meaning")

    # 4. Check boilerplate example_sentence_th
    is_boilerplate_ex_th = (
        'ตัวอย่างประโยคแสดงการใช้งาน' in ex_th or
        'ประโยคตัวอย่าง:' in ex_th or
        'หมายความว่า' in ex_th or
        ex_th == 'NEEDS_HUMAN_TRANSLATION' or
        not ex_th
    )

    if reasons:
        flagged.append({
            'index': idx,
            'id': item.get('id'),
            'glova_id': item.get('glova_id'),
            'word': item.get('word'),
            'cefr_level': lvl,
            'part_of_speech': pos,
            'meaning_th': m_th,
            'meaning_en': m_en,
            'example_sentence_en': ex_en,
            'example_sentence_th': ex_th,
            'reasons': reasons,
            'needs_ex_th_fix': is_boilerplate_ex_th
        })

print(f"Total flagged items with definition/POS issues: {len(flagged)}")

with open('scripts/flagged_vocab_issues.json', 'w', encoding='utf-8') as f:
    json.dump(flagged, f, ensure_ascii=False, indent=2)

print("\nSample flagged items (first 25):")
for f_item in flagged[:25]:
    print(f"{f_item['word']:15} | {f_item['part_of_speech']:10} | {f_item['cefr_level']:2} | TH: {f_item['meaning_th'][:20]:20} | Reasons: {', '.join(f_item['reasons'])}")
