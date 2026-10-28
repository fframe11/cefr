import {
  CambridgeRubricScores,
  CEFRBand,
  GrammarIssue,
  LexicalDistribution,
  WritingEvaluationData,
  WritingEvaluationRequest
} from './types';
import { profileLexicon } from './lexicon-profiler';
import { detectGrammarIssues } from './grammar-rules';

// Sophisticated B2/C1 Academic cohesive devices / discourse markers
const ADVANCED_COHESIVE_DEVICES = [
  'furthermore', 'moreover', 'in addition', 'additionally', 'consequently',
  'as a result', 'therefore', 'nevertheless', 'on the one hand',
  'on the other hand', 'in contrast', 'conversely', 'taking everything into account',
  'on balance', 'in recent years', 'it is undeniable that', 'thereby',
  'in conclusion', 'to summarize'
];

// Basic A1/B1 connectors
const BASIC_CONNECTORS = ['and', 'also', 'but', 'because', 'so', 'then'];

// Informal contractions to penalize in formal essays
const INFORMAL_PATTERNS = [
  /\bcan't\b/gi, /\bdon't\b/gi, /\bwon't\b/gi, /\bdidn't\b/gi,
  /\bisn't\b/gi, /\baren't\b/gi, /\bwasn't\b/gi, /\bweren't\b/gi,
  /\bgonna\b/gi, /\bwanna\b/gi, /\bkinda\b/gi, /\bya\b/gi, /\bcause\b/gi
];

export class EssayEvaluationError extends Error {
  constructor(message: string, public code: 'TOO_SHORT' | 'INVALID_INPUT') {
    super(message);
    this.name = 'EssayEvaluationError';
  }
}

export function evaluateEssay(req: WritingEvaluationRequest): WritingEvaluationData {
  const text = (req.submission_text || '').trim();
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // AC-1: Reject if fewer than 50 words
  if (wordCount < 50) {
    throw new EssayEvaluationError(
      'เนื้อหางานเขียนสั้นเกินไปสำหรับการประเมิน (ต้องการอย่างน้อย 50 คำ)',
      'TOO_SHORT'
    );
  }

  const minWords = req.min_words || 140;
  const maxWords = req.max_words || 190;

  // 1. Lexical Profiling (Oxford 3860 verified vocabulary)
  const lexicalDistribution: LexicalDistribution = profileLexicon(text);

  // 2. Grammar Error Detection (Offsets and corrections)
  const grammarIssues: GrammarIssue[] = detectGrammarIssues(text);

  // 3. Compute 4-Axis Cambridge Rubrics
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paragraphCount = paragraphs.length;

  const lowerText = text.toLowerCase();
  const advancedCohesiveFound = ADVANCED_COHESIVE_DEVICES.filter((cd) => lowerText.includes(cd));

  // --- Dimension A: Content (0 - 5.0) ---
  let contentScore = 3.5;
  if (wordCount >= minWords && wordCount <= maxWords) {
    contentScore = 4.8;
  } else if (wordCount >= minWords * 0.85 && wordCount <= maxWords * 1.15) {
    contentScore = 4.3;
  } else if (wordCount >= minWords * 0.6) {
    contentScore = 3.5;
  } else {
    contentScore = 2.6; // Heavy under-length penalty
  }

  // --- Dimension B: Communicative Achievement (0 - 5.0) ---
  // Evaluates appropriate register (formal vs informal) and reader engagement
  let commScore = 3.0;
  let informalCount = 0;
  for (const pat of INFORMAL_PATTERNS) {
    const matches = text.match(pat);
    if (matches) informalCount += matches.length;
  }

  if (informalCount === 0) {
    commScore += 0.5;
  } else if (informalCount > 3) {
    commScore -= 0.8;
  } else {
    commScore -= 0.3;
  }

  if (advancedCohesiveFound.length >= 3) {
    commScore += 0.8;
  } else if (advancedCohesiveFound.length >= 1) {
    commScore += 0.3;
  }

  // Complex syntactic constructs (relative clauses, subordination)
  const complexSubordination = (text.match(/\b(which|although|whereas|while|despite|in order to|thereby)\b/gi) || []).length;
  if (complexSubordination >= 3) {
    commScore += 0.5;
  }

  commScore = Math.max(1.0, Math.min(5.0, Number(commScore.toFixed(1))));

  // --- Dimension C: Organisation (0 - 5.0) ---
  let orgScore = 2.0;
  if (paragraphCount >= 4) {
    orgScore += 1.8; // Standard 4-paragraph Cambridge essay structure
  } else if (paragraphCount === 3) {
    orgScore += 1.4;
  } else if (paragraphCount === 2) {
    orgScore += 0.6;
  }

  if (advancedCohesiveFound.length >= 4) {
    orgScore += 1.2;
  } else if (advancedCohesiveFound.length >= 2) {
    orgScore += 0.7;
  } else if (advancedCohesiveFound.length === 1) {
    orgScore += 0.3;
  }

  orgScore = Math.max(1.0, Math.min(5.0, Number(orgScore.toFixed(1))));

  // --- Dimension D: Language (0 - 5.0) ---
  // Grounded in Lexical Sophistication (Oxford 3860) & Grammatical Control
  let langScore = 2.0;

  const b1Percent = lexicalDistribution.b1_b2_percent;
  const c1Percent = lexicalDistribution.c1_c2_percent;

  if (c1Percent >= 6) {
    langScore += 2.2; // C1/C2 mastery
  } else if (c1Percent >= 2) {
    langScore += 1.6;
  } else if (b1Percent >= 25) {
    langScore += 1.3; // Solid B2
  } else if (b1Percent >= 10) {
    langScore += 0.8; // B1/B2 threshold
  } else {
    langScore += 0.4; // Mostly A1/A2 basic lexis
  }

  // Sentence variety & complex structures
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 10;
  if (avgWordsPerSentence >= 16) {
    langScore += 0.5;
  } else if (avgWordsPerSentence < 10) {
    langScore -= 0.3; // Very short simple sentences
  }

  // Grammar issue penalty
  const errorDensity = (grammarIssues.length / wordCount) * 100;
  if (grammarIssues.length === 0) {
    langScore += 0.4;
  } else if (errorDensity > 3.0) {
    langScore -= 1.0;
  } else if (errorDensity > 1.5) {
    langScore -= 0.6;
  } else {
    langScore -= 0.3;
  }

  langScore = Math.max(1.0, Math.min(5.0, Number(langScore.toFixed(1))));

  const rubricScores: CambridgeRubricScores = {
    content: Number(contentScore.toFixed(1)),
    communicative_achievement: Number(commScore.toFixed(1)),
    organisation: Number(orgScore.toFixed(1)),
    language: Number(langScore.toFixed(1))
  };

  // 4. Calculate Overall Score (0 - 100)
  const averageRubric =
    (rubricScores.content +
      rubricScores.communicative_achievement +
      rubricScores.organisation +
      rubricScores.language) /
    4;
  const overallScore = Math.round(averageRubric * 20);

  // 5. Map to CEFR Band (Aligned with Cambridge English Scale)
  let cefrBand: CEFRBand = 'B1';
  if (overallScore >= 88) cefrBand = 'C2';
  else if (overallScore >= 76) cefrBand = 'C1';
  else if (overallScore >= 60) cefrBand = 'B2';
  else if (overallScore >= 45) cefrBand = 'B1';
  else if (overallScore >= 30) cefrBand = 'A2';
  else cefrBand = 'A1';

  // Lexical / Complexity Band Ceiling Gate
  // A text dominated by A1/A2 words with zero C1 words cannot jump to C1/C2
  if (c1Percent < 2 && b1Percent < 12) {
    if (cefrBand === 'C1' || cefrBand === 'C2' || cefrBand === 'B2') {
      cefrBand = 'B1';
    }
  } else if (c1Percent < 4 && (cefrBand === 'C1' || cefrBand === 'C2')) {
    cefrBand = 'B2';
  }

  // 6. Generate Pedagogical Strengths & Improvements in Thai
  const strengths_th: string[] = [];
  const improvements_th: string[] = [];

  // Content feedback
  if (wordCount >= minWords && wordCount <= maxWords) {
    strengths_th.push(`ควบคุมจำนวนคำได้ดีเยี่ยม (${wordCount} คำ) อยู่ในเกณฑ์ข้อสอบอย่างแม่นยำ`);
  } else if (wordCount < minWords) {
    improvements_th.push(`จำนวนคำยังต่ำกว่าเกณฑ์ (${wordCount}/${minWords} คำ) ควรขยายตัวอย่างและเหตุผลเพิ่มเติม`);
  }

  // Organisation feedback
  if (paragraphCount >= 4) {
    strengths_th.push(`มีการจัดโครงสร้างย่อหน้าชัดเจน (${paragraphCount} ย่อหน้า) แยกบทนำ เนื้อหา และบทสรุปเป็นสัดส่วน`);
  } else {
    improvements_th.push('ควรแบ่งเนื้อหาออกเป็นอย่างน้อย 3-4 ย่อหน้า (Introduction, Body Paragraphs, Conclusion) เพื่อความต่อเนื่อง');
  }

  // Cohesive devices feedback
  if (advancedCohesiveFound.length >= 3) {
    strengths_th.push(`ใช้คำเชื่อมประโยค (Cohesive Devices) ได้อย่างหลากหลาย เช่น ${advancedCohesiveFound.slice(0, 3).map((w) => `'${w}'`).join(', ')}`);
  } else {
    improvements_th.push("ควรเพิ่มคำเชื่อมระดับสูง เช่น 'Furthermore', 'Consequently', หรือ 'On the other hand' เพื่อให้เหตุผลลื่นไหล");
  }

  // Lexical feedback
  if (lexicalDistribution.c1_c2_percent > 3 || lexicalDistribution.b1_b2_percent > 20) {
    const samples = (lexicalDistribution.advanced_words_found || []).slice(0, 3);
    strengths_th.push(`มีคลังคำศัพท์ระดับวิชาการที่น่าประทับใจ เช่น ${samples.map((w) => `'${w}'`).join(', ')}`);
  } else {
    improvements_th.push('ควรยกระดับการใช้คำศัพท์พื้นฐาน (A1-A2) ให้เป็นคำศัพท์ระดับ B2/C1 เช่น ใช้ crucial แทน important หรือ substantial แทน big');
  }

  // Grammar feedback
  if (grammarIssues.length === 0) {
    strengths_th.push('ไม่พบข้อผิดพลาดทางไวยากรณ์ขั้นพื้นฐาน สะท้อนความแม่นยำทางภาษาที่ดีมาก');
  } else {
    improvements_th.push(`พบจุดที่ควรปรับปรุงด้านไวยากรณ์ ${grammarIssues.length} จุด (เช่น ${grammarIssues[0].rule_id}) กรุณาตรวจสอบคำแนะนำด้านล่าง`);
  }

  return {
    submission_id: `wrt_sub_${Math.random().toString(16).substring(2, 9)}`,
    word_count: wordCount,
    character_count: text.length,
    overall_score: overallScore,
    cefr_band: cefrBand,
    rubric_scores: rubricScores,
    lexical_distribution: lexicalDistribution,
    grammar_issues: grammarIssues,
    strengths_th,
    improvements_th,
    evaluated_at: new Date().toISOString()
  };
}
