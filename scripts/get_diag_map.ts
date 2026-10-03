import { DIAGNOSTIC_QUESTIONS } from '../data/diagnosticAssessment';

const map: Record<string, string> = {};
DIAGNOSTIC_QUESTIONS.forEach((q) => {
  const c = q.options?.find((o) => o.isCorrect);
  map[q.id] = c ? c.key : 'none';
});

console.log(JSON.stringify(map, null, 2));
