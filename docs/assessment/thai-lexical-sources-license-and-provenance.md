# Thai Lexical Sources License, Provenance & Legal Risk Audit

**Document Phase:** Phase 6.2.20 — Grounded Lexicon Expansion & Coverage Validation  
**Date:** 2026-09-27  
**Scope:** Comprehensive legal, commercial, and redistribution audit of candidate bilingual lexical sources for the Glova CEFR Platform.

---

## 1. Upstream Source Audit & Status Register

| Lexical Resource | Primary Upstream Creator | Authoritative License | Commercial Use Status | Redistribution Terms | Decision / Gate Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Glova Curated Headword Registry (GLOVA_CURATED_REGISTRY)** | Glova Linguistic & Curriculum Team | **Glova-Internal-Proprietary** | **PERMITTED (100% Owned)** | Unrestricted within Glova Platform | **APPROVED (PRIMARY SAFE SOURCE)** |
| **Open English WordNet (OEWN)** | Open English WordNet Community | **CC-BY-4.0** | **PERMITTED** | Attribution required; unrestricted commercial use | **APPROVED (Bilingual Synset Anchor)** |
| **Open Multilingual Wordnet (OMW Thai)** | Asian WordNet / NECTEC / CU / Francis Bond | **Mixed / CC-BY-NC-ND / BSD** | **RESTRICTED / UNCERTAIN** | Upstream distributions often carry NonCommercial (NC) or NoDerivatives (ND) clauses | **BLOCKED FOR MASS INGESTION** (Synset cross-reference only) |
| **NECTEC LEXiTRON** | NECTEC / NSTDA (Thailand) | **Free for Public / Non-Commercial Research** | **BLOCKED (Requires Direct Agreement)** | Redistribution for commercial purposes requires formal bilateral agreement with NECTEC | **BLOCKED** |
| **Cambridge English-Thai Dictionary** | Cambridge University Press | **Proprietary Copyright** | **PROHIBITED** | Unauthorized scraping or copying constitutes copyright infringement | **STRICTLY BLOCKED** |
| **Oxford / Longman Dictionaries** | Oxford University Press / Pearson | **Proprietary Copyright** | **PROHIBITED** | Proprietary commercial intellectual property | **STRICTLY BLOCKED** |

---

## 2. Detailed Legal Analysis by Source

### 2.1 Glova Curated Headword Registry (Approved)
- **Provenance:** Hand-crafted by Glova curriculum engineers specifically for CEFR vocabulary learning units (Phases 6.2.16–6.2.18).
- **License:** \`Glova-Internal-Proprietary\` v2.0.
- **Redistribution Rights:** Glova retains full copyright and commercial rights. Zero dependency on external third-party proprietary datasets.
- **Derivative Works:** Normalized, sense-tagged entries can be committed, bundled, and stored directly in the repository without third-party encumbrance.

### 2.2 Open Multilingual Wordnet (Thai Component) (Blocked for Mass Ingestion)
- **Primary Source:** Asian WordNet (AWN) initiated by NICT and developed in Thailand with NECTEC and Chulalongkorn University.
- **Licensing Ambiguity:** While the OMW framework aggregates open wordnets, individual language wordnets retain independent licensing. Upstream distributions of Thai WordNet in academic tools (e.g. PyThaiNLP, NLTK) frequently document terms under **Creative Commons Attribution-NonCommercial-NoDerivatives (CC BY-NC-ND)**.
- **Risk Assessment:** High risk of license violation if used in a commercial educational platform.
- **Decision:** **BLOCKED** from direct Thai gloss ingestion into the production registry. OMW synset IDs may be referenced only for cross-lingual alignment and conflict detection.

### 2.3 NECTEC LEXiTRON (Blocked)
- **Primary Source:** National Electronics and Computer Technology Center (NECTEC), Thailand.
- **License Terms:** Free for public and personal educational search. However, NECTEC's official intellectual property guidelines specify that commercial exploitation, redistribution, or integration into proprietary software products requires a formal technology transfer or licensing agreement with NECTEC's Business Development Division.
- **Decision:** **BLOCKED**. Glova will not scrape or batch-import LEXiTRON without an explicit institutional license agreement.

### 2.4 Proprietary Lexicons (Cambridge, Oxford, Longman) (Strictly Blocked)
- **Policy Invariant:** In accordance with DevSecOps guidelines and fair use standards, Glova strictly forbids importing, scraping, or reproducing definitions or translations from proprietary commercial dictionaries.

---

## 3. Expansion Strategy & Approved Architecture

To ensure 100% clean IP provenance:
1. **Curated Expansion:** Convert the existing 240 high-yield headwords from the \`GLOVA_CURATED_HEADWORD_REGISTRY\` into full \`LexicalCandidate\` representations with complete provenance.
2. **Deterministic Adapter Isolation:** All imported candidates are isolated in dedicated adapter modules with immutable \`source_record_id\`, \`source\`, and \`license\` fields.
3. **Closed-Class Segregation:** Closed-class grammatical words (pronouns, prepositions, determiners) are segregated into \`SPECIAL_SYNTAX_REVIEW_REQUIRED\` rather than forcing generic dictionary glosses that induce learner confusion.
