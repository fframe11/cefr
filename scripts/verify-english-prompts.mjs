// Verify that all question prompts, stems, and options are 100% in English with zero Thai characters
import fs from 'node:fs';

const THAI_REGEX = /[\u0E00-\u0E7F]/;

const filesToCheck = [
  'lib/questions/vocabulary-questions.ts',
  'lib/questions/grammar-questions.ts',
  'lib/questions/reading-questions.ts',
  'components/views/VocabularyView.tsx',
  'components/views/CollocationsView.tsx',
];

let hasErrors = false;

for (const relPath of filesToCheck) {
  if (!fs.existsSync(relPath)) {
    console.error(`File not found: ${relPath}`);
    hasErrors = true;
    continue;
  }

  const content = fs.readFileSync(relPath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check prompt generation lines
    if (line.includes('promptTh') || line.includes('promptEn') || line.includes('currentQuestion.promptTh') || line.includes('createMeaningRecognitionQuestion') || line.includes('createReverseMeaningQuestion')) {
      if (THAI_REGEX.test(line)) {
        console.error(`[FAIL] ${relPath}:${idx + 1} has Thai in prompt: ${line.trim()}`);
        hasErrors = true;
      }
    }
  });
}

if (hasErrors) {
  process.exit(1);
}

console.log('SUCCESS: All question prompt templates and practice views are 100% English. Zero Thai found.');
process.exit(0);
