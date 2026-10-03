#!/usr/bin/env python3
"""
build_full_writing_prompts.py
Generates 12 CEFR Writing Prompts (A1–C2, 2 prompts per level)
with rubrics, can-do descriptors, and verified model answers.
"""

import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

prompts = [
    # =========================================================================
    # A1 LEVEL (2 prompts)
    # =========================================================================
    {
        "id": "wp_a1_001",
        "cefr_level": "A1",
        "task_type": "description",
        "title_en": "Introduce Yourself and Your Daily Life",
        "title_th": "แนะนำตัวเองและชีวิตประจำวัน",
        "instruction_en": "Write a short personal introduction. Mention your name, age, where you live, what you do, and two things you like doing in your free time. (30–50 words)",
        "instruction_th": "เขียนแนะนำตัวเองสั้นๆ โดยระบุชื่อ อายุ ที่อยู่อาศัย อาชีพ/การเรียน และสิ่งที่ชอบทำในเวลาว่าง 2 อย่าง (ความยาว 30–50 คำ)",
        "min_words": 30,
        "max_words": 55,
        "scoring_rubric": {
            "task_achievement": "Includes name, age, home location, occupation/study, and two hobbies.",
            "coherence_cohesion": "Simple sequential sentences using basic connectors like 'and' or 'also'.",
            "lexical_resource": "Basic vocabulary related to personal information, numbers, and hobbies.",
            "grammatical_accuracy": "Accurate use of Present Simple and verb to be with correct subject-verb agreement."
        },
        "sample_answer_en": "Hello! My name is Tanakorn and I am twenty-two years old. I live in Bangkok, Thailand. I am a university student studying business. In my free time, I like playing badminton and reading English novels. Nice to meet you!",
        "cefr_descriptors": [
            "Can write simple phrases and sentences about themselves and imaginary people, where they live and what they do."
        ]
    },
    {
        "id": "wp_a1_002",
        "cefr_level": "A1",
        "task_type": "message",
        "title_en": "Short Note to a Friend",
        "title_th": "เขียนข้อความสั้นถึงเพื่อน",
        "instruction_en": "Write a short message to your friend inviting them to have lunch this Saturday. Say where you want to meet and at what time. (30–45 words)",
        "instruction_th": "เขียนข้อความสั้นๆ ชวนเพื่อนไปทานอาหารกลางวันในวันเสาร์นี้ ระบุสถานที่และเวลาที่ต้องการนัดพบ (ความยาว 30–45 คำ)",
        "min_words": 30,
        "max_words": 50,
        "scoring_rubric": {
            "task_achievement": "Clearly invites friend, specifies lunch location, and provides clear meeting time.",
            "coherence_cohesion": "Logical organization of an informal message with friendly opening and sign-off.",
            "lexical_resource": "Everyday vocabulary for food, days of the week, and times.",
            "grammatical_accuracy": "Correct prepositions of time ('at 12:00', 'on Saturday') and polite imperatives."
        },
        "sample_answer_en": "Hi Alex, are you free this Saturday? Would you like to have lunch with me at the new Italian restaurant near the central station? Let's meet at 12:30 PM outside the main entrance. Let me know! Cheers, Somchai.",
        "cefr_descriptors": [
            "Can write short, simple notes and messages relating to matters in areas of immediate need."
        ]
    },

    # =========================================================================
    # A2 LEVEL (2 prompts)
    # =========================================================================
    {
        "id": "wp_a2_001",
        "cefr_level": "A2",
        "task_type": "email",
        "title_en": "Holiday Update Email to a Colleague",
        "title_th": "อีเมลเล่าบรรยากาศการท่องเที่ยวถึงเพื่อนร่วมงาน",
        "instruction_en": "Write an email to an English-speaking colleague about your vacation. Describe where you are staying, what the weather is like, what activities you have done so far, and when you will return to work. (60–80 words)",
        "instruction_th": "เขียนอีเมลถึงเพื่อนร่วมงานเพื่อเล่าเรื่องการพักร้อน อธิบายสถานที่พัก สภาพอากาศ กิจกรรมที่ทำไปแล้ว และวันที่คุณจะกลับมาทำงาน (ความยาว 60–80 คำ)",
        "min_words": 60,
        "max_words": 90,
        "scoring_rubric": {
            "task_achievement": "Addresses all four prompt points: accommodation, weather, activities, and return date.",
            "coherence_cohesion": "Uses basic linking words like 'because', 'so', 'then', and 'after that'.",
            "lexical_resource": "Vocabulary related to travel, hotel amenities, geography, and leisure.",
            "grammatical_accuracy": "Accurate alternation between Past Simple, Present Continuous, and future plans with 'will' or 'going to'."
        },
        "sample_answer_en": "Dear Sarah, I am writing to you from a peaceful mountain hotel in northern Thailand. The weather is cool and breezy. Yesterday, we rented bicycles and explored a traditional wooden village near a scenic waterfall. Tomorrow morning, we are going to hike along the river path. I will be back at the office next Monday morning. I hope everything is going smoothly with the project. Best regards, Nattapong.",
        "cefr_descriptors": [
            "Can write a series of simple phrases and sentences linked with simple connectors like 'and', 'but' and 'because'."
        ]
    },
    {
        "id": "wp_a2_002",
        "cefr_level": "A2",
        "task_type": "story",
        "title_en": "A Memorable Day Out",
        "title_th": "เล่าเรื่องหนึ่งวันที่น่าจดจำ",
        "instruction_en": "Write a short paragraph about a memorable day you spent with friends or family. Explain what happened, where you went, and why it was special to you. (60–80 words)",
        "instruction_th": "เขียนเล่าเรื่องราวหนึ่งวันที่น่าจดจำกับเพื่อนหรือครอบครัว อธิบายว่าไปที่ไหน เกิดอะไรขึ้นบ้าง และทำไมวันนี้จึงมีความพิเศษสำหรับคุณ (ความยาว 60–80 คำ)",
        "min_words": 60,
        "max_words": 90,
        "scoring_rubric": {
            "task_achievement": "Clearly narrates a past event with location, action sequence, and emotional reflection.",
            "coherence_cohesion": "Sequential narrative cohesion using time adverbs: 'first', 'then', 'in the evening'.",
            "lexical_resource": "Action verbs in past forms and descriptive adjectives for feelings and atmosphere.",
            "grammatical_accuracy": "Consistent Past Simple control with both regular and irregular verbs."
        },
        "sample_answer_en": "Last month, my best friends and I went camping in Khao Yai National Park. We set up our tents near a small lake. In the afternoon, we walked through the jungle and saw wild deer drinking by the water. At night, we cooked dinner over a campfire and talked about our future dreams. It was very special because we had not seen each other for an entire year.",
        "cefr_descriptors": [
            "Can write very short, basic descriptions of events, past activities and personal experiences."
        ]
    },

    # =========================================================================
    # B1 LEVEL (2 prompts)
    # =========================================================================
    {
        "id": "wp_b1_001",
        "cefr_level": "B1",
        "task_type": "email",
        "title_en": "Formal Inconvenience Complaint to Hotel Manager",
        "title_th": "อีเมลร้องเรียนปัญหาการบริการถึงผู้จัดการโรงแรม",
        "instruction_en": "Write a formal email of complaint to a hotel manager regarding poor service during your recent weekend stay. Detail two specific problems you encountered, explain how this affected your stay, and propose a fair resolution. (100–130 words)",
        "instruction_th": "เขียนอีเมลร้องเรียนอย่างเป็นทางการถึงผู้จัดการโรงแรมเกี่ยวกับข้อบกพร่องในการเข้าพัก ระบุปัญหา 2 ประการ อธิบายผลกระทบ และเสนอแนวทางแก้ไขที่เหมาะสม (ความยาว 100–130 คำ)",
        "min_words": 100,
        "max_words": 145,
        "scoring_rubric": {
            "task_achievement": "Outlines background, details two distinct issues, explains impact, and requests specific compensation.",
            "coherence_cohesion": "Structured formal paragraphs with appropriate signposting ('Firstly', 'Furthermore', 'Consequently').",
            "lexical_resource": "Formal register vocabulary: 'inconvenience', 'promptly', 'reimbursement', 'unacceptable'.",
            "grammatical_accuracy": "Competent control of Present Perfect, Past Simple, passive structures, and polite conditionals."
        },
        "sample_answer_en": "Dear Hotel Manager,\n\nI am writing to express my dissatisfaction with my recent stay in room 402 from September 25th to 27th. \n\nFirstly, upon my arrival, the air conditioning unit in the bedroom was malfunctioning, producing loud rattling noises and failing to cool the room. Although I reported this to the front reception desk promptly, no technician was dispatched to resolve the issue until the following afternoon. Consequently, my sleep was severely disrupted throughout the weekend.\n\nFurthermore, the promised high-speed internet connection was completely unavailable, which prevented me from attending an important scheduled client conference call.\n\nGiven these significant inconveniences, I believe a partial refund of fifty percent of my room charge would be fair. I look forward to your prompt response.\n\nYours sincerely,\nPrasert Chaiprasit",
        "cefr_descriptors": [
            "Can write straightforward, connected texts on a range of familiar subjects by linking a series of shorter discrete elements into a linear sequence."
        ]
    },
    {
        "id": "wp_b1_002",
        "cefr_level": "B1",
        "task_type": "essay",
        "title_en": "Opinion Essay: Remote Work vs Office Attendance",
        "title_th": "บทความแสดงความคิดเห็น: การทำงานจากที่บ้านกับการเข้าออฟฟิศ",
        "instruction_en": "Some people believe that working remotely from home is better than working in a traditional corporate office. Write an opinion essay presenting your viewpoint. Give reasons and support them with relevant examples. (110–140 words)",
        "instruction_th": "บางคนมองว่าการทำงานแบบรีโมทจากบ้านดีกว่าการเข้าออฟฟิศ จงเขียนบทความแสดงทัศนะของคุณ พร้อมระบุเหตุผลและยกตัวอย่างประกอบ (ความยาว 110–140 คำ)",
        "min_words": 110,
        "max_words": 155,
        "scoring_rubric": {
            "task_achievement": "States a clear opinion in the introduction, supports it with 2-3 logical arguments, and provides a clear conclusion.",
            "coherence_cohesion": "Smooth transitions using discourse markers ('In my opinion', 'On the one hand', 'In addition', 'To conclude').",
            "lexical_resource": "Varied vocabulary connected to modern workplace dynamics, productivity, and work-life balance.",
            "grammatical_accuracy": "Accurate use of comparative forms, modal verbs of possibility (can, might), and complex conditional sentences."
        },
        "sample_answer_en": "In recent years, the widespread availability of high-speed internet has enabled millions of employees to work from home. In my opinion, remote work offers superior advantages over traditional office attendance.\n\nFirst and foremost, eliminating the daily commute saves workers hours of wasted time and substantial transport costs. Employees who work remotely can allocate this saved time to healthy exercise, family responsibilities, and quality rest, which significantly boosts their psychological wellbeing.\n\nMoreover, many people find that they can concentrate much better in a quiet home environment without constant workplace interruptions from noisy colleagues.\n\nHowever, it is true that remote work can sometimes lead to feelings of social isolation. Therefore, a hybrid model where staff visit the office two days a week is ideal.\n\nIn conclusion, working from home improves productivity and happiness when balanced effectively.",
        "cefr_descriptors": [
            "Can write a short essay which develops an argument, giving reasons in support of or against a particular point of view."
        ]
    },

    # =========================================================================
    # B2 LEVEL (2 prompts)
    # =========================================================================
    {
        "id": "wp_b2_001",
        "cefr_level": "B2",
        "task_type": "essay",
        "title_en": "Discursive Essay: Tourism Impact on Historical Heritage",
        "title_th": "บทความอภิปราย: ผลกระทบของการท่องเที่ยวต่อมรดกทางประวัติศาสตร์",
        "instruction_en": "International tourism brings valuable foreign revenue to historical towns, but it can also degrade delicate monuments and displace resident communities. Write an essay examining both perspectives and concluding with your reasoned stance. (160–200 words)",
        "instruction_th": "การท่องเที่ยวระหว่างประเทศสร้างรายได้มหาศาล แต่นำมาซึ่งการเสื่อมสภาพของโบราณสถานและการเบียดขับคนในพื้นที่ จงเขียนบทความอภิปรายทั้งสองแง่มุม พร้อมสรุปจุดยืนอย่างสมเหตุสมผล (ความยาว 160–200 คำ)",
        "min_words": 160,
        "max_words": 220,
        "scoring_rubric": {
            "task_achievement": "Thoroughly balances economic windfalls against socio-ecological preservation issues with a nuanced conclusion.",
            "coherence_cohesion": "Sophisticated discourse markers ('While it cannot be denied that', 'Conversely', 'Nevertheless', 'Ultimately').",
            "lexical_resource": "High lexical range: 'degrade', 'revenue influx', 'overtourism', 'monument preservation', 'sustainable regulation'.",
            "grammatical_accuracy": "Varied syntactic complexity: mixed conditionals, passive voice with reporting verbs, and relative clauses."
        },
        "sample_answer_en": "International tourism represents a double-edged sword for world heritage destinations across the globe. While the influx of foreign visitors injects vital capital into local economies, unchecked overtourism frequently imperils the very historical sites that visitors travel to admire.\n\nOn the one hand, tourism revenue provides municipal governments with substantial resources to fund structural preservation, archaeological excavation, and regional transport infrastructure. Local businesses, ranging from traditional craft artisans to family restaurants, thrive on visitor spending, thereby generating diverse employment opportunities.\n\nOn the other hand, mass foot traffic causes irreversible wear and tear on fragile ancient masonry and ancient frescoes. Furthermore, the commercial proliferation of souvenir shops and short-term vacation rentals often drives up housing costs, forcing lifelong local residents out of historic centers and hollowing out authentic community life.\n\nIn my view, prohibiting tourism is neither economically realistic nor culturally desirable. Instead, authorities must implement strict regulatory safeguards, such as mandatory advance ticketing quotas, visitor caps, and targeted tourist taxes reinvested directly into conservation.\n\nUltimately, sustainable management can reconcile economic vitality with cultural stewardship.",
        "cefr_descriptors": [
            "Can write an essay or report that develops an argument systematically with reasonable highlighting of significant points and relevant supporting detail."
        ]
    },
    {
        "id": "wp_b2_002",
        "cefr_level": "B2",
        "task_type": "report",
        "title_en": "Internal Advisory Report: Enhancing Workplace Sustainability",
        "title_th": "รายงานข้อเสนอแนะภายใน: การยกระดับความยั่งยืนในที่ทำงาน",
        "instruction_en": "You are the leader of your company's green committee. Write a formal report to the executive board assessing current environmental practices in your office, identifying two major areas of waste, and recommending actionable solutions with measurable benefits. (160–200 words)",
        "instruction_th": "คุณเป็นหัวหน้าคณะทำงานด้านสิ่งแวดล้อม จงเขียนรายงานทางการเสนอต่อผู้บริหารเพื่อประเมินการปฏิบัติงานด้านสิ่งแวดล้อม ชี้จุดที่มีความสูญเปล่า 2 ด้าน และเสนอมาตรการแก้ไขที่เป็นรูปธรรม (ความยาว 160–200 คำ)",
        "min_words": 160,
        "max_words": 220,
        "scoring_rubric": {
            "task_achievement": "Meets professional report format with clear headings, objective evaluation, and concrete recommendations.",
            "coherence_cohesion": "Organized into executive summary, findings, and recommendations using structured headers and bullet points.",
            "lexical_resource": "Corporate environmental terminology: 'carbon footprint', 'energy audit', 'procurement', 'waste diversion'.",
            "grammatical_accuracy": "Accurate modal expressions of obligation, passive constructions, and precise numerical phrasing."
        },
        "sample_answer_en": "To: Executive Board of Directors  \nFrom: Sustainability Committee Chair  \nDate: October 3rd, 2026  \nSubject: Assessment and Recommendations for Workplace Sustainability  \n\n1. Purpose of the Report  \nThe objective of this report is to evaluate our corporate headquarters' current energy and material waste, and to recommend viable strategies for reducing our operational carbon footprint.\n\n2. Key Findings and Areas of Inefficiency  \n* Energy Consumption: An internal energy audit revealed that office computers, display monitors, and central HVAC systems remain running overnight, causing a 25% waste in monthly electricity expenditure.\n* Paper and Disposable Plastics: Despite digital workflow integration, our departments consume over 40,000 sheets of paper monthly, alongside extensive use of single-use plastic water cups in meeting suites.\n\n3. Strategic Recommendations  \n* Automated Power Management: Install smart sensor switches and automated software shutdowns for all workstations at 7:00 PM, which is projected to reduce electricity bills by $15,000 annually.\n* Zero-Waste Policy: Eliminate single-use plastics immediately by providing employees with reusable steel bottles and transitioning all client agreements to cloud digital signatures.\n\nImplementing these recommendations will significantly cut operating costs while demonstrating credible corporate environmental responsibility.",
        "cefr_descriptors": [
            "Can write an essay or report which evaluates different ideas or solutions to a problem, synthesizing information from a number of sources."
        ]
    },

    # =========================================================================
    # C1 LEVEL (2 prompts)
    # =========================================================================
    {
        "id": "wp_c1_001",
        "cefr_level": "C1",
        "task_type": "argumentative_essay",
        "title_en": "Academic Essay: The Ethical Limits of Algorithmic Governance",
        "title_th": "บทความวิชาการ: ขอบเขตทางจริยธรรมของธรรมาภิบาลด้วยอัลกอริทึม",
        "instruction_en": "As automated algorithmic decision-making expands across judicial sentencing, welfare distribution, and public policing, profound questions arise regarding accountability and algorithmic bias. Write an authoritative academic essay evaluating whether critical public governance decisions should ever be delegated to automated systems. (220–280 words)",
        "instruction_th": "เมื่อระบบอัลกอริทึมอัตโนมัติถูกนำมาใช้ในกระบวนการยุติธรรมและสวัสดิการสังคม จงเขียนบทความวิชาการเชิงวิพากษ์ว่าการตัดสินใจเชิงนโยบายสาธารณะที่มีผลกระทบสูงควรถูกมอบหมายให้อัลกอริทึมทำหรือไม่ (ความยาว 220–280 คำ)",
        "min_words": 220,
        "max_words": 310,
        "scoring_rubric": {
            "task_achievement": "Deeply engages with algorithmic transparency, systemic prejudice, democratic accountability, and epistemic limits.",
            "coherence_cohesion": "Exceptional structural fluency with nuanced thematic progression and sophisticated academic transitions.",
            "lexical_resource": "Advanced academic register: 'epistemic opacity', 'codified bias', 'procedural justice', 'surrogate metrics', 'technocratic'.",
            "grammatical_accuracy": "Mastery of complex grammar: inversion after negative adverbials, participle clauses, and subjunctive constructions."
        },
        "sample_answer_en": "The increasing encroachment of automated decision-making architectures into the spheres of judicial sentencing, credit allocation, and social welfare distribution is frequently heralded as a triumph of rationalized objectivity over fallible human discretion. Proponents contend that statistical models eliminate idiosyncratic prejudice, process astronomical data volumes instantaneously, and optimize institutional throughput. However, this technocratic optimism fundamentally mischaracterizes the nature of predictive algorithms, which are neither ontologically neutral nor inherently just.\n\nCrucially, machine-learning systems do not operate in an epistemic vacuum; they extrapolate patterns from historical datasets that reflect centuries of systemic inequality and institutionalized discrimination. When algorithmic risk-assessment instruments evaluate recidivism rates in criminal sentencing, they rely on historical arrest statistics—metrics heavily distorted by racialized policing practices. Consequently, such models do not predict objective future criminality; rather, they codify, automate, and launder historical injustices under the deceptive veneer of mathematical impartiality.\n\nFurthermore, the profound epistemic opacity of deep neural networks—the intractable 'black box' problem—severely undermines the foundational democratic principle of procedural justice. When a citizen is denied parole or critical medical disability benefits by an opaque algorithmic calculation, meaningful appeal becomes virtually impossible because the explicit causal rationale cannot be articulated by human interrogators.\n\nUnder no circumstances should sovereign adjudicative power be delegated entirely to autonomous algorithmic agents. While predictive analytics can serve as auxiliary empirical tools, final normative decisions that determine human liberty and human dignity must remain firmly subordinated to human moral reasoning and democratic accountability.",
        "cefr_descriptors": [
            "Can write clear, well-structured texts of complex subjects, underlining the relevant salient issues, expanding and supporting points of view at some length with subsidiary points, reasons and relevant examples."
        ]
    },
    {
        "id": "wp_c1_002",
        "cefr_level": "C1",
        "task_type": "proposal",
        "title_en": "Strategic Institutional Proposal: Municipal Climate Adaptation",
        "title_th": "ข้อเสนอเชิงยุทธศาสตร์: แผนการปรับตัวรับการเปลี่ยนแปลงสภาพภูมิอากาศระดับเมือง",
        "instruction_en": "Write a formal strategic policy proposal addressed to a city council outlining a comprehensive fifteen-year climate resilience plan. Formulate detailed recommendations addressing urban heat island mitigation, coastal/fluvial flood defenses, and green transit equity, justifying your budgetary allocation. (220–280 words)",
        "instruction_th": "เขียนข้อเสนอเชิงนโยบายอย่างเป็นทางการต่อสภาเทศบาลเมืองเพื่อนำเสนอแผนยุทธศาสตร์ 15 ปีในการรับมือวิกฤตสภาพภูมิอากาศ ครอบคลุมการลดเกาะความร้อนเมือง การป้องกันน้ำท่วม และความเท่าเทียมด้านขนส่งสีเขียว (ความยาว 220–280 คำ)",
        "min_words": 220,
        "max_words": 310,
        "scoring_rubric": {
            "task_achievement": "Presents rigorous, multi-sector strategic interventions with budgetary logic and policy viability.",
            "coherence_cohesion": "Executive proposal layout with strategic headings, logical policy prioritization, and cohesive macro-structure.",
            "lexical_resource": "Policy and urban resilience lexicon: 'sponge city infrastructure', 'bioswales', 'electrification', 'microclimate moderation'.",
            "grammatical_accuracy": "Flawless formal syntactic variety: cleft sentences, nominalizations, and complex conditional modality."
        },
        "sample_answer_en": "Proposal: Metropolitan Climate Resilience and Ecological Adaptation Framework (2026–2040)  \nAddressed to: The Metropolitan City Council  \nSubmitted by: Directorate of Urban Ecological Resilience  \n\n1. Executive Summary  \nAccelerating climate volatility poses existential infrastructural risks to our metropolitan region. Unprecedented summer heat anomalies and recurrent tidal storm surges threaten civic public health and urban economic continuity. This strategic proposal delineates a fifteen-year, multi-tiered infrastructure adaptation framework.\n\n2. Pillar I: Urban Heat Island Mitigation via Biophilic Architecture  \nTo counteract extreme surface temperatures across dense downtown commercial districts, we propose the mandatory retrofitting of commercial rooftops with vegetative green canopies and reflective cool-roof coatings. Coupled with the strategic insertion of five hundred municipal pocket forests and continuous tree-shaded corridors, this initiative is projected to moderate summer urban microclimates by up to 2.8 degrees Celsius.\n\n3. Pillar II: Distributed Hydro-Urbanism and Flood Retention  \nConventional storm sewer networks can no longer withstand hundred-year precipitation surges. We recommend transitioning toward a distributed 'sponge city' paradigm: constructing subterranean permeable retention reservoirs beneath public parks, unpaving underutilized municipal asphalt, and installing bio-retention swales along arterial boulevards to decelerate and filter stormwater runoff before coastal discharge.\n\n4. Pillar III: Decarbonized Transit Equity  \nTrue climate resilience cannot occur without social equity. We advocate prioritizing the full electrification of our municipal bus fleet, paired with the rapid expansion of protected arterial cycling infrastructure into historically underserved, low-income peripheral districts.\n\nConclusion  \nInvesting three percent of annual municipal capital expenditure into ecological infrastructure will avert billions in catastrophic disaster remediation over the coming decades.",
        "cefr_descriptors": [
            "Can produce clear, smoothly flowing, well-structured speech, with an effective logical structure which helps the recipient to notice and remember significant points."
        ]
    },

    # =========================================================================
    # C2 LEVEL (2 prompts)
    # =========================================================================
    {
        "id": "wp_c2_001",
        "cefr_level": "C2",
        "task_type": "critical_review",
        "title_en": "Epistemic Critique: The Financialization of Higher Education",
        "title_th": "บทวิจารณ์เชิงวิพากษ์: การแปรสภาพการศึกษาระดับอุดมศึกษาให้เป็นสินค้าทางการเงิน",
        "instruction_en": "Write a sophisticated intellectual critique analyzing the transformation of modern universities from public goods of intellectual inquiry into market-driven corporate entities. Interrogate how neoliberal accountability metrics, commodified curricula, and the precarious gig-economy academic workforce erode democratic intellectual life. (260–340 words)",
        "instruction_th": "เขียนบทความวิจารณ์เชิงวิชาการชั้นสูงวิเคราะห์การเปลี่ยนผ่านของมหาวิทยาลัยจากสถาบันแสวงหาปัญญาเพื่อสาธารณะสู่องค์กรธุรกิจที่ขับเคลื่อนด้วยกำไร วิพากษ์ผลกระทบต่อชีวิตทางปัญญาและเสรีภาพทางวิชาการ (ความยาว 260–340 คำ)",
        "min_words": 260,
        "max_words": 370,
        "scoring_rubric": {
            "task_achievement": "Deeply deconstructs corporatization, precarious labor, student-as-consumer ethos, and philosophical consequences for democracy.",
            "coherence_cohesion": "Impeccable academic prose with organic rhetorical transitions, profound conceptual cohesion, and varied paragraph rhythms.",
            "lexical_resource": "Erudite philosophical lexicon: 'epistemic commodification', 'proletarianization', 'neoliberal hegemony', 'instrumental reason', 'scholarly autonomy'.",
            "grammatical_accuracy": "Virtuosic syntactic control utilizing fronting, advanced subjunctive forms, complex nominalizations, and balanced periodic sentences."
        },
        "sample_answer_en": "Over the past four decades, the university has undergone a profound ontological transvaluation. Once conceptualized as an autonomous sanctuary dedicated to disinterested intellectual inquiry, critical dialectic, and the cultivation of democratic citizenship, the modern academy has been aggressively re-engineered into an enterprise of financialized capital accumulation. Under the prevailing neoliberal orthodoxy, the holistic pursuit of truth has been systematically subordinated to instrumental reason, quantifiable performance indices, and corporate monetization.\n\nThis structural metamorphosis manifests most egregiously in the redefinition of the pedagogical relationship. Recast as consumer-investors purchasing credentialist human capital, students increasingly demand hyper-vocationalized curricula that yield immediate economic dividends. In this transactional ecosystem, the humanities and foundational theoretical sciences—domains that resist reduction to algorithmic productivity metrics—are ruthlessly defunded or liquidated as unproductive overheads. Knowledge is no longer celebrated as an emancipatory public good; it is commodified into proprietary intellectual property and market-delineated skill modules.\n\nConcurrently, the internal sociology of the university has fractured into an autocratic managerial executive class and an increasingly precaritized academic underclass. Tenure-track lines are systematically dismantled in favor of disenfranchised adjunct instructors whose transient contractual status suffocates daring intellectual unorthodoxy and pedagogy. Be that as it may, senior university administrators continue to inaugurate gleaming vanity capital projects while accumulating catastrophic debt burdens financed by usurious student tuition loans.\n\nTo lament this commercialization is not an exercise in cloistered nostalgic romanticism. When universities relinquish their role as uncompromised centers of societal self-critique, democratic deliberation is irrevocably impoverished. Without institutions insulated from short-term market imperatives, society forfeits its capacity to conceptualize futures that transcend the narrow confines of commercial expediency.",
        "cefr_descriptors": [
            "Can write clear, smoothly flowing, complex texts in an appropriate and effective style and a logical structure which helps the reader to find and remember significant points."
        ]
    },
    {
        "id": "wp_c2_002",
        "cefr_level": "C2",
        "task_type": "philosophical_essay",
        "title_en": "Philosophical Treatise: The Dissolution of Truth in the Hyper-Real Era",
        "title_th": "บทความปรัชญานิพนธ์: การสลายตัวของความจริงในยุคความจริงยิ่งยวด (Hyper-reality)",
        "instruction_en": "In an era saturated by generative synthetic media, algorithmic echo chambers, and epistemic tribalism, the classical Enlightenment consensus around verifiable objective reality appears irrevocably fractured. Compose an erudite philosophical treatise exploring whether shared democratic truth can survive in an age of hyper-real simulacra. (260–340 words)",
        "instruction_th": "ในยุคที่สื่อสังเคราะห์ ภาพจำลองเสมือนจริง และอัลกอริทึมครอบงำการรับรู้ มโนทัศน์เรื่องความจริงที่เป็นภววิสัยร่วมกันกำลังแตกสลาย จงเขียนบทความปรัชญาวิเคราะห์ว่าความจริงเชิงประชาธิปไตยจะยังคงอยู่ได้หรือไม่ท่ามกลางโลกแห่งภาพจำลองเสมือนจริง (ความยาว 260–340 คำ)",
        "min_words": 260,
        "max_words": 370,
        "scoring_rubric": {
            "task_achievement": "Addresses the epistemic crisis of post-truth, synthetic reality, Baudrillardian simulation, and democratic viability with exceptional depth.",
            "coherence_cohesion": "Philosophical rigor, rhythmic rhetorical elegance, and seamless dialectical architecture.",
            "lexical_resource": "Peerless academic vocabulary: 'epistemic solipsism', 'ontological anchor', 'hyper-real simulacrum', 'hermeneutics', 'discursive consensus'.",
            "grammatical_accuracy": "Flawless syntactic sophistication throughout: varied clause nesting, elegant archaic inversions, and rhythmic rhetorical cadences."
        },
        "sample_answer_en": "The foundational premise of Enlightenment modernity—that human societies could converge toward a shared normative reality through empirical observation, rational deliberation, and scientific falsification—is undergoing an epochal collapse. Saturated by generative synthetic hallucinations, hyper-targeted algorithmic feeds, and profound epistemic tribalism, contemporary public life is trapped within what Jean Baudrillard presciently diagnosed as the regime of the simulacrum: an order where signs and representations reference only other signs, having severed all reciprocal correspondence with an objective material substrate.\n\nWhat characterizes our contemporary epistemic crisis is not merely the proliferation of empirical falsehood, but the structural disintegration of the collective criteria by which truth is demarcated from deception. Deepfakes and generative synthetic narratives do not merely deceive individual observers; rather, they induce a paralyzing ontological vertigo, rendering the very claim to authenticity suspect. When any recorded document or historical artifact can be seamlessly manufactured post-hoc, the public withdraws from shared civic reality into hermetically sealed echo chambers governed by affective tribal allegiance rather than factual verifiability.\n\nThis epistemological fragmentation strikes at the very jugular of democratic governance. Democracy is intrinsically discursive: it presupposes that political antagonists, however fiercely they contest ideological values, inhabit a common universe of baseline empirical facts upon which compromises can be negotiated. When truth itself dissolves into subjective brand curation and algorithmic radicalization, deliberative democratic politics collapses into raw, unmediated power struggles.\n\nReclaiming an ontological anchor in an age of hyper-reality demands far more than naive technical fact-checking algorithms. It requires a profound cultural renaissance: re-establishing decentralized, accountable public epistemic institutions, revitalizing humanistic skepticism, and fostering civic spaces that liberate human attention from predatory algorithmic commodification. Should we fail to reconstruct this shared epistemic terrain, democracy will inevitably devolve into competing spectacles of simulated delirium.",
        "cefr_descriptors": [
            "Can write complex texts that display a assured, personal, natural style and an effective, logical structure which helps the reader to find and remember significant points."
        ]
    }
]

print(f"Total writing prompts generated: {len(prompts)}")

# Validate prompts
levels = {}
for p in prompts:
    lvl = p["cefr_level"]
    levels[lvl] = levels.get(lvl, 0) + 1
    assert p["min_words"] < p["max_words"]
    assert len(p["sample_answer_en"].split()) >= p["min_words"] * 0.9

print("Distribution by level:")
for lvl, count in sorted(levels.items()):
    print(f"  {lvl}: {count}")

output_path = "data/writing-prompts.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {len(prompts)} prompts to {output_path}")
