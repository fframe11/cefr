import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 20 brand-new, original dialogue questions testing pragmatic conversational meaning (OOPT Part 2)
# Zero plagiarism, zero shrimp/crab/shellfish.
items = [
    {
        "id": "oopt_p2_001",
        "speaker_1": "David",
        "dialogue_1": "The loud music from the upstairs apartment really gets on my nerves every evening.",
        "speaker_2": "Sarah",
        "dialogue_2": "Have you considered talking to the landlord about it?",
        "question_prompt": "What does David mean?",
        "options": [
            {"key": "A", "text": "The upstairs music irritates and bothers him."},
            {"key": "B", "text": "The music makes him feel anxious about safety."},
            {"key": "C", "text": "He wants to learn to play that style of music."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'gets on my nerves' แปลว่า ทำให้รำคาญใจหรือหงุดหงิด (irritates/annoys him) ไม่ได้แปลว่ากลัวหรืออยากเล่นดนตรี",
        "explanation_en": "The idiom 'get on someone's nerves' means to annoy or irritate someone intensely.",
        "idiom_tag": "get on one's nerves",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_002",
        "speaker_1": "Lisa",
        "dialogue_1": "Do you fancy joining us for a bike ride around the reservoir this Saturday?",
        "speaker_2": "Mark",
        "dialogue_2": "Why not? The weather forecast looks wonderful.",
        "question_prompt": "What does Mark mean?",
        "options": [
            {"key": "A", "text": "He agrees enthusiastically to join the bike ride."},
            {"key": "B", "text": "He does not understand why Lisa is asking him."},
            {"key": "C", "text": "He wants Lisa to explain the reasons for going."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'Why not?' ในบทสนทนาตอบรับคำเชิญ ไม่ใช่การถามหาเหตุผล แต่เป็นการตอบรับตกลงอย่างกระตือรือร้น (เห็นด้วย/ไปสิ)",
        "explanation_en": "'Why not?' is an idiomatic conversational device used to express cheerful agreement or acceptance of a suggestion.",
        "idiom_tag": "why not",
        "cefr_level": "A2"
    },
    {
        "id": "oopt_p2_003",
        "speaker_1": "Rachel",
        "dialogue_1": "Could you help me memorize these medical vocabulary terms for tomorrow?",
        "speaker_2": "Kevin",
        "dialogue_2": "Well, to be honest, I'm hopeless at memorizing scientific terminology.",
        "question_prompt": "What does Kevin mean?",
        "options": [
            {"key": "A", "text": "He is not skilled at remembering scientific words."},
            {"key": "B", "text": "He has completely lost hope in his studies."},
            {"key": "C", "text": "He finds medical vocabulary simple and straightforward."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'hopeless at...' แปลว่า ไม่เก่งเอาเสียเลย หรือ ไร้ความสามารถในด้านนั้น (not good/skilled at)",
        "explanation_en": "Being 'hopeless at' something is an understated informal way of saying one lacks talent or skill in that area.",
        "idiom_tag": "hopeless at",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_004",
        "speaker_1": "Sophie",
        "dialogue_1": "Do you have a moment to review this financial report with me?",
        "speaker_2": "Brian",
        "dialogue_2": "I'm heading out the door in about three minutes.",
        "question_prompt": "What does Brian mean?",
        "options": [
            {"key": "A", "text": "He only has a very brief time before he must leave."},
            {"key": "B", "text": "He dislikes reviewing financial documents with Sophie."},
            {"key": "C", "text": "He will return to the office in three minutes."}
        ],
        "correct_answer": "A",
        "explanation_th": "Brian บอกว่ากำลังจะก้าวออกจากประตูใน 3 นาที หมายถึงเขามีเวลาคุยได้แค่แป๊บเดียวเท่านั้นก่อนต้องรีบไป",
        "explanation_en": "Brian's utterance serves as a polite temporal boundary indicating he has almost no time to talk right now.",
        "idiom_tag": "time constraint implicature",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_005",
        "speaker_1": "Oliver",
        "dialogue_1": "Are you planning to apply for the senior marketing manager position?",
        "speaker_2": "Emma",
        "dialogue_2": "I think it is probably a bit too soon for me.",
        "question_prompt": "What does Emma mean?",
        "options": [
            {"key": "A", "text": "She feels she does not yet have enough tenure or readiness."},
            {"key": "B", "text": "She thinks the application deadline has already expired."},
            {"key": "C", "text": "She plans to arrive early for the job interview."}
        ],
        "correct_answer": "A",
        "explanation_th": "'too soon for me' หมายถึง เธอยังเพิ่งเริ่มงานได้ไม่นาน หรือยังไม่พร้อมสำหรับตำแหน่งที่สูงขึ้นในตอนนี้",
        "explanation_en": "'Too soon for me' implies premature timing relative to her career progression or current experience level.",
        "idiom_tag": "too soon",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_006",
        "speaker_1": "Tom",
        "dialogue_1": "Was the new Thai fusion restaurant downtown everything it was cracked up to be?",
        "speaker_2": "Jessica",
        "dialogue_2": "I would say so! The curry and herb roasted chicken were outstanding.",
        "question_prompt": "What did Tom mean by his question?",
        "options": [
            {"key": "A", "text": "Was the restaurant as great as people claimed in reviews?"},
            {"key": "B", "text": "Was the food at the restaurant overpriced and poorly cooked?"},
            {"key": "C", "text": "Did the restaurant suffer any physical structural damage?"}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'everything it was cracked up to be' หมายถึง ดีสมคำร่ำลือ หรือยอดเยี่ยมอย่างที่คนชื่นชมกันไว้หรือไม่",
        "explanation_en": "'Everything it's cracked up to be' refers to whether something matches its high public reputation or hype.",
        "idiom_tag": "cracked up to be",
        "cefr_level": "B2"
    },
    {
        "id": "oopt_p2_007",
        "speaker_1": "Karen",
        "dialogue_1": "You look rather pale today, Daniel. Are you coping all right?",
        "speaker_2": "Daniel",
        "dialogue_2": "I'm feeling a bit under the weather since yesterday afternoon.",
        "question_prompt": "What does Daniel mean?",
        "options": [
            {"key": "A", "text": "He is feeling slightly ill or unwell."},
            {"key": "B", "text": "He is disappointed by the rainy climate."},
            {"key": "C", "text": "He forgot to bring his umbrella to work."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'under the weather' เป็นสำนวนยอดนิยม แปลว่า รู้สึกครั่นเนื้อครั่นตัว หรือป่วยเล็กน้อย (unwell/mildly sick)",
        "explanation_en": "'Under the weather' is an idiom indicating slight indisposition or mild illness.",
        "idiom_tag": "under the weather",
        "cefr_level": "A2"
    },
    {
        "id": "oopt_p2_008",
        "speaker_1": "Paul",
        "dialogue_1": "We have been debugging this database replication issue for seven straight hours.",
        "speaker_2": "Claire",
        "dialogue_2": "Let's call it a day and tackle it with fresh minds tomorrow morning.",
        "question_prompt": "What does Claire suggest?",
        "options": [
            {"key": "A", "text": "Stopping their work for the rest of today."},
            {"key": "B", "text": "Naming today as their official launch day."},
            {"key": "C", "text": "Working through the entire night without stopping."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'call it a day' แปลว่า พอแค่นี้ก่อนสำหรับวันนี้ หรือหยุดพักการทำงานของวันนั้น",
        "explanation_en": "To 'call it a day' means to conclude one's work activities for the remainder of the day.",
        "idiom_tag": "call it a day",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_009",
        "speaker_1": "Liam",
        "dialogue_1": "Should we sign the commercial lease agreement before the agent leaves?",
        "speaker_2": "Sophia",
        "dialogue_2": "I would rather sleep on it before making such a major commitment.",
        "question_prompt": "What does Sophia mean?",
        "options": [
            {"key": "A", "text": "She wants to delay deciding until tomorrow after resting."},
            {"key": "B", "text": "She wants to sleep overnight in the new building."},
            {"key": "C", "text": "She intends to reject the lease offer outright."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'sleep on it' แปลว่า ขอเวลาคิดทบทวนคืนหนึ่งก่อนตัดสินใจในวันรุ่งขึ้น ไม่ได้แปลว่าไปนอนที่ห้องนั้น",
        "explanation_en": "To 'sleep on it' means to delay making an important decision until the following morning to consider it calmly.",
        "idiom_tag": "sleep on it",
        "cefr_level": "B2"
    },
    {
        "id": "oopt_p2_010",
        "speaker_1": "Marcus",
        "dialogue_1": "My laptop battery completely died and the charger is in my locker.",
        "speaker_2": "Chloe",
        "dialogue_2": "Do you want to use mine? I have finished all my slides.",
        "question_prompt": "What is Chloe doing?",
        "options": [
            {"key": "A", "text": "She is offering to lend her laptop to Marcus."},
            {"key": "B", "text": "She is asking Marcus to repair her charger."},
            {"key": "C", "text": "She wants Marcus to leave the library locker room."}
        ],
        "correct_answer": "A",
        "explanation_th": "Chloe เสนอความช่วยเหลือโดยถามว่า 'จะใช้ของฉันไหม' เพื่อให้ Marcus ยืมแล็ปท็อปของเธอทำงาน",
        "explanation_en": "Chloe's question functions pragmatically as an offer to share her personal computer.",
        "idiom_tag": "offering assistance",
        "cefr_level": "A2"
    },
    {
        "id": "oopt_p2_011",
        "speaker_1": "Nathan",
        "dialogue_1": "How did the negotiation with the European distributor go?",
        "speaker_2": "Elena",
        "dialogue_2": "We didn't see eye to eye on the wholesale pricing tiers.",
        "question_prompt": "What does Elena mean?",
        "options": [
            {"key": "A", "text": "They failed to reach an agreement on pricing."},
            {"key": "B", "text": "They avoided looking at each other during talks."},
            {"key": "C", "text": "They both agreed that the wholesale price was fair."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'see eye to eye' แปลว่า มีความคิดเห็นตรงกัน/เห็นพ้องต้องกัน เมื่อใส่รูปปฏิเสธ (didn't see eye to eye) จึงแปลว่า ตกลงกันไม่ได้/เห็นไม่ตรงกัน",
        "explanation_en": "'See eye to eye' signifies mutual agreement; its negative form means encountering fundamental disagreement.",
        "idiom_tag": "see eye to eye",
        "cefr_level": "B2"
    },
    {
        "id": "oopt_p2_012",
        "speaker_1": "Hannah",
        "dialogue_1": "Are you going to accept the postgraduate offer from Manchester or Edinburgh?",
        "speaker_2": "George",
        "dialogue_2": "Honestly, I am still on the fence about both programs.",
        "question_prompt": "What does George mean?",
        "options": [
            {"key": "A", "text": "He remains undecided and has not made a final choice."},
            {"key": "B", "text": "He is waiting near the boundary wall of the campus."},
            {"key": "C", "text": "He has decided to turn down both university offers."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'on the fence' หมายถึง ยังลังเลใจ หรือยังตัดสินใจไม่ได้ว่าจะเลือกฝั่งไหน",
        "explanation_en": "Being 'on the fence' is a metaphorical expression for remaining uncommitted or undecided between two options.",
        "idiom_tag": "on the fence",
        "cefr_level": "B2"
    },
    {
        "id": "oopt_p2_013",
        "speaker_1": "Megan",
        "dialogue_1": "Please don't spill the beans about the surprise anniversary dinner!",
        "speaker_2": "Arthur",
        "dialogue_2": "Don't worry, my lips are completely sealed.",
        "question_prompt": "What is Megan asking Arthur to do?",
        "options": [
            {"key": "A", "text": "Keep the secret and not reveal the dinner plan."},
            {"key": "B", "text": "Avoid dropping any food on the kitchen floor."},
            {"key": "C", "text": "Cook a vegetable dish for the anniversary dinner."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'spill the beans' แปลว่า เผยความลับ หรือบอกสิ่งที่ซ่อนไว้ให้คนอื่นรู้",
        "explanation_en": "To 'spill the beans' means to prematurely disclose confidential or secret information.",
        "idiom_tag": "spill the beans",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_014",
        "speaker_1": "Professor Adams",
        "dialogue_1": "In your seminar presentation, you argued that urban green spaces directly alleviate cognitive fatigue.",
        "speaker_2": "Student",
        "dialogue_2": "Professor Adams smiled and remarked: 'You really hit the nail on the head with that analysis.'",
        "question_prompt": "What did Professor Adams mean by his remark?",
        "options": [
            {"key": "A", "text": "The student's analytical conclusion was precisely accurate."},
            {"key": "B", "text": "The student should use physical construction tools for models."},
            {"key": "C", "text": "The student made a painful factual mistake in the paper."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'hit the nail on the head' แปลว่า พูดหรือวิเคราะห์ได้ตรงจุดเผง แม่นยำ และถูกต้องอย่างสมบูรณ์",
        "explanation_en": "To 'hit the nail on the head' means to describe an issue or arrive at an assessment with precise accuracy.",
        "idiom_tag": "hit the nail on the head",
        "cefr_level": "B2"
    },
    {
        "id": "oopt_p2_015",
        "speaker_1": "Grace",
        "dialogue_1": "Did you manage to book the flights for the medical conference in Zurich?",
        "speaker_2": "Victor",
        "dialogue_2": "Not yet. The direct business class seats cost an arm and a leg!",
        "question_prompt": "What does Victor mean?",
        "options": [
            {"key": "A", "text": "The flight tickets are excessively expensive."},
            {"key": "B", "text": "He injured his limbs while walking to the terminal."},
            {"key": "C", "text": "The airline requires mandatory health check certificates."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'cost an arm and a leg' แปลว่า แพงหูฉี่ หรือราคาแพงมากเกินไป ไม่ได้เกี่ยวกับการบาดเจ็บ",
        "explanation_en": "To 'cost an arm and a leg' is an idiom describing something extraordinarily or prohibitively expensive.",
        "idiom_tag": "cost an arm and a leg",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_016",
        "speaker_1": "Julian",
        "dialogue_1": "You look exhausted this morning, Vanessa.",
        "speaker_2": "Vanessa",
        "dialogue_2": "I had to burn the midnight oil to prepare the regulatory audit files.",
        "question_prompt": "What did Vanessa do last night?",
        "options": [
            {"key": "A", "text": "She stayed awake and worked until very late at night."},
            {"key": "B", "text": "She accidentally caused a small fire in her kitchen stove."},
            {"key": "C", "text": "She ran out of motor fuel during her commute home."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'burn the midnight oil' แปลว่า ทำงานหรืออ่านหนังสือจนดึกดื่นข้ามคืน",
        "explanation_en": "To 'burn the midnight oil' means to work, write, or study late into the night.",
        "idiom_tag": "burn the midnight oil",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_017",
        "speaker_1": "Sean",
        "dialogue_1": "The tabloid website claims that our university president will step down next month.",
        "speaker_2": "Laura",
        "dialogue_2": "I would take anything published on that gossip blog with a grain of salt.",
        "question_prompt": "What is Laura advising Sean to do?",
        "options": [
            {"key": "A", "text": "Be skeptical and not believe the rumor unconditionally."},
            {"key": "B", "text": "Add more seasoning when preparing his dinner meals."},
            {"key": "C", "text": "Contact the university president immediately by phone."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'take something with a grain of salt' แปลว่า ฟังหูไว้หู หรืออย่าเพิ่งปักใจเชื่อร้อยเปอร์เซ็นต์ เพราะอาจไม่เป็นความจริง",
        "explanation_en": "To 'take something with a grain of salt' means to maintain healthy skepticism rather than accepting a claim as truth.",
        "idiom_tag": "with a grain of salt",
        "cefr_level": "B2"
    },
    {
        "id": "oopt_p2_018",
        "speaker_1": "Evelyn",
        "dialogue_1": "The new exchange students seemed very shy during the opening orientation.",
        "speaker_2": "Liam",
        "dialogue_2": "We organized a quick group trivia game to break the ice.",
        "question_prompt": "Why did they organize the trivia game?",
        "options": [
            {"key": "A", "text": "To help people relax, overcome awkwardness, and socialize."},
            {"key": "B", "text": "To clear frozen ice away from the university entrance stairs."},
            {"key": "C", "text": "To test the students' knowledge of polar climatology."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'break the ice' แปลว่า ละลายพฤติกรรม สร้างความเป็นกันเอง และขจัดความเคอะเขินในการพบกันครั้งแรก",
        "explanation_en": "To 'break the ice' means to relieve social tension and encourage people to talk and feel comfortable.",
        "idiom_tag": "break the ice",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_019",
        "speaker_1": "Brenda",
        "dialogue_1": "Did you expect that sudden change in the course timetable?",
        "speaker_2": "Patrick",
        "dialogue_2": "Not at all. That announcement came completely out of the blue.",
        "question_prompt": "What does Patrick mean?",
        "options": [
            {"key": "A", "text": "The schedule announcement was totally unexpected."},
            {"key": "B", "text": "The schedule was printed on bright blue paper."},
            {"key": "C", "text": "He was staring at the clear blue sky when it happened."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'out of the blue' แปลว่า เกิดขึ้นอย่างไม่คาดคิด หรือจู่ๆ ก็โผล่มาโดยไม่มีสัญญาณเตือนล่วงหน้า",
        "explanation_en": "'Out of the blue' is an idiom describing an event that occurs entirely unexpectedly and without warning.",
        "idiom_tag": "out of the blue",
        "cefr_level": "B1"
    },
    {
        "id": "oopt_p2_020",
        "speaker_1": "Sam",
        "dialogue_1": "I am struggling with this complex statistical regression module.",
        "speaker_2": "Diana",
        "dialogue_2": "Don't despair! Nearly everyone in our cohort is in the same boat.",
        "question_prompt": "What does Diana mean?",
        "options": [
            {"key": "A", "text": "The other students share the exact same difficult challenge."},
            {"key": "B", "text": "All the students are planning an excursion on a river boat."},
            {"key": "C", "text": "Only Diana understands how to finish the regression homework."}
        ],
        "correct_answer": "A",
        "explanation_th": "สำนวน 'in the same boat' แปลว่า อยู่ในสถานการณ์ที่ยากลำบากเหมือนๆ กัน เผชิญชะตากรรมเดียวกัน",
        "explanation_en": "To be 'in the same boat' means being in the same unpleasant or difficult predicament as others.",
        "idiom_tag": "in the same boat",
        "cefr_level": "B1"
    }
]

output_path = 'data/ooptPart2Meaning.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print(f"Generated {len(items)} original OOPT Part 2 meaning items in {output_path}")
