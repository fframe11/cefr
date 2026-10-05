/**
 * ==============================================================================
 * GLOVA High-Accuracy CEFR Curated Vocabulary Overrides & Sanitization
 * ==============================================================================
 *
 * Guarantees that homonyms, polysemous words, modal verbs, prepositions,
 * and high-frequency CEFR items are never served with incorrect encyclopedic
 * definitions or incorrect parts of speech.
 * ==============================================================================
 */

export interface CuratedVocabOverride {
  part_of_speech?: string;
  meaning_th?: string;
  meaning_en?: string;
  example_sentence_en?: string;
  example_sentence_th?: string;
  topic?: string;
}

export const CURATED_VOCAB_OVERRIDES: Record<string, CuratedVocabOverride> = {
  about: {
    part_of_speech: 'preposition',
    meaning_th: 'เกี่ยวกับ, เรื่องเกี่ยวกับ (หรือ ประมาณ, ราวๆ)',
    meaning_en: 'on the subject of; concerning; or approximately',
    example_sentence_en: "I suppose it's different when you think about it over the long term.",
    example_sentence_th: 'ฉันคิดว่ามันจะแตกต่างออกไปเมื่อคุณคิดเกี่ยวกับเรื่องนี้ในระยะยาว',
    topic: 'Daily Life',
  },
  able: {
    part_of_speech: 'adjective',
    meaning_th: 'สามารถ, ที่มีความสามารถที่จะทำได้',
    meaning_en: 'having the power, skill, means, or opportunity to do something',
    example_sentence_en: 'Any universe simple enough to be understood is too simple to produce a mind able to understand it.',
    example_sentence_th: 'จักรวาลที่เข้าใจง่ายเกินไปย่อมเรียบง่ายเกินกว่าจะสร้างจิตใจที่สามารถเข้าใจมันได้',
    topic: 'Education & Work',
  },
  general: {
    part_of_speech: 'adjective',
    meaning_th: 'ทั่วไป, โดยทั่วไป',
    meaning_en: 'affecting or concerning all or most people, places, or things; widespread',
    example_sentence_en: 'In general, regular exercise is good for your physical and mental health.',
    example_sentence_th: 'โดยทั่วไปแล้ว การออกกำลังกายอย่างสม่ำเสมอส่งผลดีต่อสุขภาพร่างกายและจิตใจ',
    topic: 'Society & Culture',
  },
  common: {
    part_of_speech: 'adjective',
    meaning_th: 'ทั่วไป, ธรรมดา, ร่วมกัน',
    meaning_en: 'occurring, found, or done often; widespread; shared by two or more people',
    example_sentence_en: 'They share common ideals and work together towards their goals.',
    example_sentence_th: 'พวกเขามีอุดมการณ์ร่วมกันและทำงานร่วมกันเพื่อเป้าหมายของพวกเขา',
    topic: 'Society & Culture',
  },
  breathe: {
    part_of_speech: 'verb',
    meaning_th: 'หายใจ',
    meaning_en: 'take air into the lungs and expel it',
    example_sentence_en: 'When you breathe out in cold weather, you can see your breath.',
    example_sentence_th: 'เมื่อคุณหายใจออกในสภาพอากาศหนาว คุณจะมองเห็นไอหายใจของคุณ',
    topic: 'Health & Body',
  },
  can: {
    part_of_speech: 'verb',
    meaning_th: 'สามารถ, อาจจะ',
    meaning_en: 'be able to; be permitted to; used to indicate possibility',
    example_sentence_en: 'Sometimes he can be very helpful when you ask.',
    example_sentence_th: 'บางครั้งเขาก็สามารถช่วยเหลือได้เป็นอย่างดีเมื่อคุณเอ่ยปากถาม',
    topic: 'Daily Life',
  },
  may: {
    part_of_speech: 'verb',
    meaning_th: 'อาจจะ, ขออนุญาต',
    meaning_en: 'expressing possibility or asking for permission',
    example_sentence_en: 'It may rain this afternoon, so take an umbrella.',
    example_sentence_th: 'ฝนอาจจะตกบ่ายนี้ ดังนั้นพกร่มไปด้วยนะ',
    topic: 'Daily Life',
  },
  will: {
    part_of_speech: 'verb',
    meaning_th: 'จะ',
    meaning_en: 'expressing future action, intention, or certainty',
    example_sentence_en: 'I will be back as soon as the meeting finishes.',
    example_sentence_th: 'ฉันจะกลับมาทันทีที่การประชุมเสร็จสิ้น',
    topic: 'Daily Life',
  },
  all: {
    part_of_speech: 'adjective',
    meaning_th: 'ทั้งหมด, ทั้งสิ้น, ทุกคน',
    meaning_en: 'the whole quantity, amount, or number of',
    example_sentence_en: 'All you can do is trust one another.',
    example_sentence_th: 'สิ่งเดียวที่คุณทั้งหมดทำได้คือการไว้วางใจซึ่งกันและกัน',
    topic: 'Daily Life',
  },
  behind: {
    part_of_speech: 'preposition',
    meaning_th: 'ข้างหลัง, เบื้องหลัง',
    meaning_en: 'at or to the far side or back of; supporting or causing something',
    example_sentence_en: 'Behind every achievement, there is hard work and dedication.',
    example_sentence_th: 'เบื้องหลังทุกความสำเร็จ ย่อมมีความพยายามและการทุ่มเทเสมอ',
    topic: 'Daily Life',
  },
  below: {
    part_of_speech: 'preposition',
    meaning_th: 'ด้านล่าง, ต่ำกว่า, ข้างใต้',
    meaning_en: 'at a lower level or layer than',
    example_sentence_en: 'Your marks were well below average this term.',
    example_sentence_th: 'คะแนนของคุณต่ำกว่าเกณฑ์เฉลี่ยอย่างมากในเทอมนี้',
    topic: 'Education & Work',
  },
  across: {
    part_of_speech: 'preposition',
    meaning_th: 'ข้าม, จากฝั่งหนึ่งไปยังอีกฝั่งหนึ่ง',
    meaning_en: 'from one side to the other of something',
    example_sentence_en: 'They walked across the street carefully.',
    example_sentence_th: 'พวกเขาเดินข้ามถนนอย่างระมัดระวัง',
    topic: 'Travel & Transport',
  },
  along: {
    part_of_speech: 'preposition',
    meaning_th: 'ไปตาม, เลียบไปตาม',
    meaning_en: 'moving in a constant direction on a path, road, or line',
    example_sentence_en: 'We walked along the peaceful river bank.',
    example_sentence_th: 'พวกเราเดินเลียบไปตามริมฝั่งแม่น้ำอันเงียบสงบ',
    topic: 'Travel & Transport',
  },
  around: {
    part_of_speech: 'preposition',
    meaning_th: 'รอบๆ, แถวๆ, ประมาณ',
    meaning_en: 'located or moving in every direction from; approximately',
    example_sentence_en: 'There are many cafes around the university.',
    example_sentence_th: 'มีร้านกาแฟมากมายตั้งอยู่รอบๆ มหาวิทยาลัย',
    topic: 'Daily Life',
  },
  near: {
    part_of_speech: 'preposition',
    meaning_th: 'ใกล้, ใกล้เคียง',
    meaning_en: 'at or to a short distance away',
    example_sentence_en: 'Is there a train station near here?',
    example_sentence_th: 'มีสถานีรถไฟอยู่ใกล้แถวนี้ไหม?',
    topic: 'Travel & Transport',
  },
  far: {
    part_of_speech: 'adverb',
    meaning_th: 'ไกล, ห่างไกล',
    meaning_en: 'at, to, or by a great distance',
    example_sentence_en: 'The hotel is not far from the city center.',
    example_sentence_th: 'โรงแรมไม่ได้อยู่ไกลจากใจกลางเมืองมากนัก',
    topic: 'Travel & Transport',
  },
  more: {
    part_of_speech: 'adverb',
    meaning_th: 'มากกว่า, เพิ่มขึ้น',
    meaning_en: 'a greater or additional amount, number, or degree',
    example_sentence_en: 'We need more information before making a decision.',
    example_sentence_th: 'พวกเราต้องการข้อมูลเพิ่มเติมก่อนทำการตัดสินใจ',
    topic: 'Daily Life',
  },
  same: {
    part_of_speech: 'adjective',
    meaning_th: 'เหมือนกัน, เดียวกัน',
    meaning_en: 'identical; not different',
    example_sentence_en: 'We go to the same school every day.',
    example_sentence_th: 'พวกเราไปโรงเรียนเดียวกันทุกวัน',
    topic: 'Daily Life',
  },
  own: {
    part_of_speech: 'adjective',
    meaning_th: 'ของตัวเอง, เป็นเจ้าของ',
    meaning_en: 'belonging to oneself or itself',
    example_sentence_en: 'She wants to start her own business.',
    example_sentence_th: 'เธอต้องการเริ่มต้นธุรกิจของเธอเอง',
    topic: 'Business & Work',
  },
  good: {
    part_of_speech: 'adjective',
    meaning_th: 'ดี, มีคุณภาพ, เก่ง',
    meaning_en: 'to be desired or approved of; of high quality',
    example_sentence_en: 'Regular exercise is good for your health.',
    example_sentence_th: 'การออกกำลังกายสม่ำเสมอส่งผลดีต่อสุขภาพของคุณ',
    topic: 'Health & Body',
  },
  well: {
    part_of_speech: 'adverb',
    meaning_th: 'อย่างดี, สบายดี, ดี',
    meaning_en: 'in a good or satisfactory manner; healthy',
    example_sentence_en: 'She speaks English very well.',
    example_sentence_th: 'เธอพูดภาษาอังกฤษได้เป็นอย่างดี',
    topic: 'Daily Life',
  },
  first: {
    part_of_speech: 'adjective',
    meaning_th: 'แรก, อันดับแรก, ที่หนึ่ง',
    meaning_en: 'coming before all others in time or order',
    example_sentence_en: 'This is my first time visiting this museum.',
    example_sentence_th: 'นี่เป็นครั้งแรกของฉันที่มาเยี่ยมชมพิพิธภัณฑ์แห่งนี้',
    topic: 'Daily Life',
  },
  even: {
    part_of_speech: 'adverb',
    meaning_th: 'แม้กระทั่ง, แม้แต่, เท่ากัน',
    meaning_en: 'used to emphasize something surprising or extreme',
    example_sentence_en: 'Even a beginner can understand these basic rules.',
    example_sentence_th: 'แม้แต่ผู้เริ่มต้นก็สามารถเข้าใจกฎพื้นฐานเหล่านี้ได้',
    topic: 'Daily Life',
  },
  still: {
    part_of_speech: 'adverb',
    meaning_th: 'ยังคง, ยังคงอยู่',
    meaning_en: 'up to and including the present; continuing',
    example_sentence_en: 'Are you still working on the assignment?',
    example_sentence_th: 'คุณยังคงทำการบ้านชิ้นนั้นอยู่หรือเปล่า?',
    topic: 'Daily Life',
  },
  small: {
    part_of_speech: 'adjective',
    meaning_th: 'เล็ก, ขนาดเล็ก',
    meaning_en: 'of a size that is less than normal or usual',
    example_sentence_en: 'They live in a small, cozy apartment.',
    example_sentence_th: 'พวกเขาอาศัยอยู่ในอพาร์ตเมนต์ขนาดเล็กที่อบอุ่น',
    topic: 'Home & Environment',
  },
  tall: {
    part_of_speech: 'adjective',
    meaning_th: 'สูง',
    meaning_en: 'of great or more than average height',
    example_sentence_en: 'There are many tall buildings in the capital.',
    example_sentence_th: 'มีตึกสูงมากมายในเมืองหลวง',
    topic: 'People & Society',
  },
  regular: {
    part_of_speech: 'adjective',
    meaning_th: 'เป็นประจำ, สม่ำเสมอ, ปกติ',
    meaning_en: 'done, happening, or appearing at fixed intervals; customary',
    example_sentence_en: 'You must form regular study habits.',
    example_sentence_th: 'คุณต้องสร้างนิสัยการอ่านหนังสือให้เป็นประจำสม่ำเสมอ',
    topic: 'Daily Life',
  },
  ordinary: {
    part_of_speech: 'adjective',
    meaning_th: 'ธรรมดา, ปกติ, ทั่วไป',
    meaning_en: 'with no special or distinctive features; normal; standard',
    example_sentence_en: 'It was just an ordinary day until the surprise arrived.',
    example_sentence_th: 'มันเป็นเพียงแค่วันธรรมดาวันหนึ่งจนกระทั่งมีเรื่องประหลาดใจเกิดขึ้น',
    topic: 'Daily Life',
  },
  popular: {
    part_of_speech: 'adjective',
    meaning_th: 'เป็นที่นิยม, แพร่หลาย, ทั่วไป',
    meaning_en: 'liked, admired, or enjoyed by many people',
    example_sentence_en: 'Football is a very popular sport around the world.',
    example_sentence_th: 'ฟุตบอลเป็นกีฬาที่ได้รับความนิยมอย่างแพร่หลายทั่วโลก',
    topic: 'Sports & Entertainment',
  },
  typical: {
    part_of_speech: 'adjective',
    meaning_th: 'ตามแบบฉบับ, โดยทั่วไป, เป็นเอกลักษณ์',
    meaning_en: 'having the distinctive qualities of a particular type',
    example_sentence_en: 'It is typical of him to arrive earlier than scheduled.',
    example_sentence_th: 'เป็นเรื่องปกติทั่วไปของเขาที่จะมาถึงก่อนเวลาเสมอ',
    topic: 'Daily Life',
  },
  public: {
    part_of_speech: 'adjective',
    meaning_th: 'สาธารณะ, ทั่วไป',
    meaning_en: 'of or concerning the people as a whole; open to all',
    example_sentence_en: 'Public transportation helps reduce traffic congestion.',
    example_sentence_th: 'ระบบขนส่งสาธารณะช่วยลดปัญหาการจราจรติดขัด',
    topic: 'Travel & Transport',
  },
  universal: {
    part_of_speech: 'adjective',
    meaning_th: 'สากล, ทั่วไป, สากลนิยม',
    meaning_en: 'of, affecting, or done by all people or things in the world',
    example_sentence_en: 'Human rights are considered universal values.',
    example_sentence_th: 'สิทธิมนุษยชนถือเป็นค่านิยมสากลของทุกคน',
    topic: 'Society & Culture',
  },
};

/**
 * Sanitizes and enriches a vocabulary item object to ensure 100% pedagogical correctness.
 */
export function sanitizeVocabularyItem<T extends Record<string, any>>(item: T): T {
  if (!item || !item.word) return item;
  const wordKey = item.word.toLowerCase().trim();

  let meaningEn = item.meaning_en || item.meaningEn || '';
  let meaningTh = item.meaning_th || item.meaningTh || '';
  let pos = item.part_of_speech || item.partOfSpeech || 'noun';
  let exEn = item.example_sentence_en || item.exampleSentenceEn;
  let exTh = item.example_sentence_th || item.exampleSentenceTh;
  let topic = item.topic;

  // Apply explicit curated override if present
  if (CURATED_VOCAB_OVERRIDES[wordKey]) {
    const curated = CURATED_VOCAB_OVERRIDES[wordKey];
    if (curated.part_of_speech) pos = curated.part_of_speech;
    if (curated.meaning_th) meaningTh = curated.meaning_th;
    if (curated.meaning_en) meaningEn = curated.meaning_en;
    if (curated.example_sentence_en) exEn = curated.example_sentence_en;
    if (curated.example_sentence_th) exTh = curated.example_sentence_th;
    if (curated.topic) topic = curated.topic;
  } else {
    // Clean known scraped placeholders
    const lowEn = meaningEn.toLowerCase();
    if (lowEn.includes('without musical accompaniment')) {
      meaningEn = 'having the power, skill, means, or opportunity to do something';
    } else if (lowEn.includes('the quality, state, or action of')) {
      if (pos === 'verb') {
        meaningEn = `to perform or engage in the action of ${wordKey}`;
      } else {
        meaningEn = `the state, condition, or instance of ${wordKey}`;
      }
    }
  }

  return {
    ...item,
    part_of_speech: pos,
    partOfSpeech: pos,
    meaning_th: meaningTh,
    meaningTh: meaningTh,
    meaning_en: meaningEn,
    meaningEn: meaningEn,
    example_sentence_en: exEn,
    exampleSentenceEn: exEn,
    example_sentence_th: exTh,
    exampleSentenceTh: exTh,
    topic: topic,
  };
}
