import json, sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ==============================================================================
# 1. NEW READING PASSAGES
# ==============================================================================
new_reading_passages = [
  {
    "id": "reading-a1-library",
    "title": "Riverside Community Library Notice",
    "cefrLevel": "A1",
    "targetExam": "KET",
    "topic": "Daily Life & Community",
    "wordCount": 115,
    "content": """Welcome to the Riverside Community Library! 

Our library is open to all students and local residents. You can borrow up to four books for two weeks. We have free high-speed Wi-Fi, computer desks, and a quiet study room on the second floor. 

Opening Hours:
Monday to Friday: 08:30 – 19:30
Saturday: 09:00 – 16:00
Sunday: Closed for cleaning

Please remember to keep your mobile phones on silent mode while inside. Food and sweetened drinks are not allowed near the computer stations, but bottled drinking water is welcome. Have a wonderful reading day!""",
    "vocabularyGlossary": [
      { "word": "residents", "meaningTh": "ผู้อยู่อาศัยในท้องถิ่น" },
      { "word": "borrow", "meaningTh": "ยืม (หนังสือ)" },
      { "word": "silent mode", "meaningTh": "โหมดปิดเสียงโทรศัพท์" },
      { "word": "stations", "meaningTh": "จุดบริการคอมพิวเตอร์" }
    ],
    "questions": [
      {
        "id": "read-q-a1-lib-1",
        "skill": "reading",
        "cefrLevel": "A1",
        "type": "multiple_choice",
        "promptTh": "ผู้ใช้บริการสามารถยืมหนังสือได้สูงสุดกี่เล่มในแต่ละครั้ง?",
        "promptEn": "How many books can a member borrow at one time?",
        "options": [
          { "key": "A", "text": "Two books", "isCorrect": False, "feedbackTh": "ยืมได้ 2 สัปดาห์ แต่จำนวนคือ 4 เล่ม" },
          { "key": "B", "text": "Four books", "isCorrect": True, "feedbackTh": "ถูกต้อง! ในประกาศระบุว่า: 'borrow up to four books'" },
          { "key": "C", "text": "Six books", "isCorrect": False, "feedbackTh": "ไม่ใช่ 6 เล่ม" },
          { "key": "D", "text": "Ten books", "isCorrect": False, "feedbackTh": "ไม่ใช่ 10 เล่ม" }
        ],
        "explanationTh": "ประกาศระบุชัดเจน: 'You can borrow up to four books for two weeks.'",
        "explanationEn": "The notice states: 'You can borrow up to four books for two weeks.'",
        "weaknessTag": "factual_information_retrieval",
        "difficultyWeight": 1
      },
      {
        "id": "read-q-a1-lib-2",
        "skill": "reading",
        "cefrLevel": "A1",
        "type": "multiple_choice",
        "promptTh": "ห้องสมุดปิดทำการในวันใด?",
        "promptEn": "On which day is the community library closed?",
        "options": [
          { "key": "A", "text": "Every Saturday", "isCorrect": False, "feedbackTh": "วันเสาร์เปิด 09:00 - 16:00" },
          { "key": "B", "text": "Every Monday morning", "isCorrect": False, "feedbackTh": "วันจันทร์เปิดตามปกติ" },
          { "key": "C", "text": "Every Sunday", "isCorrect": True, "feedbackTh": "ถูกต้อง! ในตารางระบุ: 'Sunday: Closed for cleaning'" },
          { "key": "D", "text": "Every Friday evening", "isCorrect": False, "feedbackTh": "วันศุกร์เปิดถึง 19:30" }
        ],
        "explanationTh": "ในตารางเวลาทำการระบุว่า: 'Sunday: Closed for cleaning'",
        "explanationEn": "The schedule clearly marks Sunday as closed for cleaning.",
        "weaknessTag": "timetable_and_schedule_scanning",
        "difficultyWeight": 1
      }
    ]
  },
  {
    "id": "reading-a2-cooking",
    "title": "Teaching Young Children to Cook at Home",
    "cefrLevel": "A2",
    "targetExam": "KET",
    "topic": "Family & Education",
    "wordCount": 175,
    "content": """Do you enjoy cooking? Preparing meals at home is not only an enjoyable activity, but also an essential practical skill for young learners. Many nutritionists and educators encourage parents to invite their children into the kitchen early in life.

Even children aged six or seven can assist with simple, safe kitchen tasks. They can wash crisp green lettuce, peel ripe bananas, measure flour with measuring spoons, or stir pancake batter in a ceramic bowl. These hands-on actions help young children develop fine motor skills and understand basic mathematics through measuring weights and volumes.

Moreover, children who participate in cooking are far more likely to try healthy ingredients. When they assist in chopping sweet bell peppers or preparing a fresh carrot salad, they feel proud of their culinary creation and eat happily. Above all, cooking together provides quality family time without screen distractions, fostering communication and teamwork across generations.""",
    "vocabularyGlossary": [
      { "word": "essential", "meaningTh": "สำคัญยิ่ง, จำเป็น" },
      { "word": "nutritionists", "meaningTh": "นักโภชนาการ" },
      { "word": "motor skills", "meaningTh": "ทักษะการเคลื่อนไหวของกล้ามเนื้อมือ" },
      { "word": "culinary", "meaningTh": "เกี่ยวกับการทำอาหาร" }
    ],
    "questions": [
      {
        "id": "read-q-a2-cook-1",
        "skill": "reading",
        "cefrLevel": "A2",
        "type": "multiple_choice",
        "promptTh": "การช่วยทำอาหารในครัวช่วยพัฒนาทักษะด้านใดของเด็กเล็กตามที่บทความระบุ?",
        "promptEn": "According to the passage, how does cooking help develop young children's skills?",
        "options": [
          { "key": "A", "text": "It teaches them how to operate complex electrical appliances.", "isCorrect": False, "feedbackTh": "บทความเน้นกิจกรรมง่ายๆ ที่ปลอดภัย" },
          { "key": "B", "text": "It strengthens fine motor coordination and basic mathematical measurements.", "isCorrect": True, "feedbackTh": "ถูกต้อง! พัฒนากล้ามเนื้อมือและเข้าใจคณิตศาสตร์จากการตวงวัด" },
          { "key": "C", "text": "It trains them to become professional hotel head chefs.", "isCorrect": False, "feedbackTh": "ไม่ใช่เป้าหมายเพื่อเป็นเชฟโรงแรม" },
          { "key": "D", "text": "It replaces regular elementary school classes completely.", "isCorrect": False, "feedbackTh": "ไม่ได้มาแทนที่โรงเรียน" }
        ],
        "explanationTh": "ย่อหน้าที่ 2 ระบุชัดเจน: 'develop fine motor skills and understand basic mathematics through measuring weights and volumes.'",
        "explanationEn": "Paragraph 2 states that kitchen tasks develop motor skills and mathematical concepts.",
        "weaknessTag": "detail_comprehension_educational_benefits",
        "difficultyWeight": 2
      },
      {
        "id": "read-q-a2-cook-2",
        "skill": "reading",
        "cefrLevel": "A2",
        "type": "multiple_choice",
        "promptTh": "เหตุใดเด็กที่ช่วยทำอาหารจึงมีแนวโน้มที่จะรับประทานผักและอาหารเพื่อสุขภาพมากขึ้น?",
        "promptEn": "Why are children who cook more inclined to eat healthy foods?",
        "options": [
          { "key": "A", "text": "Because they feel proud of dishes they actively helped create.", "isCorrect": True, "feedbackTh": "ถูกต้อง! พวกเขารู้สึกภูมิใจในอาหารที่ตนเองมีส่วนร่วมสร้างสรรค์" },
          { "key": "B", "text": "Because raw vegetables are sweeter than cooked desserts.", "isCorrect": False, "feedbackTh": "บทความไม่ได้กล่าวเปรียบเทียบความหวาน" },
          { "key": "C", "text": "Because parents promise them expensive digital games afterwards.", "isCorrect": False, "feedbackTh": "บทความระบุว่าปลอดหน้าจอ ไม่ใช่การให้รางวัลเกม" },
          { "key": "D", "text": "Because school rules strictly mandate vegetable consumption.", "isCorrect": False, "feedbackTh": "ไม่ได้เกี่ยวกับกฎโรงเรียน" }
        ],
        "explanationTh": "ย่อหน้าที่ 3 ระบุว่า: 'they feel proud of their culinary creation and eat happily.'",
        "explanationEn": "Children take pride in food they prepared themselves, making them eager to eat it.",
        "weaknessTag": "cause_and_effect_inference",
        "difficultyWeight": 2
      }
    ]
  },
  {
    "id": "reading-b1-workplace",
    "title": "The Evolution of Flexible and Hybrid Work Culture",
    "cefrLevel": "B1",
    "targetExam": "PET",
    "topic": "Business & Career",
    "wordCount": 260,
    "content": """The global landscape of employment has undergone an unprecedented transformation over the past decade. Traditional office expectations, once dominated by strict nine-to-five desk routines, have yielded to flexible and hybrid models. Today, millions of professionals split their weekly schedule between domestic workstations and corporate headquarters.

Advocates of hybrid working emphasize noticeable productivity surges and reduced commuting stress. Avoiding congested highways saves workers hundreds of commuting hours annually, translating directly into improved physical well-being and healthier work-life equilibrium. Furthermore, geographic barriers have dissolved; organizations can now recruit specialized talent from diverse provinces without demanding immediate relocation.

However, operating a distributed workforce introduces nuanced managerial challenges. Preserving corporate culture and spontaneous team bonding proves notoriously difficult over video calls. Without face-to-face casual conversations by the water fountain, junior employees may feel isolated, hindering organic mentorship and professional guidance. Additionally, the boundary between professional obligations and personal leisure frequently blurs, culminating in chronic digital burnout when employees feel perpetually compelled to answer evening emails.

To resolve these tensions, forward-thinking enterprises establish explicit communication covenants. They mandate 'core collaborative hours' for synchronous brainstorming, while dedicating remaining hours to uninterrupted independent focus. Regular in-person team retreats ensure interpersonal bonds stay vibrant, balancing autonomy with camaraderie.""",
    "vocabularyGlossary": [
      { "word": "unprecedented", "meaningTh": "ที่ไม่เคยปรากฏมาก่อน" },
      { "word": "equilibrium", "meaningTh": "ความสมดุล, ดุลยภาพ" },
      { "word": "spontaneous", "meaningTh": "ที่เกิดขึ้นเองตามธรรมชาติโดยไม่วางแผนล่วงหน้า" },
      { "word": "covenants", "meaningTh": "ข้อตกลงร่วมกัน, พันธสัญญาในการทำงาน" },
      { "word": "camaraderie", "meaningTh": "มิตรภาพและความสามัคคีในทีม" }
    ],
    "questions": [
      {
        "id": "read-q-b1-work-1",
        "skill": "reading",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "ข้อได้เปรียบประการสำคัญของการทำงานแบบไฮบริดสำหรับองค์กรคืออะไร?",
        "promptEn": "What organizational advantage of hybrid working is highlighted in the text?",
        "options": [
          { "key": "A", "text": "It completely removes the requirement for formal management.", "isCorrect": False, "feedbackTh": "บทความระบุว่าสร้างความท้าทายให้ฝ่ายจัดการ ไม่ได้ตัดการจัดการออก" },
          { "key": "B", "text": "It enables recruitment of specialized talent without requiring relocation.", "isCorrect": True, "feedbackTh": "ถูกต้อง! สามารถจ้างงานคนเก่งจากต่างจังหวัดได้โดยไม่ต้องย้ายที่อยู่" },
          { "key": "C", "text": "It reduces employee salaries by thirty percent.", "isCorrect": False, "feedbackTh": "ไม่มีการระบุเรื่องการลดเงินเดือน" },
          { "key": "D", "text": "It guarantees that junior staff never need mentorship.", "isCorrect": False, "feedbackTh": "รุ่นน้องยังต้องการการชี้แนะ" }
        ],
        "explanationTh": "ย่อหน้าที่ 2 ระบุว่า: 'organizations can now recruit specialized talent from diverse provinces without demanding immediate relocation.'",
        "explanationEn": "The text states companies can hire talent from anywhere without requiring relocation.",
        "weaknessTag": "identifying_organizational_benefits",
        "difficultyWeight": 3
      },
      {
        "id": "read-q-b1-work-2",
        "skill": "reading",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "ความเสี่ยงหลักสำหรับพนักงานเมื่อทำงานจากที่บ้านคืออะไร?",
        "promptEn": "What primary risk for employees working remotely is mentioned in paragraph 3?",
        "options": [
          { "key": "A", "text": "Decreased access to home internet connections.", "isCorrect": False, "feedbackTh": "ไม่ได้พูดถึงปัญหาสัญญาณเน็ต" },
          { "key": "B", "text": "Blurring boundaries between work and rest leading to digital burnout.", "isCorrect": True, "feedbackTh": "ถูกต้อง! เส้นแบ่งเวลาทำงานกับเวลาพักผ่อนเลือนรางจนเกิดภาวะหมดไฟ" },
          { "key": "C", "text": "Higher commuting costs on public transit.", "isCorrect": False, "feedbackTh": "การทำงานที่บ้านช่วยลดค่าเดินทาง" },
          { "key": "D", "text": "A total lack of job openings in the technology sector.", "isCorrect": False, "feedbackTh": "ไม่ได้พูดถึงตำแหน่งงานว่าง" }
        ],
        "explanationTh": "ย่อหน้าที่ 3 ระบุถึง 'the boundary between professional obligations and personal leisure frequently blurs, culminating in chronic digital burnout'.",
        "explanationEn": "Paragraph 3 explicitly warns of blurred work-life boundaries causing chronic burnout.",
        "weaknessTag": "identifying_workplace_risks_and_burnout",
        "difficultyWeight": 3
      }
    ]
  },
  {
    "id": "reading-b2-technology",
    "title": "Artificial Intelligence in Second Language Acquisition",
    "cefrLevel": "B2",
    "targetExam": "FCE",
    "topic": "Technology & Education",
    "wordCount": 320,
    "content": """The integration of artificial intelligence into pedagogical frameworks is fundamentally reshaping language education. Where traditional computer-assisted instruction relied on rigid, rule-based drill matrices, contemporary large language models deliver dynamic, contextually aware linguistic interactions. Learners can now engage in nuanced conversational exchanges, receive instantaneous phonetic critiques, and access bespoke feedback adapted to their exact psychometric proficiency contours.

One of the most consequential advancements lies in adaptive formative assessment. Conventional standardized examinations often induce test anxiety and capture merely a static snapshot of learner capability. In contrast, AI-driven assessment operates continuously within learning workflows. By evaluating lexical diversity, syntactic sophistication, and conversational hesitation in real time, intelligent tutoring systems estimate ability trajectories using item response theory with remarkable calibration.

Nonetheless, applied linguists urge caution regarding over-reliance on synthetic pedagogical agents. While algorithms excel at structural remediation and lexical scaffolding, they lack genuine human empathy and cultural pragmatics. Human communication is saturated with social nuance, subtle humor, body language, and shared emotional resonance—dimensions that current computational architectures cannot authentically replicate. Furthermore, algorithmic bias in automated speech recognition frequently penalizes non-standard regional accents, creating systemic friction for marginalized dialect speakers.

Consequently, educational consensus advocates a synergistic paradigm: 'human-in-the-loop' augmentation. In this model, intelligent software handles diagnostic precision and deliberate repetitive mastery, liberating human educators to orchestrate rich collaborative debates and cultivate genuine intercultural competence.""",
    "vocabularyGlossary": [
      { "word": "bespoke", "meaningTh": "ที่ปรับแต่งมาโดยเฉพาะสำหรับบุคคล" },
      { "word": "formative", "meaningTh": "การประเมินเพื่อพัฒนาการเรียนรู้ในระหว่างทาง" },
      { "word": "remediation", "meaningTh": "การแก้ไขและซ่อมแซมจุดอ่อนทางภาษา" },
      { "word": "scaffolding", "meaningTh": "การเสริมสร้างและประคับประคองการเรียนรู้เป็นขั้นเป็นตอน" },
      { "word": "synergistic", "meaningTh": "ที่ทำงานร่วมกันเพื่อเสริมพลังซึ่งกันและกัน" }
    ],
    "questions": [
      {
        "id": "read-q-b2-ai-1",
        "skill": "reading",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "ข้อได้เปรียบของการประเมินแบบ AI เมื่อเทียบกับการสอบวัดผลมาตรฐานแบบเดิมคืออะไร?",
        "promptEn": "What advantage of AI-driven assessment over traditional testing is emphasized in paragraph 2?",
        "options": [
          { "key": "A", "text": "It entirely eliminates the need for mathematical calibration.", "isCorrect": False, "feedbackTh": "บทความระบุว่าใช้โมเดล Item Response Theory ที่แม่นยำ" },
          { "key": "B", "text": "It continuously tracks proficiency in real time within learning workflows rather than taking static snapshots.", "isCorrect": True, "feedbackTh": "ถูกต้อง! ประเมินพัฒนาการอย่างต่อเนื่องในระหว่างการเรียนรู้ แทนที่จะถ่ายภาพความรู้แบบนิ่งๆ" },
          { "key": "C", "text": "It guarantees that every student achieves a C2 certification in six weeks.", "isCorrect": False, "feedbackTh": "ไม่มีการรับประกันระยะเวลา" },
          { "key": "D", "text": "It forces learners to memorize archaic grammatical structures.", "isCorrect": False, "feedbackTh": "ไม่ได้บังคับให้ท่องจำไวยากรณ์โบราณ" }
        ],
        "explanationTh": "ย่อหน้าที่ 2 ระบุว่า: 'In contrast, AI-driven assessment operates continuously within learning workflows... estimate ability trajectories using item response theory with remarkable calibration.'",
        "explanationEn": "Paragraph 2 explains continuous real-time assessment compared to static examination snapshots.",
        "weaknessTag": "analytical_synthesis_educational_measurement",
        "difficultyWeight": 4
      },
      {
        "id": "read-q-b2-ai-2",
        "skill": "reading",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "สิ่งใดที่นักภาษาศาสตร์ประยุกต์ชี้ว่า AI ยังไม่สามารถทดแทนผู้สอนที่เป็นมนุษย์ได้?",
        "promptEn": "What dimension do applied linguists argue AI cannot authentically replicate?",
        "options": [
          { "key": "A", "text": "Spelling verification and vocabulary quizzes.", "isCorrect": False, "feedbackTh": "AI ทำการตรวจตัวสะกดและคำศัพท์ได้ดีเยี่ยม" },
          { "key": "B", "text": "Genuine empathy, cultural pragmatics, and shared emotional resonance.", "isCorrect": True, "feedbackTh": "ถูกต้อง! ความเข้าอกเข้าใจอย่างแท้จริง การสื่อสารเชิงวัฒนธรรม และมิติทางอารมณ์ร่วม" },
          { "key": "C", "text": "The speed of calculating syntactic error frequencies.", "isCorrect": False, "feedbackTh": "AI คำนวณความถี่ข้อผิดพลาดได้เร็วกว่ามนุษย์" },
          { "key": "D", "text": "Generating automated grammar worksheets.", "isCorrect": False, "feedbackTh": "AI สร้างใบงานได้รวดเร็ว" }
        ],
        "explanationTh": "ย่อหน้าที่ 3 ระบุว่า: 'they lack genuine human empathy and cultural pragmatics... shared emotional resonance—dimensions that current computational architectures cannot authentically replicate.'",
        "explanationEn": "Paragraph 3 notes AI lacks empathy, cultural nuance, and emotional resonance.",
        "weaknessTag": "critical_evaluation_of_technological_limitations",
        "difficultyWeight": 4
      }
    ]
  },
  {
    "id": "reading-c1-urban",
    "title": "Biophilic Architecture and Climate Resilience in Tropical Metropolises",
    "cefrLevel": "C1",
    "targetExam": "CAE",
    "topic": "Architecture & Environment",
    "wordCount": 380,
    "content": """The relentless escalation of global surface temperatures, compounded by the urban heat island phenomenon, has precipitated an urgent reevaluation of metropolitan spatial planning across Southeast Asia. High-density urban cores, characterized by vast expanses of impermeable concrete and monolithic glass envelopes, function as thermal batteries, absorbing solar radiation during diurnal peaks and emitting latent heat throughout the night. In response to this compounding vulnerability, progressive architectural consortia are transitioning from purely mechanical climate-control strategies toward biophilic structural integration.

Biophilic architecture operates on the premise that human physiological equilibrium and cognitive vitality are inextricably tethered to immersion in organic ecological systems. Rather than viewing vegetation as a superficial cosmetic facade, modern climate-resilient designs incorporate flora as active thermodynamic infrastructure. Multi-tiered vertical forest facades, extensive green canopy cantilevers, and permeable porous basalt pavements function synergistically to disrupt ambient microclimates. Through the physiological process of evapotranspiration, dense vertical arboretums can depress local surface temperatures by as much as four degrees Celsius, concurrently reducing the cooling loads of interior HVAC systems by up to twenty-five percent.

Furthermore, these green infrastructures execute critical hydraulic mitigation during monsoonal storm events. In legacy urban grids, saturated stormwater drains routinely inundate low-lying urban wards, producing destructive urban flash floods. Biophilic urbanism incorporates bioswales, rain gardens, and subterranean retention aquifers, attenuating peak run-off velocities through natural soil percolation.

Nonetheless, transitioning to living architecture imposes substantial structural complexity. The persistent load of wet soil matrices mandates reinforced seismic framing, while aggressive root penetration and high moisture exposure necessitate sophisticated elastomeric waterproofing membranes. Specialized arborists must be perpetually deployed for facade maintenance, escalating recurrent operating budgets. Despite these fiscal hurdles, leading urban theorists argue that the cost of inaction—manifest in catastrophic heat fatalities and deteriorating urban habitability—dwarfs the upfront capital investment required for ecological architectural transitions.""",
    "vocabularyGlossary": [
      { "word": "inextricably tethered", "meaningTh": "ผูกพันกันอย่างแนบแน่นจนไม่อาจแยกขาดได้" },
      { "word": "evapotranspiration", "meaningTh": "การคายระเหยของน้ำจากพืชและดินสู่บรรยากาศ" },
      { "word": "attenuating", "meaningTh": "การลดทอนความรุนแรงหรือชะลอความเร็วลง" },
      { "word": "bioswales", "meaningTh": "ร่องดินปลูกพืชซับน้ำฝนเพื่อชะลอและกรองน้ำหลาก" },
      { "word": "elastomeric", "meaningTh": "วัสดุยืดหยุ่นสูงที่ใช้ในการกันซึมความชื้น" }
    ],
    "questions": [
      {
        "id": "read-q-c1-urb-1",
        "skill": "reading",
        "cefrLevel": "C1",
        "type": "multiple_choice",
        "promptTh": "กลไกทางสรีรวิทยาใดของพืชที่ช่วยลดอุณหภูมิพื้นผิวของอาคารลงได้ตามที่บทความระบุ?",
        "promptEn": "What physiological process of vegetation is credited with reducing local surface temperatures?",
        "options": [
          { "key": "A", "text": "Subterranean percolation through reinforced basalt.", "isCorrect": False, "feedbackTh": "นี่คือกระบวนการซึมน้ำของดิน ไม่ใช่สรีรวิทยาพืช" },
          { "key": "B", "text": "Evapotranspiration releasing cooling moisture into the ambient microclimate.", "isCorrect": True, "feedbackTh": "ถูกต้อง! การคายระเหยน้ำ (evapotranspiration) ช่วยลดอุณหภูมิพื้นผิวได้ถึง 4 องศาเซลเซียส" },
          { "key": "C", "text": "Diurnal absorption of solar radiation into concrete thermal batteries.", "isCorrect": False, "feedbackTh": "นี่คือการกักเก็บความร้อนของคอนกรีต" },
          { "key": "D", "text": "The mechanical circulation of refrigerated freon.", "isCorrect": False, "feedbackTh": "นี่คือระบบเครื่องปรับอากาศกลไกเดิม" }
        ],
        "explanationTh": "ย่อหน้าที่ 2 ระบุชัดเจน: 'Through the physiological process of evapotranspiration, dense vertical arboretums can depress local surface temperatures by as much as four degrees Celsius'.",
        "explanationEn": "Paragraph 2 identifies evapotranspiration as the mechanism that cools local surface temperatures.",
        "weaknessTag": "complex_scientific_mechanism_comprehension",
        "difficultyWeight": 5
      },
      {
        "id": "read-q-c1-urb-2",
        "skill": "reading",
        "cefrLevel": "C1",
        "type": "multiple_choice",
        "promptTh": "ผู้เขียนบทความมีจุดยืนอย่างไรต่อต้นทุนทางการเงินที่สูงของสถาปัตยกรรมแบบชีวภาพ?",
        "promptEn": "What is the author's concluding perspective regarding the high expenditures of biophilic architecture?",
        "options": [
          { "key": "A", "text": "The expenses make it completely unviable for developing tropical cities.", "isCorrect": False, "feedbackTh": "ผู้เขียนมองว่าคุ้มค่าเมื่อเทียบกับความเสียหายหากไม่ทำ" },
          { "key": "B", "text": "The cost of inaction and climate vulnerability far outweighs the initial investment required.", "isCorrect": True, "feedbackTh": "ถูกต้อง! ต้นทุนของการนิ่งเฉยต่อภัยพิบัติและความร้อนสูงกว่าเงินลงทุนเริ่มต้นอย่างมาก" },
          { "key": "C", "text": "Governments should completely ban living facades due to root penetration hazards.", "isCorrect": False, "feedbackTh": "ไม่ได้สนับสนุนให้สั่งห้าม" },
          { "key": "D", "text": "All maintenance should be eliminated through genetic plant modification.", "isCorrect": False, "feedbackTh": "ไม่ได้เสนอเรื่องการตัดต่อพันธุกรรม" }
        ],
        "explanationTh": "ประโยคสุดท้ายของบทความสรุปว่า: 'the cost of inaction—manifest in catastrophic heat fatalities and deteriorating urban habitability—dwarfs the upfront capital investment required'.",
        "explanationEn": "The author concludes that the catastrophic costs of climate inaction far exceed upfront architectural investments.",
        "weaknessTag": "evaluating_authors_concluding_argument",
        "difficultyWeight": 5
      }
    ]
  }
]

# Read existing readingBank.ts
with open('data/readingBank.ts', 'r', encoding='utf-8') as f:
    rb_content = f.read()

# Replace the closing "];" with the new passages
insert_index = rb_content.rfind('];')
if insert_index != -1:
    new_passages_ts = ""
    for p in new_reading_passages:
        new_passages_ts += "  " + json.dumps(p, ensure_ascii=False, indent=2).replace('\n', '\n  ') + ",\n"
    
    updated_rb = rb_content[:insert_index] + new_passages_ts + rb_content[insert_index:]
    with open('data/readingBank.ts', 'w', encoding='utf-8') as f:
        f.write(updated_rb)
    print("Appended 5 new passages to data/readingBank.ts successfully!")
else:
    print("Error: Could not locate closing bracket in data/readingBank.ts")

# ==============================================================================
# 2. NEW LISTENING EXERCISES FROM PPTX GUIDELINES
# ==============================================================================
new_listening_exercises = [
  {
    "id": "listen-b1-relocation",
    "title": "Corporate Office Relocation & Logistics Planning",
    "cefrLevel": "B1",
    "targetExam": "PET",
    "speakerAccents": "American English (Office Manager & Logistics Coordinator)",
    "audioSpeedOptions": [0.75, 1.0, 1.25],
    "audioScript": """Coordinator: Good morning, Steve. Have we finalized the moving schedule for the technical support department?

Steve: Yes, Margaret. The professional moving crew arrives at five o'clock on Friday afternoon once all staff have finished work. We have packed the workstations, server towers, and documentation in color-coded crates.

Coordinator: Excellent. What about the conference room furniture and executive desks?

Steve: Those will be transported in the second delivery truck on Saturday morning. By Sunday midday, the IT network technicians will have all desktop terminals connected and tested.

Coordinator: Wonderful. So our employees can resume normal operations on Monday morning without any client disruptions!""",
    "questions": [
      {
        "id": "listen-q-b1-relo-1",
        "skill": "listening",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "ทีมงานขนย้ายมืออาชีพจะมาถึงสำนักงานในวันและเวลาใด?",
        "promptEn": "When will the professional moving crew arrive at the office?",
        "options": [
          { "key": "A", "text": "At Friday midday during the lunch break", "isCorrect": False, "feedbackTh": "ไม่ได้มาตอนเที่ยง" },
          { "key": "B", "text": "At five o'clock on Friday afternoon after work", "isCorrect": True, "feedbackTh": "ถูกต้อง! สตีฟแจ้งว่า: 'The professional moving crew arrives at five o'clock on Friday afternoon'" },
          { "key": "C", "text": "Early on Saturday morning before sunrise", "isCorrect": False, "feedbackTh": "วันเสาร์เป็นรอบรถบรรทุกคันที่สอง" },
          { "key": "D", "text": "On Sunday night before Monday opening", "isCorrect": False, "feedbackTh": "ไม่ใช่คืนวันอาทิตย์" }
        ],
        "explanationTh": "สตีฟระบุชัดเจน: 'The professional moving crew arrives at five o'clock on Friday afternoon once all staff have finished work.'",
        "explanationEn": "Steve states that the crew arrives at 5:00 PM on Friday afternoon after staff finish work.",
        "weaknessTag": "tracking_specific_chronological_timeframes",
        "difficultyWeight": 3
      },
      {
        "id": "listen-q-b1-relo-2",
        "skill": "listening",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "เป้าหมายหลักของการทดสอบระบบในวันอาทิตย์คืออะไร?",
        "promptEn": "What is the primary objective of completing IT testing on Sunday?",
        "options": [
          { "key": "A", "text": "To allow employees to work from home all week", "isCorrect": False, "feedbackTh": "ไม่ได้จะให้ทำงานที่บ้าน" },
          { "key": "B", "text": "To enable normal operations on Monday without customer disruptions", "isCorrect": True, "feedbackTh": "ถูกต้อง! เพื่อให้เปิดทำการวันจันทร์ได้ตามปกติโดยไม่กระทบลูกค้า" },
          { "key": "C", "text": "To sell redundant office computers to local charities", "isCorrect": False, "feedbackTh": "ไม่ได้กล่าวถึงการบริจาค" },
          { "key": "D", "text": "To interview prospective junior candidates", "isCorrect": False, "feedbackTh": "ไม่ได้สัมภาษณ์งาน" }
        ],
        "explanationTh": "ผู้ประสานงานสรุปว่า: 'our employees can resume normal operations on Monday morning without any client disruptions!'",
        "explanationEn": "The objective is ensuring regular business resumption on Monday morning without disruption.",
        "weaknessTag": "inferring_underlying_business_rationale",
        "difficultyWeight": 3
      }
    ]
  },
  {
    "id": "listen-b2-airport",
    "title": "International Airport Departure Gate & Luggage Notice",
    "cefrLevel": "B2",
    "targetExam": "FCE",
    "speakerAccents": "British English (Airport Gate Announcer)",
    "audioSpeedOptions": [0.75, 1.0, 1.25],
    "audioScript": """Airport Announcer: May I have your urgent attention, passengers holding boarding passes for Skyways flight 402 departing for Singapore Changi. 

Due to scheduled apron maintenance on concourse B, the departure gate for flight 402 has been relocated from gate B12 to gate E7. Boarding will commence promptly at 14:40, thirty minutes prior to scheduled departure.

Passengers traveling with oversized carry-on bags exceeding the standard cabin dimensions of 55 by 40 centimeters must check their luggage at gate E7 prior to boarding. Complimentary baggage tags will be issued at the podium. We apologize for any inconvenience caused by this gate alteration and appreciate your patience.""",
    "questions": [
      {
        "id": "listen-q-b2-air-1",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "เหตุผลสำคัญที่มีการย้ายประตูขึ้นเครื่องบินคืออะไร?",
        "promptEn": "What is the primary reason provided for relocating the departure gate?",
        "options": [
          { "key": "A", "text": "Severe electrical thunderstorms over the runway", "isCorrect": False, "feedbackTh": "ไม่ได้เกิดจากพายุ" },
          { "key": "B", "text": "Scheduled apron maintenance taking place on concourse B", "isCorrect": True, "feedbackTh": "ถูกต้อง! ประกาศระบุ: 'Due to scheduled apron maintenance on concourse B'" },
          { "key": "C", "text": "An unexpected mechanical issue with the aircraft engine", "isCorrect": False, "feedbackTh": "ไม่ได้มีปัญหาเครื่องยนต์" },
          { "key": "D", "text": "A labor dispute involving baggage handlers", "isCorrect": False, "feedbackTh": "ไม่ได้เกี่ยวกับข้อพิพาทแรงงาน" }
        ],
        "explanationTh": "เสียงประกาศระบุ: 'Due to scheduled apron maintenance on concourse B, the departure gate for flight 402 has been relocated'",
        "explanationEn": "The gate change is due to scheduled apron maintenance on concourse B.",
        "weaknessTag": "comprehending_operational_public_announcements",
        "difficultyWeight": 4
      },
      {
        "id": "listen-q-b2-air-2",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "ผู้โดยสารที่มีสัมภาระถือขึ้นเครื่องขนาดเกินกำหนดต้องปฏิบัติตามคำแนะนำใด?",
        "promptEn": "What action must passengers with oversized carry-on luggage take?",
        "options": [
          { "key": "A", "text": "They must abandon their bags at the security screening checkpoint.", "isCorrect": False, "feedbackTh": "ไม่ต้องทิ้งกระเป๋า" },
          { "key": "B", "text": "They must check their bags at gate E7 before boarding begins.", "isCorrect": True, "feedbackTh": "ถูกต้อง! ต้องโหลดกระเป๋าที่เกต E7 ก่อนขึ้นเครื่อง" },
          { "key": "C", "text": "They must purchase an additional passenger seat on the flight.", "isCorrect": False, "feedbackTh": "ไม่ต้องซื้อที่นั่งเพิ่ม" },
          { "key": "D", "text": "They are prohibited from boarding the flight entirely.", "isCorrect": False, "feedbackTh": "ไม่ได้ห้ามขึ้นเครื่อง" }
        ],
        "explanationTh": "เสียงประกาศแจ้งว่า: 'Passengers traveling with oversized carry-on bags... must check their luggage at gate E7 prior to boarding.'",
        "explanationEn": "Oversized luggage must be checked in at gate E7 prior to boarding.",
        "weaknessTag": "detail_compliance_instruction_comprehension",
        "difficultyWeight": 4
      }
    ]
  },
  {
    "id": "listen-b2-career",
    "title": "Stage Career & Performing Arts Interview with Alan",
    "cefrLevel": "B2",
    "targetExam": "FCE",
    "speakerAccents": "Standard British & Mid-Atlantic English (Interviewer & Veteran Stage Actor Alan)",
    "audioSpeedOptions": [0.75, 1.0, 1.25],
    "audioScript": """Interviewer: Welcome back to Arts Insight. I'm delighted to speak today with veteran stage performer Alan Croft. Alan, having spent over four decades in classical theatre, how did your journey in the performing arts originally begin?

Alan: Well, Rachel, believe it or not, I first stepped onto a theatrical stage when I was barely six years old. My older sister was rehearsing a local production of A Midsummer Night's Dream, and their child actor suddenly contracted measles. The director panicked, noticed me sitting quietly in the third row, and handed me a small wooden prop. 

Interviewer: Incredible! And was it an instantaneous passion?

Alan: Completely intoxicating! While my school peers spent weekends playing football or building model airplanes, I was completely captivated by stage presence, vocal projection, and text interpretation. Theatre taught me that acting is not about pretending to be someone else; it is about discovering genuine human vulnerability under extraordinary imagined circumstances.""",
    "questions": [
      {
        "id": "listen-q-b2-career-1",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "แอลันได้มีโอกาสขึ้นแสดงละครเวทีครั้งแรกเมื่ออายุ 6 ขวบได้อย่างไร?",
        "promptEn": "How did Alan secure his very first acting role at age six?",
        "options": [
          { "key": "A", "text": "He won a nationwide competitive audition for television.", "isCorrect": False, "feedbackTh": "ไม่ได้ชนะการออดิชั่นระดับชาติ" },
          { "key": "B", "text": "He replaced a sick child actor at his sister's rehearsal at the last minute.", "isCorrect": True, "feedbackTh": "ถูกต้อง! เขาได้รับเลือกให้แสดงแทนนักแสดงเด็กที่ป่วยเป็นโรคหัดอย่างกะทันหัน" },
          { "key": "C", "text": "His parents forced him to study classical opera singing.", "isCorrect": False, "feedbackTh": "พ่อแม่ไม่ได้บังคับ" },
          { "key": "D", "text": "He wrote and staged his own kindergarten puppet play.", "isCorrect": False, "feedbackTh": "ไม่ใช่ละครหุ่น" }
        ],
        "explanationTh": "แอลันเล่าว่า: 'their child actor suddenly contracted measles. The director panicked, noticed me sitting quietly in the third row, and handed me a small wooden prop.'",
        "explanationEn": "Alan stepped in as an impromptu replacement when the original child actor contracted measles.",
        "weaknessTag": "narrative_biographical_circumstance_tracking",
        "difficultyWeight": 4
      },
      {
        "id": "listen-q-b2-career-2",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "แอลันนิยามแก่นแท้ของศิลปะการแสดงว่าอย่างไรในตอนท้าย?",
        "promptEn": "According to Alan, what is the profound essence of acting?",
        "options": [
          { "key": "A", "text": "Earning prestigious commercial accolades and fame.", "isCorrect": False, "feedbackTh": "ไม่ได้เน้นเรื่องชื่อเสียงและรางวัล" },
          { "key": "B", "text": "Uncovering genuine human vulnerability under imagined circumstances.", "isCorrect": True, "feedbackTh": "ถูกต้อง! ค้นพบความเปราะบางของมนุษย์อย่างแท้จริงภายใต้สถานการณ์ที่สมมติขึ้น" },
          { "key": "C", "text": "Mastering flawless mimicry of foreign regional accents.", "isCorrect": False, "feedbackTh": "ไม่ใช่การเลียนแบบสำเนียง" },
          { "key": "D", "text": "Memorizing hundreds of historical script pages quickly.", "isCorrect": False, "feedbackTh": "ไม่ใช่แค่การท่องจำบท" }
        ],
        "explanationTh": "แอลันระบุ: 'acting is not about pretending to be someone else; it is about discovering genuine human vulnerability under extraordinary imagined circumstances.'",
        "explanationEn": "Alan defines acting as uncovering genuine human vulnerability under imagined conditions.",
        "weaknessTag": "identifying_philosophical_perspective_in_interviews",
        "difficultyWeight": 4
      }
    ]
  }
]

# Read existing listeningBank.ts
with open('data/listeningBank.ts', 'r', encoding='utf-8') as f:
    lb_content = f.read()

insert_index = lb_content.rfind('];')
if insert_index != -1:
    new_listening_ts = ""
    for l in new_listening_exercises:
        new_listening_ts += "  " + json.dumps(l, ensure_ascii=False, indent=2).replace('\n', '\n  ') + ",\n"
    
    updated_lb = lb_content[:insert_index] + new_listening_ts + lb_content[insert_index:]
    with open('data/listeningBank.ts', 'w', encoding='utf-8') as f:
        f.write(updated_lb)
    print("Appended 3 new listening exercises to data/listeningBank.ts successfully!")
else:
    print("Error: Could not locate closing bracket in data/listeningBank.ts")
