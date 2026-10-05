import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

slop_patterns = [
    (r'slang term for', 'slang term leak'),
    (r'distinctive flag', 'heraldry/flag'),
    (r'behavior intended to please', 'bizarre respect definition'),
    (r'kinship, common origin', 'kinship restriction'),
    (r'mass and occupies space', 'physics matter definition'),
    (r'auditory effect', 'sensory physics definition'),
    (r'visual sensation', 'sensory physics definition'),
    (r'tactile sensation', 'sensory physics definition'),
    (r'olfactory', 'sensory physics definition'),
    (r'gustatory', 'sensory physics definition'),
    (r'uncontrolled division of abnormal', 'medical pathology definition'),
    (r'fielding position', 'sports position'),
    (r'card game|game of cards|variety of bridge', 'card game leak'),
    (r'genus|subfamily|taxonomic|family of plants|family of animals', 'taxonomy leak'),
    (r'fleshy part', 'fleshy body part'),
    (r'apparatus used for|distillation', 'distillation apparatus'),
    (r'shaft dug', 'mine shaft'),
    (r'terrorist|assassination|murder of', 'violence/crime leak'),
    (r'statesman who', 'historical biography'),
    (r'airtight sealed', 'tin can leak'),
    (r'without musical accompaniment', 'a cappella leak'),
    (r'a garment size', 'garment size leak'),
    (r'thorny eurasian shrub', 'shrub leak'),
    (r'normative example|unavoidable event', 'philosophical jargon'),
    (r'dose of medicine|small pellet', 'pellet medicine'),
    (r'verb tense that expresses', 'grammar metalanguage'),
    (r'food that is discarded', 'garbage leak'),
    (r'the act of rowing', 'rowing sport leak'),
    (r'a light, self-propelled', 'bounce leak'),
    (r'the act of winding or twisting', 'winding twist leak'),
    (r'a suite of rooms usually on one floor', 'apartment leak'),
    (r'the act of tearing', 'tear rip leak'),
    (r'to act, perform, or engage in', 'tautological verb template'),
    (r'the state, fact, or instance of', 'tautological noun template'),
    (r'the quality, state, or action of', 'tautological noun template')
]

found = []
for idx, it in enumerate(items):
    w = it.get('word', '')
    m_en = it.get('meaning_en', '')
    m_th = it.get('meaning_th', '')
    ex_en = it.get('example_sentence_en', '')
    pos = it.get('part_of_speech', '')
    lvl = it.get('cefr_level', '')

    matches = []
    for pat, desc in slop_patterns:
        if re.search(pat, m_en, re.IGNORECASE):
            matches.append(desc)

    if matches:
        found.append({
            'index': idx,
            'id': it.get('id'),
            'glova_id': it.get('glova_id'),
            'word': w,
            'pos': pos,
            'cefr': lvl,
            'meaning_th': m_th,
            'meaning_en': m_en,
            'example_sentence_en': ex_en,
            'matches': matches
        })

print(f"Total entries with slop/glitch patterns: {len(found)}")

# Group by match description
type_counts = {}
for f in found:
    for m in f['matches']:
        type_counts[m] = type_counts.get(m, 0) + 1

for k, v in sorted(type_counts.items(), key=lambda x: -x[1]):
    print(f"  {k:35}: {v}")

with open('scripts/all_slop_detected.json', 'w', encoding='utf-8') as f:
    json.dump(found, f, ensure_ascii=False, indent=2)

print("\nSample found entries (first 30):")
for f in found[:30]:
    print(f"[{f['cefr']}] {f['word']:15} ({f['pos']:8}) | TH: {f['meaning_th'][:20]:20} | Slop: {', '.join(f['matches'])}")
