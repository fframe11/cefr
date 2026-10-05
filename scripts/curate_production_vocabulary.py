import sys
import json
import urllib.request
import os

sys.stdout.reconfigure(encoding='utf-8')

# Comprehensive CEFR pedagogical dictionary for core & polysemous words
CURATED_DICTIONARY = {
    # Specifically requested by user
    "about": {
        "part_of_speech": "preposition",
        "meaning_th": "เกี่ยวกับ, เรื่องเกี่ยวกับ (หรือ ประมาณ, ราวๆ)",
        "meaning_en": "on the subject of; concerning; or approximately",
        "example_sentence_en": "I suppose it's different when you think about it over the long term.",
        "example_sentence_th": "ฉันคิดว่ามันจะแตกต่างออกไปเมื่อคุณคิดเกี่ยวกับเรื่องนี้ในระยะยาว",
        "topic": "Daily Life"
    },
    "able": {
        "part_of_speech": "adjective",
        "meaning_th": "สามารถ, ที่มีความสามารถที่จะทำได้",
        "meaning_en": "having the power, skill, means, or opportunity to do something",
        "example_sentence_en": "Any universe simple enough to be understood is too simple to produce a mind able to understand it.",
        "example_sentence_th": "จักรวาลที่เข้าใจง่ายเกินไปย่อมเรียบง่ายเกินกว่าจะสร้างจิตใจที่สามารถเข้าใจมันได้",
        "topic": "Education & Work"
    },
    "general": {
        "part_of_speech": "adjective",
        "meaning_th": "ทั่วไป, โดยทั่วไป",
        "meaning_en": "affecting or concerning all or most people, places, or things; widespread",
        "example_sentence_en": "In general, regular exercise is good for your physical and mental health.",
        "example_sentence_th": "โดยทั่วไปแล้ว การออกกำลังกายอย่างสม่ำเสมอส่งผลดีต่อสุขภาพร่างกายและจิตใจ",
        "topic": "Society & Culture"
    },
    "common": {
        "part_of_speech": "adjective",
        "meaning_th": "ทั่วไป, ธรรมดา, ร่วมกัน",
        "meaning_en": "occurring, found, or done often; widespread; shared by two or more people",
        "example_sentence_en": "They share common ideals and work together towards their goals.",
        "example_sentence_th": "พวกเขามีอุดมการณ์ร่วมกันและทำงานร่วมกันเพื่อเป้าหมายของพวกเขา",
        "topic": "Society & Culture"
    },
    "breathe": {
        "part_of_speech": "verb",
        "meaning_th": "หายใจ",
        "meaning_en": "take air into the lungs and expel it",
        "example_sentence_en": "When you breathe out in cold weather, you can see your breath.",
        "example_sentence_th": "เมื่อคุณหายใจออกในสภาพอากาศหนาว คุณจะมองเห็นไอหายใจของคุณ",
        "topic": "Health & Body"
    },
    "can": {
        "part_of_speech": "verb",
        "meaning_th": "สามารถ, อาจจะ",
        "meaning_en": "be able to; be permitted to; used to indicate possibility",
        "example_sentence_en": "Sometimes he can be very helpful when you ask.",
        "example_sentence_th": "บางครั้งเขาก็สามารถช่วยเหลือได้เป็นอย่างดีเมื่อคุณเอ่ยปากถาม",
        "topic": "Daily Life"
    },
    "may": {
        "part_of_speech": "verb",
        "meaning_th": "อาจจะ, ขออนุญาต",
        "meaning_en": "expressing possibility or asking for permission",
        "example_sentence_en": "It may rain this afternoon, so take an umbrella.",
        "example_sentence_th": "ฝนอาจจะตกบ่ายนี้ ดังนั้นพกร่มไปด้วยนะ",
        "topic": "Daily Life"
    },
    "will": {
        "part_of_speech": "verb",
        "meaning_th": "จะ",
        "meaning_en": "expressing future action, intention, or certainty",
        "example_sentence_en": "I will be back as soon as the meeting finishes.",
        "example_sentence_th": "ฉันจะกลับมาทันทีที่การประชุมเสร็จสิ้น",
        "topic": "Daily Life"
    },
    "all": {
        "part_of_speech": "determiner",
        "meaning_th": "ทั้งหมด, ทั้งสิ้น, ทุกคน",
        "meaning_en": "the whole quantity, amount, or number of",
        "example_sentence_en": "All you can do is trust one another.",
        "example_sentence_th": "สิ่งเดียวที่คุณทั้งหมดทำได้คือการไว้วางใจซึ่งกันและกัน",
        "topic": "Daily Life"
    },
    "behind": {
        "part_of_speech": "preposition",
        "meaning_th": "ข้างหลัง, เบื้องหลัง",
        "meaning_en": "at or to the far side or back of; supporting or causing something",
        "example_sentence_en": "Behind every achievement, there is hard work and dedication.",
        "example_sentence_th": "เบื้องหลังทุกความสำเร็จ ย่อมมีความพยายามและการทุ่มเทเสมอ",
        "topic": "Daily Life"
    },
    "below": {
        "part_of_speech": "preposition",
        "meaning_th": "ด้านล่าง, ต่ำกว่า, ข้างใต้",
        "meaning_en": "at a lower level or layer than",
        "example_sentence_en": "Your marks were well below average this term.",
        "example_sentence_th": "คะแนนของคุณต่ำกว่าเกณฑ์เฉลี่ยอย่างมากในเทอมนี้",
        "topic": "Education & Work"
    },
    "across": {
        "part_of_speech": "preposition",
        "meaning_th": "ข้าม, จากฝั่งหนึ่งไปยังอีกฝั่งหนึ่ง",
        "meaning_en": "from one side to the other of something",
        "example_sentence_en": "They walked across the street carefully.",
        "example_sentence_th": "พวกเขาเดินข้ามถนนอย่างระมัดระวัง",
        "topic": "Travel & Transport"
    },
    "along": {
        "part_of_speech": "preposition",
        "meaning_th": "ไปตาม, เลียบไปตาม",
        "meaning_en": "moving in a constant direction on a path, road, or line",
        "example_sentence_en": "We walked along the peaceful river bank.",
        "example_sentence_th": "พวกเราเดินเลียบไปตามริมฝั่งแม่น้ำอันเงียบสงบ",
        "topic": "Travel & Transport"
    },
    "around": {
        "part_of_speech": "preposition",
        "meaning_th": "รอบๆ, แถวๆ, ประมาณ",
        "meaning_en": "located or moving in every direction from; approximately",
        "example_sentence_en": "There are many cafes around the university.",
        "example_sentence_th": "มีร้านกาแฟมากมายตั้งอยู่รอบๆ มหาวิทยาลัย",
        "topic": "Daily Life"
    },
    "near": {
        "part_of_speech": "preposition",
        "meaning_th": "ใกล้, ใกล้เคียง",
        "meaning_en": "at or to a short distance away",
        "example_sentence_en": "Is there a train station near here?",
        "example_sentence_th": "มีสถานีรถไฟอยู่ใกล้แถวนี้ไหม?",
        "topic": "Travel & Transport"
    },
    "far": {
        "part_of_speech": "adverb",
        "meaning_th": "ไกล, ห่างไกล",
        "meaning_en": "at, to, or by a great distance",
        "example_sentence_en": "The hotel is not far from the city center.",
        "example_sentence_th": "โรงแรมไม่ได้อยู่ไกลจากใจกลางเมืองมากนัก",
        "topic": "Travel & Transport"
    },
    "more": {
        "part_of_speech": "determiner",
        "meaning_th": "มากกว่า, เพิ่มขึ้น",
        "meaning_en": "a greater or additional amount, number, or degree",
        "example_sentence_en": "We need more information before making a decision.",
        "example_sentence_th": "พวกเราต้องการข้อมูลเพิ่มเติมก่อนทำการตัดสินใจ",
        "topic": "Daily Life"
    },
    "same": {
        "part_of_speech": "adjective",
        "meaning_th": "เหมือนกัน, เดียวกัน",
        "meaning_en": "identical; not different",
        "example_sentence_en": "We go to the same school every day.",
        "example_sentence_th": "พวกเราไปโรงเรียนเดียวกันทุกวัน",
        "topic": "Daily Life"
    },
    "own": {
        "part_of_speech": "adjective",
        "meaning_th": "ของตัวเอง, เป็นเจ้าของ",
        "meaning_en": "belonging to oneself or itself",
        "example_sentence_en": "She wants to start her own business.",
        "example_sentence_th": "เธอต้องการเริ่มต้นธุรกิจของเธอเอง",
        "topic": "Business & Work"
    },
    "good": {
        "part_of_speech": "adjective",
        "meaning_th": "ดี, มีคุณภาพ, เก่ง",
        "meaning_en": "to be desired or approved of; of high quality",
        "example_sentence_en": "Regular exercise is good for your health.",
        "example_sentence_th": "การออกกำลังกายสม่ำเสมอส่งผลดีต่อสุขภาพของคุณ",
        "topic": "Health & Body"
    },
    "well": {
        "part_of_speech": "adverb",
        "meaning_th": "อย่างดี, สบายดี, ดี",
        "meaning_en": "in a good or satisfactory manner; healthy",
        "example_sentence_en": "She speaks English very well.",
        "example_sentence_th": "เธอพูดภาษาอังกฤษได้เป็นอย่างดี",
        "topic": "Daily Life"
    },
    "first": {
        "part_of_speech": "adjective",
        "meaning_th": "แรก, อันดับแรก, ที่หนึ่ง",
        "meaning_en": "coming before all others in time or order",
        "example_sentence_en": "This is my first time visiting this museum.",
        "example_sentence_th": "นี่เป็นครั้งแรกของฉันที่มาเยี่ยมชมพิพิธภัณฑ์แห่งนี้",
        "topic": "Daily Life"
    },
    "even": {
        "part_of_speech": "adverb",
        "meaning_th": "แม้กระทั่ง, แม้แต่, เท่ากัน",
        "meaning_en": "used to emphasize something surprising or extreme",
        "example_sentence_en": "Even a beginner can understand these basic rules.",
        "example_sentence_th": "แม้แต่ผู้เริ่มต้นก็สามารถเข้าใจกฎพื้นฐานเหล่านี้ได้",
        "topic": "Daily Life"
    },
    "still": {
        "part_of_speech": "adverb",
        "meaning_th": "ยังคง, ยังคงอยู่",
        "meaning_en": "up to and including the present; continuing",
        "example_sentence_en": "Are you still working on the assignment?",
        "example_sentence_th": "คุณยังคงทำการบ้านชิ้นนั้นอยู่หรือเปล่า?",
        "topic": "Daily Life"
    },
    "small": {
        "part_of_speech": "adjective",
        "meaning_th": "เล็ก, ขนาดเล็ก",
        "meaning_en": "of a size that is less than normal or usual",
        "example_sentence_en": "They live in a small, cozy apartment.",
        "example_sentence_th": "พวกเขาอาศัยอยู่ในอพาร์ตเมนต์ขนาดเล็กที่อบอุ่น",
        "topic": "Home & Environment"
    },
    "tall": {
        "part_of_speech": "adjective",
        "meaning_th": "สูง",
        "meaning_en": "of great or more than average height",
        "example_sentence_en": "There are many tall buildings in the capital.",
        "example_sentence_th": "มีตึกสูงมากมายในเมืองหลวง",
        "topic": "People & Society"
    },
    "regular": {
        "part_of_speech": "adjective",
        "meaning_th": "เป็นประจำ, สม่ำเสมอ, ปกติ",
        "meaning_en": "done, happening, or appearing at fixed intervals; customary",
        "example_sentence_en": "You must form regular study habits.",
        "example_sentence_th": "คุณต้องสร้างนิสัยการอ่านหนังสือให้เป็นประจำสม่ำเสมอ",
        "topic": "Daily Life"
    },
    "ordinary": {
        "part_of_speech": "adjective",
        "meaning_th": "ธรรมดา, ปกติ, ทั่วไป",
        "meaning_en": "with no special or distinctive features; normal; standard",
        "example_sentence_en": "It was just an ordinary day until the surprise arrived.",
        "example_sentence_th": "มันเป็นเพียงแค่วันธรรมดาวันหนึ่งจนกระทั่งมีเรื่องประหลาดใจเกิดขึ้น",
        "topic": "Daily Life"
    },
    "popular": {
        "part_of_speech": "adjective",
        "meaning_th": "เป็นที่นิยม, แพร่หลาย, ทั่วไป",
        "meaning_en": "liked, admired, or enjoyed by many people",
        "example_sentence_en": "Football is a very popular sport around the world.",
        "example_sentence_th": "ฟุตบอลเป็นกีฬาที่ได้รับความนิยมอย่างแพร่หลายทั่วโลก",
        "topic": "Sports & Entertainment"
    },
    "typical": {
        "part_of_speech": "adjective",
        "meaning_th": "ตามแบบฉบับ, โดยทั่วไป, เป็นเอกลักษณ์",
        "meaning_en": "having the distinctive qualities of a particular type",
        "example_sentence_en": "It is typical of him to arrive earlier than scheduled.",
        "example_sentence_th": "เป็นเรื่องปกติทั่วไปของเขาที่จะมาถึงก่อนเวลาเสมอ",
        "topic": "Daily Life"
    },
    "public": {
        "part_of_speech": "adjective",
        "meaning_th": "สาธารณะ, ทั่วไป",
        "meaning_en": "of or concerning the people as a whole; open to all",
        "example_sentence_en": "Public transportation helps reduce traffic congestion.",
        "example_sentence_th": "ระบบขนส่งสาธารณะช่วยลดปัญหาการจราจรติดขัด",
        "topic": "Travel & Transport"
    },
    "universal": {
        "part_of_speech": "adjective",
        "meaning_th": "สากล, ทั่วไป, สากลนิยม",
        "meaning_en": "of, affecting, or done by all people or things in the world",
        "example_sentence_en": "Human rights are considered universal values.",
        "example_sentence_th": "สิทธิมนุษยชนถือเป็นค่านิยมสากลของทุกคน",
        "topic": "Society & Culture"
    },
    "core": {
        "part_of_speech": "noun",
        "meaning_th": "แกนกลาง, หัวใจสำคัญ, สาระสำคัญ",
        "meaning_en": "the central, innermost, or most essential part of something",
        "example_sentence_en": "The core concept of the plan remains unchanged.",
        "example_sentence_th": "แนวคิดหัวใจสำคัญของแผนการยังคงไม่เปลี่ยนแปลง",
        "topic": "Education & Work"
    },
    "impression": {
        "part_of_speech": "noun",
        "meaning_th": "ความประทับใจ, ความรู้สึกแรกพบ",
        "meaning_en": "an idea, feeling, or opinion about someone or something",
        "example_sentence_en": "She made a great first impression at the interview.",
        "example_sentence_th": "เธอสร้างความประทับใจแรกพบที่ยอดเยี่ยมในการสัมภาษณ์งาน",
        "topic": "Personal & Social"
    },
    "depression": {
        "part_of_speech": "noun",
        "meaning_th": "ภาวะซึมเศร้า, เศรษฐกิจตกต่ำ",
        "meaning_en": "feelings of severe despondency and dejection; a period of economic decline",
        "example_sentence_en": "Counseling and therapy can help overcome severe depression.",
        "example_sentence_th": "การปรึกษาและการบำบัดสามารถช่วยเอาชนะภาวะซึมเศร้าขั้นรุนแรงได้",
        "topic": "Health & Body"
    },
    "roundabout": {
        "part_of_speech": "noun",
        "meaning_th": "วงเวียน, วงเวียนจราจร",
        "meaning_en": "a circular road junction where traffic moves continuously in one direction",
        "example_sentence_en": "Take the second exit at the roundabout.",
        "example_sentence_th": "ใช้ทางออกที่สองเมื่อถึงวงเวียนจราจร",
        "topic": "Travel & Transport"
    },
    "hood": {
        "part_of_speech": "noun",
        "meaning_th": "หมวกคลุมศีรษะ, ฝากระโปรงหน้ารถ",
        "meaning_en": "a covering for the head and neck, or the metal cover over a car engine",
        "example_sentence_en": "He pulled up his jacket hood because it started raining.",
        "example_sentence_th": "เขาดึงหมวกฮู้ดของเสื้อแจ็กเก็ตขึ้นมาเพราะฝนเริ่มตก",
        "topic": "Clothing & Daily"
    },
    "how": {
        "part_of_speech": "adverb",
        "meaning_th": "อย่างไร, เท่าไร",
        "meaning_en": "in what way or manner; to what degree",
        "example_sentence_en": "How can I improve my English fluency?",
        "example_sentence_th": "ฉันจะสามารถพัฒนาความคล่องแคล่วในการพูดภาษาอังกฤษได้อย่างไร?",
        "topic": "Daily Life"
    },
    "else": {
        "part_of_speech": "adverb",
        "meaning_th": "อื่น, นอกจากนี้",
        "meaning_en": "in addition; besides; different",
        "example_sentence_en": "Would you like anything else to eat or drink?",
        "example_sentence_th": "คุณต้องการอะไรอื่นเพิ่มเติมสำหรับรับประทานหรือดื่มไหม?",
        "topic": "Daily Life"
    },
    "that": {
        "part_of_speech": "pronoun",
        "meaning_th": "นั้น, สิ่งนั้น, ที่",
        "meaning_en": "used to identify a specific person, thing, or statement",
        "example_sentence_en": "That was one of the most exciting journeys of my life.",
        "example_sentence_th": "นั่นเป็นหนึ่งในการเดินทางที่น่าตื่นเต้นที่สุดในชีวิตของฉัน",
        "topic": "Daily Life"
    },
    "since": {
        "part_of_speech": "conjunction",
        "meaning_th": "ตั้งแต่, เนื่องจาก, เพราะว่า",
        "meaning_en": "from a particular time in the past until now; because",
        "example_sentence_en": "I have lived in this city since 2020.",
        "example_sentence_th": "ฉันอาศัยอยู่ในเมืองนี้มาตั้งแต่ปี 2020",
        "topic": "Daily Life"
    },
    "before": {
        "part_of_speech": "preposition",
        "meaning_th": "ก่อน, ก่อนหน้านี้, ข้างหน้า",
        "meaning_en": "during the period of time preceding; in front of",
        "example_sentence_en": "Wash your hands before eating your meal.",
        "example_sentence_th": "ล้างมือของคุณก่อนรับประทานอาหาร",
        "topic": "Daily Life"
    },
    "after": {
        "part_of_speech": "preposition",
        "meaning_th": "หลังจาก, ภายหลัง",
        "meaning_en": "in the time following an event or period of time",
        "example_sentence_en": "Let's meet for coffee after work.",
        "example_sentence_th": "พวกเราไปเจอกันดื่มกาแฟหลังเลิกงานกันเถอะ",
        "topic": "Daily Life"
    },
    "ever": {
        "part_of_speech": "adverb",
        "meaning_th": "เคย, ตลอดเวลา",
        "meaning_en": "at any time in the past or present",
        "example_sentence_en": "Have you ever visited Chiang Mai during winter?",
        "example_sentence_th": "คุณเคยไปเที่ยวเชียงใหม่ช่วงหน้าหนาวไหม?",
        "topic": "Daily Life"
    },
    "never": {
        "part_of_speech": "adverb",
        "meaning_th": "ไม่เคย, ไม่มีทาง",
        "meaning_en": "at no time in the past or future; not at all",
        "example_sentence_en": "I will never forget the kindness of local people.",
        "example_sentence_th": "ฉันจะไม่มีวันลืมความมีน้ำใจของคนในท้องถิ่นเลย",
        "topic": "Daily Life"
    },
    "often": {
        "part_of_speech": "adverb",
        "meaning_th": "บ่อยๆ, มักจะ",
        "meaning_en": "many times at short intervals; frequently",
        "example_sentence_en": "How often do you practice reading in English?",
        "example_sentence_th": "คุณฝึกอ่านภาษาอังกฤษบ่อยแค่ไหน?",
        "topic": "Daily Life"
    },
    "sometimes": {
        "part_of_speech": "adverb",
        "meaning_th": "บางครั้ง, เป็นบางครั้ง",
        "meaning_en": "occasionally, rather than all of the time",
        "example_sentence_en": "Sometimes I prefer studying alone in the library.",
        "example_sentence_th": "บางครั้งฉันก็ชอบนั่งอ่านหนังสือคนเดียวในห้องสมุดมากกว่า",
        "topic": "Daily Life"
    },
    "always": {
        "part_of_speech": "adverb",
        "meaning_th": "เสมอ, เป็นประจำ, ตลอดเวลา",
        "meaning_en": "at all times; on all occasions",
        "example_sentence_en": "He always arrives ten minutes before meetings start.",
        "example_sentence_th": "เขามาถึงก่อนการประชุมเริ่มสิบนาทีเสมอ",
        "topic": "Daily Life"
    },
    "really": {
        "part_of_speech": "adverb",
        "meaning_th": "จริงๆ, อย่างแท้จริง",
        "meaning_en": "in actual fact; truly; very",
        "example_sentence_en": "I am really looking forward to the holidays.",
        "example_sentence_th": "ฉันตั้งตารอวันหยุดนี้จริงๆ",
        "topic": "Daily Life"
    },
    "quite": {
        "part_of_speech": "adverb",
        "meaning_th": "ค่อนข้าง, พอสมควร",
        "meaning_en": "to a certain or fairly significant extent; moderately",
        "example_sentence_en": "The test was quite difficult, but everyone passed.",
        "example_sentence_th": "ข้อสอบค่อนข้างยากพอสมควร แต่ทุกคนก็สอบผ่าน",
        "topic": "Daily Life"
    },
    "almost": {
        "part_of_speech": "adverb",
        "meaning_th": "เกือบ, เกือบจะ",
        "meaning_en": "not quite; very nearly",
        "example_sentence_en": "Dinner is almost ready, so please sit down.",
        "example_sentence_th": "อาหารเย็นเกือบจะพร้อมแล้ว กรุณานั่งลงได้เลย",
        "topic": "Daily Life"
    },
    "enough": {
        "part_of_speech": "determiner",
        "meaning_th": "พอ, เพียงพอ",
        "meaning_en": "as much or as many as required or needed",
        "example_sentence_en": "Make sure you drink enough water throughout the day.",
        "example_sentence_th": "อย่าลืมดื่มน้ำให้เพียงพอตลอดทั้งวัน",
        "topic": "Daily Life"
    },
    "together": {
        "part_of_speech": "adverb",
        "meaning_th": "ด้วยกัน, ร่วมกัน",
        "meaning_en": "with or in proximity to another person or group",
        "example_sentence_en": "Let's work together to complete this assignment on time.",
        "example_sentence_th": "มาร่วมมือกันทำงานชิ้นนี้ให้เสร็จทันเวลากันเถอะ",
        "topic": "Daily Life"
    },
    "away": {
        "part_of_speech": "adverb",
        "meaning_th": "ออกไป, ห่างออกไป",
        "meaning_en": "to or at a distance from a particular place",
        "example_sentence_en": "The convenience store is just two minutes away.",
        "example_sentence_th": "ร้านสะดวกซื้ออยู่ห่างออกไปเพียงแค่สองนาทีเท่านั้น",
        "topic": "Daily Life"
    },
    "just": {
        "part_of_speech": "adverb",
        "meaning_th": "เพิ่งจะ, เพียงแค่, พอดี",
        "meaning_en": "very recently; simply or only; exactly",
        "example_sentence_en": "I have just finished reviewing the study notes.",
        "example_sentence_th": "ฉันเพิ่งจะทบทวนบันทึกสรุปการเรียนเสร็จพอดี",
        "topic": "Daily Life"
    },
    "house": {
        "part_of_speech": "noun",
        "meaning_th": "บ้าน, ที่อยู่อาศัย",
        "meaning_en": "a building for human habitation, especially one that is lived in by a family",
        "example_sentence_en": "They bought a new house near the park.",
        "example_sentence_th": "พวกเขาซื้อบ้านหลังใหม่ใกล้สวนสาธารณะ",
        "topic": "Home & Environment"
    },
    "wash": {
        "part_of_speech": "verb",
        "meaning_th": "ล้าง, ซัก, ชำระล้าง",
        "meaning_en": "clean with water and soap or detergent",
        "example_sentence_en": "Please wash your hands before preparing food.",
        "example_sentence_th": "กรุณาล้างมือของคุณก่อนเตรียมอาหาร",
        "topic": "Health & Body"
    },
    "earth": {
        "part_of_speech": "noun",
        "meaning_th": "โลก, พื้นดิน, ดิน",
        "meaning_en": "the planet on which we live; the surface of the land",
        "example_sentence_en": "The earth revolves around the sun once a year.",
        "example_sentence_th": "โลกโคจรรอบดวงอาทิตย์ปีละหนึ่งรอบ",
        "topic": "Nature & Science"
    },
    "ball": {
        "part_of_speech": "noun",
        "meaning_th": "ลูกบอล, ทรงกลม",
        "meaning_en": "a solid or hollow spherical object used in games and sports",
        "example_sentence_en": "The children are playing with a red ball in the yard.",
        "example_sentence_th": "เด็กๆ กำลังเล่นลูกบอลสีแดงอยู่ในสนาม",
        "topic": "Sports & Entertainment"
    },
    "mouth": {
        "part_of_speech": "noun",
        "meaning_th": "ปาก",
        "meaning_en": "the opening in the face through which food is taken and speech is made",
        "example_sentence_en": "Cover your mouth when coughing or sneezing.",
        "example_sentence_th": "ปิดปากของคุณเมื่อไอหรือจาม",
        "topic": "Health & Body"
    },
    "king": {
        "part_of_speech": "noun",
        "meaning_th": "กษัตริย์, พระราชา",
        "meaning_en": "the male ruler of an independent state or kingdom",
        "example_sentence_en": "The king was respected by his people for his fairness.",
        "example_sentence_th": "กษัตริย์ได้รับการเคารพนับถือจากประชาชนในความยุติธรรมของพระองค์",
        "topic": "Society & Culture"
    },
    "stand": {
        "part_of_speech": "verb",
        "meaning_th": "ยืน, ตั้งอยู่",
        "meaning_en": "maintain an upright position on one's feet",
        "example_sentence_en": "Please stand behind the yellow line for safety.",
        "example_sentence_th": "กรุณายืนหลังเส้นสีเหลืองเพื่อความปลอดภัย",
        "topic": "Daily Life"
    },
    "call": {
        "part_of_speech": "verb",
        "meaning_th": "เรียก, โทรหา, ตั้งชื่อ",
        "meaning_en": "give a specified name to; contact someone by telephone",
        "example_sentence_en": "I will call you when I arrive at the hotel.",
        "example_sentence_th": "ฉันจะโทรหาคุณเมื่อฉันเดินทางถึงโรงแรม",
        "topic": "Communication & Daily"
    },
    "roll": {
        "part_of_speech": "verb",
        "meaning_th": "ม้วน, กลิ้ง, หมุน",
        "meaning_en": "move by turning over and over on an axis, or wrap into a cylinder",
        "example_sentence_en": "The ball rolled down the hill quickly.",
        "example_sentence_th": "ลูกบอลกลิ้งลงเนินเขาอย่างรวดเร็ว",
        "topic": "Movement & Action"
    },
    "tie": {
        "part_of_speech": "noun",
        "meaning_th": "เนกไท, ความผูกพัน",
        "meaning_en": "a strip of cloth worn around the neck and tied in a knot",
        "example_sentence_en": "He wore a smart dark suit and a silk tie.",
        "example_sentence_th": "เขาสวมชุดสูทสีเข้มเรียบร้อยและผูกเนกไทผ้าไหม",
        "topic": "Clothing & Style"
    },
    "scale": {
        "part_of_speech": "noun",
        "meaning_th": "เครื่องชั่ง, ตาชั่ง, มาตราส่วน",
        "meaning_en": "an instrument for weighing things, or a relative measure",
        "example_sentence_en": "Step on the scale to check your weight.",
        "example_sentence_th": "ขึ้นไปบนเครื่องชั่งเพื่อตรวจดูน้ำหนักของคุณ",
        "topic": "Science & Measurement"
    },
    "seal": {
        "part_of_speech": "noun",
        "meaning_th": "ตราประทับ, รอยผนึก, แมวน้ำ",
        "meaning_en": "an official stamp or mark, or a sea mammal",
        "example_sentence_en": "The contract was signed with an official seal.",
        "example_sentence_th": "สัญญาได้รับการลงนามพร้อมประทับตราทางการ",
        "topic": "Business & Law"
    },
    "stick": {
        "part_of_speech": "noun",
        "meaning_th": "กิ่งไม้, ท่อนไม้, ไม้เท้า",
        "meaning_en": "a piece of wood cut from a tree, or a walking stick",
        "example_sentence_en": "He walked through the forest with a sturdy wooden stick.",
        "example_sentence_th": "เขาเดินผ่านป่าด้วยไม้เท้าไม้เนื้อแข็งที่แข็งแรง",
        "topic": "Nature & Environment"
    },
    "bolt": {
        "part_of_speech": "noun",
        "meaning_th": "กลอนประตู, สลักเกลียว",
        "meaning_en": "a sliding bar to fasten a door, or a threaded metal fastener",
        "example_sentence_en": "Slide the bolt across the door to lock it securely.",
        "example_sentence_th": "เลื่อนกลอนประตูเพื่อล็อคให้แน่นหนา",
        "topic": "Home & Hardware"
    },
    "present": {
        "part_of_speech": "verb",
        "meaning_th": "นำเสนอ, มอบให้, แสดงให้เห็น",
        "meaning_en": "give, show, or offer something formally to an audience",
        "example_sentence_en": "She will present her research findings at the conference.",
        "example_sentence_th": "เธอจะนำเสนอผลงานวิจัยของเธอในงานประชุมวิชาการ",
        "topic": "Education & Work"
    },
    "carrier": {
        "part_of_speech": "noun",
        "meaning_th": "ผู้ขนส่ง, สายการบิน, บริษัทขนส่ง",
        "meaning_en": "a company that transports goods or passengers",
        "example_sentence_en": "The national carrier offers direct flights between both capitals.",
        "example_sentence_th": "สายการบินแห่งชาติให้บริการเที่ยวบินตรงระหว่างเมืองหลวงทั้งสอง",
        "topic": "Travel & Business"
    }
}

def clean_placeholder(word, meaning_en, pos):
    if not meaning_en:
        return f"A standard English {pos}."
    low = meaning_en.lower()
    if "the quality, state, or action of" in low:
        # Generate clean concise definition
        if pos == "noun":
            return f"The state, fact, or instance of {word}."
        elif pos == "verb":
            return f"To act, perform, or engage in {word}."
        elif pos == "adjective":
            return f"Relating to, characterized by, or being {word}."
    return meaning_en

# 1. Update data/vocabulary-production-3860.json
file_path = 'data/vocabulary-production-3860.json'
with open(file_path, 'r', encoding='utf-8') as f:
    items = json.load(f)

updated_count = 0
for item in items:
    w = item.get('word', '').lower()
    
    # Apply curated definition
    if w in CURATED_DICTIONARY:
        curated = CURATED_DICTIONARY[w]
        item['part_of_speech'] = curated['part_of_speech']
        item['meaning_th'] = curated['meaning_th']
        item['meaning_en'] = curated['meaning_en']
        if 'example_sentence_en' in curated:
            item['example_sentence_en'] = curated['example_sentence_en']
            item['example_sentence_th'] = curated['example_sentence_th']
        if 'topic' in curated:
            item['topic'] = curated['topic']
        updated_count += 1
    else:
        # Clean quality/state/action placeholders
        cleaned_en = clean_placeholder(w, item.get('meaning_en', ''), item.get('part_of_speech', ''))
        if cleaned_en != item.get('meaning_en'):
            item['meaning_en'] = cleaned_en
            updated_count += 1

print(f"Updated {updated_count} items in {file_path}")
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

# 2. Update Supabase vocabularies table
supabase_url = os.environ.get("SUPABASE_URL", "https://atmatooytieelwiarffp.supabase.co")
service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_yIO9KuG7_oIx6ROrQdwPhg_tZ4RsjmI")

print("\nUpdating Supabase database rows...")
headers = {
    "apikey": service_role_key,
    "Authorization": f"Bearer {service_role_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

supabase_updated = 0
for w, curated in CURATED_DICTIONARY.items():
    update_url = f"{supabase_url}/rest/v1/vocabularies?word=eq.{w}"
    patch_body = {
        "part_of_speech": curated["part_of_speech"],
        "meaning_th": curated["meaning_th"],
        "meaning_en": curated["meaning_en"],
        "example_sentence_en": curated.get("example_sentence_en"),
        "example_sentence_th": curated.get("example_sentence_th"),
        "topic": curated.get("topic")
    }
    
    data_bytes = json.dumps(patch_body).encode('utf-8')
    req = urllib.request.Request(update_url, data=data_bytes, headers=headers, method='PATCH')
    try:
        with urllib.request.urlopen(req) as resp:
            if resp.status in [200, 204]:
                supabase_updated += 1
                print(f"  [OK] Supabase updated '{w}' -> TH: {curated['meaning_th']}, POS: {curated['part_of_speech']}")
    except Exception as e:
        print(f"  [FAIL] Supabase update for '{w}': {e}")

print(f"Supabase update finished: {supabase_updated}/{len(CURATED_DICTIONARY)} records updated.")
