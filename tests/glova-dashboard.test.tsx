import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DashboardView } from '../components/views/DashboardView';
import { UserProgressState } from '../types';

const mockBaseProgress: UserProgressState = {
  currentLevel: 'B1',
  estimatedCambridgeScore: 148,
  streakDays: 5,
  dailyGoalMinutes: 20,
  minutesStudiedToday: 15,
  skillStats: {
    vocabulary: 65,
    grammar: 72,
    reading: 80,
    listening: 58,
    writing: 50,
    speaking: 45,
  },
  completedQuestionIds: ['q1', 'q2', 'q3'],
  masteredWordIds: ['w1', 'w2'],
  weakTopics: [],
  assessmentCompleted: true,
  targetExam: 'PET',
};

describe('Glova Dashboard View Redesign Suite', () => {
  describe('1. Real Data & Placement Rendering', () => {
    it('should render current CEFR level, target exam, and Cambridge estimated score', () => {
      const html = renderToString(
        <DashboardView
          progress={mockBaseProgress}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('เป้าหมายการสอบ:');
      expect(html).toContain('PET');
      expect(html).toContain('148');
      expect(html).toContain('B1');
      expect(html).toContain('Cambridge');
      expect(html).toContain('Curated CEFR Learning Pathways');
    });

    it('should render compact progress summary with daily goal, streak, and completed questions', () => {
      const html = renderToString(
        <DashboardView
          progress={mockBaseProgress}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('15 นาที');
      expect(html).toContain('5 วัน');
      expect(html).toContain('3 ข้อ'); // completedQuestionIds.length
      expect(html).toContain('2 คำ'); // masteredWordIds.length
      expect(html).toContain('คำศัพท์ที่เชี่ยวชาญ');
    });

    it('should render skill mastery progress bars for all 6 core competencies', () => {
      const html = renderToString(
        <DashboardView
          progress={mockBaseProgress}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      // Verify skills appear with real percentage numbers
      expect(html).toContain('65');
      expect(html).toContain('72');
      expect(html).toContain('80');
      expect(html).toContain('58');
      expect(html).toContain('50');
      expect(html).toContain('45');
      expect(html).toContain('%');
    });
  });

  describe('2. Primary Next Best Action (70/30 Focal Logic)', () => {
    it('should prioritize Weakness Remediation when weakTopics exist', () => {
      const progressWithWeakness: UserProgressState = {
        ...mockBaseProgress,
        weakTopics: [
          {
            tag: 'present_perfect',
            labelTh: 'Present Perfect Tense',
            errorCount: 3,
            lastFailedAt: '2026-09-28T10:00:00Z',
          },
        ],
      };

      const html = renderToString(
        <DashboardView
          progress={progressWithWeakness}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('ทบทวนและซ่อมแซม: Present Perfect Tense');
      expect(html).toContain('ตรวจพบข้อผิดพลาด 3 ครั้ง');
      expect(html).toContain('เริ่มฝึกจุดนี้ทันที');
    });

    it('should prioritize Diagnostic Assessment when assessment is incomplete', () => {
      const unassessedProgress: UserProgressState = {
        ...mockBaseProgress,
        assessmentCompleted: false,
        weakTopics: [],
      };

      const html = renderToString(
        <DashboardView
          progress={unassessedProgress}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('ทำแบบทดสอบวัดระดับ CEFR Diagnostic Test');
      expect(html).toContain('เริ่มวัดระดับภาษา');
    });

    it('should provide Daily Practice when learner is on track with zero weaknesses', () => {
      const html = renderToString(
        <DashboardView
          progress={mockBaseProgress}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('ฝึกฝนประจำวัน: คำศัพท์และไวยากรณ์ระดับ B1');
      expect(html).toContain('เริ่มฝึกฝนทันที');
    });
  });

  describe('3. Weakness Remediation Empty vs Populated States', () => {
    it('should show empowering empty state when no repeated mistakes exist', () => {
      const html = renderToString(
        <DashboardView
          progress={{ ...mockBaseProgress, weakTopics: [] }}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('ยอดเยี่ยมมาก! ยังไม่พบจุดอ่อนที่ผิดซ้ำ');
      expect(html).toContain('ทดลองทำข้อสอบจำลอง');
    });

    it('should render actionable list when multiple weaknesses exist', () => {
      const progressWithMultiple: UserProgressState = {
        ...mockBaseProgress,
        weakTopics: [
          { tag: 'preposition_at', labelTh: 'Prepositions of Time (at/on/in)', errorCount: 4, lastFailedAt: '2026-09-28' },
          { tag: 'articles', labelTh: 'Definite Article (the)', errorCount: 2, lastFailedAt: '2026-09-28' },
        ],
      };

      const html = renderToString(
        <DashboardView
          progress={progressWithMultiple}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('Prepositions of Time (at/on/in)');
      expect(html).toContain('Definite Article (the)');
      expect(html).toContain('ซ่อมจุดนี้');
    });
  });

  describe('4. Secondary Curated Learning Paths', () => {
    it('should render distinct secondary action cards for Vocabulary, Grammar, and Mock Exams', () => {
      const html = renderToString(
        <DashboardView
          progress={mockBaseProgress}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('คลังคำศัพท์ CEFR');
      expect(html).toContain('ไวยากรณ์ภาษาอังกฤษ');
      expect(html).toContain('ข้อสอบจำลอง Cambridge');
      expect(html).toContain('เปิดคลังคำศัพท์');
      expect(html).toContain('ฝึกทำแบบฝึกหัด');
      expect(html).toContain('เข้าสู่คลังข้อสอบ');
    });
  });

  describe('5. Accessibility & Typography Structure', () => {
    it('should contain semantic headings and ARIA progressbars', () => {
      const html = renderToString(
        <DashboardView
          progress={mockBaseProgress}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('<h1');
      expect(html).toContain('<h2');
      expect(html).toContain('<h3');
      expect(html).toContain('role="progressbar"');
      expect(html).toContain('role="status"');
    });
  });
});
