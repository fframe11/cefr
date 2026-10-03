const fs = require('fs');
const path = require('path');

const KEYS = ['A', 'B', 'C', 'D'];

function rebalanceQuestion(q, index) {
  const options = q.options;
  if (!options || options.length < 2) return q;

  const numOptions = options.length;
  const targetIndex = index % numOptions;

  // Identify correct option
  let correctOptIndex = -1;
  const rawAns = (q.correct_answer || q.correctAnswer || '').trim();

  // 1. By text match
  correctOptIndex = options.findIndex(o => o.text && o.text.trim().toLowerCase() === rawAns.toLowerCase());

  // 2. By key match
  if (correctOptIndex === -1 && rawAns.length === 1) {
    correctOptIndex = options.findIndex(o => o.key && o.key.toUpperCase() === rawAns.toUpperCase());
  }

  // 3. By isCorrect flag
  if (correctOptIndex === -1) {
    correctOptIndex = options.findIndex(o => o.isCorrect === true || o.is_correct === true);
  }

  if (correctOptIndex === -1) {
    console.warn(`[WARN] Could not identify correct option for question: ${q.id}`);
    return q;
  }

  // Ensure isCorrect is populated on all options
  options.forEach((opt, idx) => {
    opt.isCorrect = (idx === correctOptIndex);
  });

  // Swap to targetIndex if different
  if (correctOptIndex !== targetIndex) {
    const temp = options[targetIndex];
    options[targetIndex] = options[correctOptIndex];
    options[correctOptIndex] = temp;
  }

  // Re-assign keys based on new positions
  options.forEach((opt, idx) => {
    opt.key = KEYS[idx] || String.fromCharCode(65 + idx);
  });

  // Update question-level correct answer pointers
  const newCorrectKey = KEYS[targetIndex];
  if (q.correct_answer !== undefined) {
    // If it was originally a key
    if (rawAns.length === 1 && /^[A-D]$/i.test(rawAns)) {
      q.correct_answer = newCorrectKey;
    }
  }
  if (q.correctAnswer !== undefined) {
    q.correctAnswer = newCorrectKey;
  }
  q.correct_option_key = newCorrectKey;

  return q;
}

// 1. Rebalance data/ooptPart2Meaning.json
const ooptP2Path = path.resolve('data/ooptPart2Meaning.json');
if (fs.existsSync(ooptP2Path)) {
  const p2 = JSON.parse(fs.readFileSync(ooptP2Path, 'utf8'));
  console.log(`Rebalancing ${p2.length} questions in ooptPart2Meaning.json...`);
  p2.forEach((q, idx) => rebalanceQuestion(q, idx));
  fs.writeFileSync(ooptP2Path, JSON.stringify(p2, null, 2), 'utf8');
  console.log('Successfully rebalanced ooptPart2Meaning.json');
}

// 2. Rebalance data/grammar-question-bank.json
const gqPath = path.resolve('data/grammar-question-bank.json');
if (fs.existsSync(gqPath)) {
  const gq = JSON.parse(fs.readFileSync(gqPath, 'utf8'));
  const isArr = Array.isArray(gq);
  const list = isArr ? gq : gq.questions;
  console.log(`Rebalancing ${list.length} questions in grammar-question-bank.json...`);
  list.forEach((q, idx) => rebalanceQuestion(q, idx));
  fs.writeFileSync(gqPath, JSON.stringify(gq, null, 2), 'utf8');
  console.log('Successfully rebalanced grammar-question-bank.json');
}
