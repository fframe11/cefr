import { ListeningExercise } from '../types';

/**
 * ==============================================================================
 * GLOVA Comprehensive CEFR & Oxford OOPT Listening Bank (A1–C1)
 * ==============================================================================
 * Synthesized from authentic OOPT Section 2 Listening formats and academic
 * curricula in Thailand CEFR guideline materials.
 * 
 * Features:
 * - 10 authentic listening tasks across A1 (2), A2 (2), B1 (3), B2 (2), C1 (1).
 * - Real-world communicative scenarios (Campus orientation, Transit/Tickets, Lost Property,
 *   Sustainable housing, Careers counseling, Usability critique, Conservation, Linguistics).
 * - Multi-speed audio playback scripts with 4-choice questions, detailed bilingual explanations,
 *   and psychometric weakness tags.
 * - Strict Invariant: Verified allergen-free content.
 * ==============================================================================
 */

export const LISTENING_BANK: ListeningExercise[] = [
  {
    "id": "listen-a1-campus",
    "title": "University Campus Information Desk",
    "cefrLevel": "A1",
    "targetExam": "KET",
    "speakerAccents": "British English (Student & Receptionist)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Student: Excuse me, good morning! I am looking for the main university library.\n\nReceptionist: Good morning! The library is right across the courtyard, in building number four. It is on the second floor, room two hundred and four.\n\nStudent: Room two hundred and four, thank you! And what time does it close today?\n\nReceptionist: On weekdays it is open from eight o'clock in the morning until eight o'clock in the evening. On Saturdays, it closes at four in the afternoon.\n\nStudent: Perfect, thank you very much for your help!",
    "questions": [
      {
        "id": "listen-q-a1-campus-1",
        "skill": "listening",
        "cefrLevel": "A1",
        "type": "multiple_choice",
        "promptTh": "ห้องสมุดหลักของมหาวิทยาลัยตั้งอยู่ที่ห้องใด?",
        "promptEn": "Where is the main university library located?",
        "options": [
          {
            "key": "A",
            "text": "Room 104 in building three",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ห้อง 104"
          },
          {
            "key": "B",
            "text": "Room 204 in building four",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! เจ้าหน้าที่บอกว่า 'building number four... room two hundred and four'"
          },
          {
            "key": "C",
            "text": "Room 402 on the fourth floor",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้อยู่ชั้น 4"
          },
          {
            "key": "D",
            "text": "Room 208 across the sports field",
            "isCorrect": false,
            "feedbackTh": "ไม่มีห้อง 208"
          }
        ],
        "explanationTh": "เจ้าหน้าที่ระบุชัดเจน: 'in building number four... on the second floor, room two hundred and four' (อาคาร 4 ชั้น 2 ห้อง 204)",
        "explanationEn": "The receptionist states the library is in building 4, room 204.",
        "weaknessTag": "identifying_room_numbers_and_locations",
        "difficultyWeight": 1
      },
      {
        "id": "listen-q-a1-campus-2",
        "skill": "listening",
        "cefrLevel": "A1",
        "type": "multiple_choice",
        "promptTh": "ห้องสมุดปิดเวลาใดในวันธรรมดา (Weekdays)?",
        "promptEn": "What time does the library close on weekdays?",
        "options": [
          {
            "key": "A",
            "text": "4:00 PM",
            "isCorrect": false,
            "feedbackTh": "4 โมงเย็นเป็นเวลาปิดวันเสาร์"
          },
          {
            "key": "B",
            "text": "6:00 PM",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงเวลา 6 โมง"
          },
          {
            "key": "C",
            "text": "8:00 PM",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! เจ้าหน้าที่ระบุ 'until eight o'clock in the evening'"
          },
          {
            "key": "D",
            "text": "10:00 PM",
            "isCorrect": false,
            "feedbackTh": "ไม่เปิดถึง 4 ทุ่ม"
          }
        ],
        "explanationTh": "เจ้าหน้าที่กล่าวว่า: 'On weekdays it is open from eight o'clock in the morning until eight o'clock in the evening.' (วันธรรมดาเปิดถึง 2 ทุ่ม หรือ 8:00 PM)",
        "explanationEn": "The receptionist clarifies that on weekdays it stays open until eight o'clock in the evening (8:00 PM).",
        "weaknessTag": "listening_for_opening_hours",
        "difficultyWeight": 1
      }
    ]
  },
  {
    "id": "listen-a1-train",
    "title": "Train Station Ticket Window",
    "cefrLevel": "A1",
    "targetExam": "KET",
    "speakerAccents": "Standard English (Passenger & Clerk)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Clerk: Next in line, please! How can I help you today?\n\nPassenger: Hello. I would like one off-peak day return ticket to Oxford, please.\n\nClerk: Certainly. That will be fourteen pounds and fifty pence, please.\n\nPassenger: Here is a twenty-pound note.\n\nClerk: Thank you, and here is five pounds fifty change with your ticket. The next train departs at nine thirty-five from platform number three.\n\nPassenger: Nine thirty-five from platform three. Thank you!",
    "questions": [
      {
        "id": "listen-q-a1-train-1",
        "skill": "listening",
        "cefrLevel": "A1",
        "type": "multiple_choice",
        "promptTh": "ราคาตั๋วรถไฟไป-กลับ (Day return) ไปยัง Oxford มีราคาเท่าไร?",
        "promptEn": "How much does the return ticket to Oxford cost?",
        "options": [
          {
            "key": "A",
            "text": "£10.50",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ 10.50 ปอนด์"
          },
          {
            "key": "B",
            "text": "£14.50",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! พนักงานขายตั๋วระบุว่า 'fourteen pounds and fifty pence'"
          },
          {
            "key": "C",
            "text": "£15.00",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ 15 ปอนด์"
          },
          {
            "key": "D",
            "text": "£20.00",
            "isCorrect": false,
            "feedbackTh": "20 ปอนด์คือธนบัตรที่ผู้โดยสารจ่าย"
          }
        ],
        "explanationTh": "พนักงานแจ้งราคาว่า: 'fourteen pounds and fifty pence' (£14.50)",
        "explanationEn": "The ticket clerk states the price is fourteen pounds and fifty pence (£14.50).",
        "weaknessTag": "identifying_prices_and_money",
        "difficultyWeight": 1
      },
      {
        "id": "listen-q-a1-train-2",
        "skill": "listening",
        "cefrLevel": "A1",
        "type": "multiple_choice",
        "promptTh": "รถไฟขบวนถัดไปจะออกจากชานชาลา (Platform) ใด?",
        "promptEn": "Which platform does the next train depart from?",
        "options": [
          {
            "key": "A",
            "text": "Platform 1",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ชานชาลา 1"
          },
          {
            "key": "B",
            "text": "Platform 2",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ชานชาลา 2"
          },
          {
            "key": "C",
            "text": "Platform 3",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! พนักงานระบุ 'from platform number three'"
          },
          {
            "key": "D",
            "text": "Platform 5",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ชานชาลา 5"
          }
        ],
        "explanationTh": "พนักงานกล่าวว่า: 'The next train departs at nine thirty-five from platform number three.' (ชานชาลาที่ 3)",
        "explanationEn": "The clerk specifies that the train leaves from platform number three.",
        "weaknessTag": "listening_for_transport_details",
        "difficultyWeight": 1
      }
    ]
  },
  {
    "id": "listen-a2-airport",
    "title": "Airport Flight Announcement",
    "cefrLevel": "A2",
    "targetExam": "KET",
    "speakerAccents": "British English (Female Announcer)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Attention all passengers on flight TG 910 to London Heathrow.\nWe regret to inform you that due to heavy fog over Europe, departure has been delayed by forty-five minutes.\nThe revised boarding time is now ten fifteen at Gate B4.\nPassengers requiring special assistance or traveling with small infants are requested to approach the customer care desk at Gate B2.\nWe sincerely apologize for any inconvenience caused to your journey today. Thank you for your patience.",
    "questions": [
      {
        "id": "listen-q-a2-1",
        "skill": "listening",
        "cefrLevel": "A2",
        "type": "multiple_choice",
        "promptTh": "สาเหตุที่เที่ยวบินล่าช้าคืออะไร?",
        "promptEn": "What is the reason for the flight delay?",
        "options": [
          {
            "key": "A",
            "text": "Mechanical difficulties on the aircraft",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เกิดจากปัญหาเครื่องยนต์"
          },
          {
            "key": "B",
            "text": "Adverse weather conditions (heavy fog)",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ในประกาศระบุว่า 'due to heavy fog over Europe'"
          },
          {
            "key": "C",
            "text": "A missing cabin crew member",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงลูกเรือ"
          },
          {
            "key": "D",
            "text": "Airport terminal maintenance",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงการซ่อมบำรุงอาคาร"
          }
        ],
        "explanationTh": "ผู้ประกาศแจ้งชัดเจนว่า: 'due to heavy fog over Europe' (เนื่องจากหมอกหนาจัดทั่วยุโรป).",
        "explanationEn": "The announcement states the delay is 'due to heavy fog over Europe'.",
        "weaknessTag": "identifying_cause_in_announcements",
        "difficultyWeight": 2
      },
      {
        "id": "listen-q-a2-2",
        "skill": "listening",
        "cefrLevel": "A2",
        "type": "multiple_choice",
        "promptTh": "เวลาขึ้นเครื่องใหม่ (Revised boarding time) คือเวลาใด และที่ประตูใด?",
        "promptEn": "What is the revised boarding time and gate number?",
        "options": [
          {
            "key": "A",
            "text": "09:30 at Gate B4",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ 9:30"
          },
          {
            "key": "B",
            "text": "10:15 at Gate B4",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ประกาศระบุว่า 'ten fifteen at Gate B4'"
          },
          {
            "key": "C",
            "text": "10:45 at Gate B2",
            "isCorrect": false,
            "feedbackTh": "Gate B2 เป็นโต๊ะให้ความช่วยเหลือพิเศษ"
          },
          {
            "key": "D",
            "text": "11:15 at Gate A1",
            "isCorrect": false,
            "feedbackTh": "ข้อมูลเวลาและประตูไม่ถูกต้อง"
          }
        ],
        "explanationTh": "ข้อความในประกาศระบุว่า: 'The revised boarding time is now ten fifteen at Gate B4.'",
        "explanationEn": "The revised boarding time is ten fifteen (10:15) at Gate B4.",
        "weaknessTag": "listening_for_times_and_numbers",
        "difficultyWeight": 2
      }
    ]
  },
  {
    "id": "listen-a2-lostproperty",
    "title": "Lost Property Office Inquiry",
    "cefrLevel": "A2",
    "targetExam": "KET",
    "speakerAccents": "American English (Officer & Student)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Officer: Central Campus Lost Property. How can I assist you?\n\nStudent: Hi, I think I left my backpack on the university shuttle bus yesterday afternoon around three thirty.\n\nOfficer: Okay, can you describe the backpack for me?\n\nStudent: It is a dark navy blue canvas backpack with brown leather zippers. Inside, there is an economics textbook, a silver laptop charger, and a plastic pencil case.\n\nOfficer: Let me check our registry... Ah, yes! Driver Dan handed in a navy blue backpack from the three o'clock route. Did it have a student ID card in the front pocket?\n\nStudent: Yes, under the name Alex Turner!\n\nOfficer: That matches. You can pick it up today before five o'clock. Please remember to bring a photo ID.",
    "questions": [
      {
        "id": "listen-q-a2-lost-1",
        "skill": "listening",
        "cefrLevel": "A2",
        "type": "multiple_choice",
        "promptTh": "สิ่งของชิ้นใดที่อยู่ในกระเป๋าเป้ของนักศึกษา?",
        "promptEn": "Which item was inside the student's backpack?",
        "options": [
          {
            "key": "A",
            "text": "A chemistry notebook and tennis racket",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้มีไม้เทนนิส"
          },
          {
            "key": "B",
            "text": "An economics textbook and a silver laptop charger",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! นักศึกษาระบุ 'an economics textbook, a silver laptop charger'"
          },
          {
            "key": "C",
            "text": "A tablet computer and leather wallet",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงแท็บเล็ต"
          },
          {
            "key": "D",
            "text": "A camera lens and sports jersey",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้มีกล้องถ่ายรูป"
          }
        ],
        "explanationTh": "นักศึกษาแจ้งว่าข้างในกระเป๋ามี: 'an economics textbook, a silver laptop charger, and a plastic pencil case'",
        "explanationEn": "The student states that inside there is an economics textbook and a silver laptop charger.",
        "weaknessTag": "identifying_object_descriptions",
        "difficultyWeight": 2
      },
      {
        "id": "listen-q-a2-lost-2",
        "skill": "listening",
        "cefrLevel": "A2",
        "type": "multiple_choice",
        "promptTh": "นักศึกษาต้องนำสิ่งใดมาด้วยเมื่อมาติดต่อรับกระเป๋าคืน?",
        "promptEn": "What must the student bring when collecting the backpack?",
        "options": [
          {
            "key": "A",
            "text": "A receipt from the shuttle bus",
            "isCorrect": false,
            "feedbackTh": "ไม่ต้องใช้ใบเสร็จรถบัส"
          },
          {
            "key": "B",
            "text": "A written recommendation from a professor",
            "isCorrect": false,
            "feedbackTh": "ไม่ต้องใช้จดหมายแนะนำ"
          },
          {
            "key": "C",
            "text": "A valid photo ID",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! เจ้าหน้าที่ระบุ 'Please remember to bring a photo ID'"
          },
          {
            "key": "D",
            "text": "A ten-pound cash deposit",
            "isCorrect": false,
            "feedbackTh": "ไม่มีค่ามัดจำ"
          }
        ],
        "explanationTh": "เจ้าหน้าที่กำชับว่า: 'Please remember to bring a photo ID.' (กรุณานำบัตรประจำตัวที่มีรูปถ่ายมาด้วย)",
        "explanationEn": "The officer asks the student to bring a photo ID for verification.",
        "weaknessTag": "listening_for_conditional_requirements",
        "difficultyWeight": 2
      }
    ]
  },
  {
    "id": "listen-b1-interview",
    "title": "Podcast: Sustainable Architecture for Beginners",
    "cefrLevel": "B1",
    "targetExam": "PET",
    "speakerAccents": "Neutral English (Host & Architect)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Host: Welcome back to EcoDesign Today. With us in the studio is Mark Reynolds, an eco-architect who renovates standard suburban homes into energy-neutral dwellings. Mark, what is the single biggest misconception homeowners hold about going green?\n\nMark: Well, Sarah, most people mistakenly believe that sustainability requires installing costly solar panels or high-tech underground heat pumps right on day one. In reality, the most cost-effective first step is simply sealing thermal leaks around windows and door frames and upgrading insulation in the roof.\n\nHost: Really? Just insulation?\n\nMark: Absolutely! A house that is thoroughly insulated retains up to forty percent more heat in winter and stays cooler during humid summer afternoons. If your building shell leaks heat, even the most expensive solar installation won't save you money. Fix the leaks first, and consider renewable equipment later.",
    "questions": [
      {
        "id": "listen-q-b1-1",
        "skill": "listening",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "ความเข้าใจผิดที่พบบ่อยที่สุดของเจ้าของบ้านตามที่สถาปนิกกล่าวคืออะไร?",
        "promptEn": "According to Mark, what is the primary misconception homeowners have?",
        "options": [
          {
            "key": "A",
            "text": "That green buildings cannot withstand harsh winter storms.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงความทนทานต่อพายุ"
          },
          {
            "key": "B",
            "text": "That going green immediately requires expensive high-tech gear like solar panels.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! คนส่วนใหญ่เข้าใจผิดว่าต้องเริ่มจากการติดโซลาร์เซลล์ราคาแพงทันที"
          },
          {
            "key": "C",
            "text": "That insulation has no effect on room temperature.",
            "isCorrect": false,
            "feedbackTh": "มาร์กชี้ว่าฉนวนกันความร้อนมีผลสำคัญมาก"
          },
          {
            "key": "D",
            "text": "That architects charge too much for thermal audits.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้พูดถึงค่าบริการของสถาปนิก"
          }
        ],
        "explanationTh": "มาร์กอธิบายว่า: 'most people mistakenly believe that sustainability requires installing costly solar panels or high-tech underground heat pumps right on day one.'",
        "explanationEn": "Mark explains the misconception that green homes immediately require expensive renewable hardware.",
        "weaknessTag": "identifying_misconceptions_and_opinions",
        "difficultyWeight": 3
      }
    ]
  },
  {
    "id": "listen-b1-careers",
    "title": "University Careers & Internship Center",
    "cefrLevel": "B1",
    "targetExam": "PET",
    "speakerAccents": "Scottish & Australian English (Two Students)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Fiona: Callum! Have you had a chance to visit the new careers advisory center in the student union?\n\nCallum: I went there yesterday morning, actually. To be honest, I was expecting just another room filled with boring printed pamphlets and job boards.\n\nFiona: And was it like that?\n\nCallum: Not at all! The career coach spent forty-five minutes reviewing my CV line by line. She pointed out that I had completely buried my practical Python programming project under high school hobbies. She helped me reframe it into an active technical portfolio entry.\n\nFiona: That sounds super practical. Did you have to book a month in advance?\n\nCallum: No, they have drop-in clinics every Tuesday and Thursday between ten and two. But if you want a mock interview session for summer internships, you do need to register online at least one week ahead.",
    "questions": [
      {
        "id": "listen-q-b1-car-1",
        "skill": "listening",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "คัลลัมประทับใจบริการใดของศูนย์แนะแนวอาชีพมากที่สุด?",
        "promptEn": "What impressed Callum the most about his visit to the careers center?",
        "options": [
          {
            "key": "A",
            "text": "The wide selection of free printed brochures",
            "isCorrect": false,
            "feedbackTh": "เขาคิดว่าโบรชัวร์น่าเบื่อในตอนแรก"
          },
          {
            "key": "B",
            "text": "The personalized line-by-line feedback on restructuring his CV",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! โค้ชช่วยตรวจเรซูเม่แบบละเอียดทีละบรรทัดและดึงโปรเจกต์เขียนโปรแกรมขึ้นมาให้โดดเด่น"
          },
          {
            "key": "C",
            "text": "The guaranteed paid summer internship placement",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้การันตีการได้งานทันที"
          },
          {
            "key": "D",
            "text": "The free lunch provided during drop-in clinics",
            "isCorrect": false,
            "feedbackTh": "ไม่มีบริการอาหารกลางวัน"
          }
        ],
        "explanationTh": "คัลลัมกล่าวว่าโค้ชใช้เวลา 45 นาทีตรวจ CV ทีละบรรทัด และช่วยจัดโครงสร้างโปรเจกต์ Python ให้โดดเด่น",
        "explanationEn": "Callum highlights the detailed 45-minute CV review that helped him showcase his Python project.",
        "weaknessTag": "evaluating_personal_evaluations_and_feelings",
        "difficultyWeight": 3
      },
      {
        "id": "listen-q-b1-car-2",
        "skill": "listening",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "หากฟิโอน่าต้องการเข้าร่วมการจำลองสัมภาษณ์งาน (Mock interview) เธอต้องทำอย่างไร?",
        "promptEn": "What must Fiona do if she wants a mock interview session?",
        "options": [
          {
            "key": "A",
            "text": "Walk in without booking on any Wednesday afternoon",
            "isCorrect": false,
            "feedbackTh": "Walk-in ทำได้เฉพาะ drop-in clinic วันอังคารและพฤหัสบดี"
          },
          {
            "key": "B",
            "text": "Sign up online at least one week in advance",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! คัลลัมระบุ 'register online at least one week ahead'"
          },
          {
            "key": "C",
            "text": "Pay a twenty-pound administrative registration fee",
            "isCorrect": false,
            "feedbackTh": "ไม่มีค่าธรรมเนียม"
          },
          {
            "key": "D",
            "text": "Bring a recommendation letter from her department head",
            "isCorrect": false,
            "feedbackTh": "ไม่ต้องมีจดหมายแนะนำ"
          }
        ],
        "explanationTh": "คัลลัมระบุชัดเจน: 'if you want a mock interview session... you do need to register online at least one week ahead'",
        "explanationEn": "Callum states mock interviews require online registration at least one week ahead.",
        "weaknessTag": "distinguishing_scheduling_procedures",
        "difficultyWeight": 3
      }
    ]
  },
  {
    "id": "listen-b1-website",
    "title": "Reviewing an Online Science Magazine",
    "cefrLevel": "B1",
    "targetExam": "PET",
    "speakerAccents": "Canadian & British English (Colleagues)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Liam: Have you read that in-depth feature about battery chemistry on the new TechScience journal website?\n\nEmma: I tried to yesterday, Liam, but frankly, I found their website interface rather frustrating.\n\nLiam: Really? Why is that? I thought the typography and infographics were quite sharp.\n\nEmma: The visual layout is pleasant enough, but every time you scroll down two paragraphs, an animated banner pops up asking you to subscribe to their newsletter. Furthermore, the search bar is tucked away in a tiny icon at the bottom of the page rather than at the top navigation bar. It is counterintuitive.\n\nLiam: Fair enough. Although, to their credit, their articles are completely free of paywalls, unlike most academic portals. They rely entirely on reader donations and sponsorship.",
    "questions": [
      {
        "id": "listen-q-b1-web-1",
        "skill": "listening",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "สิ่งใดที่เอ็มม่ารู้สึกไม่พอใจเกี่ยวกับเว็บไซต์ของวารสารวิทยาศาสตร์?",
        "promptEn": "What does Emma find frustrating about the journal website?",
        "options": [
          {
            "key": "A",
            "text": "The articles are locked behind an expensive mandatory subscription.",
            "isCorrect": false,
            "feedbackTh": "เลียมระบุว่าบทความอ่านฟรี ไม่มี paywall"
          },
          {
            "key": "B",
            "text": "Intrusive newsletter pop-ups and poor placement of the search function.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! มีป๊อปอัปสมัครจดหมายข่าวคอยกวนใจ และช่องค้นหาถูกซ่อนไว้ด้านล่างอย่างไม่คุ้นเคย"
          },
          {
            "key": "C",
            "text": "The font choices make the text completely unreadable on mobile screens.",
            "isCorrect": false,
            "feedbackTh": "เธอยอมรับว่า layout และภาพประกอบดูดี"
          },
          {
            "key": "D",
            "text": "The website takes over two minutes to load each page.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงความเร็วในการโหลด"
          }
        ],
        "explanationTh": "เอ็มม่าระบุว่ามีแบนเนอร์ป๊อปอัปสมัครสมาชิกเด้งขึ้นมาตลอด และแถบค้นหากลับไปอยู่ด้านล่างแทนที่จะอยู่ด้านบน",
        "explanationEn": "Emma complains about recurring subscription pop-ups and the non-intuitive placement of the search bar.",
        "weaknessTag": "identifying_specific_user_complaints",
        "difficultyWeight": 3
      },
      {
        "id": "listen-q-b1-web-2",
        "skill": "listening",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "เลียมชี้ให้เห็นจุดเด่นข้อใดของเว็บไซต์นี้เพื่อปกป้องเว็บไซต์?",
        "promptEn": "What redeeming quality does Liam highlight about the publication?",
        "options": [
          {
            "key": "A",
            "text": "It is funded by university scholarships.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงทุนการศึกษา"
          },
          {
            "key": "B",
            "text": "It publishes articles in over twenty languages.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้พูดถึงภาษาอื่นๆ"
          },
          {
            "key": "C",
            "text": "The content is freely accessible without a paywall.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! เลียมกล่าวว่า 'their articles are completely free of paywalls'"
          },
          {
            "key": "D",
            "text": "It has no advertisements whatsoever.",
            "isCorrect": false,
            "feedbackTh": "เว็บไซต์อาศัยสปอนเซอร์และเงินบริจาค"
          }
        ],
        "explanationTh": "เลียมให้เหตุผลเชิงบวกว่า: 'their articles are completely free of paywalls, unlike most academic portals' (บทความเข้าถึงได้ฟรีโดยไม่มีการปิดกั้นด้วยระบบจ่ายเงิน)",
        "explanationEn": "Liam notes that, unlike most academic sites, their content is completely free of paywalls.",
        "weaknessTag": "comprehending_counterarguments_in_dialogue",
        "difficultyWeight": 3
      }
    ]
  },
  {
    "id": "listen-b2-lecture",
    "title": "University Lecture: The Evolutionary Psychology of Cooperation",
    "cefrLevel": "B2",
    "targetExam": "FCE",
    "speakerAccents": "Academic English (Male Lecturer)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Good morning, everyone. In evolutionary biology, classical Darwinian competition suggests that selfish organisms prioritize individual survival and reproductive genetic propagation above all else.\nYet when we observe human civilizations across ten thousand years of history, cooperative mutualism emerges as our defining evolutionary superpower.\n\nHow did natural selection cultivate altruism when selfish freeloaders could theoretically exploit generosity without reciprocating?\nThe mathematical resolution lies in what evolutionary biologists term 'Indirect Reciprocity'. In human tribes, an individual's reputation acts as a universal social currency.\nWhen you assist a fellow member without expecting an immediate payoff, other observers witness your civic generosity.\nThey subsequently reward you with heightened social trust, alliance opportunities, and communal protection during times of scarcity.\nIn essence, human morality evolved as an ingenious reputation-management mechanism that made long-term cooperation far more biologically advantageous than transient deceit.",
    "questions": [
      {
        "id": "listen-q-b2-1",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "กลไกใดที่ช่วยให้การช่วยเหลือผู้อื่น (Altruism) มีความได้เปรียบทางวิวัฒนาการตามการบรรยาย?",
        "promptEn": "According to the lecturer, how did indirect reciprocity make cooperation biologically advantageous?",
        "options": [
          {
            "key": "A",
            "text": "By genetically eliminating selfish individuals from early tribal populations.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กำจัดทางพันธุกรรมโดยตรง"
          },
          {
            "key": "B",
            "text": "By allowing generosity to build public reputation and social trust that yields future communal support.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! การช่วยเหลือสร้างชื่อเสียง (Reputation) และความไว้ใจ ทำให้ได้รับการช่วยเหลือกลับคืนในยามขาดแคลน"
          },
          {
            "key": "C",
            "text": "By requiring monetary deposits before tribe members engaged in trade.",
            "isCorrect": false,
            "feedbackTh": "ยุคดึกดำบรรพ์ยังไม่มีระบบเงินตรา"
          },
          {
            "key": "D",
            "text": "By forcing all individuals to live in isolated family clusters.",
            "isCorrect": false,
            "feedbackTh": "ขัดแย้งกับการอยู่ร่วมกันเป็นเผ่า"
          }
        ],
        "explanationTh": "ผู้บรรยายอธิบายว่า 'Indirect Reciprocity' ทำให้การช่วยเหลือผู้อื่นสร้างชื่อเสียง (social currency) ซึ่งทำให้ผู้สังเกตการณ์มอบความไว้วางใจและการปกป้องช่วยเหลือในอนาคต.",
        "explanationEn": "Indirect reciprocity enables cooperative acts to build social reputation, conferring survival advantages during scarcity.",
        "weaknessTag": "comprehending_complex_theoretical_arguments",
        "difficultyWeight": 4
      }
    ]
  },
  {
    "id": "listen-b2-conservation",
    "title": "Radio Documentary: Non-Invasive Museum Conservation",
    "cefrLevel": "B2",
    "targetExam": "FCE",
    "speakerAccents": "British & Italian English (Presenter & Conservator)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Presenter: For centuries, historical art restorers had no choice but to physically scrape away aged varnish or extract minute core samples to diagnose pigment composition. Today, in the basement laboratories of the National Gallery, a silent revolution is underway with Dr. Matteo Rossi.\n\nDr. Rossi: When dealing with a five-hundred-year-old Renaissance canvas, every physical intervention carries irreversible risk. That is why our conservation institute has transitioned entirely toward non-invasive hyperspectral imaging and macro X-ray fluorescence.\n\nPresenter: Could you explain how macro X-ray fluorescence works in practice?\n\nDr. Rossi: Instead of removing a physical particle of paint, we illuminate the artwork with low-energy X-ray beams. Each chemical element in the historic pigment—such as copper in azurite blue or mercury in vermilion red—re-emits a characteristic secondary photon signature. In a matter of hours, our computer maps the exact elemental distribution across underlying sketches and pentimenti without ever touching the painting's surface. It allows us to distinguish genuine Renaissance brushwork from nineteenth-century deceptive overpaints.",
    "questions": [
      {
        "id": "listen-q-b2-con-1",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "ข้อได้เปรียบหลักของเทคนิค macro X-ray fluorescence เมื่อเทียบกับวิธีบูรณะแบบดั้งเดิมคืออะไร?",
        "promptEn": "What is the primary advantage of macro X-ray fluorescence over traditional restoration methods?",
        "options": [
          {
            "key": "A",
            "text": "It completely eliminates the need to maintain climate-controlled museum storage.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เกี่ยวกับระบบควบคุมอุณหภูมิในคลัง"
          },
          {
            "key": "B",
            "text": "It reveals chemical pigments and hidden sketches without physically sampling or damaging the canvas.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! วิเคราะห์ธาตุและภาพร่างที่ซ่อนอยู่ได้โดยไม่ต้องขูดหรือทำลายผิวภาพวาด"
          },
          {
            "key": "C",
            "text": "It instantly restores faded varnish to its original sixteenth-century luster.",
            "isCorrect": false,
            "feedbackTh": "เป็นเทคนิคการวิเคราะห์ ไม่ใช่การฟอกสีวานิช"
          },
          {
            "key": "D",
            "text": "It reduces the electricity consumption of laboratory equipment by ninety percent.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เน้นเรื่องการประหยัดไฟ"
          }
        ],
        "explanationTh": "ดร. รอสซี่เน้นย้ำว่าเป็นวิธี 'non-invasive' (ไม่รุกล้ำ) ที่ระบุธาตุในเม็ดสีและภาพร่างข้างใต้ได้โดยไม่ต้องสัมผัสหรือเจาะผิวภาพวาด",
        "explanationEn": "Dr. Rossi highlights that the technique maps chemical elements and hidden sketches non-invasively without physical contact.",
        "weaknessTag": "understanding_scientific_methodology_in_humanities",
        "difficultyWeight": 4
      },
      {
        "id": "listen-q-b2-con-2",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "เทคโนโลยีนี้ช่วยให้นักอนุรักษ์งานศิลปะจำแนกสิ่งใดออกจากกันได้?",
        "promptEn": "What does this technology help conservators distinguish?",
        "options": [
          {
            "key": "A",
            "text": "Genuine Renaissance brushstrokes from later nineteenth-century repainting",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ข้อความระบุ 'distinguish genuine Renaissance brushwork from nineteenth-century deceptive overpaints'"
          },
          {
            "key": "B",
            "text": "Whether the wooden frame was carved in Florence or Venice",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้วิเคราะห์กรอบไม้"
          },
          {
            "key": "C",
            "text": "The current market price of the painting at international auctions",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้ประเมินราคาซื้อขาย"
          },
          {
            "key": "D",
            "text": "How many museum visitors view the masterpiece each year",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้นับจำนวนผู้เข้าชม"
          }
        ],
        "explanationTh": "ดร. รอสซี่กล่าวสรุปว่าเทคโนโลยีนี้ช่วย: 'distinguish genuine Renaissance brushwork from nineteenth-century deceptive overpaints' (แยกฝีแปรงยุคเรเนซองส์ของแท้ออกจากรอยวาดทับในศตวรรษที่ 19)",
        "explanationEn": "The conservator explains it distinguishes original Renaissance brushwork from later overpainting.",
        "weaknessTag": "identifying_evaluative_outcomes",
        "difficultyWeight": 4
      }
    ]
  },
  {
    "id": "listen-c1-linguistics",
    "title": "Postgraduate Seminar: Cognitive Semantics and Conceptual Metaphors",
    "cefrLevel": "C1",
    "targetExam": "CAE",
    "speakerAccents": "Academic English (Professor Elizabeth Vance)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Good afternoon, colleagues. For generations, literary theory treated metaphor as an ornamental rhetorical device—a decorative flourish employed by poets to elevate prose above mundane communication.\nHowever, following Lakoff and Johnson's foundational 1980 treatise, cognitive semantics proved that our conceptual system is fundamentally metaphoric in its architecture.\n\nConsider how modern societies conceptualize the abstract construct of 'Time'. In industrial and digital economies, time is unconsciously mapped onto the conceptual domain of 'Commodity' or 'Money'.\nNotice the omnipresent linguistic evidence: we 'spend' time, 'waste' time, 'budget' an afternoon, 'borrow' a few minutes, or 'invest' hours in acquiring a language.\nThis is not mere figurative wordplay; it dictates cognitive behavior and institutional structures.\nWhen time is framed as a scarce monetary asset, human beings experience acute physiological anxiety whenever minutes elapse without tangible productive output.\nBy contrast, indigenous cultures whose temporal metaphors are structured around cyclical ecological flows—such as river tides or monsoon seasons—exhibit radically different social attitudes toward waiting, punctuality, and existential hurry.\nIn short, the metaphors embedded in our grammatical subconscious do not merely describe reality; they actively construct the phenomenological world we inhabit.",
    "questions": [
      {
        "id": "listen-q-c1-ling-1",
        "skill": "listening",
        "cefrLevel": "C1",
        "type": "multiple_choice",
        "promptTh": "มุมมองทางภาษาศาสตร์พุทธิปัญญา (Cognitive Semantics) แตกต่างจากทฤษฎีวรรณกรรมดั้งเดิมเกี่ยวกับ 'อุปลักษณ์' (Metaphor) อย่างไร?",
        "promptEn": "How does cognitive semantics differ from traditional literary theory regarding metaphors?",
        "options": [
          {
            "key": "A",
            "text": "It regards metaphors solely as stylistic embellishments reserved for formal poetry.",
            "isCorrect": false,
            "feedbackTh": "นี่คือมุมมองดั้งเดิม ไม่ใช่พุทธิปัญญา"
          },
          {
            "key": "B",
            "text": "It proves that metaphors constitute the core architecture of human conceptual thought and daily behavior.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ชี้ว่าอุปลักษณ์คือโครงสร้างพื้นฐานของระบบความคิด ไม่ใช่แค่คำสละสลวย"
          },
          {
            "key": "C",
            "text": "It claims that metaphors should be removed from scientific textbooks to ensure objectivity.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เสนอให้ตัดอุปลักษณ์ออก"
          },
          {
            "key": "D",
            "text": "It demonstrates that metaphors are biologically inherited rather than culturally transmitted.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวว่าสืบทอดทางพันธุกรรม"
          }
        ],
        "explanationTh": "ศาสตราจารย์แวนซ์อธิบายว่า: 'our conceptual system is fundamentally metaphoric in its architecture' ซึ่งตรงข้ามกับมุมมองดั้งเดิมที่มองเป็นเพียง 'ornamental rhetorical device'",
        "explanationEn": "Professor Vance explains that conceptual systems are fundamentally metaphoric, contrasting with the view of metaphor as mere poetic ornament.",
        "weaknessTag": "analyzing_epistemological_contrasts_in_lectures",
        "difficultyWeight": 5
      },
      {
        "id": "listen-q-c1-ling-2",
        "skill": "listening",
        "cefrLevel": "C1",
        "type": "multiple_choice",
        "promptTh": "ตัวอย่างอุปลักษณ์ 'Time is Money' ที่ผู้บรรยายยกขึ้นมา ส่งผลกระทบต่อจิตวิทยาของมนุษย์ในสังคมอุตสาหกรรมอย่างไร?",
        "promptEn": "According to the lecturer, how does the 'Time is Money' metaphor psychologically affect modern individuals?",
        "options": [
          {
            "key": "A",
            "text": "It induces acute anxiety whenever time passes without measurable productive output.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ทำให้เกิดความวิตกกังวลเมื่อเวลาผ่านไปโดยไม่ได้ผลิตผลลัพธ์ที่เป็นรูปธรรม"
          },
          {
            "key": "B",
            "text": "It inspires workers to negotiate higher hourly wages in financial corporations.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เน้นเรื่องการต่อรองเงินเดือน"
          },
          {
            "key": "C",
            "text": "It encourages people to abandon digital devices and adopt cyclical agricultural lifestyles.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงการละทิ้งอุปกรณ์ดิจิทัล"
          },
          {
            "key": "D",
            "text": "It completely eradicates the concept of punctuality across international teams.",
            "isCorrect": false,
            "feedbackTh": "ในทางกลับกัน ทำให้เคร่งครัดเรื่องเวลามากขึ้น"
          }
        ],
        "explanationTh": "ผู้บรรยายระบุว่า: 'When time is framed as a scarce monetary asset, human beings experience acute physiological anxiety whenever minutes elapse without tangible productive output.'",
        "explanationEn": "Framing time as a financial commodity induces anxiety when minutes pass without tangible productivity.",
        "weaknessTag": "inferring_psychological_consequences_from_discourse",
        "difficultyWeight": 5
      }
    ]
  },
  {
    "id": "listen-b1-relocation",
    "title": "Corporate Office Relocation & Logistics Planning",
    "cefrLevel": "B1",
    "targetExam": "PET",
    "speakerAccents": "American English (Office Manager & Logistics Coordinator)",
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Coordinator: Good morning, Steve. Have we finalized the moving schedule for the technical support department?\n\nSteve: Yes, Margaret. The professional moving crew arrives at five o'clock on Friday afternoon once all staff have finished work. We have packed the workstations, server towers, and documentation in color-coded crates.\n\nCoordinator: Excellent. What about the conference room furniture and executive desks?\n\nSteve: Those will be transported in the second delivery truck on Saturday morning. By Sunday midday, the IT network technicians will have all desktop terminals connected and tested.\n\nCoordinator: Wonderful. So our employees can resume normal operations on Monday morning without any client disruptions!",
    "questions": [
      {
        "id": "listen-q-b1-relo-1",
        "skill": "listening",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "ทีมงานขนย้ายมืออาชีพจะมาถึงสำนักงานในวันและเวลาใด?",
        "promptEn": "When will the professional moving crew arrive at the office?",
        "options": [
          {
            "key": "A",
            "text": "At Friday midday during the lunch break",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้มาตอนเที่ยง"
          },
          {
            "key": "B",
            "text": "At five o'clock on Friday afternoon after work",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! สตีฟแจ้งว่า: 'The professional moving crew arrives at five o'clock on Friday afternoon'"
          },
          {
            "key": "C",
            "text": "Early on Saturday morning before sunrise",
            "isCorrect": false,
            "feedbackTh": "วันเสาร์เป็นรอบรถบรรทุกคันที่สอง"
          },
          {
            "key": "D",
            "text": "On Sunday night before Monday opening",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่คืนวันอาทิตย์"
          }
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
          {
            "key": "A",
            "text": "To allow employees to work from home all week",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้จะให้ทำงานที่บ้าน"
          },
          {
            "key": "B",
            "text": "To enable normal operations on Monday without customer disruptions",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! เพื่อให้เปิดทำการวันจันทร์ได้ตามปกติโดยไม่กระทบลูกค้า"
          },
          {
            "key": "C",
            "text": "To sell redundant office computers to local charities",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้กล่าวถึงการบริจาค"
          },
          {
            "key": "D",
            "text": "To interview prospective junior candidates",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้สัมภาษณ์งาน"
          }
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
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Airport Announcer: May I have your urgent attention, passengers holding boarding passes for Skyways flight 402 departing for Singapore Changi. \n\nDue to scheduled apron maintenance on concourse B, the departure gate for flight 402 has been relocated from gate B12 to gate E7. Boarding will commence promptly at 14:40, thirty minutes prior to scheduled departure.\n\nPassengers traveling with oversized carry-on bags exceeding the standard cabin dimensions of 55 by 40 centimeters must check their luggage at gate E7 prior to boarding. Complimentary baggage tags will be issued at the podium. We apologize for any inconvenience caused by this gate alteration and appreciate your patience.",
    "questions": [
      {
        "id": "listen-q-b2-air-1",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "เหตุผลสำคัญที่มีการย้ายประตูขึ้นเครื่องบินคืออะไร?",
        "promptEn": "What is the primary reason provided for relocating the departure gate?",
        "options": [
          {
            "key": "A",
            "text": "Severe electrical thunderstorms over the runway",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เกิดจากพายุ"
          },
          {
            "key": "B",
            "text": "Scheduled apron maintenance taking place on concourse B",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ประกาศระบุ: 'Due to scheduled apron maintenance on concourse B'"
          },
          {
            "key": "C",
            "text": "An unexpected mechanical issue with the aircraft engine",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้มีปัญหาเครื่องยนต์"
          },
          {
            "key": "D",
            "text": "A labor dispute involving baggage handlers",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เกี่ยวกับข้อพิพาทแรงงาน"
          }
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
          {
            "key": "A",
            "text": "They must abandon their bags at the security screening checkpoint.",
            "isCorrect": false,
            "feedbackTh": "ไม่ต้องทิ้งกระเป๋า"
          },
          {
            "key": "B",
            "text": "They must check their bags at gate E7 before boarding begins.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ต้องโหลดกระเป๋าที่เกต E7 ก่อนขึ้นเครื่อง"
          },
          {
            "key": "C",
            "text": "They must purchase an additional passenger seat on the flight.",
            "isCorrect": false,
            "feedbackTh": "ไม่ต้องซื้อที่นั่งเพิ่ม"
          },
          {
            "key": "D",
            "text": "They are prohibited from boarding the flight entirely.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้ห้ามขึ้นเครื่อง"
          }
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
    "audioSpeedOptions": [
      0.75,
      1.0,
      1.25
    ],
    "audioScript": "Interviewer: Welcome back to Arts Insight. I'm delighted to speak today with veteran stage performer Alan Croft. Alan, having spent over four decades in classical theatre, how did your journey in the performing arts originally begin?\n\nAlan: Well, Rachel, believe it or not, I first stepped onto a theatrical stage when I was barely six years old. My older sister was rehearsing a local production of A Midsummer Night's Dream, and their child actor suddenly contracted measles. The director panicked, noticed me sitting quietly in the third row, and handed me a small wooden prop. \n\nInterviewer: Incredible! And was it an instantaneous passion?\n\nAlan: Completely intoxicating! While my school peers spent weekends playing football or building model airplanes, I was completely captivated by stage presence, vocal projection, and text interpretation. Theatre taught me that acting is not about pretending to be someone else; it is about discovering genuine human vulnerability under extraordinary imagined circumstances.",
    "questions": [
      {
        "id": "listen-q-b2-career-1",
        "skill": "listening",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "แอลันได้มีโอกาสขึ้นแสดงละครเวทีครั้งแรกเมื่ออายุ 6 ขวบได้อย่างไร?",
        "promptEn": "How did Alan secure his very first acting role at age six?",
        "options": [
          {
            "key": "A",
            "text": "He won a nationwide competitive audition for television.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้ชนะการออดิชั่นระดับชาติ"
          },
          {
            "key": "B",
            "text": "He replaced a sick child actor at his sister's rehearsal at the last minute.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! เขาได้รับเลือกให้แสดงแทนนักแสดงเด็กที่ป่วยเป็นโรคหัดอย่างกะทันหัน"
          },
          {
            "key": "C",
            "text": "His parents forced him to study classical opera singing.",
            "isCorrect": false,
            "feedbackTh": "พ่อแม่ไม่ได้บังคับ"
          },
          {
            "key": "D",
            "text": "He wrote and staged his own kindergarten puppet play.",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ละครหุ่น"
          }
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
          {
            "key": "A",
            "text": "Earning prestigious commercial accolades and fame.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เน้นเรื่องชื่อเสียงและรางวัล"
          },
          {
            "key": "B",
            "text": "Uncovering genuine human vulnerability under imagined circumstances.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ค้นพบความเปราะบางของมนุษย์อย่างแท้จริงภายใต้สถานการณ์ที่สมมติขึ้น"
          },
          {
            "key": "C",
            "text": "Mastering flawless mimicry of foreign regional accents.",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่การเลียนแบบสำเนียง"
          },
          {
            "key": "D",
            "text": "Memorizing hundreds of historical script pages quickly.",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่แค่การท่องจำบท"
          }
        ],
        "explanationTh": "แอลันระบุ: 'acting is not about pretending to be someone else; it is about discovering genuine human vulnerability under extraordinary imagined circumstances.'",
        "explanationEn": "Alan defines acting as uncovering genuine human vulnerability under imagined conditions.",
        "weaknessTag": "identifying_philosophical_perspective_in_interviews",
        "difficultyWeight": 4
      }
    ]
  },
];
