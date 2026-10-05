import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total catalog words: {len(items)}")

# 1. Suspicious definitions
bad_en_phrases = [
    'without musical accompaniment',
    'the quality, state, or action of',
    'a garment size for',
    'heraldry',
    'the fleshy part of the human body',
    'thorny eurasian shrub',
    'a piece of open land for recreational use',
]

suspicious_en = []
for i, item in enumerate(items):
    m_en = (item.get('meaning_en') or '').lower()
    for phrase in bad_en_phrases:
        if phrase in m_en:
            suspicious_en.append((item.get('word'), item.get('part_of_speech'), item.get('cefr_level'), item.get('meaning_th'), item.get('meaning_en'), phrase))

print(f"\n--- Suspicious English Definitions ({len(suspicious_en)}) ---")
for s in suspicious_en[:30]:
    print(f"{s[0]:15} | {s[1]:10} | {s[2]} | TH: {s[3]} | EN: {s[4][:50]} [{s[5]}]")

# 2. Check all A1 and A2 function words
core_words = [
    'a', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost',
    'alone', 'along', 'already', 'also', 'always', 'among', 'and', 'another',
    'any', 'anyone', 'anything', 'around', 'as', 'at', 'away', 'back', 'because',
    'before', 'behind', 'below', 'beside', 'best', 'better', 'between', 'both',
    'but', 'by', 'can', 'cannot', 'could', 'down', 'during', 'each', 'either',
    'else', 'enough', 'even', 'ever', 'every', 'everyone', 'everything', 'far',
    'few', 'first', 'for', 'from', 'front', 'general', 'common', 'good', 'great',
    'here', 'how', 'if', 'in', 'into', 'just', 'last', 'least', 'less', 'like',
    'little', 'lot', 'many', 'may', 'me', 'might', 'more', 'most', 'much',
    'must', 'my', 'near', 'neither', 'never', 'next', 'no', 'nobody', 'none',
    'no one', 'nor', 'not', 'nothing', 'now', 'of', 'off', 'often', 'on', 'once',
    'only', 'or', 'other', 'others', 'our', 'out', 'over', 'own', 'part', 'past',
    'per', 'perhaps', 'quite', 'rather', 'really', 'same', 'several', 'shall',
    'should', 'since', 'so', 'some', 'somebody', 'someone', 'something', 'sometimes',
    'soon', 'still', 'such', 'than', 'that', 'the', 'their', 'them', 'then',
    'there', 'these', 'they', 'this', 'those', 'though', 'through', 'throughout',
    'to', 'together', 'too', 'toward', 'towards', 'under', 'until', 'up', 'upon',
    'us', 'very', 'well', 'what', 'whatever', 'when', 'where', 'whether', 'which',
    'while', 'who', 'whoever', 'whom', 'whose', 'why', 'will', 'with', 'within',
    'without', 'would', 'yet', 'you', 'your'
]

print("\n--- Core High-Frequency Words Check ---")
for w in core_words:
    matches = [i for i in items if i.get('word') == w]
    for m in matches:
        # Check if POS or meaning is suspicious
        pos = m.get('part_of_speech')
        lvl = m.get('cefr_level')
        th = m.get('meaning_th')
        en = m.get('meaning_en')
        ex = m.get('example_sentence_en')
        print(f"{w:12} | {pos:10} | {lvl:2} | TH: {th} | EN: {en[:45]}")
