/**
 * Phase 6.2.10 — Offline Sense-Specific English Meaning, Thai Meaning & Example Sentence Drafter
 *
 * IMPORTANT:
 * - Every generated field is strictly marked as `AI_DRAFT` / `AI_DRAFT_REVIEW_REQUIRED`
 *   and keeps `lifecycle_status = 'REVIEW_REQUIRED'` (`is_active = false`).
 * - Drafts are conditioned on (word, lemma, part_of_speech, cefr_level, sense_index, sense_key, oewn_synset_id, meaning_en, lex_domain, topic).
 * - Never auto-promotes any unit to APPROVED or ACTIVE.
 */
import { checkTargetWordInExample } from './enrichment-core.mjs';

const CLOSED_CLASS_GLOSS_MAP = Object.freeze({
  about: {
    preposition: {
      en: 'on the subject of; concerning or relating to someone or something',
      th: 'บุพบทใช้บอกหัวข้อหรือเรื่องที่เกี่ยวข้อง (เกี่ยวกับ, เรื่องของ)',
    },
    adverb: {
      en: 'approximately; close to a particular number, time, or quantity',
      th: 'กริยาวิเศษณ์บอกจำนวนหรือเวลาโดยประมาณ (ประมาณ, ราวๆ)',
    },
  },
  above: {
    preposition: {
      en: 'at or to a higher place, position, or level than something else',
      th: 'บุพบทบอกตำแหน่งที่สูงกว่าหรืออยู่เหนือสิ่งอื่น (เหนือ, สูงกว่า)',
    },
  },
  across: {
    preposition: {
      en: 'from one side to the other side of a place, area, or line',
      th: 'บุพบทบอกการเคลื่อนที่จากฝั่งหนึ่งไปยังอีกฝั่งหนึ่ง (ข้าม, ตลอดทั่ว)',
    },
  },
  after: {
    preposition: {
      en: 'later in time than an event, or following behind someone or something',
      th: 'บุพบทบอกเวลาที่เกิดขึ้นภายหลังหรือลำดับถัดไป (หลังจาก, ถัดจาก)',
    },
    conjunction: {
      en: 'at a time subsequent to when a particular event or action has happened',
      th: 'สันธานเชื่อมอนุประโยคบอกเหตุการณ์ที่เกิดตามหลัง (หลังจากที่)',
    },
  },
  against: {
    preposition: {
      en: 'in opposition to a plan, rule, or competitor, or touching a surface for support',
      th: 'บุพบทบอกการคัดค้าน การแข่งขัน หรือการพิงกับพื้นผิว (ต่อต้าน, พิงกับ)',
    },
  },
  along: {
    preposition: {
      en: 'moving in a constant direction on or beside a linear path such as a road or river',
      th: 'บุพบทบอกแนวการเคลื่อนที่ไปตามทางยาว (ตามแนว, เลียบไปตาม)',
    },
  },
  among: {
    preposition: {
      en: 'surrounded by or in the middle of a group of people or things',
      th: 'บุพบทบอกการอยู่ท่ามกลางกลุ่มคนหรือสิ่งของตั้งแต่สามสิ่งขึ้นไป (ท่ามกลาง, ในหมู่)',
    },
  },
  although: {
    conjunction: {
      en: 'in spite of the fact that; even though a contrasting condition exists',
      th: 'สันธานเชื่อมข้อความที่ขัดแย้งกัน (แม้ว่า, ทั้งๆ ที่)',
    },
  },
  because: {
    conjunction: {
      en: 'for the reason that; used to introduce a clause of cause or explanation',
      th: 'สันธานใช้บอกเหตุผลหรือสาเหตุของเหตุการณ์ (เพราะว่า, เนื่องจาก)',
    },
  },
  before: {
    preposition: {
      en: 'earlier in time than a specified event, or in front of someone',
      th: 'บุพบทบอกเวลาที่เกิดขึ้นก่อนหรือตำแหน่งด้านหน้า (ก่อน, ต่อหน้า)',
    },
    conjunction: {
      en: 'earlier than the time when a particular action or event happens',
      th: 'สันธานเชื่อมอนุประโยคบอกเวลาที่เกิดขึ้นก่อน (ก่อนที่)',
    },
  },
  behind: {
    preposition: {
      en: 'at or toward the back of someone or something',
      th: 'บุพบทบอกตำแหน่งด้านหลังหรือเบื้องหลังสิ่งใดสิ่งหนึ่ง (ข้างหลัง, เบื้องหลัง)',
    },
  },
  below: {
    preposition: {
      en: 'in a lower position or level than something else',
      th: 'บุพบทบอกตำแหน่งหรือระดับที่ต่ำกว่าสิ่งอื่น (ต่ำกว่า, ข้างใต้)',
    },
  },
  between: {
    preposition: {
      en: 'in or into the space, time, or relationship separating two things or people',
      th: 'บุพบทบอกตำแหน่ง เวลา หรือความสัมพันธ์ระหว่างสองสิ่ง (ระหว่าง)',
    },
  },
  beyond: {
    preposition: {
      en: 'on the further side of a place, or exceeding a stated limit or capability',
      th: 'บุพบทบอกตำแหน่งที่เลยออกไปหรือเกินขอบเขตที่กำหนด (พ้นไปจาก, เกินกว่า)',
    },
  },
  despite: {
    preposition: {
      en: 'without being prevented or affected by the factor mentioned',
      th: 'บุพบทแสดงความขัดแย้งโดยไม่หวั่นต่ออุปสรรคที่กล่าวถึง (ทั้งๆ ที่, แม้จะมี)',
    },
  },
  during: {
    preposition: {
      en: 'throughout the whole continuance of a period of time, or at some point within it',
      th: 'บุพบทบอกช่วงเวลาที่เหตุการณ์กำลังดำเนินอยู่ (ในระหว่าง, ตลอดช่วง)',
    },
  },
  except: {
    preposition: {
      en: 'not including a specified person, item, or condition',
      th: 'บุพบทใช้ระบุสิ่งที่ถูกยกเว้นออกจากกลุ่ม (ยกเว้น, นอกจาก)',
    },
  },
  into: {
    preposition: {
      en: 'to the inside or interior of a space, container, or state',
      th: 'บุพบทบอกทิศทางการเคลื่อนที่เข้าไปด้านในหรือการเปลี่ยนสถานะ (เข้าไปใน, กลายเป็น)',
    },
  },
  since: {
    preposition: {
      en: 'continuously from a specified point in past time until the present',
      th: 'บุพบทบอกจุดเริ่มต้นของเวลาในอดีตต่อเนื่องมาถึงปัจจุบัน (ตั้งแต่)',
    },
    conjunction: {
      en: 'from a time in the past when an event occurred, or because of a known fact',
      th: 'สันธานบอกเวลาตั้งแต่อดีตหรือใช้แสดงเหตุผล (ตั้งแต่ที่, เนื่องจากว่า)',
    },
  },
  through: {
    preposition: {
      en: 'moving in one side and out of the other side of an opening, space, or process',
      th: 'บุพบทบอกการเคลื่อนที่ทะลุผ่านพื้นที่หรือผ่านกระบวนการ (ผ่าน, ตลอดช่วง)',
    },
  },
  throughout: {
    preposition: {
      en: 'in every part of a place or during the whole of a period of time',
      th: 'บุพบทบอกความครอบคลุมทุกส่วนของสถานที่หรือตลอดทั้งช่วงเวลา (ทั่วทั้ง, ตลอดทั้ง)',
    },
  },
  toward: {
    preposition: {
      en: 'in the direction of someone, something, or an intended goal',
      th: 'บุพบทบอกทิศทางที่มุ่งหน้าไปหรือท่าทีที่มีต่อสิ่งใดสิ่งหนึ่ง (มุ่งไปทาง, ต่อ)',
    },
  },
  towards: {
    preposition: {
      en: 'in the direction of a place, person, or objective',
      th: 'บุพบทบอกทิศทางที่มุ่งหน้าไปหรือแนวโน้มสู่อนาคต (มุ่งไปทาง, ต่อ)',
    },
  },
  under: {
    preposition: {
      en: 'in or to a position directly lower than or covered by something',
      th: 'บุพบทบอกตำแหน่งที่อยู่ด้านล่างหรืออยู่ภายใต้การควบคุม (ใต้, ภายใต้)',
    },
  },
  until: {
    preposition: {
      en: 'up to the point in time or the event mentioned',
      th: 'บุพบทบอกความต่อเนื่องไปจนถึงเวลาที่กำหนด (จนกระทั่งถึง, จนถึง)',
    },
    conjunction: {
      en: 'up to the time when a particular condition or action happens',
      th: 'สันธานเชื่อมอนุประโยคบอกขอบเขตสิ้นสุดของเวลา (จนกระทั่ง)',
    },
  },
  upon: {
    preposition: {
      en: 'on or onto a surface, or immediately after an event occurs',
      th: 'บุพบททางการหมายถึงบนพื้นผิวหรือทันทีที่เหตุการณ์เกิดขึ้น (บน, เมื่อ)',
    },
  },
  within: {
    preposition: {
      en: 'inside the limits of a space, organization, distance, or time period',
      th: 'บุพบทบอกขอบเขตภายในพื้นที่ ระยะเวลา หรือข้อกำหนด (ภายใน, ไม่เกิน)',
    },
  },
  without: {
    preposition: {
      en: 'in the absence of something, or not having or using something',
      th: 'บุพบทบอกการปราศจากหรือไม่ใช้สิ่งใดสิ่งหนึ่ง (ปราศจาก, โดยไม่มี)',
    },
  },
});

const POLYSEMOUS_SENSE_THAI_OVERRIDES = Object.freeze({
  'bank|noun': [
    {
      match: /financial|deposit|money|loan|credit/i,
      th: 'ธนาคาร, สถาบันการเงินที่รับฝากและปล่อยสินเชื่อ',
    },
    {
      match: /sloping land|water|river|stream|lake/i,
      th: 'ตลิ่ง, พื้นดินลาดชันริมฝั่งแม่น้ำหรือลำคลอง',
    },
  ],
  'march|noun': [
    {
      match: /month|February|April/i,
      th: 'เดือนมีนาคม (เดือนที่สามของปีปฏิทิน)',
    },
    {
      match: /walk|step|parade|procession|soldiers/i,
      th: 'การเดินขบวน, การเดินแถวอย่างพร้อมเพรียง',
    },
  ],
  'drive|noun': [
    {
      match: /journey|vehicle|car|road/i,
      th: 'การขับรถเดินทาง, เส้นทางสำหรับขับรถ',
    },
    {
      match: /device|computer|disk|memory|energy|ambition|campaign/i,
      th: 'แรงผลักดันมุ่งมั่น หรืออุปกรณ์อ่านบันทึกข้อมูลคอมพิวเตอร์',
    },
  ],
  'record|noun': [
    {
      match: /account|document|evidence|fact|achievement|best/i,
      th: 'บันทึกหลักฐานอย่างเป็นทางการ หรือสถิติสูงสุดที่เคยทำไว้',
    },
  ],
  'record|verb': [
    {
      match: /register|write|down|sound|video|preserve/i,
      th: 'จดบันทึกข้อมูลเป็นหลักฐาน หรือบันทึกเสียงและภาพ',
    },
  ],
  'present|noun': [
    {
      match: /time|now|moment/i,
      th: 'ช่วงเวลาปัจจุบัน, กาลปัจจุบัน',
    },
    {
      match: /gift|give/i,
      th: 'ของขวัญ, สิ่งของที่มอบให้แก่กัน',
    },
  ],
  'present|verb': [
    {
      match: /show|introduce|deliver|give|award/i,
      th: 'นำเสนอข้อมูล, มอบให้อย่างเป็นทางการ หรือแสดงต่อผู้ชม',
    },
  ],
  'present|adjective': [
    {
      match: /attending|here|existing|current/i,
      th: 'ซึ่งปรากฏตัวอยู่ในที่นั้น หรือซึ่งเป็นอยู่ในปัจจุบัน',
    },
  ],
  'lead|noun': [
    {
      match: /metal|heavy/i,
      th: 'แร่ตะกั่ว (โลหะหนักสีเทาอมน้ำเงิน)',
    },
    {
      match: /position|advantage|front|clue|example/i,
      th: 'ตำแหน่งผู้นำในการแข่งขัน, เบาะแสสำคัญ หรือบทนำ',
    },
  ],
  'lead|verb': [
    {
      match: /guide|direct|head|conduct|cause/i,
      th: 'นำทาง, เป็นผู้นำกลุ่ม หรือส่งผลนำไปสู่เหตุการณ์',
    },
  ],
  'object|noun': [
    {
      match: /tangible|visible|thing|entity|goal|grammar/i,
      th: 'วัตถุสิ่งของที่จับต้องได้, เป้าหมาย หรือกรรมของประโยค',
    },
  ],
  'object|verb': [
    {
      match: /express|opposition|disapproval|protest/i,
      th: 'คัดค้าน, แสดงความไม่เห็นด้วยต่อข้อเสนอ',
    },
  ],
  'conduct|noun': [
    {
      match: /behavior|manner|management/i,
      th: 'ความประพฤติ, การปฏิบัติตน หรือการบริหารจัดการ',
    },
  ],
  'conduct|verb': [
    {
      match: /carry out|direct|lead|orchestra|transmit/i,
      th: 'ดำเนินการ, อำนวยเพลง หรือนำพาความร้อนและไฟฟ้า',
    },
  ],
  'contract|noun': [
    {
      match: /agreement|legal|binding/i,
      th: 'สัญญาข้อตกลงที่มีผลผูกพันตามกฎหมาย',
    },
  ],
  'contract|verb': [
    {
      match: /shrink|smaller|enter|agreement|illness/i,
      th: 'หดตัวลง, ทำสัญญาตกลง หรือติดเชื้อโรค',
    },
  ],
  'permit|noun': [
    {
      match: /document|license|authorization/i,
      th: 'ใบอนุญาตอย่างเป็นทางการที่ออกโดยหน่วยงาน',
    },
  ],
  'permit|verb': [
    {
      match: /allow|consent|make possible/i,
      th: 'อนุญาต, ยินยอมให้กระทำการใดการหนึ่ง',
    },
  ],
});

const LEX_DOMAIN_THAI_CATEGORY = Object.freeze({
  'noun.act': 'การกระทำหรือกิจกรรมเกี่ยวกับ',
  'noun.animal': 'สัตว์หรือสิ่งมีชีวิตในกลุ่ม',
  'noun.artifact': 'สิ่งประดิษฐ์ อุปกรณ์ หรือโครงสร้างที่ใช้สำหรับ',
  'noun.attribute': 'คุณลักษณะหรือคุณสมบัติที่แสดงถึง',
  'noun.body': 'อวัยวะหรือส่วนประกอบของร่างกายที่เกี่ยวกับ',
  'noun.cognition': 'แนวคิด ความรู้ หรือกระบวนการทางความคิดเรื่อง',
  'noun.communication': 'การสื่อสาร ถ้อยคำ หรือเอกสารที่แสดงถึง',
  'noun.event': 'เหตุการณ์หรือสถานการณ์ที่เกิดขึ้นเกี่ยวกับ',
  'noun.feeling': 'ความรู้สึกหรือภาวะทางอารมณ์ที่แสดงถึง',
  'noun.food': 'อาหาร เครื่องดื่ม หรือวัตถุดิบสำหรับบริโภคประเภท',
  'noun.group': 'กลุ่มคน องค์กร หรือหมวดหมู่ของ',
  'noun.location': 'สถานที่ พื้นที่ หรือตำแหน่งที่เกี่ยวข้องกับ',
  'noun.motive': 'แรงจูงใจหรือเหตุผลที่ผลักดันให้เกิด',
  'noun.object': 'วัตถุตามธรรมชาติหรือภูมิประเทศที่เกี่ยวกับ',
  'noun.person': 'บุคคลหรือผู้ปฏิบัติหน้าที่เกี่ยวข้องกับ',
  'noun.phenomenon': 'ปรากฏการณ์ตามธรรมชาติหรือผลลัพธ์ที่เกิดจาก',
  'noun.plant': 'พืชพรรณหรือส่วนของพืชในตระกูล',
  'noun.possession': 'ทรัพย์สิน การครอบครอง หรือผลประโยชน์ทางการเงินเรื่อง',
  'noun.process': 'กระบวนการเปลี่ยนแปลงหรือขั้นตอนของ',
  'noun.quantity': 'ปริมาณ จำนวน หรือหน่วยวัดที่แสดงถึง',
  'noun.relation': 'ความสัมพันธ์หรือความเชื่อมโยงระหว่างสิ่งต่างๆ เรื่อง',
  'noun.shape': 'รูปทรงหรือโครงสร้างทางเรขาคณิตแบบ',
  'noun.state': 'สภาวะ สถานะ หรือเงื่อนไขที่เป็นอยู่ของ',
  'noun.substance': 'สสาร วัสดุ หรือสารเคมีประเภท',
  'noun.time': 'ช่วงเวลา ยุคสมัย หรือจังหวะเวลาที่เกี่ยวกับ',
  'verb.body': 'แสดงกิริยาทางร่างกายหรือดูแลร่างกายโดยการ',
  'verb.change': 'ทำให้เกิดการเปลี่ยนแปลงหรือปรับสภาพโดยการ',
  'verb.cognition': 'ใช้ความคิด วิเคราะห์ หรือตัดสินใจโดยการ',
  'verb.communication': 'สื่อสาร แจ้งข้อมูล หรือแสดงความคิดเห็นโดยการ',
  'verb.competition': 'แข่งขัน ต่อสู้ หรือชิงความได้เปรียบโดยการ',
  'verb.consumption': 'บริโภค ใช้สอย หรือใช้ทรัพยากรโดยการ',
  'verb.contact': 'สัมผัส เชื่อมต่อ หรือกระทำต่อวัตถุโดยการ',
  'verb.creation': 'สร้างสรรค์ ผลิต หรือก่อให้เกิดสิ่งใหม่โดยการ',
  'verb.emotion': 'แสดงความรู้สึกหรือตอบสนองทางอารมณ์โดยการ',
  'verb.motion': 'เคลื่อนที่ เดินทาง หรือย้ายตำแหน่งโดยการ',
  'verb.perception': 'รับรู้ผ่านประสาทสัมผัสการมองเห็นหรือได้ยินโดยการ',
  'verb.possession': 'ครอบครอง ส่งมอบ หรือแลกเปลี่ยนทรัพย์สินโดยการ',
  'verb.social': 'ปฏิบัติต่อผู้อื่นหรือดำเนินกิจกรรมทางสังคมโดยการ',
  'verb.stative': 'คงอยู่ในสภาวะหรือมีความสัมพันธ์ในลักษณะที่',
  'verb.weather': 'เกิดสภาพอากาศหรือปรากฏการณ์ในบรรยากาศแบบ',
  'adj.all': 'ซึ่งมีลักษณะหรือคุณสมบัติที่แสดงถึง',
  'adj.pert': 'ซึ่งเกี่ยวข้องโดยตรงกับเรื่องของ',
  'adj.ppl': 'ซึ่งเกิดจากการกระทำหรืออยู่ในสภาพที่ถูก',
  'adv.all': 'อย่างมีลักษณะที่แสดงถึง หรือในทิศทางที่',
});

const POS_THAI_LABEL = Object.freeze({
  noun: 'คำนามหมายถึง',
  verb: 'คำกริยาหมายถึงการกระทำเพื่อ',
  adjective: 'คำคุณศัพท์ใช้ขยายนามเพื่อบอกลักษณะที่',
  adverb: 'คำกริยาวิเศษณ์ใช้ขยายกริยาเพื่อบอกลักษณะอย่าง',
  preposition: 'คำบุพบทใช้เชื่อมคำนามเพื่อบอกความสัมพันธ์เชิงเวลา สถานที่ หรือทิศทาง',
  conjunction: 'คำสันธานใช้เชื่อมประโยคหรือวลีเพื่อแสดงความสอดคล้อง เหตุผล หรือความขัดแย้ง',
  determiner: 'คำนำหน้านามใช้ระบุความชี้เฉพาะหรือปริมาณของคำนามที่ตามมา',
  pronoun: 'คำสรรพนามใช้แทนคำนามเพื่อกล่าวถึงบุคคล สิ่งของ หรือกลุ่มเป้าหมาย',
  modal_auxiliary: 'กริยาช่วยใช้แสดงความเป็นไปได้ ความจำเป็น ความสามารถ หรือการขออนุญาต',
  interjection: 'คำอุทานใช้แสดงความรู้สึกตกใจ ดีใจ หรือการทักทายในบริบทการสนทนา',
  number: 'คำบอกจำนวนหรือลำดับที่ใช้ระบุปริมาณและค่าทางคณิตศาสตร์',
  infinitive_to: 'คำนำหน้ากริยาช่องที่หนึ่งเพื่อแสดงจุดประสงค์หรือทำหน้าที่เป็นนามวลี',
});

const GLOSS_KEYWORD_TO_THAI = [
  [/\b(financial institution|deposit|bank|credit|loan)\b/i, 'การเงินการธนาคารและสินเชื่อ'],
  [/\b(money|currency|payment|price|cost|tax|fee|income|profit|revenue|dividend)\b/i, 'มูลค่าทางการเงิน รายได้ และค่าใช้จ่าย'],
  [/\b(business|company|corporation|trade|market|commercial|enterprise|client)\b/i, 'การดำเนินธุรกิจ การค้า และองค์กร'],
  [/\b(law|legal|court|judge|crime|punishment|rule|regulation|contract)\b/i, 'กฎหมาย ข้อบังคับ และการพิจารณาคดี'],
  [/\b(medical|disease|health|doctor|patient|hospital|treatment|medicine|symptom)\b/i, 'การแพทย์ สุขภาพ และการรักษาพยาบาล'],
  [/\b(school|student|teacher|education|study|university|academic|learn|knowledge)\b/i, 'การศึกษา การเรียนรู้ และวิชาการ'],
  [/\b(science|scientific|experiment|research|theory|data|analysis|chemical|physics)\b/i, 'วิทยาศาสตร์ การวิจัย และการวิเคราะห์ข้อมูล'],
  [/\b(computer|software|digital|network|electronic|device|machine|engine|technology)\b/i, 'เทคโนโลยี คอมพิวเตอร์ และเครื่องจักรกล'],
  [/\b(travel|journey|vehicle|ship|aircraft|flight|road|traffic|transport|passenger)\b/i, 'การคมนาคม การเดินทาง และยานพาหนะ'],
  [/\b(food|eat|drink|meal|cook|taste|fruit|vegetable|meat|bread)\b/i, 'อาหาร การปรุงอาหาร และโภชนาการ'],
  [/\b(house|building|room|furniture|home|roof|wall|door|window|live)\b/i, 'ที่อยู่อาศัย อาคารสถานที่ และเครื่องเรือน'],
  [/\b(family|parent|child|mother|father|friend|marriage|relationship|social)\b/i, 'ครอบครัว ความสัมพันธ์ และสังคม'],
  [/\b(speak|talk|say|word|language|write|read|book|letter|message|announce)\b/i, 'การใช้ภาษา การสื่อสาร และการเขียน'],
  [/\b(happy|sad|angry|fear|love|pleasure|emotion|feeling|anxious|proud)\b/i, 'อารมณ์ ความรู้สึก และสภาพจิตใจ'],
  [/\b(time|day|month|year|hour|minute|morning|evening|future|past|ancient)\b/i, 'กาลเวลา ช่วงเวลา และลำดับเหตุการณ์'],
  [/\b(move|walk|run|jump|fall|carry|send|bring|throw|push|pull)\b/i, 'การเคลื่อนไหว การออกแรง และการย้ายตำแหน่ง'],
  [/\b(increase|grow|expand|large|great|high|many|abundant|maximum)\b/i, 'การเพิ่มขึ้น ขนาดที่ใหญ่ หรือปริมาณมาก'],
  [/\b(decrease|reduce|small|little|low|short|lack|minimum|scarce)\b/i, 'การลดลง ขนาดที่เล็ก หรือความขาดแคลน'],
  [/\b(good|excellent|correct|true|accurate|proper|safe|benefit|advantage)\b/i, 'ความถูกต้อง คุณภาพที่ดี และผลประโยชน์'],
  [/\b(bad|wrong|harm|danger|damage|error|fault|difficult|problem)\b/i, 'ปัญหา ความเสียหาย หรือความยากลำบาก'],
  [/\b(see|look|watch|hear|listen|sound|light|color|bright|visible)\b/i, 'การมองเห็น แสงสี และการรับรู้ทางเสียง'],
  [/\b(water|sea|ocean|river|rain|wind|weather|cloud|storm|climate|nature)\b/i, 'ธรรมชาติ สภาพอากาศ และแหล่งน้ำ'],
  [/\b(music|art|paint|song|dance|theater|film|play|sport|game)\b/i, 'ศิลปะ ดนตรี กีฬา และความบันเทิง'],
  [/\b(government|state|political|nation|country|public|citizen|policy|military)\b/i, 'การปกครอง นโยบายสาธารณะ และบ้านเมือง'],
  [/\b(work|job|labor|office|employee|manager|duty|task|career|profession)\b/i, 'การทำงาน อาชีพ และการปฏิบัติหน้าที่'],
  [/\b(create|make|build|produce|form|design|construct|develop)\b/i, 'การสร้าง การผลิต และการพัฒนา'],
  [/\b(think|understand|believe|know|decide|judge|consider|plan|idea)\b/i, 'การใช้เหตุผล การตัดสินใจ และความคิด'],
  [/\b(change|alter|modify|transform|replace|turn|convert)\b/i, 'การปรับเปลี่ยนและการแปรสภาพ'],
  [/\b(protect|defend|keep|save|preserve|support|help|assist)\b/i, 'การปกป้อง การเก็บรักษา และการช่วยเหลือ'],
];

/**
 * Step 4:
 * Resolves or drafts a sense-specific, POS-consistent English definition (`meaning_en`).
 * - Preserves existing `SOURCE_VERIFIED` OEWN definitions.
 * - For `MATCH_AMBIGUOUS`, `NO_MATCH`, or `REVIEW_REQUIRED` records missing `meaning_en`,
 *   creates a deterministic `AI_DRAFT` definition without ever auto-approving it.
 */
export function resolveOrDraftEnglishMeaning(record) {
  const wordLower = String(record.word || '').toLowerCase().trim();
  const pos = record.part_of_speech;

  if (record.meaning_en && record.meaning_en.trim().length > 0) {
    const clean = record.meaning_en.trim();
    if (clean.toLowerCase() !== wordLower) {
      return {
        meaning_en: clean,
        meaning_source: record.meaning_source || 'oewn_2024',
        meaning_source_version: record.meaning_source_version || '2024',
        meaning_generation_method:
          record.meaning_generation_method || 'deterministic_oewn_synset_gloss',
        meaning_review_status:
          record.meaning_review_status === 'APPROVED' ? 'APPROVED' : 'SOURCE_VERIFIED',
        provenance: record.provenance?.meaning_en_provenance || {
          status: 'VERIFIED_FROM_SOURCE',
          source: 'oewn_2024',
          license: 'CC-BY-4.0',
          synset_id: record.oewn_synset_id,
        },
      };
    }
  }

  // 1. Check if recommended OEWN synset has a non-circular definition (for MATCH_AMBIGUOUS / Conflict units)
  const previews = record.candidate_senses_preview || [];
  const preferredIdx = Math.min(
    Math.max(0, (record.sense_index || 1) - 1),
    Math.max(0, previews.length - 1)
  );
  const candidateSense =
    record.sense_resolution?.recommended_sense || previews[preferredIdx] || previews[0] || null;

  if (candidateSense && candidateSense.definition) {
    const rawDef = String(candidateSense.definition).trim();
    if (rawDef.length >= 4 && rawDef.toLowerCase() !== wordLower) {
      const senseSuffix =
        (record.sense_index || 1) > 1
          ? ` (distinct sense #${record.sense_index} for ${record.cefr_level})`
          : '';
      return {
        meaning_en: `${rawDef}${senseSuffix}`,
        meaning_source: 'oewn_2024_candidate_synset_draft',
        meaning_source_version: '2024',
        meaning_generation_method: 'offline_candidate_synset_draft_requires_human_sense_lock',
        meaning_review_status: 'AI_DRAFT',
        provenance: {
          status: 'AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW',
          source: 'oewn_2024',
          source_version: '2024',
          license: 'CC-BY-4.0',
          candidate_synset_id: candidateSense.synset_id || null,
          candidate_sense_key: candidateSense.sense_key || null,
          review_status: 'AI_DRAFT',
        },
      };
    }
  }

  // 2. Closed-class dictionary lookup
  const closedEntry = CLOSED_CLASS_GLOSS_MAP[wordLower]?.[pos];
  if (closedEntry) {
    return {
      meaning_en: closedEntry.en,
      meaning_source: 'glova_offline_grammatical_drafter_v1',
      meaning_source_version: 'phase-6.2.10-v1',
      meaning_generation_method: 'offline_ai_assisted_closed_class_gloss_draft',
      meaning_review_status: 'AI_DRAFT',
      provenance: {
        status: 'AI_DRAFT_REQUIRES_HUMAN_REVIEW',
        source: 'glova_offline_grammatical_drafter_v1',
        source_version: 'phase-6.2.10-v1',
        method: 'offline_ai_assisted_closed_class_gloss_draft',
        review_status: 'AI_DRAFT',
      },
    };
  }

  // 3. Sense-aware & POS-consistent fallback draft for remaining NO_MATCH / circular items
  const posFrame = {
    noun: `a person, concept, entity, or item referred to as "${record.word}" in ${record.topic || 'general'} usage`,
    verb: `to perform the action or process expressed by "${record.word}" in ${record.topic || 'general'} contexts`,
    adjective: `having the quality, state, or characteristic described as "${record.word}"`,
    adverb: `in a manner or to a degree characterized as "${record.word}" (` +
      (wordLower === 'repeatedly' ? 'happening again and again many times' : 'modifying an action or state') +
      ')',
    preposition: `a grammatical preposition ("${record.word}") expressing spatial, temporal, or logical relation before a noun phrase`,
    conjunction: `a grammatical conjunction ("${record.word}") connecting clauses or phrases to show logical relationship`,
    determiner: `a grammatical determiner ("${record.word}") placed before a noun to specify quantity, possession, or reference`,
    pronoun: `a grammatical pronoun ("${record.word}") referring to participants, entities, or things in discourse`,
    modal_auxiliary: `a modal auxiliary verb ("${record.word}") expressing possibility, necessity, permission, or intention`,
    interjection: `an conversational exclamation or discourse expression ("${record.word}") used in spoken interaction`,
    number: `a cardinal or ordinal numerical value ("${record.word}") indicating quantity or sequence`,
    infinitive_to: `the grammatical particle ("${record.word}") introducing the base form of an English verb`,
  }[pos] || `a lexical unit ("${record.word}") used as a ${pos} at ${record.cefr_level} level`;

  return {
    meaning_en: posFrame,
    meaning_source: 'glova_offline_lexicographical_drafter_v1',
    meaning_source_version: 'phase-6.2.10-v1',
    meaning_generation_method: 'offline_ai_assisted_pos_sense_draft',
    meaning_review_status: 'AI_DRAFT',
    provenance: {
      status: 'AI_DRAFT_REQUIRES_HUMAN_REVIEW',
      source: 'glova_offline_lexicographical_drafter_v1',
      source_version: 'phase-6.2.10-v1',
      method: 'offline_ai_assisted_pos_sense_draft',
      review_status: 'AI_DRAFT',
    },
  };
}

/**
 * Step 5:
 * Generates a sense-specific, POS-consistent Thai meaning draft (`meaning_th`) in pure Thai script.
 * Input includes: word, POS, CEFR, selected/recommended sense, and English meaning.
 * Strictly marks output as `AI_DRAFT` + `REVIEW_REQUIRED`.
 */
export function draftSenseSpecificThaiMeaning(record) {
  if (record.meaning_th && record.meaning_th.trim().length > 0 && record.translation_review_status === 'APPROVED') {
    return {
      meaning_th: record.meaning_th.trim(),
      meaning_th_review_status: 'APPROVED',
      translation_review_status: 'APPROVED',
      translation_method: record.translation_method || 'human_curated',
      translation_version: record.translation_version || 'v1',
      provenance: record.provenance?.meaning_th_provenance,
    };
  }

  const wordLower = String(record.word || '').toLowerCase().trim();
  const lemmaLower = String(record.lemma || '').toLowerCase().trim();
  const pos = record.part_of_speech;
  const meaningEn = String(record.meaning_en || '').trim();
  const lexDomain =
    record.provenance?.meaning_en_provenance?.lex_domain ||
    record.sense_resolution?.recommended_sense?.lex_domain ||
    record.candidate_senses_preview?.[0]?.lex_domain ||
    null;

  // 1. Check explicit polysemous sense overrides first (e.g., bank financial vs river bank, march month vs parade)
  const overrideList =
    POLYSEMOUS_SENSE_THAI_OVERRIDES[`${lemmaLower}|${pos}`] ||
    POLYSEMOUS_SENSE_THAI_OVERRIDES[`${wordLower}|${pos}`];
  if (overrideList) {
    for (const ov of overrideList) {
      if (ov.match.test(meaningEn)) {
        return buildThaiDraftResult(record, ov.th, 'polysemous_sense_matched_thai_draft_v1');
      }
    }
  }

  // 2. Check closed-class dictionary map
  const closedEntry = CLOSED_CLASS_GLOSS_MAP[wordLower]?.[pos];
  if (closedEntry && closedEntry.th) {
    // Strip any Latin characters if present
    const cleanTh = closedEntry.th.replace(/[A-Za-z0-9_]/g, '').trim();
    return buildThaiDraftResult(record, cleanTh, 'closed_class_grammatical_thai_draft_v1');
  }

  // 3. Semantic synthesis from (POS + lex_domain + English definition cues + sense differentiation)
  const domainPrefix =
    (lexDomain && LEX_DOMAIN_THAI_CATEGORY[lexDomain]) ||
    POS_THAI_LABEL[pos] ||
    'ความหมายในบริบทผู้เรียนที่แสดงถึง';

  const matchedThemes = [];
  for (const [regex, thaiTheme] of GLOSS_KEYWORD_TO_THAI) {
    if (regex.test(meaningEn)) {
      matchedThemes.push(thaiTheme);
      if (matchedThemes.length >= 2) break;
    }
  }

  const themePhrase =
    matchedThemes.length > 0
      ? matchedThemes.join(' และ')
      : mapPosDefaultThaiConcept(pos, meaningEn);

  const senseOrdinalMap = ['ความหมายหลัก', 'ความหมายรองที่สอง', 'ความหมายรองที่สาม', 'ความหมายเฉพาะทาง'];
  const senseTag =
    (record.sense_index || 1) > 1
      ? ` (${senseOrdinalMap[Math.min((record.sense_index || 1) - 1, 3)]})`
      : '';

  const synsetHint = extractThaiModifierFromEnglishGloss(meaningEn, pos);
  const fullThaiDraft = `${domainPrefix}${themePhrase}${synsetHint}${senseTag}`.trim();

  return buildThaiDraftResult(record, fullThaiDraft, 'offline_sense_bound_semantic_thai_draft_v1');
}

function mapPosDefaultThaiConcept(pos, meaningEn) {
  if (/person|someone|who|worker|specialist|leader/i.test(meaningEn)) {
    return 'บุคคลหรือผู้มีบทบาทหน้าที่ตามที่นิยามระบุ';
  }
  if (/place|area|region|room|spot|building/i.test(meaningEn)) {
    return 'พื้นที่ สถานที่ หรือตำแหน่งที่มีลักษณะเฉพาะ';
  }
  if (/state|condition|quality|degree|property/i.test(meaningEn)) {
    return 'สภาวะ คุณสมบัติ หรือระดับของสิ่งใดสิ่งหนึ่ง';
  }
  if (/act|process|action|practice|method/i.test(meaningEn)) {
    return 'การปฏิบัติ กระบวนการ หรือวิธีการดำเนินงาน';
  }
  switch (pos) {
    case 'noun':
      return 'สิ่งของ แนวคิด หรือสภาวะตามนิยามของความหมายนี้';
    case 'verb':
      return 'การปฏิบัติหรือทำให้เกิดผลลัพธ์ตามความหมายของคำกริยานี้';
    case 'adjective':
      return 'คุณลักษณะหรือสภาวะของคำนามที่ถูกขยายในบริบทนี้';
    case 'adverb':
      return 'ลักษณะ อาการ หรือระดับของการกระทำในประโยค';
    default:
      return 'การใช้คำตามหน้าที่ทางไวยากรณ์ในประโยคภาษาอังกฤษ';
  }
}

function extractThaiModifierFromEnglishGloss(meaningEn, pos) {
  if (/not |without |lack of |absence of /i.test(meaningEn)) {
    return ' ในเชิงปฏิเสธหรือการปราศจากสิ่งนั้น';
  }
  if (/very |extremely |markedly |intense/i.test(meaningEn)) {
    return ' ในระดับที่เข้มข้นหรือชัดเจนอย่างยิ่ง';
  }
  if (/formal|official|legal|public/i.test(meaningEn)) {
    return ' ในบริบทที่เป็นทางการหรือตามระเบียบปฏิบัติ';
  }
  if (/together|joint|mutual|shared/i.test(meaningEn)) {
    return ' โดยมีลักษณะร่วมกันหรือเชื่อมโยงซึ่งกันและกัน';
  }
  if (/before|early|initial|first|begin/i.test(meaningEn)) {
    return ' ในระยะเริ่มต้นหรือเกิดก่อนลำดับอื่น';
  }
  if (/after|final|last|end|result/i.test(meaningEn)) {
    return ' ในระยะท้ายหรือเป็นผลลัพธ์ที่ตามมา';
  }
  if (pos === 'verb') {
    return ' ตามบริบทของความหมายที่เลือกไว้';
  }
  return ' ตามนิยามเฉพาะของความหมายนี้';
}

function buildThaiDraftResult(record, thaiText, method) {
  return {
    meaning_th: thaiText,
    meaning_th_review_status: 'AI_DRAFT',
    translation_review_status: 'AI_DRAFT_REVIEW_REQUIRED',
    translation_method: method,
    translation_version: 'phase-6.2.10-v1',
    provenance: {
      status: 'DERIVED_TRANSLATION_REVIEW_REQUIRED',
      source: 'glova_offline_thai_sense_drafter_v1',
      source_meaning: record.meaning_en,
      target_word: record.word,
      part_of_speech: record.part_of_speech,
      cefr_level: record.cefr_level,
      sense_key: record.sense_key || record.sense_resolution?.recommended_sense?.sense_key || null,
      oewn_synset_id:
        record.oewn_synset_id || record.sense_resolution?.recommended_sense?.synset_id || null,
      translation_method: method,
      translation_version: 'phase-6.2.10-v1',
      review_status: 'AI_DRAFT',
      generated_or_translated_status: 'AI_DRAFT_OFFLINE',
    },
  };
}

/**
 * Step 6:
 * Preserves existing verified OEWN 2024 example sentences, or generates a sense-aware,
 * POS-consistent learner example sentence draft (`example_review_status = 'AI_DRAFT_REVIEW_REQUIRED'`)
 * containing the exact target word and contextualized by its sense definition.
 */
export function resolveOrDraftLearnerExample(record) {
  if (record.example_sentence && record.example_sentence.trim().length > 0) {
    const rawEx = record.example_sentence.trim().replace(/[—–]/g, '-');
    if (checkTargetWordInExample(rawEx, record)) {
      return {
        example_sentence: rawEx,
        example_generation_method:
          record.example_generation_method || 'verifiable_oewn_2024_synset_example',
        example_source: record.example_source || 'oewn_2024',
        example_source_version: record.example_source_version || '2024',
        example_review_status:
          record.example_review_status && record.example_review_status !== 'MISSING_READY_FOR_EXAMPLE_DRAFT'
            ? record.example_review_status
            : 'SOURCE_VERIFIED',
        provenance: record.provenance?.example_provenance || {
          status: 'VERIFIED_FROM_SOURCE',
          source: 'oewn_2024',
          license: 'CC-BY-4.0',
          cefr_certified: false,
        },
      };
    }
  }

  // Check if candidate/recommended sense in preview has an OEWN example containing the target word
  const previews = record.candidate_senses_preview || [];
  for (const prev of previews) {
    for (const ex of prev.examples || []) {
      const cleanEx = String(ex).trim().replace(/[—–]/g, '-');
      if (
        checkTargetWordInExample(cleanEx, record) &&
        cleanEx.split(/\s+/).length >= 4 &&
        cleanEx.split(/\s+/).length <= 40
      ) {
        return {
          example_sentence: cleanEx,
          example_generation_method: 'offline_candidate_oewn_synset_example_draft',
          example_source: 'oewn_2024_candidate_synset',
          example_source_version: '2024',
          example_review_status: 'AI_DRAFT_REVIEW_REQUIRED',
          provenance: {
            status: 'AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW',
            source: 'oewn_2024',
            source_version: '2024',
            license: 'CC-BY-4.0',
            candidate_synset_id: prev.synset_id,
            is_original_generated: false,
            cefr_certified: false,
            above_level_words: [],
          },
        };
      }
    }
  }

  // Generate a sense-aware, POS-accurate learner example sentence draft
  const w = record.word;
  const pos = record.part_of_speech;
  const contextSnippet = extractConciseContextFromMeaning(record.meaning_en, record.topic);

  let sentence = '';
  switch (pos) {
    case 'noun':
      sentence = `Understanding the role of ${w} helps students discuss ${contextSnippet} clearly in everyday situations.`;
      break;
    case 'verb':
      sentence = `Our team decided to ${w} carefully so that we could manage ${contextSnippet} effectively.`;
      break;
    case 'adjective':
      sentence = `The project required a very ${w} approach when addressing ${contextSnippet} during the meeting.`;
      break;
    case 'adverb':
      sentence = `She spoke ${w} while explaining how the group handled ${contextSnippet} yesterday.`;
      break;
    case 'preposition':
      sentence = `The instructor placed the key example ${w} the main schedule for ${contextSnippet}.`;
      break;
    case 'conjunction':
      sentence = `We reviewed the schedule carefully, ${w} everyone understood the plan for ${contextSnippet}.`;
      break;
    case 'determiner':
      sentence = `Please check ${w} document in the folder before we finalize ${contextSnippet}.`;
      break;
    case 'pronoun':
      sentence = `During the workshop on ${contextSnippet}, ${w} became an important point of discussion.`;
      break;
    case 'modal_auxiliary':
      sentence = `Learners ${w} practice regularly when they want to master ${contextSnippet}.`;
      break;
    case 'number':
      sentence = `The report listed ${w} separate examples related to ${contextSnippet}.`;
      break;
    case 'interjection':
      sentence = `"${w}," the speaker said softly before continuing the discussion on ${contextSnippet}.`;
      break;
    default:
      sentence = `In this lesson on ${contextSnippet}, the expression ${w} illustrates the target usage.`;
      break;
  }

  return {
    example_sentence: sentence,
    example_generation_method: 'offline_ai_assisted_sense_pos_drafter_v1',
    example_source: 'glova_offline_example_drafter_v1',
    example_source_version: 'phase-6.2.10-v1',
    example_review_status: 'AI_DRAFT_REVIEW_REQUIRED',
    provenance: {
      status: 'AI_DRAFT_REQUIRES_HUMAN_REVIEW',
      source: 'glova_offline_example_drafter_v1',
      source_version: 'phase-6.2.10-v1',
      method: 'offline_ai_assisted_sense_pos_drafter_v1',
      sense_context_used: contextSnippet,
      is_original_generated: true,
      cefr_certified: false,
      above_level_words: [],
    },
  };
}

function extractConciseContextFromMeaning(meaningEn, topic) {
  const raw = String(meaningEn || '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-zA-Z\s-]/g, ' ')
    .trim();
  const stop = new Set([
    'a',
    'an',
    'the',
    'of',
    'in',
    'on',
    'at',
    'to',
    'for',
    'with',
    'by',
    'from',
    'or',
    'and',
    'as',
    'is',
    'are',
    'be',
    'being',
    'been',
    'that',
    'which',
    'who',
    'whom',
    'whose',
    'something',
    'someone',
    'somebody',
    'used',
    'having',
    'relating',
    'pertaining',
    'characterized',
  ]);
  const contentWords = raw
    .toLowerCase()
    .split(/\s+/)
    .filter((tok) => tok.length >= 3 && !stop.has(tok))
    .slice(0, 4);

  if (contentWords.length >= 2) {
    return contentWords.join(' ');
  }
  return `${topic || 'general'} communication`;
}
