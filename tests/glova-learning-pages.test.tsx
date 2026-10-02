import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { VocabularyView } from '../components/views/VocabularyView';
import { GrammarView } from '../components/views/GrammarView';
import { ReadingView } from '../components/views/ReadingView';
import { ListeningView } from '../components/views/ListeningView';
import { WritingView } from '../components/views/WritingView';
import { SpeakingView } from '../components/views/SpeakingView';

describe('Glova Learning Pages Redesign Suite', () => {
  describe('1. Vocabulary View Redesign', () => {
    it('should render active vocabulary lab context, level pills, and real mastery count', () => {
      const html = renderToString(
        <VocabularyView
          masteredWordIds={['w1', 'w2', 'w3']}
          onToggleMastery={() => {}}
        />
      );

      expect(html).toContain('ACTIVE VOCABULARY LAB');
      expect(html).toContain('คลังคำศัพท์และการจำแบบ Spaced Repetition');
      expect(html).toContain('3 คำ'); // real masteredWordIds length
      expect(html).toContain('โหมดฝึกจำ');
      expect(html).toContain('คลังรายการ');
    });

    it('should render active learning flashcard hero with CEFR badge, pronunciation, and controls', () => {
      const html = renderToString(
        <VocabularyView
          masteredWordIds={[]}
          onToggleMastery={() => {}}
        />
      );

      expect(html).toContain('CEFR');
      expect(html).toContain('ฟังการออกเสียงคำว่า');
      expect(html).toContain('ทำเครื่องหมายว่าจำได้');
      expect(html).toContain('คำถัดไป');
    });
  });

  describe('2. Grammar View Redesign', () => {
    it('should render grammar studio context, rules, and exercise card', () => {
      const html = renderToString(
        <GrammarView
          onQuestionCompleted={() => {}}
        />
      );

      expect(html).toContain('Unit');
      expect(html).toContain('บทเรียน');
    });
  });

  describe('3. Reading View Redesign', () => {
    it('should render reading lab context, passage canvas with word count, and comprehension questions', () => {
      const html = renderToString(
        <ReadingView
          onQuestionCompleted={() => {}}
        />
      );

      expect(html).toContain('READING LAB');
      expect(html).toContain('อ่านจับใจความและวิเคราะห์บริบท');
      expect(html).toContain('คำ'); // word count indicator
      expect(html).toContain('คำถามวัดความเข้าใจ');
      expect(html).toContain('บทความ');
    });
  });

  describe('4. Listening View Redesign', () => {
    it('should render listening studio context and practice test tabs', () => {
      const html = renderToString(
        <ListeningView
          onQuestionCompleted={() => {}}
        />
      );

      expect(html).toContain('สตูดิโอการฟัง');
      expect(html).toContain('แบบทดสอบ');
    });
  });

  describe('5. Writing View Redesign', () => {
    it('should render writing lab context, prompt guidelines, writing textarea, and word guidelines', () => {
      const html = renderToString(<WritingView />);

      expect(html).toContain('WRITING LAB');
      expect(html).toContain('ทักษะการเขียนและการสื่อสาร');
      expect(html).toContain('พื้นที่เขียนคำตอบ');
      expect(html).toContain('เกณฑ์ความยาว:');
      expect(html).toContain('ส่งงานเขียน');
      expect(html).toContain('บันทึกแบบร่าง');
    });
  });

  describe('6. Speaking View Redesign', () => {
    it('should render speaking lab context, prompt, recording affordance, and target phrases', () => {
      const html = renderToString(<SpeakingView />);

      expect(html).toContain('SPEAKING LAB');
      expect(html).toContain('การพูดและออกเสียงเชิงโต้ตอบ');
      expect(html).toContain('แตะเพื่อเริ่มบันทึกเสียง');
      expect(html).toContain('คำศัพท์และสำนวนเป้าหมาย:');
      expect(html).toContain('แนวทางการตอบ:');
    });
  });

  describe('7. Structural Consistency & Accessibility Across All Views', () => {
    it('should render all 6 learning views without crashing and include touch-target elements', () => {
      const vocabHtml = renderToString(
        <VocabularyView masteredWordIds={[]} onToggleMastery={() => {}} />
      );
      const grammarHtml = renderToString(<GrammarView onQuestionCompleted={() => {}} />);
      const readingHtml = renderToString(<ReadingView onQuestionCompleted={() => {}} />);
      const listeningHtml = renderToString(<ListeningView onQuestionCompleted={() => {}} />);
      const writingHtml = renderToString(<WritingView />);
      const speakingHtml = renderToString(<SpeakingView />);

      for (const html of [vocabHtml, grammarHtml, readingHtml, listeningHtml, writingHtml, speakingHtml]) {
        expect(html.length).toBeGreaterThan(100);
        expect(html).toContain('touch-target');
      }
    });
  });
});
