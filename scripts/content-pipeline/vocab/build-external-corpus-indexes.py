"""
Phase 6.2.44 — External Corpus Acquisition & Index Builder
Extracts and indexes:
1. Tatoeba English Sentences (from data/external-cache/tatoeba/eng_sentences.tsv.bz2)
2. Kaikki English-Thai Wiktionary (from data/external-cache/kaikki/kaikki.org-dictionary-Thai.jsonl)

Invariants:
- Preserves complete provenance (source ID, version, license, URL, checksum)
- Uses exact deterministic morphology rules (matching morphology-matcher.mjs)
- Preserves all translation candidates (no translations[0] shortcuts)
- Zero AI-generated data
"""

import bz2
import json
import os
import re
import sys
import time

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
INVENTORY_PATH = os.path.join(PROJECT_ROOT, "reports/phase-6.2.36-inventory-accounting.json")

TATOEBA_BZ2_PATH = os.path.join(PROJECT_ROOT, "data/external-cache/tatoeba/eng_sentences.tsv.bz2")
TATOEBA_OUT_INDEX = os.path.join(PROJECT_ROOT, "data/external-cache/tatoeba/tatoeba-universe-index.json")

KAIKKI_JSONL_PATH = os.path.join(PROJECT_ROOT, "data/external-cache/kaikki/kaikki.org-dictionary-Thai.jsonl")
KAIKKI_OUT_INDEX = os.path.join(PROJECT_ROOT, "data/external-cache/kaikki/kaikki-universe-index.json")

VULGARITY_REGEX = re.compile(
    r"\b(f+u+c+k|s+h+i+t|b+i+t+c+h|a+s+s+h+o+l+e|c+u+n+t|d+i+c+k|p+u+s+s+y|n+i+g+g|bastard)\b",
    re.I
)

FALSE_DERIVATIVES = {
    ("art", "article"),
    ("car", "carpet"),
    ("care", "careful"),
    ("act", "action"),
    ("class", "classic"),
    ("day", "daylight"),
    ("pan", "panic"),
    ("war", "warn"),
    ("fat", "father"),
    ("dog", "dogma"),
    ("bus", "business"),
}

IRREGULAR_VERBS = {
    "arise": ["arose", "arisen"], "be": ["was", "were", "been", "is", "are", "am"],
    "become": ["became", "become"], "begin": ["began", "begun"], "bend": ["bent"],
    "bite": ["bit", "bitten"], "bleed": ["bled"], "blow": ["blew", "blown"],
    "break": ["broke", "broken"], "bring": ["brought"], "build": ["built"],
    "burst": ["burst"], "buy": ["bought"], "cast": ["cast"], "catch": ["caught"],
    "choose": ["chose", "chosen"], "cling": ["clung"], "come": ["came", "come"],
    "cost": ["cost"], "creep": ["crept"], "cut": ["cut"], "deal": ["dealt"],
    "dig": ["dug"], "do": ["did", "done", "does"], "draw": ["drew", "drawn"],
    "drink": ["drank", "drunk"], "drive": ["drove", "driven"], "eat": ["ate", "eaten"],
    "fall": ["fell", "fallen"], "feed": ["fed"], "feel": ["felt"], "fight": ["fought"],
    "find": ["found"], "flee": ["fled"], "fly": ["flow", "flown", "flew"],
    "forbid": ["forbade", "forbidden"], "forget": ["forgot", "forgotten"],
    "forgive": ["forgave", "forgiven"], "freeze": ["froze", "frozen"],
    "get": ["got", "gotten"], "give": ["gave", "given"], "go": ["went", "gone", "goes"],
    "grow": ["grew", "grown"], "hang": ["hung"], "have": ["had", "has"],
    "hear": ["heard"], "hide": ["hid", "hidden"], "hit": ["hit"], "hold": ["held"],
    "hurt": ["hurt"], "keep": ["kept"], "know": ["knew", "known"], "lay": ["laid"],
    "lead": ["led"], "leave": ["left"], "lend": ["lent"], "let": ["let"],
    "lie": ["lay", "lain"], "light": ["lit"], "lose": ["lost"], "make": ["made"],
    "mean": ["meant"], "meet": ["met"], "pay": ["paid"], "put": ["put"],
    "quit": ["quit"], "read": ["read"], "ride": ["rode", "ridden"],
    "ring": ["rang", "rung"], "rise": ["rose", "risen"], "run": ["ran", "run"],
    "say": ["said"], "see": ["saw", "seen"], "seek": ["sought"], "sell": ["sold"],
    "send": ["sent"], "set": ["set"], "shake": ["shook", "shaken"], "shine": ["shone"],
    "shoot": ["shot"], "show": ["showed", "shown"], "shut": ["shut"],
    "sing": ["sang", "sung"], "sink": ["sank", "sunk"], "sit": ["sat"],
    "sleep": ["slept"], "slide": ["slid"], "speak": ["spoke", "spoken"],
    "spend": ["spent"], "spin": ["spun"], "spread": ["spread"], "stand": ["stood"],
    "steal": ["stole", "stolen"], "stick": ["stuck"], "strike": ["struck"],
    "swear": ["swore", "sworn"], "sweep": ["swept"], "swim": ["swam", "swum"],
    "swing": ["swung"], "take": ["took", "taken"], "teach": ["taught"],
    "tear": ["tore", "torn"], "tell": ["told"], "think": ["thought"],
    "throw": ["threw", "thrown"], "understand": ["understood"], "wake": ["woke", "woken"],
    "wear": ["wore", "worn"], "win": ["won"], "write": ["wrote", "written"]
}

IRREGULAR_NOUNS = {
    "child": ["children"], "foot": ["feet"], "tooth": ["teeth"], "goose": ["geese"],
    "man": ["men"], "woman": ["women"], "mouse": ["mice"], "person": ["people"],
    "ox": ["oxen"], "crisis": ["crises"], "analysis": ["analyses"],
    "phenomenon": ["phenomena"], "criterion": ["criteria"], "datum": ["data"]
}


def load_universe():
    with open(INVENTORY_PATH, "r", encoding="utf-8") as f:
        inv = json.load(f)
    units = inv.get("units", [])
    lemma_to_units = {}
    for u in units:
        w = u["word"].lower().strip()
        lemma_to_units.setdefault(w, []).append(u)
    return units, lemma_to_units


def build_reverse_token_index(universe_lemmas):
    token_to_lemmas = {}
    for w in universe_lemmas:
        token_to_lemmas.setdefault(w, set()).add(w)
        if w in IRREGULAR_VERBS:
            for f in IRREGULAR_VERBS[w]:
                token_to_lemmas.setdefault(f, set()).add(w)
        if w in IRREGULAR_NOUNS:
            for f in IRREGULAR_NOUNS[w]:
                token_to_lemmas.setdefault(f, set()).add(w)

        # Standard regular inflections
        token_to_lemmas.setdefault(w + "s", set()).add(w)
        token_to_lemmas.setdefault(w + "es", set()).add(w)
        token_to_lemmas.setdefault(w + "ed", set()).add(w)
        token_to_lemmas.setdefault(w + "d", set()).add(w)
        token_to_lemmas.setdefault(w + "ing", set()).add(w)
        if w.endswith("y") and not w.endswith(("ay", "ey", "oy", "uy")):
            token_to_lemmas.setdefault(w[:-1] + "ies", set()).add(w)
            token_to_lemmas.setdefault(w[:-1] + "ied", set()).add(w)
        if w.endswith("e"):
            token_to_lemmas.setdefault(w[:-1] + "ing", set()).add(w)
        token_to_lemmas.setdefault(w + "er", set()).add(w)
        token_to_lemmas.setdefault(w + "est", set()).add(w)

    return token_to_lemmas


def match_lemma_in_tokens(lemma, pos, tokens):
    norm_lemma = lemma.lower().strip()
    norm_pos = pos.lower().strip()

    # 1. Exact Lemma
    if norm_lemma in tokens:
        return "EXACT_LEMMA", norm_lemma

    # 2. Irregular
    if norm_pos == "verb" and norm_lemma in IRREGULAR_VERBS:
        for irr in IRREGULAR_VERBS[norm_lemma]:
            if irr in tokens:
                return "IRREGULAR_FORM", irr

    if norm_pos == "noun" and norm_lemma in IRREGULAR_NOUNS:
        for irr in IRREGULAR_NOUNS[norm_lemma]:
            if irr in tokens:
                return "IRREGULAR_FORM", irr

    # 3. Regular Inflection
    for t in tokens:
        if (norm_lemma, t) in FALSE_DERIVATIVES:
            continue

        if norm_pos == "noun":
            if (t == norm_lemma + "s" or
                (norm_lemma.endswith(("s", "x", "z", "ch", "sh")) and t == norm_lemma + "es") or
                (norm_lemma.endswith("y") and not norm_lemma.endswith(("ay", "ey", "oy", "uy")) and t == norm_lemma[:-1] + "ies")):
                return "INFLECTED_FORM", t

        elif norm_pos == "verb":
            if (t == norm_lemma + "s" or
                (norm_lemma.endswith(("s", "x", "z", "ch", "sh")) and t == norm_lemma + "es") or
                (norm_lemma.endswith("y") and not norm_lemma.endswith(("ay", "ey", "oy", "uy")) and t == norm_lemma[:-1] + "ies") or
                t == norm_lemma + "ed" or
                (norm_lemma.endswith("e") and t == norm_lemma + "d") or
                (norm_lemma.endswith("y") and not norm_lemma.endswith(("ay", "ey", "oy", "uy")) and t == norm_lemma[:-1] + "ied") or
                t == norm_lemma + "ing" or
                (norm_lemma.endswith("e") and not norm_lemma.endswith(("ee", "oe", "ye")) and t == norm_lemma[:-1] + "ing")):
                return "INFLECTED_FORM", t

        elif norm_pos in ("adjective", "adverb"):
            if ((t == norm_lemma + "er" or (norm_lemma.endswith("e") and t == norm_lemma + "r")) or
                (t == norm_lemma + "est" or (norm_lemma.endswith("e") and t == norm_lemma + "st"))):
                return "INFLECTED_FORM", t

    return None, None


def process_tatoeba(units, lemma_to_units):
    print("[Tatoeba] Indexing full English corpus from", TATOEBA_BZ2_PATH)
    t0 = time.time()

    universe_lemmas = set(lemma_to_units.keys())
    token_to_lemmas = build_reverse_token_index(universe_lemmas)
    all_target_tokens = set(token_to_lemmas.keys())

    tatoeba_index = {}
    stats = {
        "total_lines_scanned": 0,
        "quality_rejected_length": 0,
        "quality_rejected_punct": 0,
        "quality_rejected_vulgar": 0,
        "candidates_extracted": 0,
        "unique_lemmas_covered": 0
    }

    with bz2.open(TATOEBA_BZ2_PATH, "rt", encoding="utf-8") as f:
        for line in f:
            stats["total_lines_scanned"] += 1
            parts = line.strip().split("\t")
            if len(parts) < 3:
                continue

            sid, lang, text = parts[0], parts[1], parts[2].strip()

            words = text.split()
            if len(words) < 4 or len(words) > 35:
                stats["quality_rejected_length"] += 1
                continue

            if not re.search(r'[.?!]["\']?$', text):
                stats["quality_rejected_punct"] += 1
                continue

            if VULGARITY_REGEX.search(text):
                stats["quality_rejected_vulgar"] += 1
                continue

            token_list = [w.lower() for w in re.findall(r"[a-zA-Z]+", text)]
            token_set = set(token_list)

            matching_tokens = token_set.intersection(all_target_tokens)
            if not matching_tokens:
                continue

            candidate_lemmas = set()
            for tok in matching_tokens:
                for lem in token_to_lemmas[tok]:
                    candidate_lemmas.add(lem)

            for lemma in candidate_lemmas:
                current_list = tatoeba_index.get(lemma, [])
                if len(current_list) >= 3:
                    continue

                matching_units = lemma_to_units[lemma]
                pos = matching_units[0]["pos"]

                match_type, matched_token = match_lemma_in_tokens(lemma, pos, token_set)
                if match_type:
                    rec = {
                        "source_name": "Tatoeba Collaborative Translation Corpus",
                        "source_version": "2024.09 Export",
                        "source_sentence_id": int(sid),
                        "sentence_text": text,
                        "source_language": "eng",
                        "license": "CC-BY-2.0-FR",
                        "source_url": "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
                        "source_checksum": "f0568ae34496f8a03758ce6821b68da04b1fe67a9300de8d26d50494ae5aceab",
                        "match_type": match_type,
                        "matched_token": matched_token,
                        "word_count": len(words)
                    }
                    tatoeba_index.setdefault(lemma, []).append(rec)
                    stats["candidates_extracted"] += 1

    stats["unique_lemmas_covered"] = len(tatoeba_index)
    duration = time.time() - t0
    stats["duration_seconds"] = round(duration, 2)
    print(f"[Tatoeba] Completed in {duration:.1f}s. Scanned {stats['total_lines_scanned']:,} lines. Covered {stats['unique_lemmas_covered']}/{len(universe_lemmas)} lemmas.")

    os.makedirs(os.path.dirname(TATOEBA_OUT_INDEX), exist_ok=True)
    with open(TATOEBA_OUT_INDEX, "w", encoding="utf-8") as f:
        json.dump(tatoeba_index, f, ensure_ascii=False)
    print(f"[Tatoeba] Saved index to {TATOEBA_OUT_INDEX}")

    return stats, tatoeba_index


def process_kaikki(units, lemma_to_units):
    print("[Kaikki] Indexing Thai Wiktionary from", KAIKKI_JSONL_PATH)
    t0 = time.time()

    universe_lemmas = set(lemma_to_units.keys())
    kaikki_index = {}
    stats = {
        "total_entries_scanned": 0,
        "glosses_evaluated": 0,
        "records_extracted": 0,
        "unique_lemmas_covered": 0
    }

    with open(KAIKKI_JSONL_PATH, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            stats["total_entries_scanned"] += 1
            obj = json.loads(line)
            thai_word = obj.get("word", "").strip()
            raw_pos = obj.get("pos", "")

            pos_norm = "noun" if raw_pos in ("noun", "name", "propn") else (
                "verb" if raw_pos == "verb" else (
                    "adjective" if raw_pos == "adj" else (
                        "adverb" if raw_pos == "adv" else raw_pos
                    )
                )
            )

            for s_idx, s in enumerate(obj.get("senses", [])):
                for g in s.get("glosses", []):
                    stats["glosses_evaluated"] += 1
                    clean_g = g.lower().strip()

                    matched_words = set()
                    if clean_g in universe_lemmas:
                        matched_words.add(clean_g)

                    parts = re.split(r"[,;]\s*", clean_g)
                    for p in parts:
                        clean_p = re.sub(r"\(.*?\)", "", p).strip()
                        clean_p = re.sub(r"^(to|a|an)\s+", "", clean_p).strip()
                        if clean_p in universe_lemmas:
                            matched_words.add(clean_p)

                    for mw in matched_words:
                        rec = {
                            "source_name": "Kaikki Wiktionary English-Thai",
                            "source_version": "2024.09 Dump",
                            "source_entry_id": f"kaikki_th_{idx}_{s_idx}_{thai_word}",
                            "headword": mw,
                            "thai_translation": thai_word,
                            "raw_gloss": g,
                            "part_of_speech": pos_norm,
                            "license": "CC-BY-SA-3.0",
                            "source_url": "https://kaikki.org/dictionary/Thai/kaikki.org-dictionary-Thai.jsonl",
                            "source_checksum": "202acdc93b99bfeb240d48ee48a9f520160a85aa951ecb653eeb3d93b0b6fb57",
                            "synonyms": s.get("synonyms", [])
                        }
                        kaikki_index.setdefault(mw, []).append(rec)
                        stats["records_extracted"] += 1

    stats["unique_lemmas_covered"] = len(kaikki_index)
    duration = time.time() - t0
    stats["duration_seconds"] = round(duration, 2)
    print(f"[Kaikki] Completed in {duration:.1f}s. Scanned {stats['total_entries_scanned']} entries. Covered {stats['unique_lemmas_covered']}/{len(universe_lemmas)} lemmas.")

    os.makedirs(os.path.dirname(KAIKKI_OUT_INDEX), exist_ok=True)
    with open(KAIKKI_OUT_INDEX, "w", encoding="utf-8") as f:
        json.dump(kaikki_index, f, ensure_ascii=False)
    print(f"[Kaikki] Saved index to {KAIKKI_OUT_INDEX}")

    return stats, kaikki_index


def main():
    print("[Phase 6.2.44] Starting External Corpus Acquisition & Index Builder...")
    units, lemma_to_units = load_universe()
    print(f"[Universe] Loaded {len(units)} units ({len(lemma_to_units)} unique lemmas).")

    tatoeba_stats, _ = process_tatoeba(units, lemma_to_units)
    kaikki_stats, _ = process_kaikki(units, lemma_to_units)

    summary = {
        "phase": "6.2.44",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "universe_units": len(units),
        "universe_unique_lemmas": len(lemma_to_units),
        "tatoeba": tatoeba_stats,
        "kaikki": kaikki_stats
    }
    out_summary_path = os.path.join(PROJECT_ROOT, "reports/phase-6.2.44-corpus-acquisition-summary.json")
    with open(out_summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print("[Phase 6.2.44] Summary written to", out_summary_path)


if __name__ == "__main__":
    main()
