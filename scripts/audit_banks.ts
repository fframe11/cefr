import fs from 'fs';
import path from 'path';

// Import TS banks
import { GRAMMAR_BANK } from '../data/grammarBank';
import { READING_BANK } from '../data/readingBank';
import { LISTENING_BANK } from '../data/listeningBank';
import { VOCABULARY_BANK } from '../data/vocabularyBank';
import { COLLOCATIONS_BANK } from '../data/collocationsBank';
import { CAMBRIDGE_MOCK_EXAMS } from '../data/mockExams';
import { QUICK_CHECK_QUESTIONS } from '../data/quickCheckQuestions';
import { DIAGNOSTIC_QUESTIONS } from '../data/diagnosticAssessment';

interface QuestionAudit {
  id: string;
  source: string;
  optionsCount: number;
  correctKeys: string[];
  hasExplanation: boolean;
  issue?: string;
}

function auditQuestion(q: any, source: string): QuestionAudit {
  const id = q.id || q.questionId || 'unknown';
  const options = q.options || [];
  const correctKeys: string[] = [];

  // Check options isCorrect
  options.forEach((opt: any) => {
    if (opt.isCorrect === true || opt.is_correct === true) {
      correctKeys.push(opt.key);
    }
  });

  // Check top-level correctAnswer or correct_answer
  if (correctKeys.length === 0) {
    if (q.correctAnswer) correctKeys.push(q.correctAnswer);
    else if (q.correct_answer) correctKeys.push(q.correct_answer);
    else if (q.correctOptionKey) correctKeys.push(q.correctOptionKey);
  }

  let issue: string | undefined;
  if (options.length === 0) {
    issue = 'NO_OPTIONS';
  } else if (correctKeys.length === 0) {
    issue = 'NO_CORRECT_ANSWER';
  } else if (correctKeys.length > 1) {
    issue = `MULTIPLE_CORRECT_ANSWERS: ${correctKeys.join(',')}`;
  }

  return {
    id,
    source,
    optionsCount: options.length,
    correctKeys,
    hasExplanation: Boolean(q.explanationTh || q.explanationEn || q.explanation),
    issue,
  };
}

function analyzeSet(name: string, questions: any[]) {
  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, other: 0 };
  const issues: QuestionAudit[] = [];

  questions.forEach((q) => {
    const res = auditQuestion(q, name);
    if (res.issue) {
      issues.push(res);
    }
    if (res.correctKeys.length > 0) {
      res.correctKeys.forEach((k) => {
        const upper = k.toUpperCase().trim();
        if (distribution[upper] !== undefined) {
          distribution[upper]++;
        } else {
          distribution.other++;
        }
      });
    }
  });

  const total = questions.length;
  console.log(`\n========================================`);
  console.log(`Bank: ${name} (Total Questions: ${total})`);
  console.log(`Answer Distribution:`);
  Object.entries(distribution).forEach(([key, count]) => {
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
    console.log(`  ${key}: ${count} (${pct}%)`);
  });

  if (issues.length > 0) {
    console.log(`Issues found (${issues.length}):`);
    issues.slice(0, 10).forEach((iss) => {
      console.log(`  - [${iss.id}] ${iss.issue}`);
    });
    if (issues.length > 10) {
      console.log(`  ... and ${issues.length - 10} more`);
    }
  } else {
    console.log(`No issues found (all have exactly 1 correct answer)`);
  }

  return { name, total, distribution, issues };
}

async function main() {
  console.log('Auditing Question Banks across CEFR Platform...');

  // 1. Grammar Bank
  const grammarQuestions = GRAMMAR_BANK.flatMap((t) => t.practiceQuestions || []);
  analyzeSet('Grammar Bank (data/grammarBank.ts)', grammarQuestions);

  // 2. Reading Bank
  const readingQuestions = READING_BANK.flatMap((p) => p.questions || []);
  analyzeSet('Reading Bank (data/readingBank.ts)', readingQuestions);

  // 3. Listening Bank
  const listeningQuestions = LISTENING_BANK.flatMap((t) => t.questions || []);
  analyzeSet('Listening Bank (data/listeningBank.ts)', listeningQuestions);

  // 4. Vocabulary Bank
  const vocabQuestions = VOCABULARY_BANK.flatMap((c) => (c as any).questions || []);
  analyzeSet('Vocabulary Bank (data/vocabularyBank.ts)', vocabQuestions);

  // 5. Collocations Bank
  const collocQuestions = COLLOCATIONS_BANK.flatMap((c) => (c as any).questions || []);
  analyzeSet('Collocations Bank (data/collocationsBank.ts)', collocQuestions);

  // 6. Mock Exams
  const mockExamQuestions = CAMBRIDGE_MOCK_EXAMS.flatMap((e) => e.sections.flatMap((s) => s.questions || []));
  analyzeSet('Mock Exams (data/mockExams.ts)', mockExamQuestions);

  // 7. Quick Check Questions
  analyzeSet('Quick Check Questions (data/quickCheckQuestions.ts)', QUICK_CHECK_QUESTIONS);

  // 8. Diagnostic Assessment
  analyzeSet('Diagnostic Assessment (data/diagnosticAssessment.ts)', DIAGNOSTIC_QUESTIONS);

  // 9. JSON banks
  try {
    const p2Path = path.resolve('data/ooptPart2Meaning.json');
    if (fs.existsSync(p2Path)) {
      const p2 = JSON.parse(fs.readFileSync(p2Path, 'utf8'));
      analyzeSet('OOPT Part 2 Meaning (data/ooptPart2Meaning.json)', p2);
    }
  } catch (e) {
    console.error('Error reading ooptPart2Meaning.json', e);
  }

  try {
    const p3Path = path.resolve('data/ooptPart3Cloze.json');
    if (fs.existsSync(p3Path)) {
      const p3 = JSON.parse(fs.readFileSync(p3Path, 'utf8'));
      analyzeSet('OOPT Part 3 Cloze (data/ooptPart3Cloze.json)', p3);
    }
  } catch (e) {
    console.error('Error reading ooptPart3Cloze.json', e);
  }

  try {
    const gqPath = path.resolve('data/grammar-question-bank.json');
    if (fs.existsSync(gqPath)) {
      const gq = JSON.parse(fs.readFileSync(gqPath, 'utf8'));
      analyzeSet('Grammar Question Bank JSON (data/grammar-question-bank.json)', Array.isArray(gq) ? gq : (gq.questions || []));
    }
  } catch (e) {
    console.error('Error reading grammar-question-bank.json', e);
  }
}

main().catch(console.error);
