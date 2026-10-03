# Phase 6.2.28 — Human QA Execution Manifest & Workbench

> **STATUS: PREPARATION ONLY — NOT FOR FINAL SYSTEM SIGN-OFF**  
> **Human Decisions Executed:** 0 / 50  
> **Database Mutations:** 0 (Strict Read-Only Mode)  
> **Source Packet:** `reports/phase-6.2.27-human-review-packet.json` (Gate: PASS)  
> **Source Controlled Batch:** `reports/phase-6.2.27-controlled-qa-batch.json` (Ready: 50 Records)  
> **Generated At:** 2026-10-03T13:49:35.528Z

---

## 1. Executive Summary & Inventory Table

The following 50 learning units have been locked and derived 1:1 from the canonical dataset. Each record is presented with its verified unadulterated content, provenance markers, and empirical risk indicators.

| Seq | Word | POS | CEFR | Sense | Risk Classification | Operational Priority | Flags |
|---|---|---|---|---|---|---|---|
| 1 | **gape** | `verb` | **C1** | 2 | `C1_OBSCURE` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, AI_DRAFT_MEANING` |
| 2 | **grounds** | `noun` | **C1** | 2 | `C1_OBSCURE` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, IPA_VARIANT, AI_DRAFT_MEANING` |
| 3 | **drill** | `noun` | **C1** | 2 | `C1_OBSCURE` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 4 | **gape** | `verb` | **C1** | 1 | `C1_OBSCURE` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 5 | **grounds** | `noun` | **C1** | 3 | `C1_OBSCURE` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, IPA_VARIANT, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 6 | **recess** | `noun` | **C1** | 1 | `C1_OBSCURE` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, IPA_VARIANT, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 7 | **dribble** | `verb` | **C2** | 1 | `C2_LITERARY` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, AI_DRAFT_MEANING` |
| 8 | **echo** | `verb` | **C2** | 1 | `C2_LITERARY` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 9 | **perch** | `noun` | **C2** | 1 | `C2_LITERARY` | TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED | `POLYSEMY, CEFR_CONFLICT, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 10 | **about** | `adverb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 11 | **above** | `adverb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 12 | **action** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 13 | **add** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 14 | **afternoon** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 15 | **age** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 16 | **agree** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 17 | **alone** | `adverb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 18 | **along** | `adverb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 19 | **answer** | `noun` | **A1** | 1 | `HOMONYM_AMBIGUITY` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 20 | **answer** | `verb` | **A1** | 1 | `HOMONYM_AMBIGUITY` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 21 | **arrive** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 22 | **art** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 23 | **ask** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 24 | **away** | `adverb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 25 | **baby** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 26 | **back** | `adverb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 27 | **bad** | `adjective` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 28 | **bank** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 29 | **bear** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 30 | **beautiful** | `adjective` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 31 | **become** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 32 | **bed** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 33 | **begin** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 34 | **behind** | `adverb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 35 | **believe** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 36 | **big** | `adjective` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 37 | **black** | `adjective` | **A1** | 1 | `HOMONYM_AMBIGUITY` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 38 | **black** | `noun` | **A1** | 1 | `HOMONYM_AMBIGUITY` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 39 | **blue** | `adjective` | **A1** | 1 | `HOMONYM_AMBIGUITY` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 40 | **blue** | `noun` | **A1** | 1 | `HOMONYM_AMBIGUITY` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 41 | **board** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 42 | **body** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 43 | **box** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 44 | **boy** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 45 | **break** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 46 | **bring** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 47 | **brother** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 48 | **build** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 49 | **bus** | `noun` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |
| 50 | **buy** | `verb` | **A1** | 1 | `POLYSEMOUS_CORE` | TIER_2_HIGH_VALUE_CORE_POLYSEMOUS | `POLYSEMY, SYNTHETIC_EXAMPLE, AI_DRAFT_MEANING` |

---

## 2. Review Guidance Categories & Methodological Invariants

| Category | Primary Focus & Verification Objectives |
|---|---|
| **POLYSEMOUS_CORE** | Verify `meaning_en` matches the designated `sense_index`; ensure Thai translation captures this exact sub-sense rather than broad generic gloss; verify example sentence embodies this exact sense. |
| **C1_OBSCURE** | Verify nuanced definitions matching C1 CEFR descriptor; ensure Thai register is formal and unsimplified; confirm example sentence structural complexity. |
| **C2_LITERARY** | Verify mastery/literary nuances; confirm Thai translation precision; ensure example sentence exhibits native-level sophistication. |
| **HOMONYM_AMBIGUITY** | Verify strict part-of-speech boundary (e.g. noun vs adjective); ensure definitions and example sentences do not bleed into alternate homographs. |
| **MONOSEMOUS_FOUNDATIONAL** | Verify Thai accuracy against canonical English meaning; verify standard IPA transcription; confirm naturalness of example sentence. |

---

## 3. Individual Review Workbench Cards (50 Records)

Each card below provides full empirical context and an empty decision template for the Human Reviewer in Phase 6.2.29.

### [#1] gape (verb) — C1 | Sense 2

- **Learning Unit Key:** `gape|verb|C1|sense:2`
- **Batch Origin:** `LARGE-010` (Index: 83)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C1_OBSCURE` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** be wide open
- **Thai Meaning:** ดำเนินการ หรือกระทำการตามลักษณะเฉพาะ
- **IPA Pronunciation:** `/ɡeɪp/`
- **Example Sentence:** *"the deep gaping canyon"*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `VERIFIED_SOURCE_EXAMPLE`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en is sufficiently nuanced for C1 advanced competence
- [ ] Verify Thai translation accurately captures advanced register without distortion
- [ ] Verify example sentence demonstrates appropriate syntactic and semantic complexity
- [ ] Verify licensed IPA notation accuracy for advanced phonetic patterns

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#2] grounds (noun) — C1 | Sense 2

- **Learning Unit Key:** `grounds|noun|C1|sense:2`
- **Batch Origin:** `LARGE-011` (Index: 39)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C1_OBSCURE` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `IPA_VARIANT` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** dregs consisting of solid particles (especially of coffee) that form a residue
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/ɡɹaʊndz/`
- **Example Sentence:** *"it is a Middle Eastern custom to read your future in your coffee grounds"*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA_WITH_VARIANTS`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `VERIFIED_SOURCE_EXAMPLE`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en is sufficiently nuanced for C1 advanced competence
- [ ] Verify Thai translation accurately captures advanced register without distortion
- [ ] Verify example sentence demonstrates appropriate syntactic and semantic complexity
- [ ] Verify licensed IPA notation accuracy for advanced phonetic patterns

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#3] drill (noun) — C1 | Sense 2

- **Learning Unit Key:** `drill|noun|C1|sense:2`
- **Batch Origin:** `LARGE-006` (Index: 115)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C1_OBSCURE` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** systematic training by multiple repetitions
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/dɹɪl/`
- **Example Sentence:** *"Understanding the role of drill helps students discuss systematic training multiple repetitions clearly in everyday situations."*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_REQUIRES_HUMAN_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en is sufficiently nuanced for C1 advanced competence
- [ ] Verify Thai translation accurately captures advanced register without distortion
- [ ] Verify example sentence demonstrates appropriate syntactic and semantic complexity
- [ ] Verify licensed IPA notation accuracy for advanced phonetic patterns

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#4] gape (verb) — C1 | Sense 1

- **Learning Unit Key:** `gape|verb|C1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 82)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C1_OBSCURE` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** look with amazement; look stupidly
- **Thai Meaning:** รับรู้ผ่านประสาทสัมผัสการมองเห็นหรือได้ยินโดยการการมองเห็น แสงสี และการรับรู้ทางเสียง ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/ɡeɪp/`
- **Example Sentence:** *"the deep gaping canyon"*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en is sufficiently nuanced for C1 advanced competence
- [ ] Verify Thai translation accurately captures advanced register without distortion
- [ ] Verify example sentence demonstrates appropriate syntactic and semantic complexity
- [ ] Verify licensed IPA notation accuracy for advanced phonetic patterns

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#5] grounds (noun) — C1 | Sense 3

- **Learning Unit Key:** `grounds|noun|C1|sense:3`
- **Batch Origin:** `LARGE-015` (Index: 98)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C1_OBSCURE` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `IPA_VARIANT` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** a justification for something existing or happening
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/ɡɹaʊndz/`
- **Example Sentence:** *"it is a Middle Eastern custom to read your future in your coffee grounds (C1 noun sense 3)."*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA_WITH_VARIANTS`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en is sufficiently nuanced for C1 advanced competence
- [ ] Verify Thai translation accurately captures advanced register without distortion
- [ ] Verify example sentence demonstrates appropriate syntactic and semantic complexity
- [ ] Verify licensed IPA notation accuracy for advanced phonetic patterns

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#6] recess (noun) — C1 | Sense 1

- **Learning Unit Key:** `recess|noun|C1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 99)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C1_OBSCURE` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `IPA_VARIANT` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** an enclosure that is set back or indented
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/ɹɪˈses/`
- **Example Sentence:** *"Understanding the role of recess helps students discuss enclosure set back indented clearly in everyday situations."*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA_WITH_VARIANTS`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_REQUIRES_HUMAN_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en is sufficiently nuanced for C1 advanced competence
- [ ] Verify Thai translation accurately captures advanced register without distortion
- [ ] Verify example sentence demonstrates appropriate syntactic and semantic complexity
- [ ] Verify licensed IPA notation accuracy for advanced phonetic patterns

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#7] dribble (verb) — C2 | Sense 1

- **Learning Unit Key:** `dribble|verb|C2|sense:1`
- **Batch Origin:** `LARGE-010` (Index: 148)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C2_LITERARY` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** run or flow slowly, as in drops or in an unsteady stream
- **Thai Meaning:** เคลื่อนที่ เดินทาง หรือย้ายตำแหน่งโดยการการเคลื่อนไหว การออกแรง และการย้ายตำแหน่ง ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/dˈɹɪbəl/`
- **Example Sentence:** *"reports began to dribble in"*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `VERIFIED_SOURCE_EXAMPLE`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en captures the exact literary/figurative nuance expected at C2 level
- [ ] Verify Thai translation accurately captures literary register without oversimplification
- [ ] Verify example sentence demonstrates authentic native C2 syntactic complexity
- [ ] Verify licensed IPA notation accuracy for C2 phonetic distinctions

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#8] echo (verb) — C2 | Sense 1

- **Learning Unit Key:** `echo|verb|C2|sense:1`
- **Batch Origin:** `LARGE-007` (Index: 41)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C2_LITERARY` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** ring or echo with sound
- **Thai Meaning:** สื่อสาร แจ้งข้อมูล หรือแสดงความคิดเห็นโดยการการมองเห็น แสงสี และการรับรู้ทางเสียง ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/ˈekoʊ/`
- **Example Sentence:** *"followers echoing the cries of their leaders"*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en captures the exact literary/figurative nuance expected at C2 level
- [ ] Verify Thai translation accurately captures literary register without oversimplification
- [ ] Verify example sentence demonstrates authentic native C2 syntactic complexity
- [ ] Verify licensed IPA notation accuracy for C2 phonetic distinctions

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#9] perch (noun) — C2 | Sense 1

- **Learning Unit Key:** `perch|noun|C2|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 97)
- **Operational Priority:** `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`
- **Risk Category:** `C2_LITERARY` (HIGH)
- **Review Flags:** `POLYSEMY` `CEFR_CONFLICT` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** an elevated place serving as a seat
- **Thai Meaning:** สถานที่ พื้นที่ หรืออาคารสำหรับการใช้งานเฉพาะ (เกี่ยวกับอาหารหรือของกิน)
- **IPA Pronunciation:** `/pɜːɹtʃ/`
- **Example Sentence:** *"Understanding the role of perch helps students discuss elevated place serving seat clearly in everyday situations."*

#### Provenance Verification
- **CEFR Profile Source:** Octanove Vocabulary Profile C1/C2
- **Sense Disambiguation Status:** `MATCH_CONFIDENT`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_REQUIRES_HUMAN_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en captures the exact literary/figurative nuance expected at C2 level
- [ ] Verify Thai translation accurately captures literary register without oversimplification
- [ ] Verify example sentence demonstrates authentic native C2 syntactic complexity
- [ ] Verify licensed IPA notation accuracy for C2 phonetic distinctions

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#10] about (adverb) — A1 | Sense 1

- **Learning Unit Key:** `about|adverb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 100)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** (of quantities) imprecise but fairly close to correct
- **Thai Meaning:** กริยาวิเศษณ์บอกจำนวนหรือเวลาโดยประมาณ (ประมาณ, ราวๆ)
- **IPA Pronunciation:** `/əˈbaʊt/`
- **Example Sentence:** *"in just about a minute"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#11] above (adverb) — A1 | Sense 1

- **Learning Unit Key:** `above|adverb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 101)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** (in writing) at an earlier place
- **Thai Meaning:** อย่างมีลักษณะ หรือในทิศทางที่สอดคล้องกัน
- **IPA Pronunciation:** `/əˈbʌv/`
- **Example Sentence:** *"She spoke above while explaining how the group handled earlier place yesterday."*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_REQUIRES_HUMAN_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#12] action (noun) — A1 | Sense 1

- **Learning Unit Key:** `action|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 102)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** something done (usually as opposed to something said)
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/ˈækʃən/`
- **Example Sentence:** *"there were stories of murders and other unnatural actions"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#13] add (verb) — A1 | Sense 1

- **Learning Unit Key:** `add|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 103)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** make an addition (to); join or combine or unite with others; increase the quality, quantity, size or scope of
- **Thai Meaning:** ทำให้เกิดการเปลี่ยนแปลงหรือปรับสภาพโดยการการเพิ่มขึ้น ขนาดที่ใหญ่ หรือปริมาณมาก และการสร้าง การผลิต และการพัฒนา ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/æd/`
- **Example Sentence:** *"We added two students to that dorm room"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#14] afternoon (noun) — A1 | Sense 1

- **Learning Unit Key:** `afternoon|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 104)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** the part of the day between noon and evening
- **Thai Meaning:** ช่วงเวลา ระยะเวลา หรือจังหวะเวลา
- **IPA Pronunciation:** `/ˌæftəɹˈnuːn/`
- **Example Sentence:** *"he spent a quiet afternoon in the park"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#15] age (noun) — A1 | Sense 1

- **Learning Unit Key:** `age|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 105)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** how long something has existed
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/eɪdʒ/`
- **Example Sentence:** *"it was replaced because of its age"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#16] agree (verb) — A1 | Sense 1

- **Learning Unit Key:** `agree|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 106)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** be in accord; be in agreement
- **Thai Meaning:** เห็นด้วย, ตกลง
- **IPA Pronunciation:** `/əɡˈɹiː/`
- **Example Sentence:** *"We agreed on the terms of the settlement"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#17] alone (adverb) — A1 | Sense 1

- **Learning Unit Key:** `alone|adverb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 107)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** without any others being included or involved
- **Thai Meaning:** อย่างปราศจาก หรือไม่ปรากฏอาการดังกล่าว
- **IPA Pronunciation:** `/əˈloʊn/`
- **Example Sentence:** *"the child stayed home alone"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#18] along (adverb) — A1 | Sense 1

- **Learning Unit Key:** `along|adverb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 108)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** with a forward motion
- **Thai Meaning:** อย่างมีลักษณะ หรือในทิศทางที่สอดคล้องกัน
- **IPA Pronunciation:** `/əˈlɔːŋ/`
- **Example Sentence:** *"we drove along admiring the view"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#19] answer (noun) — A1 | Sense 1

- **Learning Unit Key:** `answer|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 109)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `HOMONYM_AMBIGUITY` (MEDIUM)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** a statement (either spoken or written) that is made to reply to a question or request or criticism or accusation
- **Thai Meaning:** สภาวะ สภาพ หรือเงื่อนไขที่เป็นอยู่
- **IPA Pronunciation:** `/ˈænsəɹ/`
- **Example Sentence:** *"I waited several days for his answer"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify part of speech strictly matches 'noun' (distinct from noun vs verb)
- [ ] Verify meaning_en and Thai meaning correspond strictly to this syntactic category
- [ ] Verify example sentence uses the word strictly in this grammatical function

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#20] answer (verb) — A1 | Sense 1

- **Learning Unit Key:** `answer|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 110)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `HOMONYM_AMBIGUITY` (MEDIUM)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** react verbally
- **Thai Meaning:** สื่อสาร แจ้งข้อมูล หรือแสดงความคิดเห็นโดยการการปฏิบัติ กระบวนการ หรือวิธีการดำเนินงาน ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/ˈænsəɹ/`
- **Example Sentence:** *"She didn't want to answer"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify part of speech strictly matches 'verb' (distinct from noun vs verb)
- [ ] Verify meaning_en and Thai meaning correspond strictly to this syntactic category
- [ ] Verify example sentence uses the word strictly in this grammatical function

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#21] arrive (verb) — A1 | Sense 1

- **Learning Unit Key:** `arrive|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 111)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** reach a destination; arrive by movement or progress
- **Thai Meaning:** มาถึง, ถึงที่หมาย
- **IPA Pronunciation:** `/əɹˈaɪv/`
- **Example Sentence:** *"She arrived home at 7 o'clock"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#22] art (noun) — A1 | Sense 1

- **Learning Unit Key:** `art|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 112)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** the products of human creativity; works of art collectively
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง (เกี่ยวกับอาหารหรือของกิน)
- **IPA Pronunciation:** `/ɑːɹt/`
- **Example Sentence:** *"a collection of fine art"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#23] ask (verb) — A1 | Sense 1

- **Learning Unit Key:** `ask|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 113)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** make a request or demand for something to somebody
- **Thai Meaning:** สื่อสาร แจ้งข้อมูล หรือแสดงความคิดเห็นโดยการการสร้าง การผลิต และการพัฒนา ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/æsk/`
- **Example Sentence:** *"She asked him for a loan"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#24] away (adverb) — A1 | Sense 1

- **Learning Unit Key:** `away|adverb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 114)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** from a particular thing or place or position (‘forth’ is obsolete)
- **Thai Meaning:** อย่างมีลักษณะ หรือในทิศทางที่สอดคล้องกัน
- **IPA Pronunciation:** `/əˈweɪ/`
- **Example Sentence:** *"ran away from the lion"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#25] baby (noun) — A1 | Sense 1

- **Learning Unit Key:** `baby|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 115)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** a very young child (birth to 1 year) who has not yet begun to walk or talk
- **Thai Meaning:** เด็กทารก, ลูกอ่อน
- **IPA Pronunciation:** `/ˈbeɪbi/`
- **Example Sentence:** *"the baby began to cry again"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#26] back (adverb) — A1 | Sense 1

- **Learning Unit Key:** `back|adverb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 116)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** in or to or toward a former location
- **Thai Meaning:** อย่างมีลักษณะ หรือในทิศทางที่สอดคล้องกัน
- **IPA Pronunciation:** `/bæk/`
- **Example Sentence:** *"she went back to her parents' house"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#27] bad (adjective) — A1 | Sense 1

- **Learning Unit Key:** `bad|adjective|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 117)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** having undesirable or negative qualities
- **Thai Meaning:** เลว, ไม่ดี, แย่
- **IPA Pronunciation:** `/bæd/`
- **Example Sentence:** *"a bad report card"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#28] bank (noun) — A1 | Sense 1

- **Learning Unit Key:** `bank|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 118)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** sloping land (especially the slope beside a body of water)
- **Thai Meaning:** ตลิ่ง, พื้นดินลาดชันริมฝั่งแม่น้ำหรือลำคลอง
- **IPA Pronunciation:** `/bæŋk/`
- **Example Sentence:** *"they pulled the canoe up on the bank"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#29] bear (noun) — A1 | Sense 1

- **Learning Unit Key:** `bear|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 119)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** massive plantigrade carnivorous or omnivorous mammals with long shaggy coats and strong claws
- **Thai Meaning:** พืชพรรณ ต้นไม้ หรือดอกไม้ตามธรรมชาติ
- **IPA Pronunciation:** `/beɹ/`
- **Example Sentence:** *"Understanding the role of bear helps students discuss massive plantigrade carnivorous omnivorous clearly in everyday situations."*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_REQUIRES_HUMAN_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#30] beautiful (adjective) — A1 | Sense 1

- **Learning Unit Key:** `beautiful|adjective|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 120)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** delighting the senses or exciting intellectual or emotional admiration
- **Thai Meaning:** สวยงาม, งดงาม
- **IPA Pronunciation:** `/bˈjuːtəfəl/`
- **Example Sentence:** *"what a beautiful day"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#31] become (verb) — A1 | Sense 1

- **Learning Unit Key:** `become|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 121)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** enter or assume a certain state or condition
- **Thai Meaning:** ทำให้เกิดการเปลี่ยนแปลงหรือปรับสภาพโดยการการปกครอง นโยบายสาธารณะ และบ้านเมือง ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/bɪˈkʌm/`
- **Example Sentence:** *"What becomes has duration"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#32] bed (noun) — A1 | Sense 1

- **Learning Unit Key:** `bed|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 122)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** a piece of furniture that provides a place to sleep
- **Thai Meaning:** สถานที่ พื้นที่ หรืออาคารสำหรับการใช้งานเฉพาะ
- **IPA Pronunciation:** `/bed/`
- **Example Sentence:** *"he sat on the edge of the bed"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#33] begin (verb) — A1 | Sense 1

- **Learning Unit Key:** `begin|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 123)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** take the first step or steps in carrying out an action
- **Thai Meaning:** ทำให้เกิดการเปลี่ยนแปลงหรือปรับสภาพโดยการการปฏิบัติ กระบวนการ หรือวิธีการดำเนินงาน ในระยะเริ่มต้นหรือเกิดก่อนลำดับอื่น
- **IPA Pronunciation:** `/bɪˈɡɪn/`
- **Example Sentence:** *"The DMZ begins right over the hill"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#34] behind (adverb) — A1 | Sense 1

- **Learning Unit Key:** `behind|adverb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 124)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** in or to or toward the rear
- **Thai Meaning:** อย่างมีลักษณะ หรือในทิศทางที่สอดคล้องกัน
- **IPA Pronunciation:** `/bɪˈhaɪnd/`
- **Example Sentence:** *"seen from behind, the house is more imposing than it is from the front"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#35] believe (verb) — A1 | Sense 1

- **Learning Unit Key:** `believe|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 125)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** accept as true; take to be true
- **Thai Meaning:** ใช้ความคิด วิเคราะห์ หรือตัดสินใจโดยการความถูกต้อง คุณภาพที่ดี และผลประโยชน์ ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/bɪˈliːv/`
- **Example Sentence:** *"I believed his report"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#36] big (adjective) — A1 | Sense 1

- **Learning Unit Key:** `big|adjective|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 126)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** above average in size or number or quantity or magnitude or extent
- **Thai Meaning:** ใหญ่, โต
- **IPA Pronunciation:** `/bɪɡ/`
- **Example Sentence:** *"set out for the big city"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#37] black (adjective) — A1 | Sense 1

- **Learning Unit Key:** `black|adjective|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 127)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `HOMONYM_AMBIGUITY` (MEDIUM)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** being of the achromatic color of maximum darkness; having little or no hue owing to absorption of almost all incident light
- **Thai Meaning:** ซึ่งมีคุณลักษณะเด่นหรือคุณสมบัตินี้
- **IPA Pronunciation:** `/blæk/`
- **Example Sentence:** *"as black as coal"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify part of speech strictly matches 'adjective' (distinct from adjective vs noun)
- [ ] Verify meaning_en and Thai meaning correspond strictly to this syntactic category
- [ ] Verify example sentence uses the word strictly in this grammatical function

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#38] black (noun) — A1 | Sense 1

- **Learning Unit Key:** `black|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 128)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `HOMONYM_AMBIGUITY` (MEDIUM)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** British chemist who identified carbon dioxide and who formulated the concepts of specific heat and latent heat (1728-1799)
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง (เกี่ยวกับอาหารหรือของกิน)
- **IPA Pronunciation:** `/blæk/`
- **Example Sentence:** *"in the black of night"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify part of speech strictly matches 'noun' (distinct from adjective vs noun)
- [ ] Verify meaning_en and Thai meaning correspond strictly to this syntactic category
- [ ] Verify example sentence uses the word strictly in this grammatical function

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#39] blue (adjective) — A1 | Sense 1

- **Learning Unit Key:** `blue|adjective|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 129)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `HOMONYM_AMBIGUITY` (MEDIUM)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** of the color intermediate between green and violet; having a color similar to that of a clear unclouded sky
- **Thai Meaning:** ซึ่งมีคุณลักษณะเด่นหรือคุณสมบัตินี้
- **IPA Pronunciation:** `/bluː/`
- **Example Sentence:** *"October's bright blue weather"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify part of speech strictly matches 'adjective' (distinct from adjective vs noun)
- [ ] Verify meaning_en and Thai meaning correspond strictly to this syntactic category
- [ ] Verify example sentence uses the word strictly in this grammatical function

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#40] blue (noun) — A1 | Sense 1

- **Learning Unit Key:** `blue|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 130)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `HOMONYM_AMBIGUITY` (MEDIUM)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** blue color or pigment; resembling the color of the clear sky in the daytime
- **Thai Meaning:** ช่วงเวลา ระยะเวลา หรือจังหวะเวลา
- **IPA Pronunciation:** `/bluː/`
- **Example Sentence:** *"he had eyes of bright blue"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify part of speech strictly matches 'noun' (distinct from adjective vs noun)
- [ ] Verify meaning_en and Thai meaning correspond strictly to this syntactic category
- [ ] Verify example sentence uses the word strictly in this grammatical function

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#41] board (noun) — A1 | Sense 1

- **Learning Unit Key:** `board|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 131)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** a committee having supervisory powers
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/bɔːɹd/`
- **Example Sentence:** *"the board has seven members"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#42] body (noun) — A1 | Sense 1

- **Learning Unit Key:** `body|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 132)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** the entire physical structure of an organism (an animal, plant, or human being)
- **Thai Meaning:** พืชพรรณ ต้นไม้ หรือดอกไม้ตามธรรมชาติ (ทางการแพทย์และสุขภาพ)
- **IPA Pronunciation:** `/ˈbɑːdi/`
- **Example Sentence:** *"he felt as if his whole body were on fire"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#43] box (noun) — A1 | Sense 1

- **Learning Unit Key:** `box|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 133)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** a (usually rectangular) container; may have a lid
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/bɑːks/`
- **Example Sentence:** *"he rummaged through a box of spare parts"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#44] boy (noun) — A1 | Sense 1

- **Learning Unit Key:** `boy|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 134)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** a youthful male person
- **Thai Meaning:** เด็กชาย, ชายหนุ่ม
- **IPA Pronunciation:** `/bɔɪ/`
- **Example Sentence:** *"the baby was a boy"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#45] break (verb) — A1 | Sense 1

- **Learning Unit Key:** `break|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 135)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** terminate or end
- **Thai Meaning:** ดำเนินการ หรือกระทำการตามลักษณะเฉพาะ
- **IPA Pronunciation:** `/bɹeɪk/`
- **Example Sentence:** *"break a lucky streak"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#46] bring (verb) — A1 | Sense 1

- **Learning Unit Key:** `bring|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 136)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** take something or somebody with oneself somewhere
- **Thai Meaning:** นำมา, พามา
- **IPA Pronunciation:** `/bɹɪŋ/`
- **Example Sentence:** *"Bring me the box from the other room"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#47] brother (noun) — A1 | Sense 1

- **Learning Unit Key:** `brother|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 137)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** (Roman Catholic Church) a title given to a monk and used as form of address
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง
- **IPA Pronunciation:** `/bˈɹʌðəɹ/`
- **Example Sentence:** *"my brother still lives with our parents"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#48] build (verb) — A1 | Sense 1

- **Learning Unit Key:** `build|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 138)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** make by combining materials and parts
- **Thai Meaning:** สร้างสรรค์ ผลิต หรือก่อให้เกิดสิ่งใหม่โดยการการสร้าง การผลิต และการพัฒนา ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/bɪld/`
- **Example Sentence:** *"Pressure is building up at the Indian-Pakistani border"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#49] bus (noun) — A1 | Sense 1

- **Learning Unit Key:** `bus|noun|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 139)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** a vehicle carrying many passengers; used for public transport
- **Thai Meaning:** สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง (การเดินทางและคมนาคม)
- **IPA Pronunciation:** `/bʌs/`
- **Example Sentence:** *"he always rode the bus to work"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `REMEDIATED_CANDIDATE_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---
### [#50] buy (verb) — A1 | Sense 1

- **Learning Unit Key:** `buy|verb|A1|sense:1`
- **Batch Origin:** `LARGE-015` (Index: 140)
- **Operational Priority:** `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`
- **Risk Category:** `POLYSEMOUS_CORE` (HIGH)
- **Review Flags:** `POLYSEMY` `SYNTHETIC_EXAMPLE` `AI_DRAFT_MEANING`

#### Current Canonical Content
- **English Meaning:** obtain by purchase; acquire by means of a financial transaction
- **Thai Meaning:** ครอบครอง ส่งมอบ หรือแลกเปลี่ยนทรัพย์สินโดยการการปฏิบัติ กระบวนการ หรือวิธีการดำเนินงาน ตามบริบทของความหมายที่เลือกไว้
- **IPA Pronunciation:** `/baɪ/`
- **Example Sentence:** *"This sum will buy you a ride on the train"*

#### Provenance Verification
- **CEFR Profile Source:** CEFR-J Vocabulary Profile
- **Sense Disambiguation Status:** `MATCH_AMBIGUOUS`
- **IPA Transcription Status:** `VERIFIED_LICENSED_IPA`
- **Thai Meaning Status:** `DERIVED_TRANSLATION_REVIEW_REQUIRED`
- **Example Sentence Status:** `AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW`

#### Reviewer Guidance Checklist
- [ ] Verify meaning_en matches the specific sense_index indicated in the key
- [ ] Verify meaning_th matches that specific sub-sense, not a broad or generic definition
- [ ] Verify example sentence uses the word strictly in this target sense

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
```text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
```

---

## 4. Governance & Purity Attestation

- **Pre-filled Decisions:** Strictly 0 (All records initialized with `human_decision: null`)
- **Reviewer Identifiers:** Strictly 0 (All records initialized with `reviewer_id: null`)
- **Database Safety:** Zero SQL writes executed, zero Supabase client mutation calls.
- **Next Phase Authorization:** Phase 6.2.29 may proceed only when the Human Reviewer explicitly inputs decision values.
