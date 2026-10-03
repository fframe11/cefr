#!/usr/bin/env python3
"""
build_full_grammar_bank.py
Generates 160 pristine CEFR grammar questions covering A1 through C2
and saves to data/grammar-question-bank.json.
"""

import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

questions = []

def add_q(id_str, level, topic, q_type, b, a, stem, correct, options_list, exp_en, exp_th, tag):
    opts = []
    keys = ["A", "B", "C", "D"]
    for i, opt in enumerate(options_list):
        opts.append({"key": keys[i], "text": opt})
    questions.append({
        "id": id_str,
        "cefr_level": level,
        "grammar_topic": topic,
        "question_type": q_type,
        "difficulty_b": round(b, 2),
        "discrimination_a": round(a, 2),
        "guessing_c": 0.25,
        "stem_en": stem,
        "correct_answer": correct,
        "options": opts,
        "explanation_en": exp_en,
        "explanation_th": exp_th,
        "weakness_tag": tag,
        "source": "curated_pedagogical"
    })

# =========================================================================
# A1 LEVEL (30 questions: gq_a1_001 to gq_a1_030, b in [-2.5, -1.5])
# =========================================================================
add_q("gq_a1_001", "A1", "present_simple", "gap_fill", -2.4, 1.2,
      "She _____ English every morning before breakfast.", "studies",
      ["study", "studies", "studying", "is study"],
      "With third-person singular (she) in Present Simple, verbs ending in consonant + y change to -ies.",
      "ประธานเอกพจน์บุรุษที่ 3 (She) ใน Present Simple คำกริยาที่ลงท้ายด้วย consonant + y เปลี่ยนเป็น -ies",
      "grammar_present_simple_3rd_person")

add_q("gq_a1_002", "A1", "be_verb", "gap_fill", -2.5, 1.1,
      "My brother and I _____ students at the same school.", "are",
      ["am", "is", "are", "be"],
      "The compound subject 'My brother and I' is plural (we), requiring 'are'.",
      "ประธานพหูพจน์ 'My brother and I' (พวกเรา) ต้องใช้กับ verb to be คือ 'are'",
      "grammar_be_verb_agreement")

add_q("gq_a1_003", "A1", "articles", "gap_fill", -2.3, 1.3,
      "He wants to buy _____ apple and two oranges.", "an",
      ["a", "an", "the", "some"],
      "'An' is used before singular countable nouns beginning with a vowel sound.",
      "'apple' ขึ้นต้นด้วยเสียงสระ จึงใช้คำนำหน้านามไม่ชี้เฉพาะ 'an'",
      "grammar_articles_indefinite")

add_q("gq_a1_004", "A1", "pronouns", "gap_fill", -2.2, 1.15,
      "This is Peter. Do you know _____?", "him",
      ["he", "his", "him", "himself"],
      "The object pronoun 'him' is needed after the transitive verb 'know'.",
      "ตามหลังคำกริยา 'know' ต้องใช้รูปสรรพนามกรรมคือ 'him'",
      "grammar_object_pronouns")

add_q("gq_a1_005", "A1", "prepositions_time", "gap_fill", -2.1, 1.25,
      "The train leaves _____ eight o'clock in the morning.", "at",
      ["in", "on", "at", "to"],
      "'At' is used for clock times.",
      "เวลาที่ระบุเวลาเป็นนาฬิกาแน่นอน ใช้ 'at'",
      "grammar_prepositions_time")

add_q("gq_a1_006", "A1", "present_simple_negative", "gap_fill", -2.0, 1.3,
      "Tom _____ like coffee; he prefers tea.", "doesn't",
      ["don't", "doesn't", "isn't", "not"],
      "Third-person singular negative in Present Simple uses 'doesn't' + base verb.",
      "ประธานเอกพจน์บุรุษที่ 3 (Tom) ในประโยคปฏิเสธใช้ 'doesn't' + กริยาช่อง 1",
      "grammar_present_simple_negative")

add_q("gq_a1_007", "A1", "plurals", "gap_fill", -2.2, 1.2,
      "There are five _____ playing in the park.", "children",
      ["child", "childs", "children", "childrens"],
      "'Children' is the irregular plural form of 'child'.",
      "พหูพจน์ของ 'child' คือรูปเปลี่ยนเสียง 'children'",
      "grammar_irregular_plurals")

add_q("gq_a1_008", "A1", "demonstratives", "gap_fill", -2.3, 1.1,
      "_____ shoes over there are very expensive.", "Those",
      ["This", "That", "These", "Those"],
      "'Those' refers to plural items located at a distance ('over there').",
      "'Those' ใช้ชี้คำนามพหูพจน์ (shoes) ที่อยู่ไกลตัว ('over there')",
      "grammar_demonstratives")

add_q("gq_a1_009", "A1", "modals_can", "gap_fill", -2.4, 1.15,
      "My sister can _____ three languages fluently.", "speak",
      ["speaks", "speak", "speaking", "to speak"],
      "Modal verbs like 'can' are followed by the bare infinitive.",
      "หลัง modal verb 'can' ต้องตามด้วยกริยาฐาน (bare infinitive)",
      "grammar_modal_bare_infinitive")

add_q("gq_a1_010", "A1", "possessive_adjectives", "gap_fill", -2.1, 1.25,
      "Anna has a new car. _____ car is red.", "Her",
      ["His", "Her", "Its", "Their"],
      "'Her' refers back to a female possessor (Anna).",
      "สรรพนามแสดงความเป็นเจ้าของสำหรับผู้หญิงเอกพจน์คือ 'Her'",
      "grammar_possessive_adjectives")

add_q("gq_a1_011", "A1", "there_is_are", "gap_fill", -2.2, 1.2,
      "_____ a big supermarket near my house.", "There is",
      ["There is", "There are", "It have", "They are"],
      "'There is' introduces a singular countable noun.",
      "บอกการมีอยู่ของคำนามเอกพจน์ ใช้ 'There is'",
      "grammar_there_be")

add_q("gq_a1_012", "A1", "prepositions_place", "gap_fill", -2.3, 1.1,
      "The notebook is _____ the desk.", "on",
      ["in", "on", "at", "to"],
      "'On' indicates placement on a horizontal surface.",
      "อยู่บนพื้นผิวโต๊ะ ใช้บุพบท 'on'",
      "grammar_prepositions_place")

add_q("gq_a1_013", "A1", "wh_questions", "gap_fill", -2.0, 1.3,
      "_____ is your favorite singer? - Ed Sheeran.", "Who",
      ["What", "Where", "Who", "When"],
      "'Who' asks about identity of a person.",
      "คำถามเกี่ยวกับบุคคลใช้ 'Who'",
      "grammar_wh_question_words")

add_q("gq_a1_014", "A1", "adverbs_frequency", "gap_fill", -1.9, 1.25,
      "Sarah _____ late for work; she is very punctual.", "is never",
      ["never is", "is never", "never", "isn't never"],
      "Adverbs of frequency follow the verb 'to be'.",
      "กริยาวิเศษณ์บอกความถี่ (never) อยู่หลัง verb to be เสมอ",
      "grammar_adverb_position_frequency")

add_q("gq_a1_015", "A1", "present_continuous", "gap_fill", -1.8, 1.35,
      "Look! The boys _____ football right now.", "are playing",
      ["play", "are playing", "is playing", "played"],
      "Action happening right now with plural subject uses are + verb-ing.",
      "เหตุการณ์ที่กำลังดำเนินอยู่ขณะนี้ (right now) ใช้ are + V-ing",
      "grammar_present_continuous_form")

add_q("gq_a1_016", "A1", "prepositions_days", "gap_fill", -2.1, 1.2,
      "We usually play tennis _____ Sunday afternoons.", "on",
      ["at", "in", "on", "by"],
      "'On' is used before days and specific day parts.",
      "วันในสัปดาห์ใช้บุพบท 'on'",
      "grammar_prepositions_days")

add_q("gq_a1_017", "A1", "have_has_got", "gap_fill", -2.0, 1.15,
      "David _____ got two brothers and one sister.", "has",
      ["have", "has", "is", "having"],
      "Singular subject David takes 'has got'.",
      "ประธานเอกพจน์บุรุษที่ 3 ใช้ 'has got'",
      "grammar_have_has_got")

add_q("gq_a1_018", "A1", "conjunctions_basic", "gap_fill", -2.2, 1.1,
      "I want to go to the cinema, _____ I don't have enough money.", "but",
      ["and", "or", "but", "so"],
      "'But' expresses contrast between two ideas.",
      "เชื่อมข้อความที่ขัดแย้งกันใช้ 'but'",
      "grammar_coordinating_conjunctions")

add_q("gq_a1_019", "A1", "quantifiers_much_many", "gap_fill", -1.9, 1.3,
      "How _____ water do you drink every day?", "much",
      ["many", "much", "lot", "few"],
      "'How much' is used with uncountable nouns like water.",
      "คำนามนับไม่ได้ (water) ถามปริมาณด้วย 'How much'",
      "grammar_quantifiers_uncountable")

add_q("gq_a1_020", "A1", "imperatives", "gap_fill", -2.3, 1.15,
      "Please _____ touch the paintings in the museum.", "don't",
      ["not", "no", "don't", "doesn't"],
      "Negative imperatives begin with 'don't' + base verb.",
      "ประโยคคำสั่งห้ามขึ้นต้นด้วย 'don't' + V.1",
      "grammar_negative_imperative")

add_q("gq_a1_021", "A1", "present_simple_questions", "gap_fill", -1.8, 1.35,
      "_____ your parents live in London?", "Do",
      ["Do", "Does", "Are", "Is"],
      "Plural subject 'your parents' takes auxiliary 'Do' in Present Simple questions.",
      "ประธานพหูพจน์ (your parents) ใช้กริยาช่วย 'Do' ในคำถาม",
      "grammar_present_simple_questions")

add_q("gq_a1_022", "A1", "verb_plus_ing", "gap_fill", -1.9, 1.25,
      "My little sister enjoys _____ books before bedtime.", "reading",
      ["read", "reads", "reading", "to read"],
      "'Enjoy' is followed by a gerund (-ing form).",
      "กริยา 'enjoy' ตามด้วย V-ing (gerund) เสมอ",
      "grammar_verb_plus_gerund_basic")

add_q("gq_a1_023", "A1", "adjective_order_basic", "gap_fill", -2.3, 1.1,
      "They bought a _____ table for the dining room.", "nice round",
      ["nice round", "round nice", "nicely round", "table round"],
      "Opinion adjectives (nice) precede shape/size adjectives (round).",
      "คุณศัพท์บอกความเห็น (nice) มาก่อนคุณศัพท์บอกรูปร่าง (round)",
      "grammar_adjective_order_basic")

add_q("gq_a1_024", "A1", "possessive_pronouns", "gap_fill", -1.9, 1.3,
      "This jacket isn't mine; it is _____.", "hers",
      ["her", "hers", "she", "herself"],
      "The independent possessive pronoun 'hers' stands alone.",
      "สรรพนามแสดงความเป็นเจ้าของที่วางเดี่ยวๆ ไม่ต้องมีนามตามหลังใช้ 'hers'",
      "grammar_possessive_pronouns")

add_q("gq_a1_025", "A1", "definite_article", "gap_fill", -2.1, 1.2,
      "Can you please open _____ window? It is warm in here.", "the",
      ["a", "an", "the", "any"],
      "'The' is used when the specific object is clear in the immediate setting.",
      "เจาะจงหน้าต่างในห้องที่ผู้ฟังและผู้พูดอยู่ด้วยกัน ใช้ 'the'",
      "grammar_definite_article_context")

add_q("gq_a1_026", "A1", "prepositions_transport", "gap_fill", -2.0, 1.25,
      "He travels to school _____ train every morning.", "by",
      ["in", "on", "by", "with"],
      "'By' is used directly with transport modes (by train, by car).",
      "บอกวิธีการเดินทางโดยตรงไม่ใส่ article ใช้ 'by train'",
      "grammar_prepositions_transport")

add_q("gq_a1_027", "A1", "plurals_es", "gap_fill", -2.4, 1.1,
      "I bought two new _____ for my shoes.", "boxes",
      ["box", "boxs", "boxes", "boxies"],
      "Nouns ending in -x add -es in the plural form.",
      "คำนามลงท้ายด้วย x เติม -es เมื่อเป็นพหูพจน์",
      "grammar_regular_plurals_es")

add_q("gq_a1_028", "A1", "be_negative_plural", "gap_fill", -2.3, 1.15,
      "The students _____ in the classroom right now.", "aren't",
      ["isn't", "aren't", "don't", "not are"],
      "Plural subject 'The students' requires negative be-verb 'aren't'.",
      "ประธานพหูพจน์ (The students) ใช้ 'aren't'",
      "grammar_be_negative_agreement")

add_q("gq_a1_029", "A1", "some_any_negative", "gap_fill", -1.8, 1.3,
      "There isn't _____ sugar left in the jar.", "any",
      ["some", "any", "many", "no"],
      "'Any' is used in negative sentences with uncountable nouns.",
      "ประโยคปฏิเสธใช้ 'any' กับคำนามนับไม่ได้",
      "grammar_some_any_negative")

add_q("gq_a1_030", "A1", "prepositions_months", "gap_fill", -2.0, 1.2,
      "My birthday is _____ September.", "in",
      ["on", "at", "in", "by"],
      "'In' is used with months of the year.",
      "ใช้นำหน้าชื่อเดือน (September) ใช้บุพบท 'in'",
      "grammar_prepositions_months")

# =========================================================================
# A2 LEVEL (30 questions: gq_a2_001 to gq_a2_030, b in [-1.5, -0.5])
# =========================================================================
add_q("gq_a2_001", "A2", "past_simple_regular", "gap_fill", -1.4, 1.2,
      "Yesterday, we _____ for three hours along the river.", "walked",
      ["walk", "walked", "walking", "have walked"],
      "Completed past action with explicit time marker 'yesterday' requires Past Simple.",
      "การกระทำที่จบลงแล้วในอดีตและมีคำบอกเวลา 'yesterday' ใช้ Past Simple (walked)",
      "grammar_past_simple_regular")

add_q("gq_a2_002", "A2", "past_simple_irregular", "gap_fill", -1.35, 1.3,
      "She _____ a beautiful dress at the shopping mall last Saturday.", "bought",
      ["buyed", "bought", "boughted", "buys"],
      "'Bought' is the irregular past tense of 'buy'.",
      "กริยาช่อง 2 ของ 'buy' คือรูปอปกติ 'bought'",
      "grammar_past_simple_irregular")

add_q("gq_a2_003", "A2", "comparative_adjectives", "gap_fill", -1.2, 1.35,
      "The blue jacket is _____ than the red one.", "more expensive",
      ["expensive", "more expensive", "expensiver", "most expensive"],
      "Three-syllable adjectives form the comparative with 'more' + adjective + 'than'.",
      "คุณศัพท์ตั้งแต่ 3 พยางค์ขึ้นไป (expensive) ทำขั้นกว่าด้วย 'more' + adj + than",
      "grammar_comparatives")

add_q("gq_a2_004", "A2", "superlative_adjectives", "gap_fill", -1.15, 1.25,
      "Mount Everest is _____ mountain in the world.", "the highest",
      ["higher", "highest", "the highest", "the most high"],
      "One-syllable adjectives take 'the' + -est in the superlative.",
      "คุณศัพท์พยางค์เดียวขั้นสูงสุดต้องมี 'the' นำหน้าแล้วเติม -est (the highest)",
      "grammar_superlatives")

add_q("gq_a2_005", "A2", "future_going_to", "gap_fill", -1.1, 1.3,
      "Look at those dark clouds! It _____ rain soon.", "is going to",
      ["will be", "is going to", "goes to", "is raining to"],
      "'Be going to' expresses predictions based on current visual evidence.",
      "การคาดคะเนเหตุการณ์ที่มีหลักฐานปรากฏให้เห็นในปัจจุบัน (dark clouds) ใช้ 'is going to'",
      "grammar_going_to_prediction")

add_q("gq_a2_006", "A2", "future_will", "gap_fill", -1.05, 1.2,
      "Don't worry about the dishes; I _____ do them for you.", "will",
      ["am going to", "will", "do", "would"],
      "'Will' is used for spontaneous offers and decisions made at the moment of speaking.",
      "การตัดสินใจช่วยเหลือทันทีขณะที่กำลังพูด (spontaneous decision/offer) ใช้ 'will'",
      "grammar_will_spontaneous")

add_q("gq_a2_007", "A2", "modals_have_to", "gap_fill", -1.25, 1.25,
      "You _____ show your passport when entering another country.", "have to",
      ["have to", "must to", "can to", "ought"],
      "'Have to' expresses external obligation/rules.",
      "การบอกกฎเกณฑ์หรือข้อบังคับภายนอก ใช้ 'have to'",
      "grammar_have_to_obligation")

add_q("gq_a2_008", "A2", "modals_should", "gap_fill", -1.3, 1.2,
      "You look very tired; you _____ go to bed earlier.", "should",
      ["should", "should to", "ought", "must to"],
      "'Should' + bare infinitive gives friendly advice.",
      "การให้คำแนะนำทั่วไป ใช้ modal verb 'should' + กริยาช่อง 1",
      "grammar_should_advice")

add_q("gq_a2_009", "A2", "past_simple_negative", "gap_fill", -1.2, 1.35,
      "We _____ enjoy the film because it was too scary.", "didn't",
      ["didn't", "don't", "weren't", "hadn't"],
      "Past Simple negative uses 'didn't' + base form for all subjects.",
      "ประโยคปฏิเสธใน Past Simple ใช้ 'didn't' + กริยาฐาน (base form)",
      "grammar_past_simple_negative")

add_q("gq_a2_010", "A2", "past_simple_question", "gap_fill", -1.1, 1.3,
      "Where _____ you go for your summer vacation last year?", "did",
      ["do", "did", "were", "have"],
      "Past Simple questions require the auxiliary 'did' + base verb.",
      "คำถามถามถึงเหตุการณ์ในอดีต (last year) ใช้กริยาช่วย 'did'",
      "grammar_past_simple_questions")

add_q("gq_a2_011", "A2", "past_continuous_intro", "gap_fill", -0.9, 1.4,
      "At 8 PM yesterday, I _____ my homework in my bedroom.", "was doing",
      ["did", "was doing", "am doing", "have done"],
      "Action in progress at a specific past moment uses was/were + verb-ing.",
      "การกระทำที่กำลังดำเนินอยู่ในเวลาเฉพาะเจาะจงในอดีต ใช้ Past Continuous (was doing)",
      "grammar_past_continuous_basic")

add_q("gq_a2_012", "A2", "when_while_past", "gap_fill", -0.85, 1.4,
      "I was cooking dinner when the doorbell _____.", "rang",
      ["rings", "rang", "was ringing", "had rung"],
      "A short past action interrupting a continuous past action uses Past Simple.",
      "เหตุการณ์สั้นที่เข้ามาแทรกขณะที่อีกเหตุการณ์กำลังดำเนินอยู่ ใช้ Past Simple (rang)",
      "grammar_past_interrupted_action")

add_q("gq_a2_013", "A2", "conjunction_because_so", "gap_fill", -1.3, 1.15,
      "It started raining heavily, _____ we decided to stay indoors.", "so",
      ["because", "so", "although", "since"],
      "'So' introduces the result of an action.",
      "เชื่อมประโยคเพื่อบอกผลลัพธ์ที่ตามมา ใช้ 'so' (ดังนั้น)",
      "grammar_conjunctions_result")

add_q("gq_a2_014", "A2", "conjunction_although", "gap_fill", -0.8, 1.35,
      "_____ it was freezing cold, they went swimming in the lake.", "Although",
      ["Because", "Although", "So", "However"],
      "'Although' introduces a subordinate clause showing surprising contrast.",
      "เชื่อมประโยครองที่แสดงความขัดแย้งที่ไม่คาดคิด ใช้ 'Although' (แม้ว่า)",
      "grammar_conjunctions_contrast")

add_q("gq_a2_015", "A2", "infinitives_of_purpose", "gap_fill", -1.15, 1.25,
      "He went to the pharmacy _____ some medicine for his headache.", "to get",
      ["for get", "to get", "getting", "for getting"],
      "An infinitive with 'to' expresses purpose (why someone did something).",
      "การบอกวัตถุประสงค์ของการกระทำ (ไปเพื่ออะไร) ใช้ to-infinitive ('to get')",
      "grammar_infinitive_of_purpose")

add_q("gq_a2_016", "A2", "gerund_after_preposition", "gap_fill", -1.0, 1.3,
      "She is really good at _____ traditional Thai food.", "cooking",
      ["cook", "cooks", "cooking", "to cook"],
      "Prepositions (like 'at') must be followed by a gerund (-ing).",
      "คำที่ตามหลังคำบุพบท (at) ต้องอยู่ในรูป gerund (V-ing) เสมอ",
      "grammar_gerund_after_prepositions")

add_q("gq_a2_017", "A2", "as_as_comparison", "gap_fill", -1.05, 1.25,
      "My brother is not as _____ as my father.", "tall",
      ["taller", "tall", "tallest", "more tall"],
      "Equality comparison 'as... as' uses the base adjective.",
      "โครงสร้างการเปรียบเทียบเท่าเทียม 'as ... as' ใช้คำคุณศัพท์รูปปกติ (tall)",
      "grammar_as_as_comparison")

add_q("gq_a2_018", "A2", "too_enough", "gap_fill", -0.95, 1.3,
      "He is not old _____ to drive a car.", "enough",
      ["too", "enough", "so", "very"],
      "'Enough' follows adjectives and precedes to-infinitive.",
      "'enough' วางไว้ 'หลัง' คำคุณศัพท์ (old enough) เพื่อบอกความพอเพียง",
      "grammar_too_enough")

add_q("gq_a2_019", "A2", "quantifiers_few_little", "gap_fill", -0.9, 1.35,
      "We have _____ time left before the exam starts, so hurry up.", "little",
      ["few", "a few", "little", "many"],
      "'Little' means not much and is used with uncountable nouns like 'time'.",
      "'time' เป็นนามนับไม่ได้และมีความหมายเชิงลบ (เหลือน้อยแทบไม่มี) ใช้ 'little'",
      "grammar_few_little")

add_q("gq_a2_020", "A2", "prepositions_movement", "gap_fill", -1.2, 1.2,
      "The cat ran _____ the street to chase a bird.", "across",
      ["through", "across", "along", "onto"],
      "'Across' means from one side of a surface or road to the other.",
      "การเคลื่อนที่จากฝั่งหนึ่งข้ามไปยังอีกฝั่งหนึ่งของถนน ใช้ 'across'",
      "grammar_prepositions_movement")

add_q("gq_a2_021", "A2", "reflexive_pronouns", "gap_fill", -1.1, 1.25,
      "He looked at _____ in the mirror and smiled.", "himself",
      ["him", "his", "himself", "he"],
      "Reflexive pronoun 'himself' is used when the subject and object are the same person.",
      "ประธานและกรรมเป็นบุคคลเดียวกัน ใช้สรรพนามสะท้อน 'himself'",
      "grammar_reflexive_pronouns")

add_q("gq_a2_022", "A2", "adverbs_of_manner", "gap_fill", -1.3, 1.2,
      "The baby was sleeping, so she closed the door _____.", "quietly",
      ["quiet", "quietly", "more quiet", "quietness"],
      "Adverbs of manner ending in -ly describe how the action was performed.",
      "ขยายคำกริยา 'closed' เพื่อบอกลักษณะการกระทำ ใช้ adverb 'quietly'",
      "grammar_adverbs_manner")

add_q("gq_a2_023", "A2", "indefinite_pronouns", "gap_fill", -1.0, 1.3,
      "There is _____ at the front door waiting to see you.", "someone",
      ["anyone", "someone", "no one", "anything"],
      "'Someone' is used in affirmative statements referring to an unidentified person.",
      "ประโยคบอกเล่ากล่าวถึงบุคคลที่ไม่ระบุเจาะจง ใช้ 'someone'",
      "grammar_indefinite_pronouns")

add_q("gq_a2_024", "A2", "must_mustn't", "gap_fill", -1.15, 1.25,
      "You _____ speak loudly in the library; it is strictly forbidden.", "mustn't",
      ["don't have to", "mustn't", "shouldn't", "needn't"],
      "'Mustn't' expresses strict prohibition.",
      "ข้อห้ามที่เคร่งครัดตามกฎระเบียบ (strictly forbidden) ใช้ 'mustn't'",
      "grammar_must_prohibition")

add_q("gq_a2_025", "A2", "question_tags_basic", "gap_fill", -0.85, 1.4,
      "You live in Chiang Mai, _____ you?", "don't",
      ["aren't", "don't", "didn't", "do"],
      "Positive Present Simple statement with main verb 'live' takes negative tag 'don't you?'.",
      "ประโยคบอกเล่า Present Simple กริยาแท้ live ใช้ question tag ปฏิเสธ 'don't you?'",
      "grammar_question_tags_basic")

add_q("gq_a2_026", "A2", "preposition_during_for", "gap_fill", -0.95, 1.35,
      "I lived in Tokyo _____ two years before moving to London.", "for",
      ["during", "for", "since", "while"],
      "'For' expresses a duration of time (two years).",
      "บอกระยะเวลาความยาวนานของการกระทำ (two years) ใช้ 'for'",
      "grammar_for_during_duration")

add_q("gq_a2_027", "A2", "present_perfect_intro", "gap_fill", -0.75, 1.45,
      "Have you ever _____ to Japan before?", "been",
      ["went", "be", "been", "gone"],
      "'Have you ever been to' is the standard inquiry about life experience of visiting a place.",
      "ถามถึงประสบการณ์ชีวิตว่าเคยไปเยือนสถานที่นั้นแล้วกลับมาหรือยัง ใช้ 'been to'",
      "grammar_present_perfect_experience")

add_q("gq_a2_028", "A2", "used_to_intro", "gap_fill", -0.8, 1.4,
      "When I was a child, I _____ live in a small village.", "used to",
      ["used to", "was used to", "use to", "am used to"],
      "'Used to' + base verb expresses a past state or habit that is no longer true.",
      "บอกถึงสภาพหรือนิสัยในอดีตที่ปัจจุบันไม่ได้ทำแล้ว ใช้ 'used to' + V.1",
      "grammar_used_to_past_habit")

add_q("gq_a2_029", "A2", "relative_pronouns_who", "gap_fill", -1.1, 1.25,
      "The woman _____ helped me at the hospital was very kind.", "who",
      ["which", "who", "where", "whose"],
      "'Who' is the subject relative pronoun referring to people.",
      "ประภัสสรรพนาม (relative pronoun) แทนคำนามบุคคล (The woman) ใช้ 'who'",
      "grammar_relative_pronouns_who")

add_q("gq_a2_030", "A2", "modals_permission_may", "gap_fill", -1.25, 1.2,
      "Excuse me, _____ I borrow your dictionary for a moment?", "may",
      ["may", "should", "must", "would"],
      "'May' is a polite modal used to ask for permission.",
      "การขออนุญาตอย่างสุภาพตามมารยาท ใช้ modal verb 'may'",
      "grammar_modals_permission")

# =========================================================================
# B1 LEVEL (30 questions: gq_b1_001 to gq_b1_030, b in [-0.5, +0.5])
# =========================================================================
add_q("gq_b1_001", "B1", "present_perfect_vs_past", "gap_fill", -0.4, 1.35,
      "I _____ my passport yesterday, so I couldn't board the flight.", "lost",
      ["have lost", "lost", "had lost", "was losing"],
      "Specific past time adverbials (yesterday) strictly require Past Simple, not Present Perfect.",
      "เมื่อมีคำระบุเวลาอดีตเจาะจงชัดเจน (yesterday) ต้องใช้ Past Simple (lost) ไม่ใช้ Present Perfect",
      "grammar_present_perfect_vs_past_simple")

add_q("gq_b1_002", "B1", "present_perfect_continuous", "gap_fill", -0.2, 1.45,
      "She is exhausted because she _____ tennis since eight this morning.", "has been playing",
      ["plays", "has played", "has been playing", "was playing"],
      "Action continuing from the past to the present with continuous focus uses Present Perfect Continuous.",
      "การกระทำที่เริ่มในอดีตและดำเนินต่อเนื่องมาถึงปัจจุบันโดยเน้นความต่อเนื่อง ใช้ Present Perfect Continuous",
      "grammar_present_perfect_continuous")

add_q("gq_b1_003", "B1", "first_conditional", "gap_fill", -0.3, 1.35,
      "If you _____ hard, you will pass all your final exams.", "work",
      ["will work", "work", "worked", "are working"],
      "The 'if' clause of the First Conditional uses Present Simple, not 'will'.",
      "ในประโยคเงื่อนไขแบบที่ 1 (First Conditional) ส่วนของ if-clause ต้องใช้ Present Simple",
      "grammar_first_conditional")

add_q("gq_b1_004", "B1", "second_conditional_basic", "gap_fill", 0.1, 1.4,
      "If I _____ a million dollars, I would travel around the world.", "won",
      ["win", "won", "have won", "had won"],
      "Second Conditional (hypothetical present/future) uses Past Simple in the if-clause.",
      "ประโยคเงื่อนไขสมมติในปัจจุบัน (Second Conditional) ใน if-clause ใช้ Past Simple (won)",
      "grammar_second_conditional")

add_q("gq_b1_005", "B1", "passive_voice_present", "gap_fill", -0.35, 1.3,
      "Millions of electronic devices _____ in this factory every month.", "are manufactured",
      ["manufacture", "are manufactured", "were manufactured", "are manufacturing"],
      "Present Simple passive uses is/are + past participle (are manufactured).",
      "ประธานเป็นผู้ถูกกระทำในเหตุการณ์ปกติ (passive voice) ใช้ are + V.3 (are manufactured)",
      "grammar_passive_voice_present")

add_q("gq_b1_006", "B1", "passive_voice_past", "gap_fill", -0.25, 1.35,
      "The Mona Lisa _____ by Leonardo da Vinci in the early 16th century.", "was painted",
      ["painted", "was painted", "has been painted", "is painted"],
      "Past Simple passive uses was/were + past participle (was painted).",
      "ประธานถูกกระทำในอดีต (16th century) ใช้รูป Past Simple Passive (was painted)",
      "grammar_passive_voice_past")

add_q("gq_b1_007", "B1", "modals_deduction_present", "gap_fill", 0.2, 1.45,
      "The lights are off and their car is gone. They _____ at home.", "can't be",
      ["must be", "can't be", "shouldn't be", "might be"],
      "'Can't be' expresses strong negative deduction based on evidence.",
      "การคาดคะเนเชิงปฏิเสธอย่างมั่นใจจากหลักฐานแวดล้อม ใช้ 'can't be' (เป็นไปไม่ได้ที่จะอยู่)",
      "grammar_modals_deduction_present")

add_q("gq_b1_008", "B1", "modals_must_deduction", "gap_fill", 0.15, 1.4,
      "He has been working for twelve hours without a break; he _____ be exhausted.", "must",
      ["can", "must", "should", "would"],
      "'Must' expresses logical certainty / strong affirmative deduction.",
      "การคาดคะเนข้อเท็จจริงอย่างมั่นใจจากหลักฐานเชิงบวก ใช้ 'must be'",
      "grammar_modals_deduction_must")

add_q("gq_b1_009", "B1", "gerund_vs_infinitive_stop", "gap_fill", 0.0, 1.5,
      "He was feeling very tired, so he stopped _____ a quick coffee.", "to have",
      ["having", "to have", "have", "for have"],
      "'Stop + to-infinitive' means pausing an activity in order to do something else.",
      "'stop + to-infinitive' หมายถึงหยุดสิ่งที่ทำอยู่เพื่อไปทำสิ่งใหม่ (แวะดื่มกาแฟ)",
      "grammar_verb_patterns_stop")

add_q("gq_b1_010", "B1", "gerund_vs_infinitive_remember", "gap_fill", 0.25, 1.5,
      "Please remember _____ the front door before you leave for work.", "to lock",
      ["locking", "to lock", "lock", "locked"],
      "'Remember + to-infinitive' refers to remembering a duty before performing it.",
      "'remember + to-infinitive' หมายถึงจำสิ่งที่ต้องทำและทำตามหน้าที่ในอนาคต",
      "grammar_verb_patterns_remember")

add_q("gq_b1_011", "B1", "relative_clauses_whose", "gap_fill", -0.1, 1.35,
      "I met a gentleman _____ son plays professional football.", "whose",
      ["who", "whom", "whose", "which"],
      "'Whose' is the relative pronoun expressing possession.",
      "สรรพนามเชื่อมแสดงความเป็นเจ้าของความสัมพันธ์ทางเครือญาติ ใช้ 'whose'",
      "grammar_relative_clauses_whose")

add_q("gq_b1_012", "B1", "relative_clauses_where", "gap_fill", -0.3, 1.25,
      "This is the university _____ my parents first met thirty years ago.", "where",
      ["which", "where", "that", "what"],
      "'Where' is the relative adverb referring to a location of an action.",
      "คำเชื่อมแสดงสถานที่ที่เหตุการณ์เกิดขึ้น ใช้ 'where'",
      "grammar_relative_clauses_where")

add_q("gq_b1_013", "B1", "reported_speech_tense_shift", "gap_fill", 0.05, 1.45,
      "'I am moving to Paris,' she said. -> She said that she _____ to Paris.", "was moving",
      ["is moving", "was moving", "has moved", "will move"],
      "Direct speech in Present Continuous shifts back to Past Continuous in indirect speech.",
      "การเปลี่ยนคำพูดเป็น Reported Speech กริยา Present Continuous เลื่อนถอยเป็น Past Continuous",
      "grammar_reported_speech_tense_shift")

add_q("gq_b1_014", "B1", "reported_questions", "gap_fill", 0.3, 1.5,
      "He asked me where _____ my car.", "I had parked",
      ["had I parked", "I had parked", "did I park", "I parked had"],
      "Reported questions use normal statement word order (Subject + Verb), not inverted question order.",
      "ใน Reported Questions ลำดับคำต้องเรียงแบบประโยคบอกเล่า (ประธาน + กริยา) ห้ามกลับกริยาช่วย",
      "grammar_reported_questions_order")

add_q("gq_b1_015", "B1", "for_since_distinction", "gap_fill", -0.4, 1.3,
      "She has lived in this apartment _____ she graduated from college.", "since",
      ["for", "since", "during", "from"],
      "'Since' is used with a specific starting point in time.",
      "บอกจุดเริ่มต้นของเวลาในอดีต (she graduated) ใช้ 'since'",
      "grammar_since_starting_point")

add_q("gq_b1_016", "B1", "past_perfect_simple", "gap_fill", 0.1, 1.4,
      "By the time the fire brigade arrived, the fire _____ already out.", "had gone",
      ["went", "has gone", "had gone", "was going"],
      "An action completed before another past event uses Past Perfect (had + past participle).",
      "เหตุการณ์ที่เสร็จสิ้นลงก่อนอีกเหตุการณ์หนึ่งในอดีต ใช้ Past Perfect (had gone)",
      "grammar_past_perfect_precedence")

add_q("gq_b1_017", "B1", "so_such_that", "gap_fill", -0.15, 1.35,
      "It was _____ an interesting book that I couldn't put it down.", "such",
      ["so", "such", "too", "very"],
      "'Such + a/an + adjective + singular noun' expresses degree leading to a result.",
      "โครงสร้างบอกผลลัพธ์ 'such + a/an + adj + noun + that' ใช้ 'such'",
      "grammar_so_such_clauses")

add_q("gq_b1_018", "B1", "used_to_vs_be_used_to", "gap_fill", 0.4, 1.5,
      "I found the hot weather difficult at first, but now I _____ to it.", "am used",
      ["used", "am used", "use", "was used"],
      "'Be used to + noun/gerund' means being accustomed to something.",
      "โครงสร้าง 'be used to + noun' หมายถึงเคยชินแล้วกับสิ่งนั้นในปัจจุบัน",
      "grammar_be_used_to_accustomed")

add_q("gq_b1_019", "B1", "passive_with_modals", "gap_fill", 0.2, 1.4,
      "All application forms must _____ before the end of the month.", "be submitted",
      ["submit", "be submitted", "been submitted", "submitting"],
      "Modal passive requires modal + be + past participle.",
      "Passive voice กับกริยาช่วย modal ใช้โครงสร้าง must + be + V.3",
      "grammar_passive_with_modals")

add_q("gq_b1_020", "B1", "future_continuous", "gap_fill", 0.35, 1.45,
      "This time tomorrow, we _____ over the Atlantic Ocean.", "will be flying",
      ["fly", "will fly", "will be flying", "will have flown"],
      "Future Continuous describes an action that will be in progress at a specific future moment.",
      "บอกการกระทำที่จะกำลังดำเนินอยู่ในจุดเวลาใดเวลาหนึ่งในอนาคต ใช้ Future Continuous",
      "grammar_future_continuous")

add_q("gq_b1_021", "B1", "defining_relative_omission", "gap_fill", 0.05, 1.4,
      "The documentary _____ we watched last night was thought-provoking.", "which",
      ["what", "which", "where", "whose"],
      "Object relative pronoun referring to things is 'which' or 'that'.",
      "ประภัสสรรพนามทำหน้าที่กรรมแทนสิ่งของ (documentary) ใช้ 'which'",
      "grammar_relative_pronouns_things")

add_q("gq_b1_022", "B1", "unless_conditional", "gap_fill", -0.05, 1.4,
      "We will cancel the picnic _____ the weather improves by noon.", "unless",
      ["if", "unless", "provided", "in case"],
      "'Unless' means 'if not' and introduces a condition.",
      "'unless' มีความหมายเท่ากับ 'if not' (เว้นแต่ว่า / ถ้า...ไม่)",
      "grammar_unless_conditional")

add_q("gq_b1_023", "B1", "in_case_vs_if", "gap_fill", 0.25, 1.45,
      "Take an umbrella with you _____ it rains while you are out.", "in case",
      ["in case", "if", "unless", "provided"],
      "'In case' expresses doing something as a precaution for a possible future event.",
      "'in case' ใช้บอกการเตรียมพร้อมป้องกันไว้เผื่อกรณีที่เหตุการณ์อาจเกิดขึ้น",
      "grammar_in_case_precaution")

add_q("gq_b1_024", "B1", "either_neither", "gap_fill", -0.2, 1.3,
      "_____ my brother nor my sister enjoys watching horror movies.", "Neither",
      ["Either", "Neither", "Both", "Not"],
      "'Neither... nor' pairs to connect two negative alternatives.",
      "คำเชื่อมคู่ปฏิเสธที่เข้าคู่กับ 'nor' คือ 'Neither'",
      "grammar_neither_nor")

add_q("gq_b1_025", "B1", "causative_have", "gap_fill", 0.45, 1.5,
      "I need to _____ my car serviced before our long road trip.", "have",
      ["make", "have", "do", "let"],
      "Causative 'have something done' means arranging for someone else to do a service.",
      "โครงสร้าง causative 'have + something + V.3' หมายถึงจ้างวานหรือนำไปให้ผู้อื่นทำบริการให้",
      "grammar_causative_have_done")

add_q("gq_b1_026", "B1", "question_tags_modal", "gap_fill", -0.1, 1.35,
      "She can speak Japanese fluently, _____ she?", "can't",
      ["can", "can't", "doesn't", "is she"],
      "Affirmative sentence with modal 'can' takes negative tag 'can't'.",
      "ประโยคบอกเล่าที่มี modal 'can' ใช้ question tag ปฏิเสธ 'can't she?'",
      "grammar_question_tags_modals")

add_q("gq_b1_027", "B1", "verb_object_infinitive", "gap_fill", -0.25, 1.3,
      "My teacher advised me _____ more attention to pronunciation.", "to pay",
      ["pay", "to pay", "paying", "paid"],
      "'Advise + object + to-infinitive' is the required verb pattern.",
      "กริยา advise ตามด้วยกรรมและ to-infinitive (advise someone to do something)",
      "grammar_verb_object_infinitive")

add_q("gq_b1_028", "B1", "despite_vs_although", "gap_fill", 0.15, 1.45,
      "_____ the heavy traffic, we arrived at the concert on time.", "Despite",
      ["Although", "Despite", "Even though", "However"],
      "'Despite' is a preposition followed by a noun phrase, whereas 'although' takes a clause.",
      "'Despite' เป็นบุพบทตามด้วยนามวลี (the heavy traffic) ส่วน although ต้องตามด้วยประโยค",
      "grammar_despite_in_spite_of")

add_q("gq_b1_029", "B1", "still_yet_already", "gap_fill", -0.3, 1.3,
      "Has the postman delivered the morning mail _____?", "yet",
      ["already", "still", "yet", "just"],
      "'Yet' is standard at the end of questions asking if an expected event has occurred.",
      "วางท้ายประโยคคำถามเพื่อถามว่าการกระทำที่รอคอยเกิดขึ้นหรือยัง ใช้ 'yet'",
      "grammar_yet_questions")

add_q("gq_b1_030", "B1", "adjective_dependent_prepositions", "gap_fill", -0.35, 1.25,
      "Are you interested _____ joining our photography club?", "in",
      ["at", "on", "in", "with"],
      "'Interested' takes the dependent preposition 'in'.",
      "คุณศัพท์ 'interested' ใช้คู่กับบุพบท 'in' เสมอ",
      "grammar_dependent_prepositions_adjectives")

# =========================================================================
# B2 LEVEL (30 questions: gq_b2_001 to gq_b2_030, b in [+0.5, +1.5])
# =========================================================================
add_q("gq_b2_001", "B2", "third_conditional", "gap_fill", 0.6, 1.5,
      "If we _____ the earlier train, we wouldn't have missed the opening ceremony.", "had caught",
      ["caught", "had caught", "would have caught", "catch"],
      "Third Conditional (unreal past) uses Past Perfect in the if-clause.",
      "ประโยคเงื่อนไขสมมติขัดแย้งกับอดีต (Third Conditional) ส่วน if-clause ใช้ Past Perfect",
      "grammar_third_conditional")

add_q("gq_b2_002", "B2", "mixed_conditionals_intro", "gap_fill", 1.1, 1.6,
      "If he had taken my advice last year, he _____ in financial trouble now.", "wouldn't be",
      ["wouldn't have been", "wouldn't be", "isn't", "won't be"],
      "Mixed conditional: past condition (had taken) having a present result (wouldn't be now).",
      "เงื่อนไขผสม (Mixed Conditional): เหตุเกิดในอดีตส่งผลต่อสภาวะปัจจุบัน (wouldn't be now)",
      "grammar_mixed_conditionals_past_present")

add_q("gq_b2_003", "B2", "modals_past_deduction_must", "gap_fill", 0.7, 1.5,
      "The ground is soaking wet; it _____ heavily during the night.", "must have rained",
      ["must rain", "must have rained", "should have rained", "can have rained"],
      "'Must have + past participle' makes a logical deduction about a past occurrence.",
      "การคาดคะเนอดีตอย่างมั่นใจจากหลักฐานปัจจุบัน ใช้โครงสร้าง 'must have + V.3'",
      "grammar_modals_past_deduction")

add_q("gq_b2_004", "B2", "modals_past_regret_should", "gap_fill", 0.65, 1.45,
      "I failed the driving test. I _____ more before taking it.", "should have practiced",
      ["should practice", "should have practiced", "must have practiced", "could practice"],
      "'Should have + past participle' expresses past regret or criticism of an unperformed action.",
      "การแสดงความเสียดายหรือตำหนิสิ่งที่ควรทำในอดีตแต่ไม่ได้ทำ ใช้ 'should have + V.3'",
      "grammar_should_have_past_regret")

add_q("gq_b2_005", "B2", "wish_past_unreal", "gap_fill", 0.8, 1.55,
      "I wish I _____ so harshly to my colleague yesterday.", "hadn't spoken",
      ["didn't speak", "hadn't spoken", "wouldn't speak", "haven't spoken"],
      "'Wish + Past Perfect' expresses regret about a past situation.",
      "การแสดงความเสียดายเกี่ยวกับเหตุการณ์ในอดีตหลัง wish ใช้รูป Past Perfect (hadn't spoken)",
      "grammar_wish_past_regret")

add_q("gq_b2_006", "B2", "wish_present_unreal", "gap_fill", 0.55, 1.4,
      "I wish I _____ enough spare time to learn how to play the piano.", "had",
      ["have", "had", "would have", "had had"],
      "'Wish + Past Simple' expresses a desire for a different present situation.",
      "ความปรารถนาที่ตรงข้ามกับความจริงในปัจจุบันหลัง wish ใช้ Past Simple (had)",
      "grammar_wish_present_unreal")

add_q("gq_b2_007", "B2", "non_defining_relative", "gap_fill", 0.75, 1.45,
      "Dr. Watson, _____ research on genetics won the Nobel Prize, will speak today.", "whose",
      ["who", "whom", "whose", "which"],
      "Non-defining relative clause expressing possession uses 'whose'.",
      "อนุประโยคแทรกไม่อธิบายจำกัดความ (มีเครื่องหมายจุลภาค) แสดงความเป็นเจ้าของ ใช้ 'whose'",
      "grammar_non_defining_relative_clauses")

add_q("gq_b2_008", "B2", "whom_preposition", "gap_fill", 0.95, 1.55,
      "The senior director with _____ I spoke yesterday confirmed our appointment.", "whom",
      ["who", "whom", "which", "whose"],
      "Formal English requires 'whom' directly following a preposition when referring to a person.",
      "ในภาษาทางการ เมื่อสรรพนามบุคคลอยู่ 'หลังคำบุพบท' โดยตรง ต้องใช้รูปกรรม 'whom'",
      "grammar_whom_after_prepositions")

add_q("gq_b2_009", "B2", "passive_reporting_verbs", "gap_fill", 1.05, 1.6,
      "The ancient temple is believed _____ by the king over a thousand years ago.", "to have been built",
      ["to be built", "to have been built", "being built", "having built"],
      "Impersonal passive reporting with past time reference uses 'to have been + past participle'.",
      "การรายงานความเชื่อทางประวัติศาสตร์ที่มีผลเกิดก่อน ใช้รูป 'to have been built'",
      "grammar_passive_reporting_verbs")

add_q("gq_b2_010", "B2", "future_perfect_simple", "gap_fill", 0.85, 1.5,
      "By next December, the construction team _____ the bridge.", "will have completed",
      ["will complete", "will be completing", "will have completed", "completed"],
      "'By' + future time expression requires the Future Perfect (will have completed).",
      "เมื่อมี 'By + เวลาในอนาคต' ใช้ Future Perfect (will have + V.3) เพื่อบอกความสำเร็จก่อนเวลานั้น",
      "grammar_future_perfect")

add_q("gq_b2_011", "B2", "future_perfect_continuous", "gap_fill", 1.2, 1.65,
      "In October, she _____ at this international school for precisely twenty years.", "will have been teaching",
      ["will teach", "will be teaching", "will have been teaching", "is teaching"],
      "Expresses duration up to a specific future point using Future Perfect Continuous.",
      "บอกความต่อเนื่องของระยะเวลาที่จะดำเนินมาครบกำหนดในอนาคต ใช้ Future Perfect Continuous",
      "grammar_future_perfect_continuous")

add_q("gq_b2_012", "B2", "had_better_infinitive", "gap_fill", 0.6, 1.45,
      "You had better _____ your coats; the temperature is dropping rapidly.", "put on",
      ["to put on", "put on", "putting on", "have put on"],
      "'Had better' is followed by a bare infinitive without 'to'.",
      "'had better' (ควรจะ...ดีกว่า) ต้องตามด้วยกริยาฐานรูป bare infinitive (ไม่มี to)",
      "grammar_had_better_bare_infinitive")

add_q("gq_b2_013", "B2", "would_rather_past", "gap_fill", 1.0, 1.6,
      "I would rather you _____ anyone about what happened this morning.", "didn't tell",
      ["don't tell", "didn't tell", "not to tell", "won't tell"],
      "'Would rather + subject + Past Simple' expresses preference for someone else's action.",
      "'would rather + ประธานคนอื่น' กริยาต้องถอยรูปเป็น Past Simple (didn't tell)",
      "grammar_would_rather_different_subject")

add_q("gq_b2_014", "B2", "it_is_time_past", "gap_fill", 0.9, 1.55,
      "It is high time the government _____ effective measures against inflation.", "took",
      ["takes", "took", "take", "has taken"],
      "'It is high time + subject + Past Simple' indicates that an action is already overdue.",
      "สำนวน 'It is high time + ประธาน' กริยาต้องใช้ Past Simple เพื่อสื่อว่าถึงเวลาที่ควรทำตั้งนานแล้ว",
      "grammar_it_is_high_time")

add_q("gq_b2_015", "B2", "participial_adjectives", "gap_fill", 0.5, 1.35,
      "The documentary about deep ocean trenches was utterly _____.", "fascinating",
      ["fascinated", "fascinating", "fascination", "fascinate"],
      "-ing adjectives describe the characteristic/source of the feeling (the documentary).",
      "คุณศัพท์ลงท้าย -ing ใช้บรรยายลักษณะของสิ่งของหรือเหตุการณ์ที่ก่อให้เกิดความรู้สึก",
      "grammar_participial_adjectives_ed_ing")

add_q("gq_b2_020", "B2", "inversion_hardly_when", "gap_fill", 1.3, 1.7,
      "Hardly _____ the house when the storm began.", "had we left",
      ["we had left", "had we left", "did we leave", "we left"],
      "Negative adverb 'Hardly' at sentence start triggers subject-auxiliary inversion with 'had'.",
      "คำปฏิเสธ 'Hardly' ขึ้นต้นประโยค บังคับเกิด Inversion กริยาช่วย had มาหน้าประธาน",
      "grammar_inversion_hardly_when")

add_q("gq_b2_017", "B2", "inversion_no_sooner", "gap_fill", 1.35, 1.7,
      "No sooner had the plane landed _____ the passengers stood up.", "than",
      ["when", "than", "then", "that"],
      "'No sooner... than' is the mandatory correlative conjunction pair.",
      "คู่คำเชื่อม Inversion 'No sooner had ...' ต้องเข้าคู่กับ 'than' เสมอ",
      "grammar_inversion_no_sooner_than")

add_q("gq_b2_018", "B2", "clauses_of_concession_whereas", "gap_fill", 0.7, 1.45,
      "Some people prefer modern urban apartments, _____ others love rural cottages.", "whereas",
      ["despite", "whereas", "in spite of", "unless"],
      "'Whereas' connects two contrasting facts in parallel clauses.",
      "'whereas' ใช้เชื่อมสองอนุประโยคเพื่อเปรียบเทียบความแตกต่างที่เห็นได้ชัด",
      "grammar_concession_whereas")

add_q("gq_b2_019", "B2", "cleft_sentences_what", "gap_fill", 1.15, 1.6,
      "_____ surprised me most was how calm the pilot remained during turbulence.", "What",
      ["That", "Which", "What", "It"],
      "Wh-cleft sentence beginning with 'What' focuses on the subject action/clause.",
      "Cleft sentence แบบขึ้นต้นด้วย 'What' ใช้เน้นสิ่งที่เกิดขึ้น (สิ่งที่ทำให้ฉันประหลาดใจที่สุดคือ...)",
      "grammar_wh_cleft_sentences")

add_q("gq_b2_016", "B2", "cleft_sentences_it_is", "gap_fill", 1.0, 1.55,
      "It was my uncle _____ encouraged me to pursue a career in aerospace engineering.", "who",
      ["which", "who", "whom", "whose"],
      "It-cleft focusing on a person uses 'who' or 'that'.",
      "It-cleft sentence ที่เน้นตัวบุคคล (my uncle) ใช้คำเชื่อม 'who'",
      "grammar_it_cleft_sentences")

add_q("gq_b2_021", "B2", "participle_clauses_present", "gap_fill", 0.85, 1.5,
      "_____ through the park, I stumbled across a flock of wild parakeets.", "Walking",
      ["Walked", "Walking", "Having walked", "To walk"],
      "Present participle clause expresses an action happening at the same time as the main clause.",
      "Participle clause รูป V-ing (Walking) ใช้บอกการกระทำที่เกิดขึ้นพร้อมกับกริยาหลักในประโยค",
      "grammar_participle_clauses_time")

add_q("gq_b2_022", "B2", "participle_clauses_perfect", "gap_fill", 1.1, 1.6,
      "_____ all her exams with distinction, Maria felt immensely relieved.", "Having passed",
      ["Passing", "Having passed", "Passed", "To pass"],
      "Perfect participle clause (Having + past participle) emphasizes that one action finished before another.",
      "Perfect participle (Having passed) ใช้เน้นย้ำว่าการกระทำนี้เสร็จสิ้นอย่างสมบูรณ์ก่อนกริยาหลัก",
      "grammar_perfect_participle_clauses")

add_q("gq_b2_023", "B2", "passive_gerund", "gap_fill", 0.9, 1.5,
      "He strongly dislikes _____ what to do by his junior colleagues.", "being told",
      ["telling", "to tell", "being told", "to be told"],
      "Passive gerund after 'dislike' uses being + past participle.",
      "กริยา dislike ตามด้วย gerund และเมื่ออยู่ในความหมายเชิงถูกกระทำ ต้องใช้ 'being + V.3'",
      "grammar_passive_gerunds")

add_q("gq_b2_024", "B2", "needn't_have_vs_didn't_need_to", "gap_fill", 1.25, 1.65,
      "We _____ brought warm coats; the weather turned out to be delightfully warm.", "needn't have",
      ["didn't need to", "needn't have", "mustn't have", "couldn't have"],
      "'Needn't have + V3' means an action was done unnecessarily; 'didn't need to' means it wasn't necessary and wasn't necessarily done.",
      "'needn't have + V.3' หมายถึงได้ทำสิ่งนั้นไปแล้ว แต่จริง ๆ ไม่มีความจำเป็นต้องทำ",
      "grammar_neednt_have_unnecessary_action")

add_q("gq_b2_025", "B2", "conditionals_inversion_should", "gap_fill", 1.3, 1.7,
      "_____ you require any further assistance, please do not hesitate to contact us.", "Should",
      ["Had", "Were", "Should", "If"],
      "Inversion of First Conditional replaces 'If you should require' with 'Should you require'.",
      "การกลับประโยคเงื่อนไขแบบสุภาพทางการ (Inversion of 1st conditional) ใช้ 'Should you require'",
      "grammar_inversion_first_conditional_should")

add_q("gq_b2_026", "B2", "conditionals_inversion_were", "gap_fill", 1.4, 1.7,
      "_____ I in your position, I would accept the international assignment immediately.", "Were",
      ["Had", "Were", "Should", "Am"],
      "Inversion of Second Conditional with verb to be uses 'Were I...'.",
      "Inversion ของ Second Conditional กับ verb to be ใช้โครงสร้าง 'Were I in your position'",
      "grammar_inversion_second_conditional_were")

add_q("gq_b2_027", "B2", "conditionals_inversion_had", "gap_fill", 1.45, 1.75,
      "_____ we known about the highway closure, we would have chosen an alternative route.", "Had",
      ["If", "Had", "Were", "Should"],
      "Inversion of Third Conditional replaces 'If we had known' with 'Had we known'.",
      "Inversion ของ Third Conditional ละ if แล้วนำกริยาช่วย had ขึ้นหน้าประธาน ('Had we known')",
      "grammar_inversion_third_conditional_had")

add_q("gq_b2_028", "B2", "subjunctive_mandative", "gap_fill", 1.2, 1.6,
      "The inspector demanded that the factory _____ operations until repairs were completed.", "suspend",
      ["suspended", "suspends", "suspend", "would suspend"],
      "Mandative subjunctive requires the bare base form after demand/insist/recommend that.",
      "โครงสร้าง Subjunctive หลังคำกริยาแสดงคำสั่ง/เรียกร้อง (demanded that) ใช้กริยาฐานรูปเดิม (suspend)",
      "grammar_mandative_subjunctive")

add_q("gq_b2_029", "B2", "double_comparatives", "gap_fill", 0.75, 1.45,
      "The more research you conduct, _____ your conclusions will be.", "the more reliable",
      ["more reliable", "the more reliable", "the most reliable", "reliabler"],
      "Parallel proportional change uses 'The + comparative, the + comparative'.",
      "โครงสร้างการเปลี่ยนแปลงแปรผันตามกัน ใช้ 'The + comparative ..., the + comparative ...'",
      "grammar_double_comparatives")

add_q("gq_b2_030", "B2", "modals_could_have_possibility", "gap_fill", 0.65, 1.45,
      "You were driving recklessly! You _____ caused a catastrophic accident.", "could have",
      ["must have", "could have", "should have", "would have"],
      "'Could have + V3' expresses an unfulfilled past possibility (it was possible, but didn't happen).",
      "'could have + V.3' ใช้บอกความเป็นไปได้ในอดีตที่เกือบจะเกิดขึ้นจริงแต่ไม่ได้เกิดขึ้น",
      "grammar_could_have_past_possibility")

# =========================================================================
# C1 LEVEL (20 questions: gq_c1_001 to gq_c1_020, b in [+1.5, +2.5])
# =========================================================================
add_q("gq_c1_001", "C1", "negative_inversion_seldom", "gap_fill", 1.6, 1.65,
      "Seldom _____ such remarkable eloquence from a political leader in recent history.", "have we witnessed",
      ["we have witnessed", "have we witnessed", "did we witness", "we witnessed"],
      "Negative frequency adverb 'Seldom' fronted triggers subject-auxiliary inversion.",
      "คำกริยาวิเศษณ์เชิงปฏิเสธ 'Seldom' เมื่อวางต้นประโยค บังคับเกิด Inversion สลับกริยาช่วยไว้หน้าประธาน",
      "grammar_inversion_negative_adverbials")

add_q("gq_c1_002", "C1", "inversion_under_no_circumstances", "gap_fill", 1.7, 1.7,
      "Under no circumstances _____ confidential patient records be shared without written consent.", "should",
      ["confidential records should", "should", "ought", "must records"],
      "'Under no circumstances' fronted requires immediate inversion (should + subject + be).",
      "สำนวนปฏิเสธเด็ดขาด 'Under no circumstances' วางต้นประโยค ต้องตามด้วยกริยาช่วยทันทีก่อนประธาน",
      "grammar_inversion_prepositional_phrases")

add_q("gq_c1_003", "C1", "inversion_not_only", "gap_fill", 1.65, 1.65,
      "Not only _____ the contract, but they also offered to double our funding.", "did they sign",
      ["they signed", "did they sign", "they did sign", "had they signed"],
      "'Not only' fronted in a past simple clause requires auxiliary inversion with 'did'.",
      "โครงสร้าง 'Not only' ต้นประโยค ใน Past Simple ต้องใช้กริยาช่วย did สลับหน้าประธาน",
      "grammar_inversion_not_only_but_also")

add_q("gq_c1_004", "C1", "subjunctive_formal", "gap_fill", 1.8, 1.75,
      "It is imperative that every delegate _____ present during the plenary voting session.", "be",
      ["is", "was", "be", "should to be"],
      "Formulaic/mandative subjunctive following 'It is imperative that' uses the base form 'be'.",
      "โครงสร้างทางการ 'It is imperative that...' ใช้กริยาฐานรูป Subjunctive เสมอ (be)",
      "grammar_formulaic_subjunctive")

add_q("gq_c1_005", "C1", "cleft_sentences_all", "gap_fill", 1.75, 1.7,
      "All _____ was a genuine apology, but he refused to admit his mistake.", "I asked for",
      ["that I asked", "what I asked", "I asked for", "which I asked"],
      "'All (that) + subject + verb' acts as an exclusive focus cleft construction.",
      "Cleft sentence แบบขึ้นต้นด้วย 'All...' ที่เน้นความต้องการเพียงสิ่งเดียว",
      "grammar_all_cleft_sentences")

add_q("gq_c1_006", "C1", "participle_passive_clause", "gap_fill", 1.85, 1.75,
      "_____ from afar, the ancient citadel resembles a crown resting on the mountain ridge.", "Seen",
      ["Seeing", "Seen", "Having seen", "To see"],
      "Past participle clause implies a passive meaning ('When it is seen from afar').",
      "Participle clause ที่มีความหมายเป็นผู้ถูกกระทำ (เมื่อถูกมองจากที่ไกล) ใช้ Past Participle (Seen)",
      "grammar_passive_participle_clauses")

add_q("gq_c1_007", "C1", "mixed_conditionals_unreal_past_present", "gap_fill", 1.9, 1.75,
      "If the theorem _____ verified earlier, our laboratory would currently be conducting field trials.", "had been",
      ["were", "had been", "would be", "has been"],
      "Mixed conditional: past passive condition (had been verified) with present result (would currently be).",
      "เงื่อนไขผสม: เหตุการณ์ในอดีตแบบ passive (had been verified) ส่งผลต่อการดำเนินงานในปัจจุบัน",
      "grammar_mixed_conditionals_complex")

add_q("gq_c1_008", "C1", "unreal_past_as_if", "gap_fill", 1.6, 1.6,
      "He speaks about the global financial crash as if he _____ personally in charge of the treasury.", "had been",
      ["was", "has been", "had been", "would be"],
      "'As if / As though' with past unreal reference requires the Past Perfect.",
      "การเปรียบเทียบเสมือนว่า (as if) ที่ขัดแย้งกับความเป็นจริงในอดีต ใช้ Past Perfect (had been)",
      "grammar_as_if_as_though_past")

add_q("gq_c1_009", "C1", "inversion_only_after", "gap_fill", 1.95, 1.8,
      "Only after the laboratory results were published _____ the scope of the discovery.", "did the scientific community realize",
      ["the scientific community realized", "did the scientific community realize", "had the scientific community realized", "was the scientific community realizing"],
      "Inversion occurs in the MAIN clause following an initial 'Only after...' adverbial clause.",
      "โครงสร้าง 'Only after + อนุประโยค' การกลับประโยค (Inversion) จะเกิดขึ้นใน 'ประโยคหลัก'",
      "grammar_inversion_only_after")

add_q("gq_c1_010", "C1", "inversion_little_did", "gap_fill", 1.8, 1.7,
      "Little _____ that the document he had just signed would alter the course of modern history.", "did the diplomat suspect",
      ["the diplomat suspected", "did the diplomat suspect", "had the diplomat suspected", "was the diplomat suspecting"],
      "'Little' with negative meaning fronted requires auxiliary inversion (Little did he suspect).",
      "'Little' (แทบจะไม่เลย) นำหน้าประโยค บังคับ Inversion ใน Past Simple ใช้ 'did + ประธาน + V.1'",
      "grammar_inversion_little_did")

add_q("gq_c1_011", "C1", "prepositional_fronting", "gap_fill", 2.05, 1.8,
      "Across the valley _____ the ruins of a once-formidable fourteenth-century fortress.", "lay",
      ["did lie", "lay", "lied", "lying"],
      "Locative inversion: prepositional phrase of location fronted with intransitive verb (lay) directly preceding the subject.",
      "Locative Inversion: บุพบทวลีบอกสถานที่ขึ้นต้น กริยาอกรรมกริยา (lay) วางหน้าประธานได้ทันทีโดยไม่ต้องใช้กริยาช่วย",
      "grammar_locative_inversion")

add_q("gq_c1_012", "C1", "nominal_relative_clauses", "gap_fill", 1.7, 1.65,
      "The committee expressed deep reservations about _____ was proposed by the external consultants.", "what",
      ["that", "which", "what", "whatever that"],
      "'What' acts as a fused relative meaning 'the thing which'.",
      "Fused relative pronoun 'what' ทำหน้าที่แทนนามวลีทั้งหมด ('the thing that was proposed')",
      "grammar_nominal_relative_clauses")

add_q("gq_c1_013", "C1", "compound_relative_whatever", "gap_fill", 1.65, 1.6,
      "We are determined to uphold these ethical standards, _____ the short-term financial repercussions may be.", "whatever",
      ["however", "whatever", "whichever", "wherever"],
      "'Whatever' functions as a determiner before the noun phrase 'the short-term financial repercussions'.",
      "'Whatever' ทำหน้าที่เป็น determiner นำหน้านามวลีใน concession clause",
      "grammar_compound_relatives")

add_q("gq_c1_014", "C1", "advanced_concession_much_as", "gap_fill", 2.1, 1.85,
      "Much _____ I admire her technical prowess, I cannot endorse her autocratic leadership style.", "as",
      ["as", "though that", "since", "however"],
      "'Much as + subject + verb' is an advanced concessive structure meaning 'Although I admire... very much'.",
      "สำนวนสัมปทานขั้นสูง 'Much as + ประธาน + กริยา' มีความหมายว่า 'แม้ว่าฉันจะชื่นชม...มากเพียงใดก็ตาม'",
      "grammar_much_as_concession")

add_q("gq_c1_015", "C1", "inversion_adjective_as", "gap_fill", 2.15, 1.85,
      "Strange _____ it may seem, the arid desert ecosystem harbors exceptional biodiversity.", "as",
      ["as", "like", "although", "since"],
      "'Adjective + as/though + subject + verb' expresses concession (Although it may seem strange).",
      "โครงสร้างสัมปทาน 'คุณศัพท์ + as/though + ประธาน + กริยา' (แม้ว่าจะดูแปลกก็ตาม)",
      "grammar_adjective_as_concession")

add_q("gq_c1_016", "C1", "unreal_past_supposing", "gap_fill", 1.75, 1.7,
      "Supposing they _____ our initial tender, what contingency measures would we enact?", "rejected",
      ["reject", "rejected", "had rejected", "would reject"],
      "'Supposing' introduces a hypothetical present/future condition paired with 'would' in the main clause.",
      "'Supposing' นำหน้าเงื่อนไขสมมติในปัจจุบัน/อนาคต ใช้กับ Past Simple (rejected)",
      "grammar_supposing_conditional")

add_q("gq_c1_017", "C1", "but_for_conditional", "gap_fill", 2.2, 1.85,
      "_____ for the timely intervention of the paramedic, the patient would not have survived.", "But",
      ["Only", "Except", "But", "If"],
      "'But for + noun phrase' means 'Were it not for / Had it not been for'.",
      "สำนวน 'But for + นามวลี' มีความหมายเท่ากับ 'หากมิใช่เพราะ...' ใช้กับสมมติอดีต",
      "grammar_but_for_conditional")

add_q("gq_c1_018", "C1", "participle_having_been", "gap_fill", 1.9, 1.75,
      "_____ twice by the regulatory board, the pharmaceutical company revised its clinical protocols.", "Having been reprimanded",
      ["Reprimanding", "Having reprimanded", "Having been reprimanded", "Being reprimanded"],
      "Perfect passive participle clause (Having been + V3) denotes a prior completed passive experience.",
      "Perfect passive participle (Having been reprimanded) แสดงการถูกกระทำที่เสร็จสิ้นก่อนกริยาหลัก",
      "grammar_perfect_passive_participle")

add_q("gq_c1_019", "C1", "split_infinitive_stylistic", "gap_fill", 1.55, 1.5,
      "The administration aims to _____ improve bilateral trade relations over the coming decade.", "substantially",
      ["substantial", "substantially", "substantiate", "substantive"],
      "Adverb placement modifying the infinitive verb 'improve'.",
      "การวางกริยาวิเศษณ์ขยายกริยาในโครงสร้าง infinitive (to substantially improve)",
      "grammar_adverb_infinitive_modification")

add_q("gq_c1_020", "C1", "ergative_verbs", "gap_fill", 1.8, 1.7,
      "The heavy oak doors _____ smoothly without making the slightest sound.", "swung shut",
      ["were swung shut", "swung shut", "had been swung shut", "swung shutting"],
      "Ergative use of verbs like 'swing/shut' where the patient subject undergoes the action without passive voice.",
      "การใช้กริยา Ergative (swung shut) ในรูป active แต่มีความหมายในตัวเองโดยไม่ต้องใช้ passive",
      "grammar_ergative_verbs")

# =========================================================================
# C2 LEVEL (20 questions: gq_c2_001 to gq_c2_020, b in [+2.5, +3.2])
# =========================================================================
add_q("gq_c2_001", "C2", "archaic_subjunctive_inversion", "gap_fill", 2.6, 1.8,
      "_____ it not been for her steadfast advocacy, the legislation would never have passed.", "Had",
      ["Were", "Had", "Should", "Could"],
      "Hypothetical negative past inversion: 'Had it not been for...' replaces 'If it had not been for...'.",
      "Inversion ปฏิเสธสมมติอดีตขั้นสูง 'Had it not been for...' (หากมิใช่เพราะว่า...)",
      "grammar_inversion_had_it_not_been_for")

add_q("gq_c2_002", "C2", "unreal_were_it_not_for", "gap_fill", 2.55, 1.75,
      "_____ it not for your generous patronage, our symphony orchestra could not sustain its winter season.", "Were",
      ["Had", "Were", "Should", "If"],
      "Hypothetical present inversion: 'Were it not for...' expresses a condition currently counter to fact.",
      "Inversion สมมติขัดแย้งกับปัจจุบัน 'Were it not for...' (หากมิใช่เพราะการสนับสนุนของคุณในตอนนี้)",
      "grammar_inversion_were_it_not_for")

add_q("gq_c2_003", "C2", "ellipsis_and_substitution", "gap_fill", 2.7, 1.8,
      "Some critics hailed the exhibition as groundbreaking, while others did not _____.", "so",
      ["so", "such", "it", "too"],
      "Code ellipsis and prop-word substitution after negative auxiliary.",
      "ไวยากรณ์ขั้นสูงด้าน Ellipsis & Substitution การละข้อความหลัง auxiliary verb โดยใช้รูปละ",
      "grammar_ellipsis_substitution")

add_q("gq_c2_004", "C2", "fronting_comparative", "gap_fill", 2.8, 1.85,
      "Even more compelling _____ the archaeological relics unearthed during the subsequent excavation.", "were",
      ["was", "were", "did", "had"],
      "Comparative adjective fronted with delayed plural subject ('the archaeological relics') requires plural verb 'were'.",
      "Inversion จากการนำ comparative adjective ขึ้นต้นประโยค ประธานพหูพจน์ (relics) บังคับใช้กริยา 'were'",
      "grammar_comparative_fronting_inversion")

add_q("gq_c2_005", "C2", "formulaic_subjunctive_be_that_as_it_may", "gap_fill", 2.65, 1.75,
      "_____ that as it may, we cannot overlook the egregious breach of contractual confidentiality.", "Be",
      ["Being", "Be", "Is", "Were"],
      "Fixed formulaic subjunctive idiom: 'Be that as it may' (Nevertheless / Even if that is true).",
      "สำนวน Subjunctive โบราณที่ยังใช้อยู่ในภาษาทางการชั้นสูง 'Be that as it may' (อย่างไรก็ตาม/แม้จะเป็นเช่นนั้นก็ตาม)",
      "grammar_formulaic_subjunctive_idioms")

add_q("gq_c2_006", "C2", "formulaic_come_what_may", "gap_fill", 2.75, 1.8,
      "_____ what may, the expedition team will push forward toward the summit at dawn.", "Come",
      ["Coming", "Come", "May", "Should"],
      "Formulaic subjunctive expression: 'Come what may' expresses unyielding resolve.",
      "สำนวน Subjunctive 'Come what may' (ไม่ว่าจะเกิดอะไรขึ้นก็ตาม)",
      "grammar_formulaic_subjunctive_come_what_may")

add_q("gq_c2_007", "C2", "nominalization_density", "gap_fill", 2.6, 1.7,
      "The rapid _____ of urban transit infrastructure facilitated regional economic revitalization.", "expansion",
      ["expand", "expansion", "expanding", "expansiveness"],
      "High academic register nominalization functioning as the dense syntactic head of the subject clause.",
      "การเปลี่ยนรูปเป็นคำนามระดับวิชาการชั้นสูง (Nominalization: expansion) ทำหน้าที่เป็นแกนประธาน",
      "grammar_advanced_nominalization")

add_q("gq_c2_008", "C2", "inversion_so_adjective_that", "gap_fill", 2.85, 1.85,
      "So intricate _____ the navigational mechanisms that only three horologists could repair them.", "were",
      ["was", "were", "did", "had"],
      "'So + adjective' fronted for emphatic topicalization requires inversion matching plural subject (mechanisms).",
      "การเน้นย้ำด้วย 'So + adj' ต้นประโยค บังคับเกิด Inversion สอดคล้องกับประธานพหูพจน์ (mechanisms) ใช้ 'were'",
      "grammar_so_adjective_that_inversion")

add_q("gq_c2_009", "C2", "inversion_such_be", "gap_fill", 2.9, 1.9,
      "Such _____ the sheer ferocity of the hurricane that ancient masonry structures collapsed within minutes.", "was",
      ["was", "were", "did", "is"],
      "'Such + be + singular subject' creates an emphatic literary result construction.",
      "สำนวนวรรณกรรมชั้นสูง 'Such was + นามเอกพจน์ + that' เพื่อเน้นย้ำความรุนแรงของผลลัพธ์",
      "grammar_such_be_inversion")

add_q("gq_c2_010", "C2", "negative_raising", "gap_fill", 2.5, 1.7,
      "I don't think she _____ aware of the procedural ramifications of her sudden resignation.", "is",
      ["is", "isn't", "shouldn't", "wouldn't"],
      "Negative raising: the matrix clause carries the negation (I don't think), keeping the complement clause affirmative.",
      "ปรากฏการณ์ Negative Raising: ย้ายการปฏิเสธไปไว้ที่กริยาหลัก (I don't think) อนุประโยคตามหลังจึงเป็นรูปบอกเล่า (is)",
      "grammar_negative_raising")

add_q("gq_c2_011", "C2", "absolute_participial_clauses", "gap_fill", 2.95, 1.9,
      "All necessary formalities _____ completed, the trade pact was officially ratified by both parliaments.", "having been",
      ["being", "having been", "were", "have been"],
      "An absolute clause with an overt subject ('All necessary formalities') functioning independently as a non-finite adjunct.",
      "Absolute Clause ชั้นสูง: มีประธานอิสระของตัวเองและใช้ non-finite participle 'having been completed'",
      "grammar_absolute_participial_clauses")

add_q("gq_c2_012", "C2", "infinitive_perfect_passive", "gap_fill", 2.7, 1.8,
      "The missing manuscript is alleged _____ during the ransacking of the monastic library in 1538.", "to have been destroyed",
      ["to be destroyed", "to have been destroyed", "having been destroyed", "to destroy"],
      "Perfect passive infinitive following a present reporting verb (is alleged) denoting anterior historical action.",
      "โครงสร้างรายงานปัจจุบันกับเหตุการณ์ประวัติศาสตร์ที่จบไปแล้ว ใช้ perfect passive infinitive 'to have been destroyed'",
      "grammar_perfect_passive_infinitive_reporting")

add_q("gq_c2_013", "C2", "inversion_nor_neither", "gap_fill", 2.65, 1.75,
      "The defense presented no exonerating testimonies, nor _____ any forensic rebuttal.", "did they offer",
      ["they offered", "did they offer", "offered they", "they did offer"],
      "Coordination with 'nor' strictly triggers auxiliary-subject inversion.",
      "การเชื่อมประโยคปฏิเสธด้วย 'nor' บังคับกลับกริยาช่วยและประธาน (did they offer)",
      "grammar_nor_coordination_inversion")

add_q("gq_c2_014", "C2", "pseudo_cleft_reversal", "gap_fill", 2.8, 1.85,
      "A complete overhaul of corporate governance is _____ the board of directors urgently necessitates.", "what",
      ["that", "which", "what", "where"],
      "Reversed pseudo-cleft construction: focal noun phrase + be + nominal relative clause introduced by 'what'.",
      "โครงสร้าง Reversed Pseudo-cleft ขั้นสูง: นามวลีเน้น + be + nominal clause 'what'",
      "grammar_reversed_pseudo_cleft")

add_q("gq_c2_015", "C2", "double_passive_constructions", "gap_fill", 3.0, 1.95,
      "The diplomatic dispute is expected to _____ amicably before the regional summit convenes.", "be resolved",
      ["resolve", "be resolved", "have resolved", "being resolved"],
      "Passive infinitive embedded under a passive matrix verb.",
      "โครงสร้าง Passive ซ้อน (is expected to be resolved)",
      "grammar_embedded_passive_infinitives")

add_q("gq_c2_016", "C2", "discourse_markers_inverted", "gap_fill", 2.75, 1.8,
      "On no account _____ authorized personnel leave the containment facility unmonitored.", "may",
      ["may", "personnel may", "ought", "should to"],
      "'On no account' demands immediate modal auxiliary inversion before the subject.",
      "ข้อห้ามเด็ดขาด 'On no account' ต้นประโยค บังคับสลับ modal auxiliary 'may' ไว้หน้าประธาน",
      "grammar_on_no_account_inversion")

add_q("gq_c2_017", "C2", "adverbial_bare_infinitive_suffice", "gap_fill", 3.1, 1.95,
      "_____ it to say, the catastrophic collapse of the banking syndicate surprised even veteran analysts.", "Suffice",
      ["Sufficing", "Suffice", "Sufficient", "Sufficed"],
      "Archaic subjunctive formula: 'Suffice it to say' (It is enough to say).",
      "สำนวนวรรณกรรมโบราณรูป Subjunctive: 'Suffice it to say' (ขอกล่าวเพียงเท่านี้ว่า...)",
      "grammar_formulaic_suffice_it_to_say")

add_q("gq_c2_018", "C2", "subordinating_conjunction_lest", "gap_fill", 3.05, 1.95,
      "The treaty details were drafted with extreme vigilance, lest any ambiguity _____ rise to armed disputes.", "give",
      ["gives", "gave", "give", "would give"],
      "'Lest' requires the present subjunctive bare base form (give) or 'should give' in formal registers.",
      "คำเชื่อมทางการขั้นสูง 'lest' (เกรงว่า/เพื่อมิให้) บังคับใช้กริยารูป Subjunctive ฐานเดิม (give)",
      "grammar_lest_subjunctive")

add_q("gq_c2_019", "C2", "participle_having_bare", "gap_fill", 2.85, 1.85,
      "The board declined the merger proposal, _____ that shareholder equity would be irreparably diluted.", "reasoning",
      ["reasoned", "reasoning", "having reasoned", "to reason"],
      "Present participial adjunct expressing an accompanying cognitive rationale.",
      "Participial adjunct แสดงเหตุผลการตัดสินใจของประธานในประโยค (reasoning that...)",
      "grammar_participial_rationale_adjuncts")

add_q("gq_c2_020", "C2", "fronted_non_finite_verb", "gap_fill", 3.15, 2.0,
      "Try _____ he might, the defense counsel could not undermine the veracity of the biometric evidence.", "as",
      ["as", "though that", "since", "while"],
      "Fronted bare infinitive concessive structure: 'Try as he might' (However hard he tried).",
      "โครงสร้างสัมปทานชั้นสูง 'Bare infinitive + as + ประธาน + might' (แม้เขาจะพยายามมากเพียงใดก็ตาม)",
      "grammar_bare_infinitive_fronting_concession")

print(f"Total questions generated: {len(questions)}")

# Validation check
levels = {}
for q in questions:
    lvl = q["cefr_level"]
    levels[lvl] = levels.get(lvl, 0) + 1
    # Check 4 options
    assert len(q["options"]) == 4, f"Question {q['id']} does not have 4 options"
    # Check correct answer exists in options
    texts = [opt["text"] for opt in q["options"]]
    assert q["correct_answer"] in texts, f"Question {q['id']}: correct answer '{q['correct_answer']}' not in options {texts}"

print("Level distribution:")
for lvl, count in sorted(levels.items()):
    print(f"  {lvl}: {count}")

output_path = "data/grammar-question-bank.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {len(questions)} verified questions to {output_path}")
