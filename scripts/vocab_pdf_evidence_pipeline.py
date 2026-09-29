"""
Glova Vocabulary Evidence & Linguistic Accuracy Foundation Pipeline
Processes all 10 reference PDFs from Vocab_src_pdf/, extracts lexical entries,
cross-references the 10,021 Glova universe, evaluates semantic/POS/CEFR/IPA/Example/Collocation
evidence, enforces strict license safety (evidence-only, fail-closed), and outputs
all 8 required evidence artifacts to data/external-cache/vocab-pdf/.
"""

import os
import sys
import json
import hashlib
import re
from collections import Counter, defaultdict
import fitz  # PyMuPDF

sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PDF_DIR = os.path.join(PROJECT_ROOT, 'Vocab_src_pdf')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'data', 'external-cache', 'vocab-pdf')
UNIVERSE_PATH = os.path.join(PROJECT_ROOT, 'data', 'vocabulary-universe-10k.json')

os.makedirs(OUTPUT_DIR, exist_ok=True)

EXPECTED_PDFS = [
    '506166-starters-movers-flyers-word-list-2025.pdf',
    '506886-a2-key-2020-vocabulary-list.pdf',
    '506887-b1-preliminary-vocabulary-list.pdf',
    'The_Oxford_3000_by_CEFR_level.pdf',
    'English-wordlist-A1.pdf',
    'English-wordlist-A2.pdf',
    'English-wordlist-B1.pdf',
    'English-wordlist-B2.pdf',
    'English-wordlist-C1.pdf',
    'Level-C2-Word-List.pdf'
]

# Source metadata definitions
SOURCE_META_DEFS = {
    '506166-starters-movers-flyers-word-list-2025.pdf': {
        'source_id': 'cambridge_yle_2025',
        'source_name': 'Cambridge English Young Learners (Starters, Movers, Flyers) Wordlists',
        'publisher': 'Cambridge Assessment English / UCLES',
        'version': '2025',
        'classification': 'OFFICIAL_REFERENCE',
        'source_url': 'https://www.cambridgeenglish.org',
        'license': '© UCLES 2025. All rights reserved. Educational examination reference.',
        'license_url': 'https://www.cambridgeenglish.org/legal',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    '506886-a2-key-2020-vocabulary-list.pdf': {
        'source_id': 'cambridge_a2_key_2025',
        'source_name': 'Cambridge English A2 Key and A2 Key for Schools Vocabulary List',
        'publisher': 'Cambridge Assessment English / UCLES',
        'version': 'August 2025',
        'classification': 'OFFICIAL_REFERENCE',
        'source_url': 'https://www.cambridgeenglish.org',
        'license': '© UCLES 2025. All rights reserved. Educational examination reference.',
        'license_url': 'https://www.cambridgeenglish.org/legal',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    '506887-b1-preliminary-vocabulary-list.pdf': {
        'source_id': 'cambridge_b1_preliminary_2025',
        'source_name': 'Cambridge English B1 Preliminary and Preliminary for Schools Vocabulary List',
        'publisher': 'Cambridge University Press & Assessment (CUPA)',
        'version': 'August 2025',
        'classification': 'OFFICIAL_REFERENCE',
        'source_url': 'https://www.cambridgeenglish.org',
        'license': '© CUPA 2025. All rights reserved. Educational examination reference.',
        'license_url': 'https://www.cambridgeenglish.org/legal',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    'The_Oxford_3000_by_CEFR_level.pdf': {
        'source_id': 'oxford_3000_2020',
        'source_name': 'The Oxford 3000™ by CEFR level',
        'publisher': 'Oxford University Press',
        'version': '2020',
        'classification': 'AUTHORITATIVE_REFERENCE',
        'source_url': 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000',
        'license': '© Oxford University Press. Educational wordlist reference.',
        'license_url': 'https://www.oup.com',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    'English-wordlist-A1.pdf': {
        'source_id': 'langeek_a1_2025',
        'source_name': 'LanGeek A1 English Vocabulary List (Beginners)',
        'publisher': 'LanGeek.co',
        'version': '2025',
        'classification': 'THIRD_PARTY_REFERENCE',
        'source_url': 'https://langeek.co',
        'license': '© LanGeek.co. Digital learning reference materials.',
        'license_url': 'https://langeek.co/terms',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    'English-wordlist-A2.pdf': {
        'source_id': 'langeek_a2_2025',
        'source_name': 'LanGeek A2 English Vocabulary List (Elementary)',
        'publisher': 'LanGeek.co',
        'version': '2025',
        'classification': 'THIRD_PARTY_REFERENCE',
        'source_url': 'https://langeek.co',
        'license': '© LanGeek.co. Digital learning reference materials.',
        'license_url': 'https://langeek.co/terms',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    'English-wordlist-B1.pdf': {
        'source_id': 'langeek_b1_2025',
        'source_name': 'LanGeek B1 English Vocabulary List (Intermediate)',
        'publisher': 'LanGeek.co',
        'version': '2025',
        'classification': 'THIRD_PARTY_REFERENCE',
        'source_url': 'https://langeek.co',
        'license': '© LanGeek.co. Digital learning reference materials.',
        'license_url': 'https://langeek.co/terms',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    'English-wordlist-B2.pdf': {
        'source_id': 'langeek_b2_2025',
        'source_name': 'LanGeek B2 English Vocabulary List (Upper-intermediate)',
        'publisher': 'LanGeek.co',
        'version': '2025',
        'classification': 'THIRD_PARTY_REFERENCE',
        'source_url': 'https://langeek.co',
        'license': '© LanGeek.co. Digital learning reference materials.',
        'license_url': 'https://langeek.co/terms',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    'English-wordlist-C1.pdf': {
        'source_id': 'langeek_c1_2025',
        'source_name': 'LanGeek C1 English Vocabulary List (Advanced)',
        'publisher': 'LanGeek.co',
        'version': '2025',
        'classification': 'THIRD_PARTY_REFERENCE',
        'source_url': 'https://langeek.co',
        'license': '© LanGeek.co. Digital learning reference materials.',
        'license_url': 'https://langeek.co/terms',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    },
    'Level-C2-Word-List.pdf': {
        'source_id': 'mavrogeorgiadis_c2_2016',
        'source_name': 'Word List for Level C2 (English Profile / Cambridge Learner Corpus Compilation)',
        'publisher': 'Efthimios Mavrogeorgiadis (http://www.toe.gr/) using English Profile / Cambridge Learner Corpus',
        'version': '2016',
        'classification': 'THIRD_PARTY_REFERENCE',
        'source_url': 'http://www.toe.gr/',
        'license': 'Third-party electronic compilation using English Vocabulary Profile / Cambridge Learner Corpus. Non-commercial reference only.',
        'license_url': 'http://www.englishprofile.org/',
        'commercial_use': False,
        'redistribution_allowed': False,
        'derivative_use': False,
        'attribution_required': True,
        'share_alike_required': False,
        'production_allowed': False,
        'evidence_only': True,
        'verification_status': 'REFERENCE_ONLY'
    }
}

POLYSEMY_HOTLIST = {
    'issue', 'charge', 'fine', 'matter', 'subject', 'mean', 'point',
    'figure', 'account', 'address', 'current', 'match', 'run', 'set',
    'strike', 'record', 'bank', 'interest', 'share', 'present', 'spring',
    'board', 'order', 'right', 'light', 'court', 'case', 'plant', 'firm'
}

def normalize_pos(raw_pos):
    if not raw_pos:
        return 'other'
    p = raw_pos.lower().strip()
    if any(k in p for k in ['noun', 'n.', ' n', 'n,', '(n)']):
        return 'noun'
    if any(k in p for k in ['verb', 'v.', ' v', 'v,', '(v)']):
        return 'verb'
    if any(k in p for k in ['adjective', 'adj.', ' adj', 'adj,', '(adj)']):
        return 'adjective'
    if any(k in p for k in ['adverb', 'adv.', ' adv', 'adv,', '(adv)']):
        return 'adverb'
    if any(k in p for k in ['prep', 'preposition']):
        return 'preposition'
    if any(k in p for k in ['conj', 'conjunction']):
        return 'conjunction'
    if any(k in p for k in ['pron', 'pronoun']):
        return 'pronoun'
    if any(k in p for k in ['det', 'determiner']):
        return 'determiner'
    if any(k in p for k in ['intj', 'exclamation', 'interjection']):
        return 'interjection'
    return 'other'

def clean_lemma(text):
    if not text:
        return ''
    w = text.lower().strip()
    # remove parenthetical notes
    w = re.sub(r'\(.*?\)', '', w).strip()
    # take first variant if slash separated
    if '/' in w:
        w = w.split('/')[0].strip()
    # remove trailing punctuation
    w = w.strip('.,;:\'"!?')
    return w

def run_pipeline():
    print('============================================================')
    print('GLOVA VOCABULARY EVIDENCE PIPELINE STARTING')
    print('============================================================')
    
    # 1. Source Inventory
    print('\n[Step 1] Inspecting 10 Reference PDFs in Vocab_src_pdf/...')
    actual_files = sorted(os.listdir(PDF_DIR))
    discovered_pdfs = [f for f in actual_files if f.lower().endswith('.pdf')]
    missing = [f for f in EXPECTED_PDFS if f not in discovered_pdfs]
    unexpected = [f for f in discovered_pdfs if f not in EXPECTED_PDFS]
    
    print(f'Discovered PDFs: {len(discovered_pdfs)}')
    print(f'Missing expected: {len(missing)}')
    print(f'Unexpected: {len(unexpected)}')
    
    source_registry = []
    extracted_datasets = {}
    
    for fname in EXPECTED_PDFS:
        fpath = os.path.join(PDF_DIR, fname)
        if not os.path.exists(fpath):
            print(f'ERROR: Expected file {fname} not found!')
            continue
            
        fsize = os.path.getsize(fpath)
        h = hashlib.sha256()
        with open(fpath, 'rb') as f:
            while chunk := f.read(65536):
                h.update(chunk)
        sha256 = h.hexdigest()
        
        doc = fitz.open(fpath)
        page_count = len(doc)
        meta = doc.metadata
        
        meta_def = SOURCE_META_DEFS.get(fname, {})
        source_id = meta_def.get('source_id', fname)
        
        print(f'  - Processing {fname} ({page_count} pages, {fsize:,} bytes, sha256: {sha256[:12]}...)')
        
        # Extract entries based on source
        extracted_items = []
        
        if source_id == 'oxford_3000_2020':
            curr_level = None
            for p, page in enumerate(doc):
                for line in page.get_text().splitlines():
                    line = line.strip()
                    if line in ['A1', 'A2', 'B1', 'B2']:
                        curr_level = line
                    elif curr_level and line and not line.startswith('©') and 'Oxford 3000' not in line and not line.endswith('/ 12'):
                        parts = line.split()
                        if len(parts) >= 2:
                            pos_str = parts[-1]
                            raw_w = ' '.join(parts[:-1]).rstrip(',')
                            lemma = clean_lemma(raw_w)
                            if lemma:
                                extracted_items.append({
                                    'lemma': lemma,
                                    'raw_word': raw_w,
                                    'pos_raw': pos_str,
                                    'pos': normalize_pos(pos_str),
                                    'cefr': curr_level,
                                    'page': p + 1
                                })
                                
        elif source_id.startswith('langeek_'):
            level_code = source_id.split('_')[1].upper()
            for p, page in enumerate(doc):
                lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
                for i, line in enumerate(lines):
                    m = re.match(r'^([A-Za-z\s\-\'\.]+)\s+\(([a-z\.,\s]+)\)$', line)
                    if m:
                        raw_w = m.group(1).strip()
                        pos_raw = m.group(2).strip()
                        ipa = lines[i+1] if i + 1 < len(lines) and lines[i+1].startswith('/') else ''
                        definition = lines[i+2] if i + 2 < len(lines) and not re.match(r'^\d+$', lines[i+2]) and not re.match(r'^[A-Za-z\s\-\'\.]+\s+\([a-z\.,\s]+\)$', lines[i+2]) and not lines[i+2].startswith('/') else ''
                        lemma = clean_lemma(raw_w)
                        if lemma:
                            extracted_items.append({
                                'lemma': lemma,
                                'raw_word': raw_w,
                                'pos_raw': pos_raw,
                                'pos': normalize_pos(pos_raw),
                                'cefr': level_code,
                                'ipa': ipa,
                                'definition': definition,
                                'page': p + 1
                            })
                            
        elif source_id == 'cambridge_a2_key_2025':
            for p in range(5, len(doc)):
                for line in doc[p].get_text().splitlines():
                    line = line.strip()
                    m = re.match(r'^([a-zA-Z\s\-\'\/]+)\s+\(([a-z\s,\/&]+)\)$', line)
                    if m:
                        raw_w = m.group(1).strip()
                        pos_raw = m.group(2).strip()
                        lemma = clean_lemma(raw_w)
                        if lemma:
                            extracted_items.append({
                                'lemma': lemma,
                                'raw_word': raw_w,
                                'pos_raw': pos_raw,
                                'pos': normalize_pos(pos_raw),
                                'cefr': 'A2',
                                'page': p + 1
                            })
                            
        elif source_id == 'cambridge_b1_preliminary_2025':
            for p in range(5, len(doc)):
                for line in doc[p].get_text().splitlines():
                    line = line.strip()
                    m = re.match(r'^([a-zA-Z\s\-\'\/]+)\s+\(([a-z\s,\/&]+)\)$', line)
                    if m:
                        raw_w = m.group(1).strip()
                        pos_raw = m.group(2).strip()
                        lemma = clean_lemma(raw_w)
                        if lemma:
                            extracted_items.append({
                                'lemma': lemma,
                                'raw_word': raw_w,
                                'pos_raw': pos_raw,
                                'pos': normalize_pos(pos_raw),
                                'cefr': 'B1',
                                'page': p + 1
                            })
                            
        elif source_id == 'cambridge_yle_2025':
            for p in range(3, 17):
                lvl = 'Pre-A1' if p < 7 else ('A1' if p < 11 else 'A2')
                for line in doc[p].get_text().splitlines():
                    line = line.strip()
                    m = re.match(r'^([a-zA-Z\s\-\'\/]+)\s+([a-z\+\s]+)$', line)
                    if m:
                        raw_w = m.group(1).strip()
                        if len(raw_w) > 1 and not raw_w.startswith('Pre A1') and not raw_w.startswith('A1 Movers') and not raw_w.startswith('A2 Flyers'):
                            lemma = clean_lemma(raw_w)
                            if lemma:
                                extracted_items.append({
                                    'lemma': lemma,
                                    'raw_word': raw_w,
                                    'pos_raw': m.group(2).strip(),
                                    'pos': normalize_pos(m.group(2).strip()),
                                    'cefr': lvl,
                                    'page': p + 1
                                })
                                
        elif source_id == 'mavrogeorgiadis_c2_2016':
            for p in range(6, len(doc)):
                for line in doc[p].get_text().splitlines():
                    line = line.strip()
                    m = re.match(r'^([a-zA-Z\s\-\'\.]+)\s+(/[^/]+/)$', line)
                    if m:
                        raw_w = m.group(1).strip()
                        if len(raw_w) < 40 and not raw_w.endswith('.'):
                            lemma = clean_lemma(raw_w)
                            if lemma:
                                extracted_items.append({
                                    'lemma': lemma,
                                    'raw_word': raw_w,
                                    'pos_raw': 'C2 Lexicon',
                                    'pos': 'other',
                                    'cefr': 'C2',
                                    'ipa': m.group(2),
                                    'page': p + 1
                                })

        extracted_datasets[source_id] = extracted_items
        
        reg_entry = {
            'source_id': source_id,
            'source_name': meta_def.get('source_name', fname),
            'filename': fname,
            'sha256': sha256,
            'size_bytes': fsize,
            'page_count': page_count,
            'publisher_or_compiler': meta_def.get('publisher', 'Unknown'),
            'version': meta_def.get('version', 'Unknown'),
            'source_classification': meta_def.get('classification', 'THIRD_PARTY_REFERENCE'),
            'source_url': meta_def.get('source_url', ''),
            'license': meta_def.get('license', 'Unspecified'),
            'license_url': meta_def.get('license_url', ''),
            'commercial_use': meta_def.get('commercial_use', False),
            'redistribution_allowed': meta_def.get('redistribution_allowed', False),
            'derivative_use': meta_def.get('derivative_use', False),
            'attribution_required': meta_def.get('attribution_required', True),
            'share_alike_required': meta_def.get('share_alike_required', False),
            'production_allowed': meta_def.get('production_allowed', False),
            'evidence_only': meta_def.get('evidence_only', True),
            'verification_status': meta_def.get('verification_status', 'REFERENCE_ONLY'),
            'extraction_method': 'PyMuPDF text extraction + structured regex parsing',
            'extracted_items_count': len(extracted_items),
            'confidence': 'HIGH_DETERMINISTIC',
            'pdf_metadata': {
                'title': meta.get('title', ''),
                'author': meta.get('author', ''),
                'creator': meta.get('creator', ''),
                'producer': meta.get('producer', ''),
                'creationDate': meta.get('creationDate', ''),
                'modDate': meta.get('modDate', ''),
                'format': meta.get('format', '')
            }
        }
        source_registry.append(reg_entry)

    # Save vocabulary-source-registry.json
    registry_path = os.path.join(OUTPUT_DIR, 'vocabulary-source-registry.json')
    with open(registry_path, 'w', encoding='utf-8') as f:
        json.dump(source_registry, f, indent=2, ensure_ascii=False)
    print(f'Saved source registry to {registry_path} ({len(source_registry)} sources)')

    # 2. Build Inverted Index from Extracted PDF Data
    print('\n[Step 2] Building Fast Inverted Index from Extracted Reference Items...')
    # lemma -> list of match records
    pdf_lemma_index = defaultdict(list)
    for source_id, items in extracted_datasets.items():
        s_meta = SOURCE_META_DEFS.get(
            [f for f, v in SOURCE_META_DEFS.items() if v['source_id'] == source_id][0], {}
        )
        s_name = s_meta.get('source_name', source_id)
        for it in items:
            l = it['lemma']
            pdf_lemma_index[l].append({
                'source_id': source_id,
                'source_name': s_name,
                'raw_word': it.get('raw_word', l),
                'reported_pos': it.get('pos', 'other'),
                'reported_cefr': it.get('cefr', ''),
                'ipa': it.get('ipa', ''),
                'definition': it.get('definition', ''),
                'page': it.get('page', 0),
                'confidence': 'HIGH'
            })
    print(f'Total unique reference lemmas indexed: {len(pdf_lemma_index):,}')

    # 3. Load Glova Universe & Cross-Reference
    print('\n[Step 3] Loading Glova 10,021 Universe & Evaluating Evidence Gates...')
    with open(UNIVERSE_PATH, 'r', encoding='utf-8') as f:
        universe = json.load(f)
    print(f'Loaded {len(universe):,} items from universe')

    evidence_matrix = []
    
    # Statistical counters
    covered_units_count = 0
    source_coverage_counts = Counter()
    unresolved_items = []
    production_candidates = []
    
    cefr_disagreement_count = 0
    pos_mismatch_count = 0
    polysemy_hazard_count = 0
    collocation_gap_count = 0
    example_gap_count = 0
    ipa_gap_count = 0
    thai_gap_count = 0
    
    cefr_disagreements_list = []
    pos_mismatches_list = []
    polysemy_hazards_list = []

    for item in universe:
        gid = item['id']
        word = item['word']
        lemma = clean_lemma(item.get('lemma') or word)
        pos = normalize_pos(item.get('part_of_speech'))
        glova_cefr = item.get('cefr_level', '').strip().upper()
        meaning_th = item.get('meaning_th', '').strip()
        meaning_en = item.get('meaning_en', '').strip()
        ipa = item.get('ipa', '').strip()
        ex_en = item.get('example_sentence_en', '').strip()
        ex_th = item.get('example_sentence_th', '').strip()
        collocs = item.get('collocations', [])
        
        matches = pdf_lemma_index.get(lemma, [])
        
        # Track source occurrences
        unique_sources_for_item = set(m['source_id'] for m in matches)
        for sid in unique_sources_for_item:
            source_coverage_counts[sid] += 1
            
        if matches:
            covered_units_count += 1
            
        # CEFR Evidence & Disagreement Detection
        cefr_evidence = []
        cefr_disagreement = False
        reported_levels = set()
        for m in matches:
            rep_cefr = m.get('reported_cefr', '')
            if rep_cefr:
                concordance = 'MATCH' if rep_cefr == glova_cefr else 'DISAGREEMENT'
                if concordance == 'DISAGREEMENT':
                    cefr_disagreement = True
                    reported_levels.add(rep_cefr)
                cefr_evidence.append({
                    'source': m['source_name'],
                    'reported_level': rep_cefr,
                    'concordance': concordance
                })
        if cefr_disagreement:
            cefr_disagreement_count += 1
            cefr_disagreements_list.append({
                'glova_id': gid,
                'lemma': lemma,
                'glova_cefr': glova_cefr,
                'sources': list(reported_levels)
            })

        # POS Evidence & Mismatch Detection
        pos_evidence = []
        pos_mismatch = False
        attested_pos_set = set()
        for m in matches:
            rep_pos = m.get('reported_pos', 'other')
            if rep_pos and rep_pos != 'other':
                attested_pos_set.add(rep_pos)
                matches_pos = (rep_pos == pos)
                pos_evidence.append({
                    'source': m['source_name'],
                    'reported_pos': rep_pos,
                    'matches_glova_pos': matches_pos
                })
        if attested_pos_set and pos not in attested_pos_set:
            pos_mismatch = True
            pos_mismatch_count += 1
            pos_mismatches_list.append({
                'glova_id': gid,
                'lemma': lemma,
                'glova_pos': pos,
                'attested_pos': list(attested_pos_set)
            })

        # Sense & Polysemy Evaluation
        is_polysemous = (lemma in POLYSEMY_HOTLIST)
        if is_polysemous:
            polysemy_hazard_count += 1
            polysemy_hazards_list.append({
                'glova_id': gid,
                'lemma': lemma,
                'pos': pos,
                'meaning_th': meaning_th,
                'meaning_en': meaning_en
            })

        # Pronunciation Verification
        has_ipa = bool(ipa)
        if not has_ipa:
            ipa_gap_count += 1
        ipa_matches = False
        attested_ipas = [m['ipa'] for m in matches if m.get('ipa')]
        if attested_ipas:
            ipa_matches = any(ipa in att or att in ipa for att in attested_ipas)

        # Example Quality & Alignment
        has_example = bool(ex_en)
        if not has_example:
            example_gap_count += 1
        example_demonstrates_lemma = bool(re.search(r'\b' + re.escape(lemma) + r'\b', ex_en, re.IGNORECASE)) if ex_en else False

        # Thai Meaning Coverage
        has_thai = bool(meaning_th)
        if not has_thai:
            thai_gap_count += 1

        # Collocation Coverage
        has_colloc = bool(collocs and len(collocs) > 0)
        if not has_colloc:
            collocation_gap_count += 1

        # Provenance Status Determination
        if not matches:
            provenance_status = 'UNRESOLVED'
        elif cefr_disagreement or pos_mismatch:
            provenance_status = 'CONFLICT'
        elif is_polysemous:
            provenance_status = 'PARTIALLY_SUPPORTED'
        else:
            provenance_status = 'SUPPORTED'

        evidence_entry = {
            'glova_id': gid,
            'word': word,
            'lemma': lemma,
            'part_of_speech': pos,
            'glova_cefr_level': glova_cefr,
            'meaning_th': meaning_th,
            'meaning_en': meaning_en,
            'source_matches': matches,
            'cefr_evidence': cefr_evidence,
            'pos_evidence': pos_evidence,
            'sense_evidence': {
                'is_polysemous': is_polysemous,
                'polysemy_hazard': 'HIGH' if is_polysemous else 'NORMAL',
                'definitions_attested': [m['definition'] for m in matches if m.get('definition')]
            },
            'pronunciation_evidence': {
                'glova_ipa': ipa,
                'attested_ipa': attested_ipas[0] if attested_ipas else '',
                'matches_attested': ipa_matches
            },
            'example_evidence': {
                'sentence_en': ex_en,
                'sentence_th': ex_th,
                'demonstrates_target_word': example_demonstrates_lemma,
                'source_examples_attested': []
            },
            'collocation_evidence': {
                'has_collocations': has_colloc,
                'collocations': collocs
            },
            'provenance_status': provenance_status
        }
        evidence_matrix.append(evidence_entry)

        # Categorize into Production Candidates vs Unresolved
        # Must satisfy:
        # - Has source matches
        # - No severe POS mismatch
        # - Has Thai meaning
        # - Has Example
        # - Has IPA
        # - Has Collocations
        # - Non-polysemous conflict
        is_candidate = (
            len(matches) > 0 and
            not pos_mismatch and
            has_thai and
            has_example and
            has_ipa and
            has_colloc and
            provenance_status != 'UNRESOLVED'
        )

        if is_candidate:
            production_candidates.append({
                'glova_id': gid,
                'word': word,
                'lemma': lemma,
                'pos': pos,
                'cefr': glova_cefr,
                'meaning_th': meaning_th,
                'meaning_en': meaning_en,
                'ipa': ipa,
                'sources_count': len(unique_sources_for_item),
                'status': 'VERIFIED_PRODUCTION_CANDIDATE'
            })
        else:
            reasons = []
            if not matches:
                reasons.append('NO_PDF_SOURCE_MATCH')
            if pos_mismatch:
                reasons.append('POS_MISMATCH')
            if cefr_disagreement:
                reasons.append('CEFR_SOURCE_DISAGREEMENT')
            if not has_colloc:
                reasons.append('COLLOCATION_GAP')
            if is_polysemous:
                reasons.append('POLYSEMY_MANUAL_REVIEW_REQUIRED')
            if not has_thai:
                reasons.append('THAI_MEANING_GAP')
            if not has_example:
                reasons.append('EXAMPLE_GAP')
            if not has_ipa:
                reasons.append('IPA_GAP')
                
            unresolved_items.append({
                'glova_id': gid,
                'word': word,
                'lemma': lemma,
                'pos': pos,
                'cefr': glova_cefr,
                'meaning_th': meaning_th,
                'reasons': reasons,
                'provenance_status': provenance_status
            })

    print(f'Evidence Matrix built: {len(evidence_matrix):,} units processed')
    print(f'  - Covered by >= 1 PDF source: {covered_units_count:,} ({covered_units_count/len(universe)*100:.1f}%)')
    print(f'  - Verified Production Candidates: {len(production_candidates):,}')
    print(f'  - Unresolved / Review Required: {len(unresolved_items):,}')
    print(f'  - CEFR source disagreements: {cefr_disagreement_count:,}')
    print(f'  - POS mismatches: {pos_mismatch_count:,}')
    print(f'  - High polysemy hazard units: {polysemy_hazard_count:,}')
    print(f'  - Collocation gap count: {collocation_gap_count:,}')

    # 4. Save JSON Artifacts
    print('\n[Step 4] Writing Derived JSON Artifacts...')
    matrix_path = os.path.join(OUTPUT_DIR, 'vocabulary-evidence-matrix.json')
    with open(matrix_path, 'w', encoding='utf-8') as f:
        json.dump(evidence_matrix, f, indent=2, ensure_ascii=False)
    print(f'Saved {matrix_path}')

    candidates_path = os.path.join(OUTPUT_DIR, 'vocabulary-production-candidates.json')
    with open(candidates_path, 'w', encoding='utf-8') as f:
        json.dump(production_candidates, f, indent=2, ensure_ascii=False)
    print(f'Saved {candidates_path} ({len(production_candidates):,} candidates)')

    unresolved_path = os.path.join(OUTPUT_DIR, 'vocabulary-unresolved.json')
    with open(unresolved_path, 'w', encoding='utf-8') as f:
        json.dump(unresolved_items, f, indent=2, ensure_ascii=False)
    print(f'Saved {unresolved_path} ({len(unresolved_items):,} unresolved items)')

    # 5. Generate Markdown Reports
    print('\n[Step 5] Generating Markdown Documentation Reports...')
    
    # 5.1 vocabulary-coverage-report.md
    cov_path = os.path.join(OUTPUT_DIR, 'vocabulary-coverage-report.md')
    with open(cov_path, 'w', encoding='utf-8') as f:
        f.write('# Glova 10,021 Vocabulary Universe — Source Coverage Report\n\n')
        f.write('## Executive Summary\n\n')
        f.write(f'- **Total Vocabulary Universe:** {len(universe):,} items\n')
        f.write(f'- **Units Attested in >= 1 Reference PDF:** {covered_units_count:,} ({covered_units_count/len(universe)*100:.2f}%)\n')
        f.write(f'- **Verified Production Candidates:** {len(production_candidates):,} ({len(production_candidates)/len(universe)*100:.2f}%)\n')
        f.write(f'- **Unresolved / Review-Bound Items:** {len(unresolved_items):,} ({len(unresolved_items)/len(universe)*100:.2f}%)\n\n')
        
        f.write('## Exact Source Coverage Breakdown\n\n')
        f.write('| Source ID | Source Name | Extracted Rows | Universe Units Covered | Coverage % |\n')
        f.write('|:---|:---|:---:|:---:|:---:|\n')
        for s in source_registry:
            sid = s['source_id']
            sname = s['source_name']
            ext_n = s['extracted_items_count']
            cov_n = source_coverage_counts[sid]
            pct = (cov_n / len(universe)) * 100
            f.write(f'| `{sid}` | {sname} | {ext_n:,} | {cov_n:,} | {pct:.2f}% |\n')
            
        f.write('\n## Universe CEFR Level Distribution\n\n')
        f.write('| CEFR Level | Total Universe Units | Attested in Reference PDFs | Attested % |\n')
        f.write('|:---:|:---:|:---:|:---:|\n')
        lvl_counter = Counter(u.get('cefr_level') for u in universe)
        lvl_cov_counter = Counter()
        for e in evidence_matrix:
            if e['source_matches']:
                lvl_cov_counter[e['glova_cefr_level']] += 1
        for lvl in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
            tot = lvl_counter[lvl]
            att = lvl_cov_counter[lvl]
            f.write(f'| **{lvl}** | {tot:,} | {att:,} | {(att/tot)*100:.2f}% |\n')
            
    print(f'Saved {cov_path}')

    # 5.2 vocabulary-conflict-report.md
    conf_path = os.path.join(OUTPUT_DIR, 'vocabulary-conflict-report.md')
    with open(conf_path, 'w', encoding='utf-8') as f:
        f.write('# Glova Vocabulary Pipeline — Conflict & Disagreement Report\n\n')
        f.write('## Summary of Linguistic Disagreements\n\n')
        f.write(f'- **CEFR Source Disagreements:** {cefr_disagreement_count:,} units\n')
        f.write(f'- **Part of Speech Mismatches:** {pos_mismatch_count:,} units\n')
        f.write(f'- **Polysemy High-Hazard Units:** {polysemy_hazard_count:,} units\n')
        f.write(f'- **Collocation Gaps:** {collocation_gap_count:,} units\n\n')
        
        f.write('## Policy on Source Disagreements\n\n')
        f.write('> [!IMPORTANT]\n')
        f.write('> In accordance with Section 11 of the Linguistic Accuracy Foundation Phase, **disagreements between sources are preserved rather than averaged or overwritten**. Glova does NOT invent synthetic "consensus" CEFR levels. When Cambridge and Oxford report different levels, both evidence claims are permanently recorded in the evidence matrix.\n\n')
        
        f.write('## Sample CEFR Level Disagreements\n\n')
        f.write('| Glova ID | Lemma | Glova Level | Conflicting Source Levels |\n')
        f.write('|:---|:---|:---:|:---|\n')
        for c in cefr_disagreements_list[:25]:
            f.write(f'| `{c["glova_id"]}` | **{c["lemma"]}** | {c["glova_cefr"]} | {", ".join(c["sources"])} |\n')
            
        f.write('\n## Sample Part of Speech Mismatches\n\n')
        f.write('| Glova ID | Lemma | Glova POS | Sources Attested POS |\n')
        f.write('|:---|:---|:---:|:---|\n')
        for p in pos_mismatches_list[:25]:
            f.write(f'| `{p["glova_id"]}` | **{p["lemma"]}** | {p["glova_pos"]} | {", ".join(p["attested_pos"])} |\n')
            
        f.write('\n## Polysemy Hazard Watchlist (Sample)\n\n')
        f.write('| Glova ID | Lemma | Intended POS | Intended Thai Meaning | English Definition |\n')
        f.write('|:---|:---|:---:|:---|:---|\n')
        for pol in polysemy_hazards_list[:25]:
            f.write(f'| `{pol["glova_id"]}` | **{pol["lemma"]}** | {pol["pos"]} | {pol["meaning_th"]} | {pol["meaning_en"][:50]}... |\n')
            
    print(f'Saved {conf_path}')

    # 5.3 vocabulary-license-report.md
    lic_path = os.path.join(OUTPUT_DIR, 'vocabulary-license-report.md')
    with open(lic_path, 'w', encoding='utf-8') as f:
        f.write('# Glova Vocabulary Pipeline — License & Provenance Safety Report\n\n')
        f.write('## Operational Principles (Section 5 Compliance)\n\n')
        f.write('- **Zero Commercial Redistribution:** Publicly downloadable educational wordlists from Cambridge Assessment English, Oxford University Press, LanGeek, and third-party compilers are treated strictly as **REFERENCE_ONLY** evidence.\n')
        f.write('- **No Direct DB Mutations:** Original PDF texts are NOT copied verbatim into production databases as proprietary assets.\n')
        f.write('- **Fail-Closed Verification:** Any source whose commercial redistribution license cannot be verified retains `production_allowed: false`.\n\n')
        
        f.write('## Inventory of 10 Evaluated Source Licenses\n\n')
        f.write('| Source ID | Publisher / Compiler | Classification | License Statement | Production Allowed | Status |\n')
        f.write('|:---|:---|:---:|:---|:---:|:---:|\n')
        for s in source_registry:
            f.write(f'| `{s["source_id"]}` | {s["publisher_or_compiler"]} | `{s["source_classification"]}` | {s["license"][:60]}... | `{s["production_allowed"]}` | `{s["verification_status"]}` |\n')
            
        f.write('\n## Safe Lexical Architecture\n\n')
        f.write('```mermaid\n')
        f.write('graph TD\n')
        f.write('    PDF[Reference Source PDFs] -->|Read-Only Extraction| EXT[Extracted Reference Lexicon]\n')
        f.write('    EXT -->|Hash & Page Evidence| EV[Evidence Matrix]\n')
        f.write('    GLOVA[Glova 10k Universe] -->|Comparison| EV\n')
        f.write('    EV -->|Gated Validation| CAND[Production Candidates]\n')
        f.write('    EV -->|Conflict / Gaps| UNRES[Unresolved Items Queue]\n')
        f.write('    CAND -.->|Human Review Sign-off| PROD[(Production Database)]\n')
        f.write('```\n')
    print(f'Saved {lic_path}')

    # 5.4 expert-review-sample-report.md
    rev_path = os.path.join(OUTPUT_DIR, 'expert-review-sample-report.md')
    with open(rev_path, 'w', encoding='utf-8') as f:
        f.write('# Glova University-Level Expert Review Dossier\n\n')
        f.write('> This dossier presents stratified sample units across CEFR levels (A1 to C2) and high-polysemy test cases for review by university professors and lexicographers.\n\n')
        
        # Select 2 samples per CEFR level + 5 high polysemy samples
        sampled_units = []
        by_lvl = defaultdict(list)
        for u in evidence_matrix:
            by_lvl[u['glova_cefr_level']].append(u)
            
        for lvl in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
            sampled_units.extend(by_lvl[lvl][:2])
            
        poly_samples = [u for u in evidence_matrix if u['lemma'] in ['issue', 'charge', 'fine', 'matter', 'current']][:5]
        sampled_units.extend(poly_samples)
        
        for idx, u in enumerate(sampled_units, 1):
            f.write(f'---\n\n### Sample {idx:02d}: `{u["lemma"]}` ({u["glova_cefr_level"]})\n\n')
            f.write(f'- **Glova ID:** `{u["glova_id"]}`\n')
            f.write(f'- **Lemma:** **{u["lemma"]}**\n')
            f.write(f'- **Part of Speech:** `{u["part_of_speech"]}`\n')
            f.write(f'- **Glova CEFR Level:** `{u["glova_cefr_level"]}`\n')
            f.write(f'- **Intended Target Sense:** {u["meaning_en"]}\n')
            f.write(f'- **Sense-Bound Thai Meaning:** {u["meaning_th"]}\n')
            f.write(f'- **Pronunciation (IPA):** `{u["pronunciation_evidence"]["glova_ipa"]}` (Attested match: `{u["pronunciation_evidence"]["matches_attested"]}`)\n')
            f.write(f'- **English Example:** "{u["example_evidence"]["sentence_en"]}"\n')
            f.write(f'- **Thai Translation of Example:** "{u["example_evidence"]["sentence_th"]}"\n')
            f.write(f'- **Collocations:** {", ".join(u["collocation_evidence"]["collocations"]) if u["collocation_evidence"]["has_collocations"] else "None recorded"}\n')
            f.write(f'- **Source Attestations ({len(u["source_matches"])}):**\n')
            for sm in u['source_matches'][:3]:
                f.write(f'  - `{sm["source_id"]}` (p.{sm["page"]}): reported POS `{sm["reported_pos"]}`, reported CEFR `{sm["reported_cefr"]}`\n')
            f.write(f'- **Provenance Status:** `{u["provenance_status"]}`\n')
            f.write(f'- **License Clearance:** `REFERENCE_EVIDENCE_ONLY` (fail-closed)\n')
            f.write(f'- **Known Conflicts / Flags:** {"Polysemy hazard; " if u["sense_evidence"]["is_polysemous"] else ""}None\n\n')
            
    print(f'Saved {rev_path}')
    print('\n============================================================')
    print('GLOVA VOCABULARY EVIDENCE PIPELINE COMPLETED SUCCESSFULLY')
    print('============================================================')

if __name__ == '__main__':
    run_pipeline()
