/**
 * ==============================================================================
 * GLOVA CEFR Psychometric Mapping & Diagnostic Reporting Engine
 * ==============================================================================
 *
 * Maps continuous IRT latent trait theta values to standard CEFR levels (A1–C2),
 * 0–100 calibrated placement scores, skill-specific sub-scores, and pedagogical
 * diagnostic recommendations in Thai and English.
 * ==============================================================================
 */

import { CEFRLevel } from '../../types';
import { IRTState, IRTUserResponse } from './irt-engine';

export interface CEFRLevelDescriptor {
  level: CEFRLevel;
  titleEn: string;
  titleTh: string;
  summaryEn: string;
  summaryTh: string;
  canDoStatementsEn: string[];
  canDoStatementsTh: string[];
}

export interface SkillSubScore {
  level: CEFRLevel;
  score: number;
  theta: number;
  itemsAnswered: number;
  accuracyRate: number;
}

export interface ComprehensiveAssessmentReport {
  overallLevel: CEFRLevel;
  overallScore: number; // 0–100 calibrated scale
  overallTheta: number;
  standardError: number;
  itemsCompleted: number;
  accuracyRate: number;
  skillBreakdown: {
    vocabulary: SkillSubScore;
    grammar: SkillSubScore;
    reading: SkillSubScore;
  };
  descriptor: CEFRLevelDescriptor;
  weakAreas: string[];
  recommendations: Array<{
    skill: string;
    suggestionTh: string;
    suggestionEn: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Standard Oxford OOPT / Cambridge threshold mapping for IRT Theta.
 */
export function thetaToCEFR(theta: number): CEFRLevel {
  if (theta < -1.5) return 'A1';
  if (theta < -0.5) return 'A2';
  if (theta < 0.5) return 'B1';
  if (theta < 1.5) return 'B2';
  if (theta < 2.5) return 'C1';
  return 'C2';
}

/**
 * Maps latent theta to calibrated 0–100 score.
 * Formula: 50 + 16.67 * theta (clamped between 0 and 100).
 * - Theta -3.0 -> 0
 * - Theta 0.0  -> 50
 * - Theta +3.0 -> 100
 */
export function thetaToScore(theta: number): number {
  const raw = 50 + 16.67 * theta;
  const clamped = Math.max(0, Math.min(100, Math.round(raw)));
  return clamped;
}

export const CEFR_DESCRIPTORS: Record<CEFRLevel, CEFRLevelDescriptor> = {
  A1: {
    level: 'A1',
    titleEn: 'Breakthrough / Beginner',
    titleTh: 'ระดับเริ่มต้น (Beginner)',
    summaryEn: 'Can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of concrete needs.',
    summaryTh: 'สามารถเข้าใจและใช้สำนวนคุ้นเคยในชีวิตประจำวัน สื่อสารเรื่องง่ายๆ ใกล้ตัว และแนะนำตัวเองได้',
    canDoStatementsEn: [
      'Can introduce themselves and others and ask/answer questions about personal details.',
      'Can interact in a simple way provided the other person talks slowly and clearly.',
      'Can recognize basic isolated words and short instructions in print.',
    ],
    canDoStatementsTh: [
      'สามารถแนะนำตนเองและผู้อื่น ถามตอบข้อมูลส่วนตัวเบื้องต้นได้',
      'สามารถสื่อสารอย่างง่ายได้เมื่อคู่สนทนาพูดช้าและชัดเจน',
      'สามารถอ่านเข้าใจคำศัพท์พื้นฐานและป้ายประกาศสั้นๆ ในชีวิตประจำวันได้',
    ],
  },
  A2: {
    level: 'A2',
    titleEn: 'Waystage / Elementary',
    titleTh: 'ระดับต้น (Elementary)',
    summaryEn: 'Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. basic personal info, shopping, local geography, employment).',
    summaryTh: 'สามารถเข้าใจประโยคและสำนวนที่พบบ่อยเกี่ยวกับเรื่องใกล้ตัว เช่น ข้อมูลครอบครัว การซื้อของ การเดินทาง และการทำงาน',
    canDoStatementsEn: [
      'Can communicate in simple and routine tasks requiring a direct exchange of information.',
      'Can describe in simple terms aspects of their background, immediate environment, and immediate needs.',
      'Can understand short, simple texts on familiar matters containing everyday vocabulary.',
    ],
    canDoStatementsTh: [
      'สามารถสื่อสารในสถานการณ์ชีวิตประจำวันที่มีการแลกเปลี่ยนข้อมูลง่ายๆ ได้',
      'สามารถบรรยายภูมิหลัง สภาพแวดล้อมใกล้ตัว และความต้องการเร่งด่วนได้',
      'สามารถอ่านข้อความสั้นๆ เช่น โฆษณา เมนูอาหาร และตารางเวลาเข้าใจได้',
    ],
  },
  B1: {
    level: 'B1',
    titleEn: 'Threshold / Intermediate',
    titleTh: 'ระดับกลาง (Intermediate)',
    summaryEn: 'Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc.',
    summaryTh: 'สามารถเข้าใจประเด็นหลักของภาษามาตรฐานในเรื่องที่คุ้นเคย และจัดการสถานการณ์ส่วนใหญ่ระหว่างเดินทางได้',
    canDoStatementsEn: [
      'Can deal with most situations likely to arise whilst travelling in an area where the language is spoken.',
      'Can produce simple connected text on topics which are familiar or of personal interest.',
      'Can describe experiences, events, dreams, hopes, and ambitions and briefly give reasons for opinions.',
    ],
    canDoStatementsTh: [
      'สามารถรับมือกับสถานการณ์ส่วนใหญ่ขณะเดินทางในต่างประเทศได้',
      'สามารถเขียนข้อความเชื่อมโยงความต่อเนื่องในหัวข้อที่คุ้นเคยหรือสนใจได้',
      'สามารถบอกเล่าประสบการณ์ ความฝัน ความหวัง พร้อมให้เหตุผลหรือคำอธิบายสั้นๆ ได้',
    ],
  },
  B2: {
    level: 'B2',
    titleEn: 'Vantage / Upper Intermediate',
    titleTh: 'ระดับกลางสูง (Upper Intermediate)',
    summaryEn: 'Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field of specialization.',
    summaryTh: 'สามารถเข้าใจใจความสำคัญของข้อความซับซ้อนทั้งรูปธรรมและนามธรรม รวมถึงการอภิปรายเชิงวิชาชีพเฉพาะทาง',
    canDoStatementsEn: [
      'Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible.',
      'Can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue.',
      'Can scan quickly through long and complex texts, locating relevant details efficiently.',
    ],
    canDoStatementsTh: [
      'สามารถสื่อสารโต้ตอบกับเจ้าของภาษาได้อย่างคล่องแคล่วและเป็นธรรมชาติโดยไม่ติดขัด',
      'สามารถเขียนข้อความที่ชัดเจน มีรายละเอียดหลากหลาย และแสดงความคิดเห็นพร้อมข้อดีข้อเสียได้',
      'สามารถอ่านและจับใจความบทความยาวที่ซับซ้อนและดึงข้อมูลสำคัญได้อย่างมีประสิทธิภาพ',
    ],
  },
  C1: {
    level: 'C1',
    titleEn: 'Effective Operational Proficiency / Advanced',
    titleTh: 'ระดับสูง (Advanced)',
    summaryEn: 'Can understand a wide range of demanding, longer texts, and recognize implicit meaning. Can express ideas fluently and spontaneously without much obvious searching for expressions.',
    summaryTh: 'สามารถเข้าใจข้อความยาวและซับซ้อนได้หลากหลาย พร้อมทั้งจับนัยความหมายที่แฝงอยู่ได้ สื่อสารคล่องแคล่วเป็นธรรมชาติ',
    canDoStatementsEn: [
      'Can use language flexibly and effectively for social, academic, and professional purposes.',
      'Can produce clear, well-structured, detailed text on complex subjects, showing controlled use of organizational patterns.',
      'Can understand in detail a wide range of lengthy, complex texts encountered in social, professional or academic life.',
    ],
    canDoStatementsTh: [
      'สามารถใช้ภาษาได้อย่างยืดหยุ่นและมีประสิทธิผลทั้งในบริบททางสังคม วิชาการ และวิชาชีพ',
      'สามารถเขียนงานที่มีโครงสร้างชัดเจน สละสลวย ซับซ้อน และเชื่อมโยงความคิดได้อย่างเป็นระบบ',
      'สามารถเข้าใจนัยยะ น้ำเสียง และกลวิธีทางภาษาในวรรณกรรมหรือบทความวิชาการเชิงลึกได้',
    ],
  },
  C2: {
    level: 'C2',
    titleEn: 'Mastery / Proficiency',
    titleTh: 'ระดับเชี่ยวชาญสูงสุด (Mastery)',
    summaryEn: 'Can understand with ease virtually everything heard or read. Can summarize information from different spoken and written sources, reconstructing arguments in a coherent presentation.',
    summaryTh: 'สามารถเข้าใจภาษาทั้งการฟังและการอ่านได้อย่างง่ายดาย สรุปและสังเคราะห์ข้อมูลจากแหล่งต่างๆ ได้อย่างไร้รอยต่อ',
    canDoStatementsEn: [
      'Can express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning.',
      'Can read with ease virtually all forms of the written language, including abstract, structurally or linguistically complex texts.',
      'Can hold their own in any conversation or debate and has good command of idiomatic and colloquial expressions.',
    ],
    canDoStatementsTh: [
      'สามารถถ่ายทอดความคิดได้อย่างคล่องแคล่ว แม่นยำ และแยกแยะเฉดความหมายอันละเอียดอ่อนได้อย่างสมบูรณ์',
      'สามารถอ่านเข้าใจงานเขียนทุกรูปแบบได้อย่างทะลุปรุโปร่ง รวมถึงงานที่มีโครงสร้างภาษาซับซ้อนสูง',
      'สามารถอภิปรายโต้แย้งในประเด็นยากๆ ได้อย่างมีชั้นเชิงและเป็นธรรมชาติเสมือนเจ้าของภาษาที่มีการศึกษาสูง',
    ],
  },
};

/**
 * Calculates a complete diagnostic assessment report from an IRT state.
 */
export function calculateAssessmentReport(state: IRTState): ComprehensiveAssessmentReport {
  const overallLevel = thetaToCEFR(state.theta);
  const overallScore = thetaToScore(state.theta);
  const descriptor = CEFR_DESCRIPTORS[overallLevel];

  // Calculate skill sub-scores
  const skillResponses: Record<'vocabulary' | 'grammar' | 'reading', IRTUserResponse[]> = {
    vocabulary: [],
    grammar: [],
    reading: [],
  };

  for (const r of state.responses) {
    if (r.item.skill in skillResponses) {
      skillResponses[r.item.skill].push(r);
    }
  }

  const computeSubScore = (responses: IRTUserResponse[]): SkillSubScore => {
    if (responses.length === 0) {
      return {
        level: overallLevel,
        score: overallScore,
        theta: state.theta,
        itemsAnswered: 0,
        accuracyRate: 0,
      };
    }

    const correctCount = responses.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correctCount / responses.length) * 100);

    // Approximate skill theta based on average item difficulty and accuracy
    const avgDifficulty = responses.reduce((acc, r) => acc + r.item.b, 0) / responses.length;
    // Logit adjustment
    const ratio = Math.max(0.05, Math.min(0.95, correctCount / responses.length));
    const subTheta = Math.round((avgDifficulty + Math.log(ratio / (1 - ratio)) * 0.7) * 100) / 100;
    const subLevel = thetaToCEFR(subTheta);
    const subScore = thetaToScore(subTheta);

    return {
      level: subLevel,
      score: subScore,
      theta: subTheta,
      itemsAnswered: responses.length,
      accuracyRate: accuracy,
    };
  };

  const skillBreakdown = {
    vocabulary: computeSubScore(skillResponses.vocabulary),
    grammar: computeSubScore(skillResponses.grammar),
    reading: computeSubScore(skillResponses.reading),
  };

  const totalCorrect = state.responses.filter((r) => r.isCorrect).length;
  const overallAccuracy = state.itemsAnswered > 0 ? Math.round((totalCorrect / state.itemsAnswered) * 100) : 0;

  // Extract weak areas from incorrect items
  const weakAreas: string[] = [];
  const wrongResponses = state.responses.filter((r) => !r.isCorrect);
  for (const wr of wrongResponses) {
    if (wr.item.id && !weakAreas.includes(wr.item.id)) {
      weakAreas.push(wr.item.id);
    }
  }

  // Construct recommendations
  const recommendations: Array<{
    skill: string;
    suggestionTh: string;
    suggestionEn: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Grammar recommendation
  if (skillBreakdown.grammar.accuracyRate < 60) {
    recommendations.push({
      skill: 'Grammar',
      suggestionTh: 'ควรทบทวนโครงสร้างไวยากรณ์พื้นฐาน โดยเฉพาะการผันกริยาตาม Tense และประโยคเงื่อนไข (Conditionals)',
      suggestionEn: 'Focus on reviewing core grammatical structures, specifically tense agreement and conditional clauses.',
      priority: 'high',
    });
  } else if (skillBreakdown.grammar.accuracyRate < 80) {
    recommendations.push({
      skill: 'Grammar',
      suggestionTh: 'ฝึกฝนโครงสร้างประโยคระดับสูง เช่น Inversion, Cleft Sentences และ Subjunctive Mood เพื่อยกระดับความแม่นยำ',
      suggestionEn: 'Practice advanced syntactic structures such as inversions, cleft sentences, and subjunctive forms.',
      priority: 'medium',
    });
  }

  // Vocabulary recommendation
  if (skillBreakdown.vocabulary.accuracyRate < 60) {
    recommendations.push({
      skill: 'Vocabulary',
      suggestionTh: 'ขยายคลังคำศัพท์พื้นฐาน A2–B1 และฝึกสังเกต Collocations หรือกลุ่มคำที่มักใช้ร่วมกันในประโยค',
      suggestionEn: 'Expand core A2-B1 vocabulary and pay close attention to collocations in context.',
      priority: 'high',
    });
  } else if (skillBreakdown.vocabulary.accuracyRate < 80) {
    recommendations.push({
      skill: 'Vocabulary',
      suggestionTh: 'ต่อยอดคำศัพท์ระดับวิชาการ B2–C1 และศึกษาความแตกต่างของคำพ้องความหมาย (Synonyms with nuances)',
      suggestionEn: 'Broaden your academic vocabulary (B2-C1) and study nuanced differences between synonyms.',
      priority: 'medium',
    });
  }

  // Reading recommendation
  if (skillBreakdown.reading.accuracyRate < 65) {
    recommendations.push({
      skill: 'Reading',
      suggestionTh: 'ฝึกอ่านบทความขนาดสั้นเป็นประจำและจับใจความสำคัญ (Skimming & Scanning) เพื่อค้นหาคำตอบอย่างแม่นยำ',
      suggestionEn: 'Practice skimming and scanning shorter articles to quickly pinpoint main ideas and specific details.',
      priority: 'high',
    });
  } else {
    recommendations.push({
      skill: 'Reading',
      suggestionTh: 'ท้าทายตนเองด้วยบทความวิชาการ บทวิจารณ์เชิงปรัชญา หรือบทความเชิงลึก เพื่อฝึกการอนุมานนัยยะแฝง (Inference)',
      suggestionEn: 'Challenge yourself with in-depth academic and analytical essays to hone advanced inference skills.',
      priority: 'low',
    });
  }

  return {
    overallLevel,
    overallScore,
    overallTheta: state.theta,
    standardError: state.se,
    itemsCompleted: state.itemsAnswered,
    accuracyRate: overallAccuracy,
    skillBreakdown,
    descriptor,
    weakAreas: weakAreas.slice(0, 10),
    recommendations,
  };
}
