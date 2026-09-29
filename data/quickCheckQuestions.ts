import { CEFRLevel, SkillType } from '../types';

export interface QuickCheckOption {
  key: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface QuickCheckQuestion {
  id: string;
  contextType: 'chat' | 'cafe' | 'email' | 'travel' | 'work' | 'social' | 'conversation' | 'notice';
  contextLabel: string;
  speakerOrSource?: string;
  scenarioSnippet: string;
  prompt: string;
  options: QuickCheckOption[];
  explanation: string;
  cefrLevel: CEFRLevel;
  skill: SkillType;
  growthTag: string;
}

export interface PersonalEnglishSnapshot {
  overallLevel: CEFRLevel;
  estimatedCambridgeScore: number;
  isOfficialDisclaimer: string;
  scorePercentage: number;
  correctCount: number;
  totalCount: number;
  strongAreas: string[];
  growthArea: {
    skill: SkillType;
    label: string;
    opportunityNote: string;
  };
  nextUsefulStep: {
    title: string;
    estimatedMinutes: number;
    description: string;
  };
  lifeOutcomes: Array<{
    skill: string;
    realWorldValue: string;
  }>;
}

export const QUICK_CHECK_QUESTIONS: QuickCheckQuestion[] = [
  // 1. Casual Chat Context (A2)
  {
    id: 'qc-1',
    contextType: 'chat',
    contextLabel: 'LINE / WhatsApp Message',
    speakerOrSource: 'Friend (Alex)',
    scenarioSnippet: 'Hey! Are you still up for dinner tonight? A few of us are heading to the new noodle spot around 7.',
    prompt: 'What does "up for" mean in this message?',
    options: [
      {
        key: 'A',
        text: 'Interested and available to go',
        isCorrect: true,
        feedback: 'Correct! "To be up for something" is a very common everyday idiom meaning ready and willing to participate.',
      },
      {
        key: 'B',
        text: 'Standing up right now',
        isCorrect: false,
        feedback: 'Almost. While "up" can mean standing, "up for" is a phrase meaning you want to join an activity.',
      },
      {
        key: 'C',
        text: 'Cooking food at home',
        isCorrect: false,
        feedback: 'Almost. Alex is inviting you to go out together, not asking you to cook.',
      },
      {
        key: 'D',
        text: 'Too busy to meet today',
        isCorrect: false,
        feedback: 'Almost. "Up for" is an invitation to join, not an excuse.',
      },
    ],
    explanation: '"Up for [activity]" is an informal phrase used to ask if someone wants to join or participate in something.',
    cefrLevel: 'A2',
    skill: 'vocabulary',
    growthTag: 'everyday_idiomatic_phrases',
  },

  // 2. Cafe / Service Context (A1)
  {
    id: 'qc-2',
    contextType: 'cafe',
    contextLabel: 'Coffee Shop Counter',
    speakerOrSource: 'Barista',
    scenarioSnippet: 'Hi there! What can I get started for you? And would you like that for here or to go?',
    prompt: 'You want to drink your coffee while walking to class. What is the most natural reply?',
    options: [
      {
        key: 'A',
        text: 'To go, please.',
        isCorrect: true,
        feedback: 'Correct! "To go" (or "take away") means you want to take your order with you.',
      },
      {
        key: 'B',
        text: 'Yes, I like here.',
        isCorrect: false,
        feedback: 'Almost. "For here" means drinking inside the cafe. To take it with you, say "to go".',
      },
      {
        key: 'C',
        text: 'I am walking right now.',
        isCorrect: false,
        feedback: 'Almost. The barista needs to know packaging ("for here" vs "to go").',
      },
      {
        key: 'D',
        text: 'Give me coffee.',
        isCorrect: false,
        feedback: 'Almost. This sounds a bit abrupt. "To go, please" is standard and polite.',
      },
    ],
    explanation: '"For here" means dining inside the establishment; "to go" means takeaway packaging.',
    cefrLevel: 'A1',
    skill: 'speaking',
    growthTag: 'daily_service_interactions',
  },

  // 3. University / Collaboration Email (B1)
  {
    id: 'qc-3',
    contextType: 'email',
    contextLabel: 'Group Project Email',
    speakerOrSource: 'Project Partner (Pim)',
    scenarioSnippet: 'Hi team, I just uploaded the draft presentation. Could everyone please look over slides 4 to 8 before our meeting tomorrow?',
    prompt: 'What is Pim asking the team to do?',
    options: [
      {
        key: 'A',
        text: 'Quickly inspect and check the slides',
        isCorrect: true,
        feedback: 'Correct! "Look over" means to examine or review something quickly for feedback or errors.',
      },
      {
        key: 'B',
        text: 'Look above the presentation screen',
        isCorrect: false,
        feedback: 'Almost. "Look over" is a phrasal verb meaning to review or examine, not physical direction.',
      },
      {
        key: 'C',
        text: 'Present the slides instead of her',
        isCorrect: false,
        feedback: 'Almost. She wants team feedback before the meeting, not someone else to present.',
      },
      {
        key: 'D',
        text: 'Delete slides 4 to 8 completely',
        isCorrect: false,
        feedback: 'Almost. "Look over" means reviewing content, not removing it.',
      },
    ],
    explanation: 'The phrasal verb "look over" means to review or inspect documents or work briefly.',
    cefrLevel: 'B1',
    skill: 'reading',
    growthTag: 'academic_and_workplace_phrasal_verbs',
  },

  // 4. Airport / Travel Announcement (A2)
  {
    id: 'qc-4',
    contextType: 'travel',
    contextLabel: 'Airport Terminal Speaker',
    speakerOrSource: 'Gate Announcement',
    scenarioSnippet: 'Attention passengers on flight TG-678 to Tokyo: Due to maintenance, departure will be delayed by 45 minutes. Please remain in the gate area.',
    prompt: 'What should passengers on flight TG-678 do?',
    options: [
      {
        key: 'A',
        text: 'Stay near the gate and wait for the new departure time',
        isCorrect: true,
        feedback: 'Correct! The flight is delayed by 45 minutes, and passengers are asked to stay in the gate area.',
      },
      {
        key: 'B',
        text: 'Cancel their flight and book a new ticket',
        isCorrect: false,
        feedback: 'Almost. The announcement says the flight is delayed, not cancelled.',
      },
      {
        key: 'C',
        text: 'Board the plane immediately',
        isCorrect: false,
        feedback: 'Almost. Maintenance is ongoing, so boarding is delayed by 45 minutes.',
      },
      {
        key: 'D',
        text: 'Leave the airport and come back tomorrow',
        isCorrect: false,
        feedback: 'Almost. 45 minutes is a short delay; passengers are asked to remain in the area.',
      },
    ],
    explanation: '"Delayed" means postponed to a later time; "remain" means stay in the current location.',
    cefrLevel: 'A2',
    skill: 'listening',
    growthTag: 'travel_announcements_and_directions',
  },

  // 5. Internship / Workplace Slack (B1)
  {
    id: 'qc-5',
    contextType: 'work',
    contextLabel: 'Workplace Slack Channel',
    speakerOrSource: 'Senior Colleague (Karan)',
    scenarioSnippet: 'Good catch on the quarterly figures. Let\'s circle back on this after lunch once the finance team shares the updated sheet.',
    prompt: 'What does Karan mean by "circle back"?',
    options: [
      {
        key: 'A',
        text: 'Return to discuss this topic later',
        isCorrect: true,
        feedback: 'Correct! "Circle back" is common professional English meaning to revisit or resume discussion at a later time.',
      },
      {
        key: 'B',
        text: 'Walk in a circle around the office',
        isCorrect: false,
        feedback: 'Almost. In work conversations, "circle back" is a figurative idiom about scheduling.',
      },
      {
        key: 'C',
        text: 'Drop the discussion and ignore the figures',
        isCorrect: false,
        feedback: 'Almost. Karan praised the find ("Good catch") and wants to continue after lunch.',
      },
      {
        key: 'D',
        text: 'Redraw the financial charts into circles',
        isCorrect: false,
        feedback: 'Almost. "Circle back" refers to the conversation, not visual chart shapes.',
      },
    ],
    explanation: '"Circle back" is an idiomatic business phrase meaning to re-open or follow up on a subject later.',
    cefrLevel: 'B1',
    skill: 'vocabulary',
    growthTag: 'professional_communication_idioms',
  },

  // 6. Social Media Post (B1)
  {
    id: 'qc-6',
    contextType: 'social',
    contextLabel: 'Instagram Story Caption',
    speakerOrSource: 'Exchange Student (Maya)',
    scenarioSnippet: 'Final sunset in Chiang Mai. I have totally fallen in love with this place. Never want this week to end!',
    prompt: 'What is Maya expressing in her post?',
    options: [
      {
        key: 'A',
        text: 'She had an incredible experience and wishes her trip was longer',
        isCorrect: true,
        feedback: 'Correct! "Never want this week to end" shows she is thoroughly enjoying her trip.',
      },
      {
        key: 'B',
        text: 'She is exhausted and ready to leave immediately',
        isCorrect: false,
        feedback: 'Almost. "Fallen in love with this place" means she has deep positive feelings for it.',
      },
      {
        key: 'C',
        text: 'She got lost while watching the sunset',
        isCorrect: false,
        feedback: 'Almost. Her message is purely emotional appreciation for Chiang Mai.',
      },
      {
        key: 'D',
        text: 'She forgot which day of the week it is',
        isCorrect: false,
        feedback: 'Almost. The expression is figurative, expressing delight in the current moment.',
      },
    ],
    explanation: '"Never want [time] to end" is an emotional expression of high satisfaction with an ongoing event.',
    cefrLevel: 'B1',
    skill: 'reading',
    growthTag: 'informal_digital_expression',
  },

  // 7. Everyday Conversation Agreement (B2)
  {
    id: 'qc-7',
    contextType: 'conversation',
    contextLabel: 'Dinner Discussion',
    speakerOrSource: 'Classmate (David)',
    scenarioSnippet: '"That professor explained the research methods so clearly today. I couldn\'t agree more with what she said about ethical data collection."',
    prompt: 'What is David saying about the professor\'s viewpoint?',
    options: [
      {
        key: 'A',
        text: 'He agrees with her 100% and shares her view completely',
        isCorrect: true,
        feedback: 'Correct! "I couldn\'t agree more" is an emphatic idiom meaning complete and total agreement.',
      },
      {
        key: 'B',
        text: 'He disagrees and refuses to accept her argument',
        isCorrect: false,
        feedback: 'Almost. Because it contains "couldn\'t", learners sometimes mistake it for disagreement, but it means his agreement is already at the maximum.',
      },
      {
        key: 'C',
        text: 'He did not understand what she was explaining',
        isCorrect: false,
        feedback: 'Almost. He specifically noted she "explained ... so clearly".',
      },
      {
        key: 'D',
        text: 'He wants to argue with her in the next class',
        isCorrect: false,
        feedback: 'Almost. "Couldn\'t agree more" expresses strong harmony, not debate.',
      },
    ],
    explanation: '"I couldn\'t agree more" is an idiomatic way of expressing unanimous, unreserved agreement.',
    cefrLevel: 'B2',
    skill: 'grammar',
    growthTag: 'nuanced_conversational_agreement',
  },

  // 8. Public Transit / Campus Notice (A2)
  {
    id: 'qc-8',
    contextType: 'notice',
    contextLabel: 'Library Entrance Sign',
    speakerOrSource: 'Campus Facilities',
    scenarioSnippet: 'Automated Access Door: Please scan your student ID card and hold the door for the person following you.',
    prompt: 'What are students asked to do after scanning their card?',
    options: [
      {
        key: 'A',
        text: 'Keep the door open for the next student entering behind them',
        isCorrect: true,
        feedback: 'Correct! "Hold the door" is standard courtesy meaning keeping it open so it does not slam on the next person.',
      },
      {
        key: 'B',
        text: 'Lock the door immediately from the inside',
        isCorrect: false,
        feedback: 'Almost. "Hold the door" means keeping it propped open for the following person.',
      },
      {
        key: 'C',
        text: 'Ask the person behind them for their name',
        isCorrect: false,
        feedback: 'Almost. The action requested is a physical courtesy with the door.',
      },
      {
        key: 'D',
        text: 'Close the door as quickly as possible',
        isCorrect: false,
        feedback: 'Almost. The sign asks for the opposite: to hold it open for someone following.',
      },
    ],
    explanation: '"Hold the door for [someone]" means preventing it from closing so another person can comfortably enter.',
    cefrLevel: 'A2',
    skill: 'reading',
    growthTag: 'public_instructions_and_signs',
  },
];

export function evaluateQuickCheckAssessment(answers: Record<string, string>): PersonalEnglishSnapshot {
  const totalCount = QUICK_CHECK_QUESTIONS.length;
  let correctCount = 0;
  const skillScores: Record<string, { correct: number; total: number }> = {
    vocabulary: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
    speaking: { correct: 0, total: 0 },
  };

  QUICK_CHECK_QUESTIONS.forEach((q) => {
    const selected = answers[q.id];
    const isCorrect = q.options.find((o) => o.key === selected)?.isCorrect ?? false;
    if (isCorrect) correctCount += 1;

    if (!skillScores[q.skill]) {
      skillScores[q.skill] = { correct: 0, total: 0 };
    }
    skillScores[q.skill].total += 1;
    if (isCorrect) {
      skillScores[q.skill].correct += 1;
    }
  });

  const percentage = Math.round((correctCount / totalCount) * 100);

  // Calibrate Estimated CEFR Level without making official Cambridge claims
  let overallLevel: CEFRLevel = 'A1';
  let estimatedCambridgeScore = 110;

  if (correctCount <= 2) {
    overallLevel = 'A1';
    estimatedCambridgeScore = 105 + correctCount * 5;
  } else if (correctCount <= 4) {
    overallLevel = 'A2';
    estimatedCambridgeScore = 120 + (correctCount - 2) * 8;
  } else if (correctCount <= 6) {
    overallLevel = 'B1';
    estimatedCambridgeScore = 140 + (correctCount - 4) * 8;
  } else {
    overallLevel = 'B2';
    estimatedCambridgeScore = 160 + (correctCount - 6) * 10;
  }

  // Identify strengths & opportunity growth area
  const strongAreas: string[] = [];
  if (skillScores.reading.correct > 0) strongAreas.push('Reading real-world messages and signage');
  if (skillScores.vocabulary.correct > 0) strongAreas.push('Everyday phrases & contextual clues');
  if (skillScores.listening.correct > 0) strongAreas.push('Travel & spoken announcements');
  if (strongAreas.length === 0) strongAreas.push('Catching key keywords in direct questions');

  // Choose the single next growth opportunity
  let growthSkill: SkillType = 'grammar';
  let growthLabel = 'Everyday Grammar & Phrasal Patterns';
  let growthOpportunity = "You've already got the basics down. Fine-tuning common phrase patterns is where a little practice will make a huge difference in your confidence.";
  let nextStepTitle = 'Fix 1 common everyday conversation pattern';
  let nextStepDescription = 'Learn the difference between past simple and present perfect in casual messages.';

  if (skillScores.vocabulary.correct < skillScores.vocabulary.total) {
    growthSkill = 'vocabulary';
    growthLabel = 'Idiomatic Phrasal Expressions';
    growthOpportunity = 'You\'ve already got the basics down. Adding a few natural idioms like "up for" and "circle back" will make communicating feel effortless.';
    nextStepTitle = 'Learn 3 idioms used daily by native speakers';
    nextStepDescription = 'Unlock natural phrases for texting friends, ordering food, and chatting.';
  } else if (skillScores.reading.correct < skillScores.reading.total) {
    growthSkill = 'reading';
    growthLabel = 'Contextual Reading & Skimming';
    growthOpportunity = 'You have a good eye for keywords. A short exercise on implied tone will take your reading speed to the next tier.';
    nextStepTitle = 'Read a 2-minute real-world email snippet';
    nextStepDescription = 'Catch nuances in group projects and university notices with ease.';
  }

  return {
    overallLevel,
    estimatedCambridgeScore,
    isOfficialDisclaimer: 'Glova diagnostic estimate • Not an official Cambridge Assessment certificate',
    scorePercentage: percentage,
    correctCount,
    totalCount,
    strongAreas,
    growthArea: {
      skill: growthSkill,
      label: growthLabel,
      opportunityNote: growthOpportunity,
    },
    nextUsefulStep: {
      title: nextStepTitle,
      estimatedMinutes: 2,
      description: nextStepDescription,
    },
    lifeOutcomes: [
      {
        skill: 'Conversations & Chat',
        realWorldValue: 'Reply naturally without hesitation or second-guessing your words.',
      },
      {
        skill: 'Travel & Independence',
        realWorldValue: 'Navigate airport announcements, hotels, and cafes smoothly.',
      },
      {
        skill: 'University & Career',
        realWorldValue: 'Understand presentations, research material, and team emails clearly.',
      },
    ],
  };
}

// 2-Minute Quick Win Activity Content
export interface QuickWinStep {
  id: string;
  situation: string;
  question: string;
  options: { key: string; text: string; isCorrect: boolean; tip: string }[];
  takeaway: string;
}

export const QUICK_WIN_CHALLENGE: QuickWinStep = {
  id: 'qw-present-perfect',
  situation: 'You are texting a classmate who asks: "Are you hungry? Want to grab lunch?"',
  question: 'You just finished eating 10 minutes ago. Which answer is most natural?',
  options: [
    {
      key: 'A',
      text: 'Thanks, but I\'ve already eaten!',
      isCorrect: true,
      tip: 'Perfect! Use "I\'ve already eaten" (Present Perfect) because it affects right now (you are full).',
    },
    {
      key: 'B',
      text: 'Thanks, but I eat already yesterday.',
      isCorrect: false,
      tip: 'Almost! "Eat already yesterday" mixes present and past. Say "I\'ve already eaten".',
    },
    {
      key: 'C',
      text: 'I am eating right now yesterday.',
      isCorrect: false,
      tip: 'Almost! "Am eating" is happening at this second, which contradicts "yesterday".',
    },
  ],
  takeaway: 'Quick Rule: When an action happened recently and the result matters right now (you are full!), use "have + verb 3" (I\'ve already eaten).',
};
