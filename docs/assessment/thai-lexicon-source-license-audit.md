# Thai Lexicon Source Discovery & License Verification Audit

**Phase:** 6.2.18 — Thai Lexicon Grounding & Pre-Review Automation Foundation  
**Date:** 2026-09-27  
**Auditor:** Glova Content Engineering & DevSecOps Architecture Team  
**Status:** COMPLETE & AUTHORITATIVE  

---

## 1. Executive Summary & Regulatory Stance

Before importing, copying, scraping, or bundling any external bilingual English-Thai lexical resource into the Glova learning platform, a rigorous supply-chain and intellectual property audit was conducted.

### Core Legal Invariant
> **Strict Non-Infringement Rule**: Glova does NOT assume that any resource is open for redistribution, permits commercial use, permits derivative works, or permits database redistribution simply because it is downloadable on the internet or available on GitHub. Unverified or ambiguous resources are strictly blocked from ingestion.

---

## 2. Exhaustive Audit of Candidate Lexical Sources

### Candidate 1: NECTEC LEXiTRON (National Electronics and Computer Technology Center)
- **Primary Source URL:** `https://www.nectec.or.th` | `https://github.com/nectec/lexitron`
- **Publisher / Maintainer:** National Electronics and Computer Technology Center (NECTEC), National Science and Technology Development Agency (NSTDA), Thailand.
- **Version Audited:** LEXiTRON 2.0 (Et-dictionary and Te-dictionary releases).
- **Exact License:** Custom NECTEC Software License Agreement (Institutional Freeware with Commercial Restrictions).
- **Redistribution Permission:** **Restricted**. Redistribution of raw dictionary files is prohibited without maintaining original copyright headers, and embedding into software distributed for a fee is forbidden under the standard public download terms.
- **Derivative-Work Permission:** **Restricted**. Derivative databases cannot be redistributed or commercialized without explicit approval.
- **Commercial-Use Status:** **PROHIBITED / RESTRICTED** without an executed Technology Transfer and Commercial Licensing Agreement directly from the NSTDA/NECTEC Intellectual Property Management division.
- **Attribution Requirement:** Mandatory (acknowledgement of NECTEC NSTDA in documentation).
- **Share-Alike Requirement:** None (Proprietary Institutional License).
- **Does License Apply to Lexical Data:** **YES**. The license explicitly applies to both the compiled binary/software and the underlying lexical text database (`etlex`, `telex`).
- **Audit Verdict:** ❌ **REJECTED & BLOCKED FROM DIRECT INGESTION**. Glova cannot bundle raw LEXiTRON data into its commercial/production codebase or redistributable cloud artifacts without an executed B2B agreement from NECTEC.

---

### Candidate 2: Open Multilingual Wordnet (OMW) / Thai WordNet (Asian WordNet Sub-corpus)
- **Primary Source URL:** `http://compling.hss.ntu.edu.sg/omw/` | `https://github.com/globalwordnet/omw`
- **Publisher / Maintainer:** Francis Bond (NTU / Palacký University), Asian WordNet Project, NECTEC Language and Semantic Technology Laboratory, and Chulalongkorn University.
- **Version Audited:** Thai WordNet 1.0 aligned to Princeton WordNet (PWN) 3.0 / CILI (Collaborative Interlingual Index).
- **Exact License:** Creative Commons Attribution 3.0 Unported (CC BY 3.0) for the OMW distribution package; specific academic drops from Thai research partners carry custom academic/research terms.
- **Redistribution Permission:** **Permitted** under CC BY 3.0, provided that the original copyright notice, attribution, and license notice are preserved.
- **Derivative-Work Permission:** **Permitted** under CC BY 3.0.
- **Commercial-Use Status:** **PERMITTED** under CC BY 3.0 (Commercial exploitation is allowed with proper attribution).
- **Attribution Requirement:** Mandatory. Any derivative work or product utilizing OMW Thai WordNet data must cite the Asian WordNet project and Francis Bond et al. (2013).
- **Share-Alike Requirement:** **NO**. CC BY 3.0 does not enforce copyleft or viral licensing onto the host application codebase.
- **Does License Apply to Lexical Data:** **YES**. The tab-separated lexical synset mappings in OMW are licensed under CC BY 3.0.
- **Audit Verdict:** ⚠️ **ACCEPTED UNDER STRICT PROVENANCE ISOLATION**. OMW Thai synset alignments can be utilized as a lexical reference provider, provided that:
  1. Records maintain an immutable provenance tag: `source: "OMW_THAI_WORDNET_1.0"`, `license: "CC-BY-3.0"`.
  2. Synsets are stored in dedicated reference tables/adapters, never merged with proprietary CEFR rubric weights.

---

### Candidate 3: Wiktionary via Kaikki.org (Wiktextract Bilingual Extracted Corpora)
- **Primary Source URL:** `https://kaikki.org/dictionary/Thai/` | `https://en.wiktionary.org/`
- **Publisher / Maintainer:** Tatu Ylönen (Wiktextract / Kaikki.org) and Wikimedia Foundation Community Contributors.
- **Version Audited:** English-Thai bilingual JSONL snapshot.
- **Exact License:** Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) and GNU Free Documentation License (GFDL).
- **Redistribution Permission:** **Permitted**.
- **Derivative-Work Permission:** **Permitted**.
- **Commercial-Use Status:** **Permitted** under CC BY-SA terms.
- **Attribution Requirement:** Mandatory. Must attribute Wiktionary contributors and Tatu Ylönen for Wiktextract.
- **Share-Alike Requirement:** ⚠️ **STRICT COPYLEFT (VIRAL REQUIREMENT)**. Under Section 4(b) of CC BY-SA 3.0, any derivative work or collective database that modifies, adapts, or merges this content must be licensed under the exact same CC BY-SA 3.0 license.
- **Does License Apply to Lexical Data:** **YES**. The dictionary entries extracted from Wiktionary are covered by CC BY-SA 3.0.
- **Audit Verdict:** ❌ **REJECTED FOR DIRECT EMBEDDING INTO STAGED VOCABULARY UNITS**. Merging CC BY-SA data directly into Glova's vocabulary bank would create a legal contamination risk, requiring the entire downstream database to be licensed under CC BY-SA. It may only be queried as an external offline validation oracle during development, never stored as production unit text.

---

### Candidate 4: FreeDict Project (eng-tha / tha-eng)
- **Primary Source URL:** `https://freedict.org` | `https://github.com/freedict/fd-dictionaries`
- **Publisher / Maintainer:** FreeDict Community.
- **Version Audited:** Repository inspection across all 150+ language pairs.
- **Exact License:** Project default is GNU General Public License v3.0+ (GPLv3+), but per-dictionary TEI headers govern each file.
- **Audit Findings:** No official `eng-tha` or `tha-eng` dictionary exists within the FreeDict official repository. Community conversions found on third-party sites are unauthorized repackagings of NECTEC LEXiTRON without valid GPL upstream provenance.
- **Audit Verdict:** ❌ **REJECTED (Resource non-existent upstream; third-party repackagings violate upstream license terms)**.

---

### Candidate 5: Cambridge English Lexical Resources (Cambridge Dictionary)
- **Primary Source URL:** `https://dictionary.cambridge.org`
- **Publisher / Maintainer:** Cambridge University Press & Assessment.
- **Version Audited:** Cambridge English-Thai Bilingual Online Dictionary.
- **Exact License:** Proprietary / All Rights Reserved.
- **Redistribution Permission:** **STRICTLY PROHIBITED**.
- **Derivative-Work Permission:** **STRICTLY PROHIBITED**.
- **Commercial-Use Status:** **PROHIBITED** without formal enterprise syndication agreement.
- **Audit Verdict:** ❌ **STRICTLY PROHIBITED**. Under no circumstances may Cambridge dictionary translations or proprietary text be scraped, extracted, or ingested into Glova staging files.

---

### Candidate 6: Glova Curated Headword Registry (GLOVA_CURATED_HEADWORD_REGISTRY)
- **Primary Source URL:** Internal repository: `scripts/content-pipeline/vocab/`
- **Publisher / Maintainer:** Glova Content Engineering & Lexicography Team.
- **Version Audited:** Registry v1.2.0 (Authoritative Internal Lexicon).
- **Exact License:** Proprietary Internal Content Asset.
- **Redistribution Permission:** Controlled by Glova Platform Intellectual Property Policy.
- **Derivative-Work Permission:** Permitted.
- **Commercial-Use Status:** Permitted.
- **Attribution Requirement:** Internal provenance (`source: "GLOVA_CURATED_REGISTRY"`).
- **Share-Alike Requirement:** None.
- **Audit Verdict:** ✅ **APPROVED AS PRIMARY PRODUCTION LEXICAL GROUNDING STORE**. All vetted headwords with verified POS and CEFR alignment are safely stored here with complete internal provenance.

---

## 3. Decision Matrix & Ingestion Governance

| Source | License | Commercial OK | Share-Alike Contamination Risk | Ingestion Decision |
| :--- | :--- | :---: | :---: | :--- |
| **NECTEC LEXiTRON** | Custom NSTDA | ❌ (Requires contract) | High (Proprietary breach) | **BLOCKED** |
| **OMW Thai WordNet** | CC BY 3.0 | ✅ | None (Permissive) | **ACCEPTED (Isolated Adapter)** |
| **Wiktionary (Kaikki)** | CC BY-SA 3.0 | ✅ | ⚠️ High (Copyleft viral) | **BLOCKED from core DB** |
| **FreeDict eng-tha** | N/A | ❌ | High (Invalid provenance) | **REJECTED** |
| **Cambridge Dictionary** | Proprietary | ❌ | Critical (Copyright infringement) | **STRICTLY FORBIDDEN** |
| **Glova Curated Registry**| Proprietary | ✅ | None | **AUTHORITATIVE BASELINE** |

---

## 4. Architectural Rules for Lexical Grounding Interface

1. **Isolation Invariant**: Any external data adapter (e.g. OMW Thai WordNet) must live in an isolated module with its license metadata explicitly stamped on every candidate entry.
2. **Zero Contamination**: Never mix CC BY-SA data with proprietary curriculum annotations.
3. **Immutability of Invariants**: No lexical tool may write directly to Supabase production tables or set `lifecycle_status = 'APPROVED'` automatically.
