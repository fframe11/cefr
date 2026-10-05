import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total vocabulary items: {len(items)}")

# 1. Audit POS for all items
valid_pos = {'noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'phrase'}
adverbs = {
    'almost', 'already', 'also', 'always', 'anyway', 'away', 'back', 'even',
    'ever', 'far', 'forward', 'here', 'just', 'maybe', 'more', 'most', 'much',
    'near', 'never', 'no', 'not', 'now', 'often', 'once', 'only', 'out',
    'perhaps', 'quite', 'rarely', 'rather', 'really', 'seldom', 'so', 'soon',
    'still', 'then', 'there', 'together', 'too', 'usually', 'very', 'well',
    'yet', 'again', 'ago', 'ahead', 'apart', 'aside', 'certainly', 'definitely',
    'hardly', 'nearly', 'suddenly', 'truly'
}

prepositions = {
    'about', 'above', 'across', 'after', 'against', 'along', 'alongside', 'amid',
    'among', 'around', 'as', 'at', 'before', 'behind', 'below', 'beneath',
    'beside', 'besides', 'between', 'beyond', 'by', 'concerning', 'despite',
    'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'like',
    'near', 'of', 'off', 'on', 'onto', 'opposite', 'out', 'outside', 'over',
    'past', 'regarding', 'round', 'since', 'through', 'throughout', 'till',
    'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'unto',
    'up', 'upon', 'via', 'with', 'within', 'without'
}

conjunctions = {
    'although', 'and', 'because', 'but', 'if', 'nor', 'once', 'or', 'since',
    'so', 'though', 'unless', 'until', 'when', 'whenever', 'where', 'whereas',
    'wherever', 'while', 'yet'
}

modals = {
    'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'
}

weird_defs_patterns = [
    (r'fielding position', 'cricket fielding position'),
    (r'garment size', 'garment size'),
    (r'without musical accompaniment', 'a cappella noise'),
    (r'type genus', 'biological taxonomy'),
    (r'subfamily', 'biological taxonomy'),
    (r'taxonomic', 'biological taxonomy'),
    (r'fleshy part of', 'anatomical/crude body part'),
    (r'distillation of', 'distillation equipment'),
    (r'deep hole or shaft', 'well/mining shaft'),
    (r'statesman who', 'historical biography'),
    (r'terrorist organization', 'terrorist organization'),
    (r'verb tense that expresses', 'grammatical metalanguage'),
    (r'dose of medicine', 'pill/pellet'),
    (r'airtight sealed metal', 'tin can'),
    (r'thorny eurasian shrub', 'hawthorn plant'),
    (r'a piece of open land for recreational', 'park/common'),
    (r'language of nomadic', 'ethnic group/language'),
    (r'normative example', 'abstract philosophy'),
    (r'unavoidable event', 'philosophical/noun confusion'),
    (r'a kind of person', 'slang/generic'),
    (r'something regarded as', 'generic abstract'),
    (r'quality, state, or action', 'boilerplate grammar suffix'),
    (r'heraldry', 'heraldry relic')
]

issues = []

for idx, item in enumerate(items):
    w = item.get('word', '').strip()
    w_lower = w.lower()
    pos = item.get('part_of_speech', '')
    lvl = item.get('cefr_level', '')
    m_en = item.get('meaning_en', '')
    m_th = item.get('meaning_th', '')
    ex_en = item.get('example_sentence_en', '')
    ex_th = item.get('example_sentence_th', '')

    item_issues = []

    # Check pattern matches in m_en
    for pat, desc in weird_defs_patterns:
        if re.search(pat, m_en, re.IGNORECASE):
            item_issues.append(f"Definition issue: {desc}")

    # Check POS
    if w_lower in adverbs and pos == 'verb':
        item_issues.append(f"POS error: adverb '{w}' marked as verb")
    if w_lower in prepositions and pos == 'verb' and w_lower not in {'like'}: # like can be verb
        item_issues.append(f"POS error: preposition '{w}' marked as verb")
    if w_lower in modals and pos in {'noun', 'adjective'}:
        item_issues.append(f"POS error: modal '{w}' marked as {pos}")
    if pos not in valid_pos:
        item_issues.append(f"Invalid POS: {pos}")

    # Check suspicious Thai meanings
    if not m_th or len(m_th.strip()) == 0 or m_th == '??':
        item_issues.append("Missing Thai meaning")
    elif m_th == w:
        item_issues.append("Untranslated Thai meaning")

    # Check example sentence boilerplate
    if not ex_th or 'ตัวอย่างประโยคแสดงการใช้งาน' in ex_th or ex_th == 'NEEDS_HUMAN_TRANSLATION':
        item_issues.append("Boilerplate example sentence TH")

    # Check words that must mean 'ทั่วไป' or 'เกี่ยวกับ'
    # 'general', 'common', 'public', 'universal', 'ordinary', 'typical', 'standard'
    if w_lower == 'general' and 'ทั่วไป' not in m_th:
        item_issues.append("General should mean ทั่วไป")
    if w_lower == 'common' and 'ทั่วไป' not in m_th and 'ร่วมกัน' not in m_th:
        item_issues.append("Common should mean ทั่วไป or ร่วมกัน")
    if w_lower == 'about' and 'เกี่ยวกับ' not in m_th:
        item_issues.append("About should mean เกี่ยวกับ")
    if w_lower == 'concerning' and 'เกี่ยวกับ' not in m_th:
        item_issues.append("Concerning should mean เกี่ยวกับ")
    if w_lower == 'regarding' and 'เกี่ยวกับ' not in m_th:
        item_issues.append("Regarding should mean เกี่ยวกับ")

    if item_issues:
        issues.append({
            'index': idx,
            'id': item.get('id'),
            'glova_id': item.get('glova_id'),
            'word': w,
            'pos': pos,
            'cefr': lvl,
            'meaning_en': m_en,
            'meaning_th': m_th,
            'example_sentence_en': ex_en,
            'example_sentence_th': ex_th,
            'issues': item_issues
        })

print(f"Total items with detected issues: {len(issues)}")

# Summary of issues by type
issue_counts = {}
for it in issues:
    for iss in it['issues']:
        prefix = iss.split(':')[0]
        issue_counts[prefix] = issue_counts.get(prefix, 0) + 1

for k, v in issue_counts.items():
    print(f"  {k}: {v}")

with open('scripts/deep_audit_results.json', 'w', encoding='utf-8') as f:
    json.dump(issues, f, ensure_ascii=False, indent=2)

print("\nList of all issue words:")
for it in issues:
    print(f"[{it['cefr']}] {it['word']} ({it['pos']}): {', '.join(it['issues'])} | TH: {it['meaning_th']}")
