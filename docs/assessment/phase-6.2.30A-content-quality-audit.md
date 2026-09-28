# Phase 6.2.30A — Human Content Quality Audit Report (50 Locked Records)

**Audit Status**: Complete  
**Date Audited**: 2026-09-27T16:45:59.412Z  
**Source Packet**: `reports/phase-6.2.30-human-review-packet.json`  
**Scope**: Exactly 50 Records (Preserved 1:1 in byte-for-byte locked order)  
**Governance Notice**: **AUDIT ONLY**. Zero production/staging mutations executed. Zero records marked APPROVED. Zero lifecycle changes. Learner-ready count = unchanged (83).

---

## 1. Executive Summary & Audit Gate

| Metric | Value | Percentage | Status |
| :--- | :--- | :--- | :--- |
| **TOTAL SCOPE** | **50 records** | **100.0%** | Full Review Complete |
| **APPROVE** | **8 records** | **16.0%** | Ready As-Is |
| **EDIT_REQUIRED** | **33 records** | **66.0%** | Minor / Editorial Polish Needed |
| **HOLD** | **9 records** | **18.0%** | Severe Sense / CEFR Conflict |
| **PHASE_6_2_30A_GATE** | **`PASS`** | **100.0%** | Verified Audit Invariants |

---

## 2. Failed Dimension Frequency

| Dimension | Records Affected | Primary Root Cause |
| :--- | :---: | :--- |
| **`thai_meaning`** | **36** | Generic placeholder templates, bureaucratic phrasing, or domain contamination |
| **`example_sentence`** | **17** | Cross-synset example bleeding, figurative usage, or synthetic AI templates |
| **`provenance`** | **13** | Mismatch between meaning synset and candidate example synset in OEWN |
| **`cefr_sense_coherence`** | **9** | Obscure C1/C2 theological, legal, or named entity senses assigned to A1 |
| **`english_meaning`** | **9** | Synset assigned does not reflect core A1 lexical headword target |
| **`pos`** | **0** | 100% compliant across all 50 units |
| **`ipa`** | **0** | 100% compliant CMUDict General American phonetics |

---

## 3. Top Serious Semantic Findings

1. **Named Entity Biography Mismatch**:
   - `day|noun|A1|sense:1` was mapped to Clarence Day (*"United States writer best known for his autobiographical works (1874-1935)"*), while Thai translation and example were 24-hour time units.
2. **Ecclesiastical / Theological Distortions on Core Family & Daily Words**:
   - `father|noun|A1|sense:1` mapped to Catholic priestly address (*"term of address for priests... Padre"*), missing the primary family kinship term ("พ่อ").
   - `call|noun|A1|sense:1` mapped to religious divine vocation (*"special disposition (as if from a divine source)"*), missing the telephone call sense.
3. **Formal Legal / Abstract Sense vs. A1 Physical Reality**:
   - `exercise|verb|A1|sense:1` mapped to formal execution (*"put to use"*) with infant exercise example, missing physical fitness ("ออกกำลังกาย").
   - `draw|verb|A1|sense:1` mapped to physical towing/dragging while example was marking a line, missing pictorial drawing ("วาดรูป").
4. **Bureaucratic & Occupational Thai Template Contamination**:
   - `dog|noun|A1|sense:1` translated as *"ผู้มีความเชี่ยวชาญหรือปฏิบัติหน้าที่ในด้านนี้"* (expert/worker template).
   - `feel|verb|A1|sense:1` translated with public administration boilerplate (*"...โดยการการปกครอง นโยบายสาธารณะ และบ้านเมือง"*).
   - `drink|noun|A1|sense:1` translated with temporal duration template (*"ช่วงเวลา ระยะเวลา หรือจังหวะเวลา"*).
5. **Corrupted Synthetic AI Template Examples**:
   - `college|noun|A1|sense:1` contains the banned hallucinated template: *"Understanding the role of college helps students discuss body faculty students college clearly in everyday situations."*

---

## 4. Production Safety Invariants

- **Production DB writes**: `0`
- **Staging records mutated**: `0`
- **Vocabulary lifecycle status mutated**: `0`
- **Production review ledger events created**: `0`
- **Learner-ready units count**: `83` (Strictly unchanged)
- **Overall readiness status**: `NOT_READY` (Strictly unchanged)
- **User testing authorized**: `false` (Strictly unchanged)

---

## 5. Record-by-Record Audit Workbench (50 Records)

### [#1] `call|noun|A1|sense:1`
- **Headword**: **call** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a special disposition (as if from a divine source) to pursue a particular course"
- **Current Thai Meaning**: "สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง"
- **Current Phonetic IPA**: `/kɔːl/`
- **Current Example Sentence**: *"he was disappointed that he had not heard the Call"*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `thai_meaning`, `example_sentence`, `cefr_sense_coherence`
- **Reviewer Reason**: Obscure theological sense ("divine vocation/calling") assigned to basic A1 noun instead of everyday telephone call or shout; Thai meaning is an empty generic template; capitalized example sentence refers to religious calling.
- **Suggested Action**: Place on HOLD; re-anchor canonical OEWN synset to everyday communication sense (phone call / shout), author accurate Thai translation, and provide learner-appropriate example sentence.
- **Provenance Warning**: `true`

---

### [#2] `car|noun|A1|sense:1`
- **Headword**: **car** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a motor vehicle with four wheels; usually propelled by an internal combustion engine"
- **Current Thai Meaning**: "รถยนต์"
- **Current Phonetic IPA**: `/kɑːɹ/`
- **Current Example Sentence**: *"he needs a car to get to work"*
- **Audit Decision**: `APPROVE` (Green)
- **Severity**: `LOW` | **Failed Dimensions**: `NONE`
- **Reviewer Reason**: High quality across all dimensions: core A1 automotive sense, natural Thai translation ("รถยนต์"), correct IPA, and natural learner-appropriate example sentence.
- **Suggested Action**: No change required.
- **Provenance Warning**: `false`

---

### [#3] `card|noun|A1|sense:1`
- **Headword**: **card** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "one of a set of small pieces of stiff paper marked in various ways and used for playing games or for telling fortunes"
- **Current Thai Meaning**: "เอกสาร ข้อเขียน หรือบันทึกข้อมูล (ด้านศิลปะ ดนตรี หรือกีฬา)"
- **Current Phonetic IPA**: `/kɑːɹd/`
- **Current Example Sentence**: *"he collected cards and traded them with the other boys"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe playing/trading cards accurately, but Thai meaning is a generic boilerplate template from an unrelated domain ("เอกสาร ข้อเขียน หรือบันทึกข้อมูล (ด้านศิลปะ ดนตรี หรือกีฬา)").
- **Suggested Action**: Edit Thai meaning to "ไพ่, การ์ด (สำหรับเล่นเกมหรือสะสม)" to accurately align with the playing/trading card sense.
- **Provenance Warning**: `false`

---

### [#4] `care|noun|A1|sense:1`
- **Headword**: **care** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "the work of providing treatment for or attending to someone or something"
- **Current Thai Meaning**: "ผู้มีความเชี่ยวชาญหรือปฏิบัติหน้าที่ในด้านนี้ (เกี่ยวกับอาหารหรือของกิน)"
- **Current Phonetic IPA**: `/keɹ/`
- **Current Example Sentence**: *"no medical care was required"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English meaning and example sentence accurately represent provision of attention/medical treatment, but Thai meaning is an erroneous food/cooking agent template ("ผู้มีความเชี่ยวชาญหรือปฏิบัติหน้าที่ในด้านนี้ (เกี่ยวกับอาหารหรือของกิน)").
- **Suggested Action**: Edit Thai meaning to "การดูแล, การเอาใจใส่, การรักษาพยาบาล".
- **Provenance Warning**: `false`

---

### [#5] `catch|noun|A1|sense:1`
- **Headword**: **catch** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a drawback or difficulty that is not readily evident"
- **Current Thai Meaning**: "สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง"
- **Current Phonetic IPA**: `/kætʃ/`
- **Current Example Sentence**: *"it sounds good but what's the catch?"*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `thai_meaning`, `example_sentence`, `cefr_sense_coherence`
- **Reviewer Reason**: Figurative/idiomatic B2 sense ("hidden drawback/trap" as in "what's the catch?") assigned to basic A1 noun, accompanied by an empty placeholder Thai template.
- **Suggested Action**: Place on HOLD; re-anchor canonical synset to primary A1 physical catch (e.g., act of catching a ball) and author aligned Thai translation and learner example.
- **Provenance Warning**: `true`

---

### [#6] `catch|verb|A1|sense:1`
- **Headword**: **catch** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "discover or come upon accidentally, suddenly, or unexpectedly; catch somebody doing something or in a certain state"
- **Current Thai Meaning**: "ใช้ความคิด วิเคราะห์ หรือตัดสินใจโดยการการปกครอง นโยบายสาธารณะ และบ้านเมือง ตามบริบทของความหมายที่เลือกไว้"
- **Current Phonetic IPA**: `/kætʃ/`
- **Current Example Sentence**: *"Did you catch the thief?"*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `thai_meaning`, `example_sentence`, `cefr_sense_coherence`, `provenance`
- **Reviewer Reason**: Severe three-way semantic incoherence: English gloss defines accidental discovery ("catch doing something", synset 00758153-v), example sentence illustrates capturing/apprehending a fugitive (synset 01262330-v), and Thai meaning is an irrelevant public policy template.
- **Suggested Action**: Place on HOLD; resolve synset conflict by selecting either physical catching or capturing with matching definition, translation, and example.
- **Provenance Warning**: `true`

---

### [#7] `change|noun|A1|sense:1`
- **Headword**: **change** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "an event that occurs when something passes from one state or phase to another"
- **Current Thai Meaning**: "สภาวะ สภาพ หรือเงื่อนไขที่เป็นอยู่"
- **Current Phonetic IPA**: `/tʃeɪndʒ/`
- **Current Example Sentence**: *"the change was intended to increase sales"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe transition from one state to another, but Thai meaning defines static existing state ("สภาวะ สภาพ หรือเงื่อนไขที่เป็นอยู่"), creating semantic contradiction.
- **Suggested Action**: Edit Thai meaning to "การเปลี่ยนแปลง, การปรับเปลี่ยน".
- **Provenance Warning**: `false`

---

### [#8] `change|verb|A1|sense:1`
- **Headword**: **change** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "cause to change; make different; cause a transformation"
- **Current Thai Meaning**: "ทำให้เกิดการเปลี่ยนแปลงหรือปรับสภาพโดยการการสร้าง การผลิต และการพัฒนา และการปรับเปลี่ยนและการแปรสภาพ ตามบริบทของความหมายที่เลือกไว้"
- **Current Phonetic IPA**: `/tʃeɪndʒ/`
- **Current Example Sentence**: *"The discussion has changed my thinking about the issue"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: Core transformation verb sense is sound, but Thai meaning is heavily contaminated with redundant synthetic template phrasing ("โดยการการสร้าง... ตามบริบทของความหมายที่เลือกไว้").
- **Suggested Action**: Edit Thai meaning to clean natural Thai: "เปลี่ยน, เปลี่ยนแปลง, ปรับเปลี่ยน".
- **Provenance Warning**: `false`

---

### [#9] `character|noun|A1|sense:1`
- **Headword**: **character** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "an imaginary person represented in a work of fiction (play or film or story)"
- **Current Thai Meaning**: "ผู้มีความเชี่ยวชาญหรือปฏิบัติหน้าที่ในด้านนี้ (ด้านศิลปะ ดนตรี หรือกีฬา)"
- **Current Phonetic IPA**: `/ˈkeɹɪktəɹ/`
- **Current Example Sentence**: *"she is the main character in the novel"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe a fictional story character, but Thai meaning is an erroneous real-world professional expert template ("ผู้มีความเชี่ยวชาญหรือปฏิบัติหน้าที่ในด้านนี้").
- **Suggested Action**: Edit Thai meaning to "ตัวละคร (ในนิยาย ละคร หรือภาพยนตร์)".
- **Provenance Warning**: `false`

---

### [#10] `check|noun|A1|sense:1`
- **Headword**: **check** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a written order directing a bank to pay money"
- **Current Thai Meaning**: "สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง (ด้านการค้าและธุรกิจ)"
- **Current Phonetic IPA**: `/tʃek/`
- **Current Example Sentence**: *"he paid all his bills by check"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example clearly describe a bank check (cheque), but Thai meaning is an uninformative generic template ("สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง (ด้านการค้าและธุรกิจ)").
- **Suggested Action**: Edit Thai meaning to "เช็ค (ใบสั่งจ่ายเงินของธนาคาร)".
- **Provenance Warning**: `false`

---

### [#11] `child|noun|A1|sense:1`
- **Headword**: **child** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a young person of either sex"
- **Current Thai Meaning**: "เด็ก, บุตรหลาน"
- **Current Phonetic IPA**: `/tʃaɪld/`
- **Current Example Sentence**: *"he remained a child in practical matters as long as he lived"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `example_sentence`, `provenance`
- **Reviewer Reason**: Definition ("young person") and Thai translation ("เด็ก, บุตรหลาน") are literal, but example sentence comes from a different synset (10095351-n) illustrating metaphorical adult immaturity ("remained a child in practical matters"), confusing A1 learners.
- **Suggested Action**: Edit example sentence to a straightforward literal A1 context, e.g., "The child is playing in the garden with friends."
- **Provenance Warning**: `true`

---

### [#12] `choose|verb|A1|sense:1`
- **Headword**: **choose** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "pick out, select, or choose from a number of alternatives"
- **Current Thai Meaning**: "ปรับเปลี่ยน หรือแปรสภาพให้แตกต่างไป"
- **Current Phonetic IPA**: `/tʃuːz/`
- **Current Example Sentence**: *"Choose a good husband for your daughter"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe selection, but Thai translation erroneously defines modification/transformation ("ปรับเปลี่ยน หรือแปรสภาพให้แตกต่างไป").
- **Suggested Action**: Edit Thai meaning to "เลือก, คัดเลือก".
- **Provenance Warning**: `false`

---

### [#13] `church|noun|A1|sense:1`
- **Headword**: **church** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "one of the groups of Christians who have their own beliefs and forms of worship"
- **Current Thai Meaning**: "กลุ่มบุคคล องค์กร หรือหน่วยงาน (การเดินทางและคมนาคม)"
- **Current Phonetic IPA**: `/tʃɜːɹtʃ/`
- **Current Example Sentence**: *"the church was empty"*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `thai_meaning`, `cefr_sense_coherence`, `provenance`
- **Reviewer Reason**: Severe sense conflict: English gloss defines religious denomination (synset 08234654-n), example sentence illustrates a physical building (synset 03076417-n), and Thai is an organization template tagged with transportation.
- **Suggested Action**: Place on HOLD; re-anchor canonical synset to physical church building / place of worship (03028079-n), update Thai to "โบสถ์ (คริสต์ศาสนา)" and align definition.
- **Provenance Warning**: `true`

---

### [#14] `city|noun|A1|sense:1`
- **Headword**: **city** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a large and densely populated urban area; may include several independent administrative districts"
- **Current Thai Meaning**: "สถานที่ พื้นที่ หรือตำแหน่งที่เกี่ยวข้องกับการเพิ่มขึ้น ขนาดที่ใหญ่ หรือปริมาณมาก ในระยะท้ายหรือเป็นผลลัพธ์ที่ตามมา"
- **Current Phonetic IPA**: `/ˈsɪti/`
- **Current Example Sentence**: *"Ancient Troy was a great city"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example accurately represent an urban center, but Thai meaning is a sprawling synthetic template word salad.
- **Suggested Action**: Edit Thai meaning to natural concise Thai: "เมือง, นคร".
- **Provenance Warning**: `false`

---

### [#15] `clean|adjective|A1|sense:1`
- **Headword**: **clean** | **POS**: `adjective` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "free from dirt or impurities; or having clean habits"
- **Current Thai Meaning**: "สะอาด, บริสุทธิ์"
- **Current Phonetic IPA**: `/kliːn/`
- **Current Example Sentence**: *"children with clean shining faces"*
- **Audit Decision**: `APPROVE` (Green)
- **Severity**: `LOW` | **Failed Dimensions**: `NONE`
- **Reviewer Reason**: High quality across all dimensions: core A1 adjective, accurate natural Thai ("สะอาด, บริสุทธิ์"), verified IPA, and natural learner-appropriate example sentence.
- **Suggested Action**: No change required.
- **Provenance Warning**: `false`

---

### [#16] `clean|verb|A1|sense:1`
- **Headword**: **clean** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "make clean by removing dirt, filth, or unwanted substances from"
- **Current Thai Meaning**: "สัมผัส เชื่อมต่อ หรือกระทำต่อวัตถุโดยการการสร้าง การผลิต และการพัฒนา ตามบริบทของความหมายที่เลือกไว้"
- **Current Phonetic IPA**: `/kliːn/`
- **Current Example Sentence**: *"The dentist cleaned my teeth"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English meaning and example describe cleaning dirt/filth, but Thai meaning is an erroneous synthetic template describing manufacturing and production ("โดยการการสร้าง การผลิต และการพัฒนา").
- **Suggested Action**: Edit Thai meaning to "ทำความสะอาด, ซักล้าง, เช็ดถู".
- **Provenance Warning**: `false`

---

### [#17] `cold|adjective|A1|sense:1`
- **Headword**: **cold** | **POS**: `adjective` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "having a low or inadequate temperature or feeling a sensation of coldness or having been made cold by e.g. ice or refrigeration"
- **Current Thai Meaning**: "หนาว, เย็น"
- **Current Phonetic IPA**: `/koʊld/`
- **Current Example Sentence**: *"a cold unfriendly nod"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `example_sentence`, `provenance`
- **Reviewer Reason**: Definition and Thai translation describe physical low temperature ("หนาว, เย็น"), but example sentence comes from a different synset (01264939-a) illustrating figurative emotional coldness ("a cold unfriendly nod").
- **Suggested Action**: Edit example sentence to a physical temperature context appropriate for A1, e.g., "The weather is very cold in December."
- **Provenance Warning**: `true`

---

### [#18] `cold|noun|A1|sense:1`
- **Headword**: **cold** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a mild viral infection involving the nose and respiratory passages (but not the lungs)"
- **Current Thai Meaning**: "สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง (การเดินทางและคมนาคม)"
- **Current Phonetic IPA**: `/koʊld/`
- **Current Example Sentence**: *"will they never find a cure for the common cold?"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe the common cold respiratory illness, but Thai meaning is a generic abstract template with an erroneous transportation tag.
- **Suggested Action**: Edit Thai meaning to "หวัด, โรคหวัด, ไข้หวัด".
- **Provenance Warning**: `false`

---

### [#19] `college|noun|A1|sense:1`
- **Headword**: **college** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "the body of faculty and students of a college"
- **Current Thai Meaning**: "สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง"
- **Current Phonetic IPA**: `/ˈkɑːlɪdʒ/`
- **Current Example Sentence**: *"Understanding the role of college helps students discuss body faculty students college clearly in everyday situations."*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `thai_meaning`, `example_sentence`, `cefr_sense_coherence`
- **Reviewer Reason**: Multiple severe failures: English gloss selects the institutional body of people rather than the educational institution, Thai is an empty placeholder, and the example sentence is a malformed synthetic AI template ("Understanding the role of college helps students discuss body faculty students college...").
- **Suggested Action**: Place on HOLD; re-anchor canonical synset to educational institution (08276720-n or 02844288-n), provide natural Thai translation "วิทยาลัย" and authentic example sentence.
- **Provenance Warning**: `true`

---

### [#20] `come|verb|A1|sense:1`
- **Headword**: **come** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "move toward, travel toward something or somebody or approach something or somebody"
- **Current Thai Meaning**: "เคลื่อนที่ เดินทาง หรือย้ายตำแหน่งโดยการการคมนาคม การเดินทาง และยานพาหนะ และการเคลื่อนไหว การออกแรง และการย้ายตำแหน่ง ตามบริบทของความหมายที่เลือกไว้"
- **Current Phonetic IPA**: `/kʌm/`
- **Current Example Sentence**: *"Come with me to the Casbah"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: Movement toward an observer is core A1, but Thai translation is a bloated synthetic template with redundant clauses ("โดยการการคมนาคม...").
- **Suggested Action**: Edit Thai meaning to clean natural Thai: "มา, เข้ามา, เดินทางมา".
- **Provenance Warning**: `false`

---

### [#21] `cover|noun|A1|sense:1`
- **Headword**: **cover** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a covering that serves to conceal or shelter something"
- **Current Thai Meaning**: "สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง"
- **Current Phonetic IPA**: `/ˈkʌvəɹ/`
- **Current Example Sentence**: *"under cover of darkness"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`, `example_sentence`
- **Reviewer Reason**: English definition describes shelter/concealment, Thai is an empty template, and example is an idiomatic literary phrase ("under cover of darkness") rather than straightforward A1 usage.
- **Suggested Action**: Edit Thai meaning to "ที่กำบัง, สิ่งปกคลุม" and update example sentence to a clear physical context (e.g. "We found a dry cover from the rain.").
- **Provenance Warning**: `false`

---

### [#22] `cut|verb|A1|sense:1`
- **Headword**: **cut** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "separate with or as if with an instrument"
- **Current Thai Meaning**: "ดำเนินการ หรือกระทำการตามลักษณะเฉพาะ"
- **Current Phonetic IPA**: `/kʌt/`
- **Current Example Sentence**: *"The employer wants to cut back health benefits"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`, `example_sentence`, `provenance`
- **Reviewer Reason**: Thai translation is an empty action template ("ดำเนินการ หรือกระทำการตามลักษณะเฉพาะ"), and example sentence comes from a different synset (00446629-v) illustrating the financial phrasal verb "cut back" (reduce) instead of physical cutting with an instrument.
- **Suggested Action**: Edit Thai meaning to "ตัด, หั่น, เฉือน" and replace example sentence with literal instrument cutting (e.g. "She cut the bread with a sharp knife.").
- **Provenance Warning**: `true`

---

### [#23] `dance|verb|A1|sense:1`
- **Headword**: **dance** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "move in a graceful and rhythmical way"
- **Current Thai Meaning**: "เคลื่อนที่ เดินทาง หรือย้ายตำแหน่งโดยการการเคลื่อนไหว การออกแรง และการย้ายตำแหน่ง ตามบริบทของความหมายที่เลือกไว้"
- **Current Phonetic IPA**: `/dæns/`
- **Current Example Sentence**: *"The young girl danced into the room"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example are natural, but Thai translation is a mechanical template with duplicated wording ("โดยการการเคลื่อนไหว...").
- **Suggested Action**: Edit Thai meaning to clean natural Thai: "เต้น, เต้นรำ".
- **Provenance Warning**: `false`

---

### [#24] `dark|adjective|A1|sense:1`
- **Headword**: **dark** | **POS**: `adjective` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "devoid of or deficient in light or brightness; shadowed or black"
- **Current Thai Meaning**: "ซึ่งมีลักษณะหรือคุณสมบัติตามที่ระบุ"
- **Current Phonetic IPA**: `/dɑːɹk/`
- **Current Example Sentence**: *"sitting in a dark corner"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: Thai translation is an empty placeholder formula ("ซึ่งมีลักษณะหรือคุณสมบัติตามที่ระบุ") completely devoid of the meaning of darkness.
- **Suggested Action**: Edit Thai meaning to "มืด, มืดมิด, คล้ำ".
- **Provenance Warning**: `false`

---

### [#25] `date|noun|A1|sense:1`
- **Headword**: **date** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "the specified day of the month"
- **Current Thai Meaning**: "ช่วงเวลา ระยะเวลา หรือจังหวะเวลา"
- **Current Phonetic IPA**: `/deɪt/`
- **Current Example Sentence**: *"what is the date today?"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example represent the calendar date accurately, but Thai meaning is an overgeneralized temporal template ("ช่วงเวลา ระยะเวลา หรือจังหวะเวลา").
- **Suggested Action**: Edit Thai meaning to "วันที่, วันเดือนปี".
- **Provenance Warning**: `false`

---

### [#26] `day|noun|A1|sense:1`
- **Headword**: **day** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "United States writer best known for his autobiographical works (1874-1935)"
- **Current Thai Meaning**: "วัน, เวลากลางวัน"
- **Current Phonetic IPA**: `/deɪ/`
- **Current Example Sentence**: *"two days later they left"*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `cefr_sense_coherence`, `provenance`
- **Reviewer Reason**: Critical synset corruption: English definition is a biographical entry for Clarence Day (synset 11137648-n), while Thai translation and example sentence represent the 24-hour time unit (synset 15410545-n).
- **Suggested Action**: Place on HOLD; re-anchor canonical synset to 24-hour time unit 15167733-n / 15410545-n with proper gloss ("a period of 24 hours").
- **Provenance Warning**: `true`

---

### [#27] `describe|verb|A1|sense:1`
- **Headword**: **describe** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "give a description of"
- **Current Thai Meaning**: "มอบให้ จัดสรร หรือส่งต่อให้แก่ผู้อื่น"
- **Current Phonetic IPA**: `/dɪskˈɹaɪb/`
- **Current Example Sentence**: *"Discreet Italian police described it in a manner typically continental"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`, `example_sentence`, `provenance`
- **Reviewer Reason**: Thai translation describes giving or distributing to others ("มอบให้ จัดสรร หรือส่งต่อให้แก่ผู้อื่น" = transfer/distribute), and example sentence is derived from a different synset (01005472-v) with complex C1 literary prose unsuitable for A1.
- **Suggested Action**: Edit Thai meaning to "บรรยาย, อธิบาย, พรรณนา" and simplify example sentence to A1 level (e.g., "Please describe what happened.").
- **Provenance Warning**: `true`

---

### [#28] `design|noun|A1|sense:1`
- **Headword**: **design** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "the act of working out the form of something (as by making a sketch or outline or plan)"
- **Current Thai Meaning**: "กระบวนการ การปฏิบัติ หรือการดำเนินการ (ด้านศิลปะ ดนตรี หรือกีฬา)"
- **Current Phonetic IPA**: `/dɪˈzaɪn/`
- **Current Example Sentence**: *"he contributed to the design of a new instrument"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example are sound, but Thai meaning is an abstract process template ("กระบวนการ การปฏิบัติ หรือการดำเนินการ (ด้านศิลปะ ดนตรี หรือกีฬา)").
- **Suggested Action**: Edit Thai meaning to "การออกแบบ, แบบแผน, โครงสร้างแผนผัง".
- **Provenance Warning**: `false`

---

### [#29] `difficult|adjective|A1|sense:1`
- **Headword**: **difficult** | **POS**: `adjective` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "not easy; requiring great physical or mental effort to accomplish or comprehend or endure"
- **Current Thai Meaning**: "ซึ่งมีลักษณะหรือคุณสมบัติที่แสดงถึงการเพิ่มขึ้น ขนาดที่ใหญ่ หรือปริมาณมาก ในเชิงปฏิเสธหรือการปราศจากสิ่งนั้น"
- **Current Phonetic IPA**: `/ˈdɪfəkəlt/`
- **Current Example Sentence**: *"nesting places on the cliffs are difficult of access"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`, `example_sentence`
- **Reviewer Reason**: Thai translation is an incomprehensible synthetic template word salad, and example sentence uses an archaic formal construction ("difficult of access") unsuited to A1.
- **Suggested Action**: Edit Thai meaning to "ยาก, ลำบาก" and update example to standard learner syntax, e.g. "The test was very difficult."
- **Provenance Warning**: `false`

---

### [#30] `discuss|verb|A1|sense:1`
- **Headword**: **discuss** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "to consider or examine in speech or writing"
- **Current Thai Meaning**: "สื่อสาร แจ้งข้อมูล หรือแสดงความคิดเห็นโดยการการใช้เหตุผล การตัดสินใจ และความคิด ตามบริบทของความหมายที่เลือกไว้"
- **Current Phonetic IPA**: `/dɪsˈkʌs/`
- **Current Example Sentence**: *"The class discussed Dante's ‘Inferno’"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: Core discussion verb sense is sound, but Thai meaning contains redundant synthetic template clauses ("โดยการการใช้เหตุผล... ตามบริบทของความหมายที่เลือกไว้").
- **Suggested Action**: Edit Thai meaning to clean natural Thai: "สนทนา, อภิปราย, พูดคุยแลกเปลี่ยนความคิดเห็น".
- **Provenance Warning**: `false`

---

### [#31] `do|verb|A1|sense:1`
- **Headword**: **do** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "engage in"
- **Current Thai Meaning**: "ทำ, ปฏิบัติ"
- **Current Phonetic IPA**: `/duː/`
- **Current Example Sentence**: *"How is she doing in her new job?"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `example_sentence`, `provenance`
- **Reviewer Reason**: Meaning synset is 02640914-v ("engage in"), but example sentence was pulled from a different synset (02698732-v, "fare/manage"), causing semantic drift between the gloss and the question.
- **Suggested Action**: Edit example sentence to directly illustrate "engage in" / perform action (e.g. "I do my homework every afternoon.").
- **Provenance Warning**: `true`

---

### [#32] `dog|noun|A1|sense:1`
- **Headword**: **dog** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a member of the genus Canis (probably descended from the common wolf) that has been domesticated by man since prehistoric times; occurs in many breeds"
- **Current Thai Meaning**: "ผู้มีความเชี่ยวชาญหรือปฏิบัติหน้าที่ในด้านนี้"
- **Current Phonetic IPA**: `/dɔːɡ/`
- **Current Example Sentence**: *"the dog barked all night"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe the domestic canine animal, but Thai meaning is a human professional expert template ("ผู้มีความเชี่ยวชาญหรือปฏิบัติหน้าที่ในด้านนี้").
- **Suggested Action**: Edit Thai meaning to "สุนัข, หมา".
- **Provenance Warning**: `false`

---

### [#33] `door|noun|A1|sense:1`
- **Headword**: **door** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a swinging or sliding barrier that will close the entrance to a room or building or vehicle"
- **Current Thai Meaning**: "ประตู"
- **Current Phonetic IPA**: `/dɔːɹ/`
- **Current Example Sentence**: *"he knocked on the door"*
- **Audit Decision**: `APPROVE` (Green)
- **Severity**: `LOW` | **Failed Dimensions**: `NONE`
- **Reviewer Reason**: High quality across all dimensions: architectural entrance barrier, natural concise Thai ("ประตู"), correct IPA, and natural learner example sentence.
- **Suggested Action**: No change required.
- **Provenance Warning**: `false`

---

### [#34] `down|adverb|A1|sense:1`
- **Headword**: **down** | **POS**: `adverb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "spatially or metaphorically from a higher to a lower level or position"
- **Current Thai Meaning**: "ลง, ข้างล่าง"
- **Current Phonetic IPA**: `/daʊn/`
- **Current Example Sentence**: *"rode the lift up and skied down"*
- **Audit Decision**: `APPROVE` (Green)
- **Severity**: `LOW` | **Failed Dimensions**: `NONE`
- **Reviewer Reason**: High quality: accurate adverb definition, concise natural Thai ("ลง, ข้างล่าง"), correct IPA, and natural directional example sentence.
- **Suggested Action**: No change required.
- **Provenance Warning**: `false`

---

### [#35] `draw|verb|A1|sense:1`
- **Headword**: **draw** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "cause to move by pulling"
- **Current Thai Meaning**: "สัมผัส เชื่อมต่อ หรือกระทำต่อวัตถุโดยการการเคลื่อนไหว การออกแรง และการย้ายตำแหน่ง ตามบริบทของความหมายที่เลือกไว้"
- **Current Phonetic IPA**: `/dɹɔː/`
- **Current Example Sentence**: *"I draw a line here"*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `thai_meaning`, `example_sentence`, `cefr_sense_coherence`, `provenance`
- **Reviewer Reason**: Tripartite sense conflict: English gloss defines physical pulling/towing (synset 01498488-v), example sentence illustrates marking a line (synset 00763641-v), and primary A1 target is making a pictorial drawing (synset 01692287-v).
- **Suggested Action**: Place on HOLD; re-anchor canonical synset to pictorial drawing 01692287-v ("make a picture or diagram") with Thai "วาด, วาดรูป" and sketch example.
- **Provenance Warning**: `true`

---

### [#36] `dream|noun|A1|sense:1`
- **Headword**: **dream** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a series of mental images and emotions occurring during sleep"
- **Current Thai Meaning**: "ความรู้สึก อารมณ์ หรือสภาวะจิตใจ"
- **Current Phonetic IPA**: `/dɹiːm/`
- **Current Example Sentence**: *"I had a dream about you last night"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe sleep dreams accurately, but Thai meaning is an overgeneralized mental state template ("ความรู้สึก อารมณ์ หรือสภาวะจิตใจ").
- **Suggested Action**: Edit Thai meaning to "ความฝัน".
- **Provenance Warning**: `false`

---

### [#37] `drink|noun|A1|sense:1`
- **Headword**: **drink** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "a single serving of a beverage"
- **Current Thai Meaning**: "ช่วงเวลา ระยะเวลา หรือจังหวะเวลา (เกี่ยวกับอาหารหรือของกิน)"
- **Current Phonetic IPA**: `/dɹɪŋk/`
- **Current Example Sentence**: *"I asked for a hot drink"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe a single serving of a beverage, but Thai meaning is an erroneous temporal template ("ช่วงเวลา ระยะเวลา หรือจังหวะเวลา (เกี่ยวกับอาหารหรือของกิน)").
- **Suggested Action**: Edit Thai meaning to "เครื่องดื่ม".
- **Provenance Warning**: `false`

---

### [#38] `drink|verb|A1|sense:1`
- **Headword**: **drink** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "take in liquids"
- **Current Thai Meaning**: "ดื่ม"
- **Current Phonetic IPA**: `/dɹɪŋk/`
- **Current Example Sentence**: *"The patient must drink several liters each day"*
- **Audit Decision**: `APPROVE` (Green)
- **Severity**: `LOW` | **Failed Dimensions**: `NONE`
- **Reviewer Reason**: High quality across all dimensions: core A1 ingestion verb, accurate natural Thai ("ดื่ม"), verified IPA, and clear example sentence.
- **Suggested Action**: No change required.
- **Provenance Warning**: `false`

---

### [#39] `early|adverb|A1|sense:1`
- **Headword**: **early** | **POS**: `adverb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "during an early stage"
- **Current Thai Meaning**: "แต่เช้า, เร็วกว่ากำหนด"
- **Current Phonetic IPA**: `/ˈɜːɹli/`
- **Current Example Sentence**: *"early on in her career"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `LOW` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English gloss defines an initial stage/period and example illustrates career phase ("early on in her career"), whereas Thai meaning defines morning/schedule arrival ("แต่เช้า, เร็วกว่ากำหนด").
- **Suggested Action**: Edit Thai meaning to include initial stage context: "แต่เนิ่นๆ, ในช่วงแรก, แต่เช้า".
- **Provenance Warning**: `false`

---

### [#40] `easy|adjective|A1|sense:1`
- **Headword**: **easy** | **POS**: `adjective` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "posing no difficulty; requiring little effort"
- **Current Thai Meaning**: "ง่าย, ไม่ยุ่งยาก"
- **Current Phonetic IPA**: `/ˈiːzi/`
- **Current Example Sentence**: *"knowing that I had done my best, my mind was easy"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `example_sentence`, `provenance`
- **Reviewer Reason**: Definition and Thai translation describe task simplicity ("posing no difficulty", "ง่าย, ไม่ยุ่งยาก"), but example sentence comes from a different synset (00828754-a) illustrating emotional tranquility ("my mind was easy").
- **Suggested Action**: Edit example sentence to illustrate task simplicity, e.g., "The English exam was very easy."
- **Provenance Warning**: `true`

---

### [#41] `eat|verb|A1|sense:1`
- **Headword**: **eat** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "take in solid food"
- **Current Thai Meaning**: "กิน, รับประทาน"
- **Current Phonetic IPA**: `/iːt/`
- **Current Example Sentence**: *"She was eating a banana"*
- **Audit Decision**: `APPROVE` (Green)
- **Severity**: `LOW` | **Failed Dimensions**: `NONE`
- **Reviewer Reason**: High quality across all dimensions: foundational A1 ingestion verb, natural Thai translation ("กิน, รับประทาน"), verified IPA, and clear learner example sentence.
- **Suggested Action**: No change required.
- **Provenance Warning**: `false`

---

### [#42] `end|noun|A1|sense:1`
- **Headword**: **end** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "either extremity of something that has length"
- **Current Thai Meaning**: "สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง"
- **Current Phonetic IPA**: `/end/`
- **Current Example Sentence**: *"the end of the pier"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe the physical extremity of an object, but Thai meaning is an empty generic template ("สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง").
- **Suggested Action**: Edit Thai meaning to "ปลาย, ส่วนปลาย, จุดสิ้นสุด".
- **Provenance Warning**: `false`

---

### [#43] `evening|noun|A1|sense:1`
- **Headword**: **evening** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "the latter part of the day (the period of decreasing daylight from late afternoon until nightfall)"
- **Current Thai Meaning**: "ช่วงเวลา ระยะเวลา หรือจังหวะเวลา"
- **Current Phonetic IPA**: `/ˈiːvnɪŋ/`
- **Current Example Sentence**: *"he enjoyed the evening light across the lake"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `MEDIUM` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition and example describe the period of late afternoon to nightfall, but Thai translation is a generic time template ("ช่วงเวลา ระยะเวลา หรือจังหวะเวลา").
- **Suggested Action**: Edit Thai meaning to "ตอนเย็น, ช่วงหัวค่ำ".
- **Provenance Warning**: `false`

---

### [#44] `example|noun|A1|sense:1`
- **Headword**: **example** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "an item of information that is typical of a class or group"
- **Current Thai Meaning**: "กลุ่มบุคคล องค์กร หรือหน่วยงาน"
- **Current Phonetic IPA**: `/ɪɡˈzæmpəl/`
- **Current Example Sentence**: *"this patient provides a typical example of the syndrome"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`
- **Reviewer Reason**: English definition describes a representative specimen/illustration, but Thai meaning is an erroneous collective group template ("กลุ่มบุคคล องค์กร หรือหน่วยงาน").
- **Suggested Action**: Edit Thai meaning to "ตัวอย่าง, แบบอย่าง".
- **Provenance Warning**: `false`

---

### [#45] `exercise|verb|A1|sense:1`
- **Headword**: **exercise** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "put to use"
- **Current Thai Meaning**: "ดำเนินการ หรือกระทำการตามลักษณะเฉพาะ"
- **Current Phonetic IPA**: `/ˈeksəɹˌsaɪz/`
- **Current Example Sentence**: *"Some parents exercise their infants"*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `thai_meaning`, `example_sentence`, `cefr_sense_coherence`, `provenance`
- **Reviewer Reason**: Severe CEFR and semantic distortion: synset 01211811-v defines formal execution ("put to use", e.g. exercise rights) paired with an anomalous transitive infant example (synset 00103377-v), completely missing A1 physical exercise ("ออกกำลังกาย").
- **Suggested Action**: Place on HOLD; re-anchor canonical synset to bodily fitness 00085444-v ("do physical exercise") with Thai "ออกกำลังกาย" and standard learner example.
- **Provenance Warning**: `true`

---

### [#46] `face|noun|A1|sense:1`
- **Headword**: **face** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "the front of the human head from the forehead to the chin and ear to ear"
- **Current Thai Meaning**: "ใบหน้า"
- **Current Phonetic IPA**: `/feɪs/`
- **Current Example Sentence**: *"he washed his face"*
- **Audit Decision**: `APPROVE` (Green)
- **Severity**: `LOW` | **Failed Dimensions**: `NONE`
- **Reviewer Reason**: High quality across all dimensions: anatomical A1 core noun, concise natural Thai ("ใบหน้า"), verified IPA, and clear learner example sentence.
- **Suggested Action**: No change required.
- **Provenance Warning**: `false`

---

### [#47] `fast|adjective|A1|sense:1`
- **Headword**: **fast** | **POS**: `adjective` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "acting or moving or capable of acting or moving quickly"
- **Current Thai Meaning**: "เร็ว, รวดเร็ว"
- **Current Phonetic IPA**: `/fæst/`
- **Current Example Sentence**: *"on the fast track in school"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `LOW` | **Failed Dimensions**: `example_sentence`
- **Reviewer Reason**: Definition and Thai translation are accurate for physical speed, but example sentence uses the figurative idiom "on the fast track in school" which may confuse A1 learners.
- **Suggested Action**: Edit example sentence to a clear physical speed context, e.g., "Cheetahs are very fast animals."
- **Provenance Warning**: `false`

---

### [#48] `fast|adverb|A1|sense:1`
- **Headword**: **fast** | **POS**: `adverb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "quickly or rapidly (often used as a combining form)"
- **Current Thai Meaning**: "เร็ว, อย่างรวดเร็ว"
- **Current Phonetic IPA**: `/fæst/`
- **Current Example Sentence**: *"how fast can he get here?"*
- **Audit Decision**: `APPROVE` (Green)
- **Severity**: `LOW` | **Failed Dimensions**: `NONE`
- **Reviewer Reason**: High quality: accurate adverb definition, concise natural Thai ("เร็ว, อย่างรวดเร็ว"), correct IPA, and natural learner question.
- **Suggested Action**: No change required.
- **Provenance Warning**: `false`

---

### [#49] `father|noun|A1|sense:1`
- **Headword**: **father** | **POS**: `noun` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "‘Father’ is a term of address for priests in some churches (especially the Roman Catholic Church or the Orthodox Catholic Church); ‘Padre’ is frequently used in the military"
- **Current Thai Meaning**: "สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง"
- **Current Phonetic IPA**: `/ˈfɑːðəɹ/`
- **Current Example Sentence**: *"hear our prayers, Heavenly Father"*
- **Audit Decision**: **`HOLD` (Red)**
- **Severity**: `HIGH` | **Failed Dimensions**: `english_meaning`, `thai_meaning`, `example_sentence`, `cefr_sense_coherence`, `provenance`
- **Reviewer Reason**: Fundamental sense distortion: ecclesiastical priestly title (synset 10261566-n) assigned to A1 foundational vocabulary instead of primary kinship term (male parent), accompanied by an empty placeholder Thai template.
- **Suggested Action**: Place on HOLD; re-anchor canonical synset to biological/family male parent 10080869-n ("a male parent"), update Thai to "พ่อ, บิดา" and provide everyday family example.
- **Provenance Warning**: `true`

---

### [#50] `feel|verb|A1|sense:1`
- **Headword**: **feel** | **POS**: `verb` | **CEFR**: `A1` | **Sense**: `1`
- **Current English Meaning**: "undergo an emotional sensation or be in a particular state of mind"
- **Current Thai Meaning**: "แสดงความรู้สึกหรือตอบสนองทางอารมณ์โดยการการปกครอง นโยบายสาธารณะ และบ้านเมือง ตามบริบทของความหมายที่เลือกไว้"
- **Current Phonetic IPA**: `/fiːl/`
- **Current Example Sentence**: *"I feel that he doesn't like me"*
- **Audit Decision**: `EDIT_REQUIRED` (Yellow)
- **Severity**: `HIGH` | **Failed Dimensions**: `thai_meaning`, `example_sentence`, `provenance`
- **Reviewer Reason**: Thai translation is severely contaminated with a bizarre public policy template ("...โดยการการปกครอง นโยบายสาธารณะ และบ้านเมือง..."), and example sentence comes from a different synset (00747728-v, opinion/belief) rather than emotional sensation (01829059-v).
- **Suggested Action**: Edit Thai meaning to "รู้สึก, มีความรู้สึก" and update example sentence to an emotional state (e.g. "I feel happy today.").
- **Provenance Warning**: `true`

---

---

## 6. Mandatory Confirmation Statement

> Phase 6.2.30A performed an independent content quality audit only. Zero production/staging database records were mutated, zero lifecycle statuses were changed, and no review approvals were executed.
