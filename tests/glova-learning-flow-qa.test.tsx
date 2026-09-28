import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';

// Import learning views
import { VocabularyView } from '../components/views/VocabularyView';
import { GrammarView } from '../components/views/GrammarView';
import { ReadingView } from '../components/views/ReadingView';
import { ListeningView } from '../components/views/ListeningView';
import { WritingView } from '../components/views/WritingView';
import { SpeakingView } from '../components/views/SpeakingView';
import { VOCABULARY_BANK } from '../data/vocabularyBank';

describe('Glova Phase 6.3.5 — Learning Flow QA & Guardrail Invariants', () => {
  const viewsDir = path.resolve(__dirname, '../components/views');
  const viewFiles = [
    'VocabularyView.tsx',
    'GrammarView.tsx',
    'ReadingView.tsx',
    'ListeningView.tsx',
    'WritingView.tsx',
    'SpeakingView.tsx',
    'AssessmentView.tsx',
    'MockExamView.tsx',
    'AnalyticsView.tsx',
  ];

  describe('Invariant 1: Rule 3 — Anti-Parenthetical Localization Slop Ban', () => {
    it('verifies all 6 learning views have zero dual-language parenthetical labels (e.g. คำไทย (English))', () => {
      const dualLanguageRegex = /[\u0E00-\u0E7F]{2,}\s*\([A-Za-z]{2,}[^)]*\)/g;

      for (const fileName of viewFiles) {
        const filePath = path.join(viewsDir, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        const matches = content.match(dualLanguageRegex) || [];
        expect(
          matches,
          `Found forbidden dual-language parenthetical labels in ${fileName}: ${matches.join(', ')}`
        ).toEqual([]);
      }
    });
  });

  describe('Invariant 2: Rule 5.0 — Universal Ban on Scripted Status Labels', () => {
    it('verifies all 6 learning views have zero (สถานะ: ...) or scripted template status labels', () => {
      const scriptedStatusRegex = /\(สถานะ:\s*[^)]+\)/g;

      for (const fileName of viewFiles) {
        const filePath = path.join(viewsDir, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        const matches = content.match(scriptedStatusRegex) || [];
        expect(
          matches,
          `Found forbidden scripted status label in ${fileName}: ${matches.join(', ')}`
        ).toEqual([]);
      }
    });
  });

  describe('Invariant 3: Defensive Callbacks (Zero Crashes on Missing Props)', () => {
    it('renders VocabularyView without crashing when onToggleMastery is omitted', () => {
      expect(() => {
        renderToString(<VocabularyView />);
      }).not.toThrow();
    });

    it('renders GrammarView without crashing when onQuestionCompleted is omitted', () => {
      expect(() => {
        renderToString(<GrammarView />);
      }).not.toThrow();
    });

    it('renders ReadingView without crashing when onQuestionCompleted is omitted', () => {
      expect(() => {
        renderToString(<ReadingView />);
      }).not.toThrow();
    });

    it('renders ListeningView without crashing when onQuestionCompleted is omitted', () => {
      expect(() => {
        renderToString(<ListeningView />);
      }).not.toThrow();
    });

    it('renders WritingView without crashing', () => {
      expect(() => {
        renderToString(<WritingView />);
      }).not.toThrow();
    });

    it('renders SpeakingView without crashing', () => {
      expect(() => {
        renderToString(<SpeakingView />);
      }).not.toThrow();
    });
  });

  describe('Invariant 4: Vocabulary View String & Accessibility Invariants', () => {
    it('renders study mode mastery button with clean single-language label', () => {
      const unmasteredHtml = renderToString(<VocabularyView masteredWordIds={[]} />);
      expect(unmasteredHtml).toContain('ทำเครื่องหมายว่าจำได้');
      expect(unmasteredHtml).not.toContain('จำได้แล้ว (Mastered)');

      // When the current word is in masteredWordIds
      const currentWordId = VOCABULARY_BANK[0].id;
      const masteredHtml = renderToString(<VocabularyView masteredWordIds={[currentWordId]} />);
      expect(masteredHtml).toContain('จำได้แล้ว');
      expect(masteredHtml).not.toContain('จำได้แล้ว (Mastered)');
    });

    it('ensures browse mode buttons have accessible 44px touch targets and aria-labels in source', () => {
      const vocabContent = fs.readFileSync(path.join(viewsDir, 'VocabularyView.tsx'), 'utf-8');
      expect(vocabContent).toContain('min-h-[44px]');
      expect(vocabContent).toContain('min-w-[44px]');
      expect(vocabContent).toContain('aria-label=');
    });
  });

  describe('Invariant 5: Reading View Single-Language Typography Invariants', () => {
    it('renders reading lab with clean single-language glossary toggle and tab label', () => {
      const html = renderToString(<ReadingView />);
      expect(html).toContain('ดูคำศัพท์สำคัญในบทความ');
      expect(html).not.toContain('ดูคำศัพท์สำคัญในบทความ (Glossary)');
      expect(html).toContain('บทความ');
      expect(html).not.toContain('บทความ (Passage)');
    });
  });

  describe('Invariant 6: Listening View Single-Language Invariants', () => {
    it('ensures listening view transcript header is clean single-language in source', () => {
      const listeningContent = fs.readFileSync(path.join(viewsDir, 'ListeningView.tsx'), 'utf-8');
      expect(listeningContent).toContain('บทพูดภาษาอังกฤษ:');
      expect(listeningContent).not.toContain('บทพูดภาษาอังกฤษ (Audio Transcript):');
    });
  });

  describe('Invariant 7: Speaking View Clean Headers and Anti-Status Invariants', () => {
    it('renders speaking lab with clean single-language prompt headers', () => {
      const html = renderToString(<SpeakingView />);
      expect(html).toContain('แนวทางการตอบ:');
      expect(html).not.toContain('แนวทางการตอบ (Guiding Questions):');
      expect(html).toContain('ตัวอย่างคำตอบระดับคะแนนเต็ม');
      expect(html).not.toContain('ตัวอย่างคำตอบระดับคะแนนเต็ม (Model Answer)');
    });

    it('ensures speaking view toast does not include scripted status labels', () => {
      const speakingContent = fs.readFileSync(path.join(viewsDir, 'SpeakingView.tsx'), 'utf-8');
      expect(speakingContent).toContain('บันทึกคำตอบแล้วเพื่อการฝึกฝน');
      expect(speakingContent).not.toContain('(สถานะ:');
    });
  });

  describe('Invariant 8: Writing View Anti-Status & Standard Adherence', () => {
    it('ensures writing view feedback and toast do not contain scripted status labels', () => {
      const writingContent = fs.readFileSync(path.join(viewsDir, 'WritingView.tsx'), 'utf-8');
      expect(writingContent).toContain('บันทึกงานเขียนสำเร็จ — อยู่ระหว่างรอการประเมินตามเกณฑ์ Cambridge');
      expect(writingContent).toContain('บันทึกคำตอบแล้ว — อยู่ระหว่างรอการประเมินผล');
      expect(writingContent).not.toContain('(สถานะ:');
    });
  });
});
