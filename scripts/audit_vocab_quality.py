import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total items: {len(items)}")

issues = []
weird_en_defs = []
weird_th_defs = []
pos_mismatches = []

# Known bad patterns in WordNet / scraped data
bad_patterns = [
    'without musical accompaniment',
    'heraldry',
    'garment size',
    'a piece of open land for recreational use',
    'thorny Eurasian shrub',
    'The quality, state, or action of',
    'a dose of medicine in the form of a small pellet', # when word is not tablet/pill
]

for idx, item in enumerate(items):
    w = item.get('word', '')
    pos = item.get('part_of_speech', '')
    lvl = item.get('cefr_level', '')
    m_en = item.get('meaning_en', '')
    m_th = item.get('meaning_th', '')
    ex_en = item.get('example_sentence_en', '')
    ex_th = item.get('example_sentence_th', '')

    # Check for placeholder or template Thai meaning
    if '??' in m_th or '??' in m_en:
        weird_th_defs.append((w, pos, lvl, m_th, "Question marks / encoding corrupt"))

    # Check for weird English definitions
    for p in bad_patterns:
        if p.lower() in m_en.lower():
            weird_en_defs.append((w, pos, lvl, m_en, p))

    # Check function words / prepositions wrongly classified as verbs/nouns
    func_preps = {
        'about': 'preposition', 'above': 'preposition', 'across': 'preposition',
        'after': 'preposition', 'against': 'preposition', 'along': 'preposition',
        'among': 'preposition', 'around': 'preposition', 'at': 'preposition',
        'before': 'preposition', 'behind': 'preposition', 'below': 'preposition',
        'beneath': 'preposition', 'beside': 'preposition', 'between': 'preposition',
        'beyond': 'preposition', 'by': 'preposition', 'down': 'preposition',
        'during': 'preposition', 'for': 'preposition', 'from': 'preposition',
        'in': 'preposition', 'into': 'preposition', 'near': 'preposition',
        'of': 'preposition', 'off': 'preposition', 'on': 'preposition',
        'onto': 'preposition', 'out': 'preposition', 'over': 'preposition',
        'through': 'preposition', 'throughout': 'preposition', 'to': 'preposition',
        'toward': 'preposition', 'towards': 'preposition', 'under': 'preposition',
        'until': 'preposition', 'up': 'preposition', 'upon': 'preposition',
        'with': 'preposition', 'within': 'preposition', 'without': 'preposition'
    }
    
    # Modal verbs
    modals = {'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'}

    # Pronouns / determiners
    determiners = {'all', 'any', 'each', 'every', 'both', 'either', 'neither', 'some', 'no', 'this', 'that', 'these', 'those'}

    if w in func_preps and pos == 'verb':
        pos_mismatches.append((w, pos, lvl, f"Should be {func_preps[w]}, not verb"))
    elif w in determiners and pos == 'verb':
        pos_mismatches.append((w, pos, lvl, f"Should be pronoun/determiner, not verb"))
    elif w in modals and pos == 'noun' and lvl in ['A1', 'A2', 'B1']:
        pos_mismatches.append((w, pos, lvl, f"Modal verb '{w}' misclassified as noun (e.g. can=กระป๋อง, will=ความตั้งใจ)"))

print(f"Weird EN defs: {len(weird_en_defs)}")
for x in weird_en_defs:
    print(f"  {x[0]} ({x[1]}, {x[2]}): {x[3]}")

print(f"\nPOS Mismatches: {len(pos_mismatches)}")
for x in pos_mismatches:
    print(f"  {x[0]} ({x[1]}, {x[2]}): {x[3]}")
