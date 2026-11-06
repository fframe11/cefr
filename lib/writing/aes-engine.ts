/**
 * ==============================================================================
 * GLOVA Automated Essay Scoring (AES) Engine - CEFR 4-Axis Rubric Grader
 * ==============================================================================
 * Evaluates student writing across 4 dimensions:
 * 1. Task Achievement & Relevance (25%)
 * 2. Coherence & Cohesion (25%)
 * 3. Lexical Resource & Sophistication (25%)
 * 4. Grammatical Range & Accuracy (25%)
 *
 * Grounded in Cambridge English B2 First Rubrics and CEFR Can-Do Descriptors.
 * ==============================================================================
 */

import { CEFRLevel } from '@/types';
import {
  WritingEvaluationResult,
  TaskAchievementScore,
  CoherenceCohesionScore,
  LexicalResourceScore,
  GrammaticalRangeScore,
  GrammarIssue,
  SentenceAnalysisItem,
  ActionableSuggestion,
} from './types';
import {
  extractWords,
  extractSentences,
  profileVocabulary,
  detectDiscourseMarkers,
  isComplexSentence,
} from './vocabulary-profiler';

export interface EvaluationOptions {
  promptId?: string;
  targetCefr?: CEFRLevel;
  minWords?: number;
  maxWords?: number;
  topic?: string;
  taskType?: string;
  promptTitle?: string;
}

/**
 * Common Subject-Verb Agreement & Syntactic Heuristic Patterns
 */
const SVA_PATTERNS: Array<{ regex: RegExp; messageEn: string; messageTh: string; suggestion: string }> = [
  {
    regex: /\b(he|she|it|everyone|everybody|nobody|somebody|someone)\s+(do|have|go|make|see|take|know|think)\b/i,
    messageEn: 'Subject-verb agreement error: 3rd person singular pronoun requires singular verb (e.g., does, has, goes).',
    messageTh: 'ข้อผิดพลาด Subject-Verb Agreement: ประธานเอกพจน์บุรุษที่ 3 (he, she, it, everyone) ต้องใช้กริยาเอกพจน์ (เช่น does, has, goes)',
    suggestion: 'Use singular verb form with 3rd-person singular subjects.',
  },
  {
    regex: /\b(they|we|you)\s+(does|has|goes|makes|sees|takes)\b/i,
    messageEn: 'Subject-verb agreement error: Plural pronoun requires base/plural verb (e.g., do, have, go).',
    messageTh: 'ข้อผิดพลาด Subject-Verb Agreement: ประธานพหูพจน์ (they, we, you) ต้องใช้กริยารูปพหูพจน์ (เช่น do, have, go)',
    suggestion: 'Use plural verb form with plural subjects.',
  },
  {
    regex: /\b(a)\s+([aeiou]\w+)\b/i,
    messageEn: 'Article error: Use "an" before vowel sounds.',
    messageTh: 'ข้อผิดพลาดการใช้ Article: ควรใช้ "an" นำหน้าคำที่ออกเสียงสระ',
    suggestion: 'Change "a" to "an".',
  },
  {
    regex: /\b(an)\s+([bcdfghjklmnpqrstvwxyz]\w+)\b/i,
    messageEn: 'Article error: Use "a" before consonant sounds.',
    messageTh: 'ข้อผิดพลาดการใช้ Article: ควรใช้ "a" นำหน้าคำที่ออกเสียงพยัญชนะ',
    suggestion: 'Change "an" to "a".',
  },
];

/**
 * Score to CEFR Band mapper.
 */
export function scoreToCefrBand(score: number): CEFRLevel {
  if (score < 20) return 'A1';
  if (score < 40) return 'A2';
  if (score < 60) return 'B1';
  if (score < 80) return 'B2';
  if (score < 95) return 'C1';
  return 'C2';
}

/**
 * Evaluate writing submission.
 */
export function evaluateWritingSubmission(
  text: string,
  options: EvaluationOptions = {}
): WritingEvaluationResult {
  const minWords = options.minWords ?? 100;
  const maxWords = options.maxWords ?? 300;
  const targetCefr = options.targetCefr ?? 'B2';
  const promptId = options.promptId ?? 'custom-writing';

  const cleanText = text.trim();
  const words = extractWords(cleanText);
  const sentences = extractSentences(cleanText);
  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const paragraphCount = paragraphs.length || 1;

  // 1. Task Achievement & Relevance (25%)
  let lengthComplianceScore = 0;
  let complianceStatus: 'underlength' | 'optimal' | 'overlength' = 'optimal';

  if (wordCount < minWords) {
    complianceStatus = 'underlength';
    const ratio = wordCount / minWords;
    lengthComplianceScore = Math.max(10, Math.round(ratio * 75));
  } else if (wordCount > maxWords * 1.5) {
    complianceStatus = 'overlength';
    lengthComplianceScore = 80; // slight penalty for extreme verbosity
  } else {
    complianceStatus = 'optimal';
    lengthComplianceScore = 95;
  }

  // Topic relevance heuristic
  let topicRelevance = 85;
  if (options.topic) {
    const topicKeywords = options.topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const textLower = cleanText.toLowerCase();
    const matched = topicKeywords.filter((kw) => textLower.includes(kw));
    topicRelevance = topicKeywords.length > 0
      ? Math.min(100, 70 + Math.round((matched.length / topicKeywords.length) * 30))
      : 85;
  }

  const taskScoreVal = Math.round(lengthComplianceScore * 0.6 + topicRelevance * 0.4);
  const taskAchievement: TaskAchievementScore = {
    score: taskScoreVal,
    cefrBand: scoreToCefrBand(taskScoreVal),
    wordCount,
    targetMinWords: minWords,
    targetMaxWords: maxWords,
    wordCountCompliance: complianceStatus,
    topicRelevanceScore: topicRelevance,
    feedbackTh:
      complianceStatus === 'underlength'
        ? `ความยาว ${wordCount} คำ ยังไม่ถึงเกณฑ์ขั้นต่ำ ${minWords} คำ ควรขยายประเด็นและยกตัวอย่างเพิ่มเติม`
        : `ความยาว ${wordCount} คำ อยู่ในเกณฑ์ที่เหมาะสม และตรงตามเป้าหมายของโจทย์`,
    feedbackEn:
      complianceStatus === 'underlength'
        ? `Word count (${wordCount}) is below the required ${minWords} words. Elaborate with more concrete examples.`
        : `Word count (${wordCount}) meets task requirements with appropriate scope.`,
  };

  // 2. Coherence & Cohesion (25%)
  const discourseData = detectDiscourseMarkers(cleanText);
  const transitionDensity = Number(((discourseData.markerCount / (wordCount || 1)) * 100).toFixed(2));
  
  // Transition scoring
  let transitionScore = 40;
  if (transitionDensity >= 3.0) transitionScore = 95;
  else if (transitionDensity >= 2.0) transitionScore = 85;
  else if (transitionDensity >= 1.0) transitionScore = 70;
  else if (discourseData.markerCount > 0) transitionScore = 55;

  // Paragraph organization scoring
  let paragraphScore = 50;
  if (paragraphCount >= 3 && paragraphCount <= 6) paragraphScore = 95;
  else if (paragraphCount === 2) paragraphScore = 75;
  else paragraphScore = 60; // single blob

  const coherenceScoreVal = Math.round(transitionScore * 0.65 + paragraphScore * 0.35);
  const coherenceCohesion: CoherenceCohesionScore = {
    score: coherenceScoreVal,
    cefrBand: scoreToCefrBand(coherenceScoreVal),
    transitionCount: discourseData.markerCount,
    transitionDensity,
    paragraphCount,
    discourseMarkersUsed: discourseData.markersUsed,
    feedbackTh:
      discourseData.markerCount >= 3
        ? `มีการใช้คำเชื่อมประโยค (${discourseData.markersUsed.slice(0, 3).join(', ')}) และการแบ่งย่อหน้าที่ทำให้ผู้อ่านติดตามความคิดได้ราบรื่น`
        : `ควรเพิ่มคำเชื่อมบอกเหตุผลและความสัมพันธ์ของประโยค (เช่น furthermore, however, therefore) เพื่อให้ย่อหน้าเชื่อมโยงกันดียิ่งขึ้น`,
    feedbackEn:
      discourseData.markerCount >= 3
        ? `Good organizational flow with effective linking words (${discourseData.markersUsed.slice(0, 3).join(', ')}).`
        : `Incorporate more transitional devices (e.g., furthermore, on the other hand, consequently) to enhance paragraph cohesion.`,
  };

  // 3. Lexical Resource (25%)
  const vocabProfile = profileVocabulary(words);
  const { typeTokenRatio, awlCount, awlWordsUsed, cefrDistribution } = vocabProfile;

  let lexicalScoreVal = 40;
  // TTR contributes
  if (typeTokenRatio >= 0.55) lexicalScoreVal += 35;
  else if (typeTokenRatio >= 0.45) lexicalScoreVal += 25;
  else lexicalScoreVal += 15;

  // Academic & B/C tier words contribute
  const advancedPercentage = cefrDistribution.b1_b2 + cefrDistribution.c1_c2 + cefrDistribution.academic;
  if (advancedPercentage >= 15 || awlCount >= 5) lexicalScoreVal += 30;
  else if (advancedPercentage >= 8 || awlCount >= 2) lexicalScoreVal += 20;
  else lexicalScoreVal += 10;

  lexicalScoreVal = Math.min(100, Math.max(10, lexicalScoreVal));

  const lexicalResource: LexicalResourceScore = {
    score: lexicalScoreVal,
    cefrBand: scoreToCefrBand(lexicalScoreVal),
    typeTokenRatio,
    lexicalDensity: Number((advancedPercentage / 100).toFixed(3)),
    awlCount,
    awlWordsUsed,
    cefrDistribution,
    feedbackTh:
      awlCount >= 3 || advancedPercentage >= 12
        ? `มีคลังคำศัพท์ที่หลากหลายและมีการใช้คำศัพท์เชิงวิชาการ (เช่น ${awlWordsUsed.slice(0, 3).join(', ') || 'คำศัพท์ระดับ B2'}) อย่างเหมาะสม`
        : `คำศัพท์ส่วนใหญ่ยังอยู่ในระดับพื้นฐาน ควรยกระดับโดยเลือกใช้คำศัพท์เฉพาะทางหรือคำที่มีความหมายเจาะจงมากขึ้น`,
    feedbackEn:
      awlCount >= 3 || advancedPercentage >= 12
        ? `Solid lexical range featuring academic and B2/C1 vocabulary choices (${awlWordsUsed.slice(0, 3).join(', ')}).`
        : `Vocabulary relies primarily on high-frequency terms. Introduce more varied, academic adjectives and adverbs.`,
  };

  // 4. Grammatical Range & Accuracy (25%)
  const detectedIssues: GrammarIssue[] = [];
  let complexCount = 0;
  const sentenceItems: SentenceAnalysisItem[] = [];

  sentences.forEach((sentence, idx) => {
    const sWords = extractWords(sentence);
    const isComplex = isComplexSentence(sentence);
    if (isComplex) complexCount++;

    const sentenceDiscourse = detectDiscourseMarkers(sentence);
    let hasIssue = false;
    let issueDetail: string | undefined;

    // Check SVA & syntax heuristics
    for (const rule of SVA_PATTERNS) {
      if (rule.regex.test(sentence)) {
        hasIssue = true;
        issueDetail = rule.messageTh;
        detectedIssues.push({
          id: `issue_${idx}_${Date.now()}`,
          sentenceIndex: idx,
          sentenceText: sentence,
          issueType: 'subject_verb',
          severity: 'warning',
          messageTh: rule.messageTh,
          messageEn: rule.messageEn,
          suggestion: rule.suggestion,
        });
        break;
      }
    }

    // Check run-on sentence heuristic
    if (sWords.length > 40 && !isComplex) {
      hasIssue = true;
      issueDetail = 'ประโยคยาวเกินไปและขาดโครงสร้างเชื่อมโยง';
      detectedIssues.push({
        id: `runon_${idx}`,
        sentenceIndex: idx,
        sentenceText: sentence,
        issueType: 'length',
        severity: 'suggestion',
        messageTh: 'ประโยคนี้มีความยาวมากเกินไป ควรแบ่งเป็น 2 ประโยคเพื่อความชัดเจน',
        messageEn: 'Sentence is over 40 words without subordinating clauses; consider splitting for clarity.',
      });
    }

    // Estimate CEFR level of sentence
    let sentCefr: CEFRLevel = 'A2';
    if (isComplex && sWords.length >= 15) sentCefr = 'B2';
    else if (isComplex || sWords.length >= 10) sentCefr = 'B1';
    else if (sWords.length < 6) sentCefr = 'A1';

    sentenceItems.push({
      index: idx + 1,
      text: sentence,
      wordCount: sWords.length,
      isComplex,
      transitionsFound: sentenceDiscourse.markersUsed,
      cefrEstimate: sentCefr,
      hasIssue,
      issueDetail,
    });
  });

  const complexSentenceRatio = Number(((complexCount / sentenceCount) * 100).toFixed(1));
  const avgSentenceLength = Number((wordCount / sentenceCount).toFixed(1));
  const errorDensity = Number(((detectedIssues.length / (wordCount || 1)) * 100).toFixed(2));

  let grammarScoreVal = 70;
  if (complexSentenceRatio >= 40) grammarScoreVal += 20;
  else if (complexSentenceRatio >= 25) grammarScoreVal += 10;
  else grammarScoreVal -= 10;

  if (errorDensity === 0) grammarScoreVal += 10;
  else if (errorDensity > 2.0) grammarScoreVal -= 20;

  grammarScoreVal = Math.min(100, Math.max(15, grammarScoreVal));

  const grammaticalRange: GrammaticalRangeScore = {
    score: grammarScoreVal,
    cefrBand: scoreToCefrBand(grammarScoreVal),
    averageSentenceLength: avgSentenceLength,
    complexSentenceRatio,
    errorDensity,
    detectedIssues,
    feedbackTh:
      complexSentenceRatio >= 35 && detectedIssues.length === 0
        ? `โครงสร้างประโยคมีความหลากหลาย มีสัดส่วนประโยคความซ้อน ${complexSentenceRatio}% และไม่พบข้อผิดพลาดร้ายแรง`
        : `ควรเพิ่มความหลากหลายของโครงสร้างประโยค เช่น การใช้ Relative Clauses หรือ Conditionals (ถ้า-แล้ว) และระวังเรื่องกริยากับประธาน`,
    feedbackEn:
      complexSentenceRatio >= 35 && detectedIssues.length === 0
        ? `Strong syntactic variety with ${complexSentenceRatio}% complex structures and high accuracy.`
        : `Increase grammatical range by incorporating more complex sentences (relative clauses, conditionals) and verifying subject-verb concord.`,
  };

  // Overall Aggregation (25% each)
  let overallScore = Math.round(
    taskAchievement.score * 0.25 +
    coherenceCohesion.score * 0.25 +
    lexicalResource.score * 0.25 +
    grammaticalRange.score * 0.25
  );

  // Severe underlength penalty: text below 50% of required minWords cannot achieve high bands
  if (wordCount < minWords * 0.5) {
    const underlengthFactor = Math.max(0.15, wordCount / minWords);
    overallScore = Math.round(overallScore * underlengthFactor);
  }

  const cefrBand = scoreToCefrBand(overallScore);

  // Generate Actionable Suggestions
  const suggestions: ActionableSuggestion[] = [];

  if (complianceStatus === 'underlength') {
    suggestions.push({
      priority: 'high',
      dimension: 'task',
      titleTh: 'เพิ่มความยาวเนื้อหาให้ครบตามเกณฑ์',
      titleEn: 'Expand content to meet minimum word count',
      detailTh: `งานเขียนปัจจุบันมี ${wordCount} คำ ซึ่งน้อยกว่าเกณฑ์ ${minWords} คำ ให้เพิ่มย่อหน้ายกตัวอย่างประสบการณ์หรือข้อมูลสนับสนุน`,
      detailEn: `Current essay is ${wordCount} words (minimum ${minWords}). Add a supporting paragraph with concrete examples.`,
    });
  }

  if (discourseData.markerCount < 3) {
    suggestions.push({
      priority: 'high',
      dimension: 'coherence',
      titleTh: 'ใช้คำเชื่อมบอกเหตุผลและความขัดแย้ง',
      titleEn: 'Use transitional connectors for cohesion',
      detailTh: 'เพิ่มคำเชื่อม เช่น "Furthermore", "On the other hand", "Consequently" ที่ต้นประโยคเพื่อเชื่อมความคิดระหว่างย่อหน้า',
      detailEn: 'Add discourse markers like "Furthermore", "In addition", "Consequently" to transition smoothly between arguments.',
    });
  }

  if (cefrDistribution.academic < 3 && awlCount < 2) {
    suggestions.push({
      priority: 'medium',
      dimension: 'lexical',
      titleTh: 'ยกระดับคำศัพท์สู่หมวด Academic (AWL)',
      titleEn: 'Elevate vocabulary with academic word families',
      detailTh: 'แทนที่คำธรรมดาด้วยคำศัพท์ระดับ B2/C1 เช่น เปลี่ยนจาก "good/bad" เป็น "beneficial/detrimental" หรือเปลี่ยนจาก "help" เป็น "facilitate"',
      detailEn: 'Replace generic words with B2/C1 alternatives (e.g., substitute "important" with "crucial", or "big problem" with "significant issue").',
    });
  }

  if (complexSentenceRatio < 30) {
    suggestions.push({
      priority: 'medium',
      dimension: 'grammar',
      titleTh: 'ผสมผสานประโยคความรวมและความซ้อน',
      titleEn: 'Incorporate complex sentence structures',
      detailTh: 'รวมประโยคสั้นๆ เข้าด้วยกันโดยใช้ "although", "whereas", "which" หรือ "in order to" เพื่อแสดงทักษะไวยากรณ์ระดับสูง',
      detailEn: 'Combine short simple sentences using subordinating clauses ("although...", "which demonstrates...") to reach B2 syntactic maturity.',
    });
  }

  // B2 Gap Analysis
  const isB2Ready = overallScore >= 60;
  const distanceToB2 = overallScore - 60;
  const b2GapAnalysis = {
    isB2Ready,
    distanceToB2,
    summaryTh: isB2Ready
      ? `ยอดเยี่ยม! ผลงานเขียนของคุณได้คะแนน ${overallScore}/100 ผ่านเกณฑ์ระดับ B2 (Upper Intermediate) ของมาตรฐาน กมอ. 2567 แล้ว`
      : `ปัจจุบันคุณได้คะแนน ${overallScore}/100 ขาดอีก ${Math.abs(distanceToB2)} คะแนนจะผ่านเกณฑ์ B2 ให้เน้นปรับปรุง ${suggestions[0]?.titleTh || 'คำศัพท์และโครงสร้างประโยค'}`,
    summaryEn: isB2Ready
      ? `Congratulations! Your writing score (${overallScore}/100) satisfies the CEFR B2 standard.`
      : `Current score is ${overallScore}/100 (${Math.abs(distanceToB2)} points away from B2 threshold). Focus on: ${suggestions[0]?.titleEn || 'Lexical range and sentence complexity'}.`,
  };

  return {
    submissionId: `wr_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    promptId,
    targetCefr,
    overallScore,
    cefrBand,
    wordCount,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes: Number((wordCount / 200).toFixed(1)),
    taskAchievement,
    coherenceCohesion,
    lexicalResource,
    grammaticalRange,
    sentences: sentenceItems,
    suggestions,
    b2GapAnalysis,
    evaluatedAt: new Date().toISOString(),
  };
}
