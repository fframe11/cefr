# Phase 6.2.35 — NECTEC LEXiTRON 2.0 License Reconciliation Audit

## Executive Summary
This document provides the authoritative legal and lexicographical reconciliation of the **NECTEC LEXiTRON 2.0** dictionary database license, reconciling:
1. The official license files (`LICENSE.txt` and `LICENSE-th.txt`) distributed by NECTEC.
2. The Open Government Data catalog listings ([Data.go.th](https://data.go.th/) and [Open-D NSTDA](https://opend.nstda.or.th/)).
3. Previous Phase 6.2.34 informal labeling ("NECTEC Non-Commercial Educational License").

---

## Authoritative License Inspection Findings

### 1. Published License Agreement Text
The authoritative license included with the LEXiTRON dataset distribution is titled:
- **English**: `LICENSE AGREEMENT (National Electronics and Computer Technology Center - NECTEC, 2003)`
- **Thai**: `ข้อตกลงการอนุญาตใช้สิทธิ์ (ศูนย์เทคโนโลยีอิเล็กทรอนิกส์และคอมพิวเตอร์แห่งชาติ พ.ศ. 2546)`

### 2. Operational Terms of Use (Section 3)
Section 3 explicitly grants redistribution and modification rights:
> *"Redistribution and use in source and binary form, with or without modification, are permitted provided that all of the following conditions are met..."*
>
> *(การเผยแพร่ต่อและการใช้พจนานุกรมเล็กซิตรอน ทั้งในรูปแบบรหัสต้นฉบับ และรูปแบบไบนารี ไม่ว่าจะมีการแก้ไขดัดแปลงหรือไม่ก็ตาม สามารถกระทำได้ภายใต้เงื่อนไข ดังนี้)*

The conditions imposed are:
- **3(a) & 3(b)**: Retain copyright notice, Acceptance of License Agreement, Terms of Use, and Section 4 Disclaimer in source code and documentation.
- **3(c) Mandatory Attribution**: Any product created and redistributed must include the exact statement:
  - English: `"This product is created by the adaptation of LEXiTRON developed by NECTEC (http://www.nectec.or.th/)."`
  - Thai: `"ผลิตภัณฑ์นี้สร้างสรรค์ขึ้นโดยดัดแปลงมาจากพจนานุกรมเล็กซิตรอนซึ่งพัฒนาโดยศูนย์เทคโนโลยีอิเล็กทรอนิกส์และคอมพิวเตอร์แห่งชาติ (http://www.nectec.or.th)"`
- **3(d) Naming Restriction**: Products derived from the adaptation must **NOT** be called "LEXiTRON" or "เล็กซิตรอน", nor may "LEXiTRON" appear in their name without prior written permission.
- **3(e) Liability**: Must not use LEXiTRON in a manner causing damage to NECTEC or third parties.
- **3(f) Endorsement Restriction**: Neither the name NECTEC nor NSTDA may be used to endorse or promote derived products without specific prior written permission.

### 3. Factual Correction of Previous Phase Descriptions
Previous notes casually described the license as a *"Non-Commercial Educational License"*.
**Audit Finding**: This description was **inaccurate**.
The actual text of Section 3 does **not** restrict usage to non-commercial or academic research only. It is a modified BSD-style permissive open attribution license.
The confusion historically arose because:
1. In the late 1990s, NECTEC licensed commercial CD-ROM standalone software under separate commercial transfer contracts.
2. The raw dataset repository (etlex/tlex), however, was released under the 2003 permissive License Agreement and subsequently cataloged on Thailand's Open Government Data Portal under "Open Data Common".

---

## Compliance Requirements for Glova Platform
To maintain 100% compliance with NECTEC's authoritative terms:
1. **Mandatory Citation**: Include the required attribution in all learning unit provenance records and in public documentation.
2. **Brand Separation**: Ensure the application is branded strictly as **Glova** (or Glova English), never using the name "LEXiTRON" as the product name.
3. **No Endorsement Claim**: Never claim or imply that NECTEC or NSTDA endorses or certifies Glova's CEFR levels or learning content.
4. **Snapshot Integrity**: Preserve `LICENSE.txt` and `LICENSE-th.txt` unmodified alongside all local lexical snapshots in `data/lexical-sources/lexitron/2.0/`.

---

## Verdict
- **Status**: **RECONCILED_AND_CONFIRMED**
- **Effective License**: `NECTEC-LEXiTRON-License-Agreement-2003` (Permissive with Attribution and Naming Restriction)
- **License Conflict**: **NONE** (Official English and Thai terms are aligned).
