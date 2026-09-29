import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  QUICK_CHECK_QUESTIONS,
  evaluateQuickCheckAssessment,
  QUICK_WIN_CHALLENGE,
} from '../data/quickCheckQuestions';
import { DashboardView } from '../components/views/DashboardView';
import { UserProgressState } from '../types';

describe('Glova First-Time Funnel & Mass Adoption Suite', () => {
  describe('1. 3-Minute Quick Check Content & Calibration', () => {
    it('should have 8 real-life scenario questions covering diverse contexts', () => {
      expect(QUICK_CHECK_QUESTIONS).toHaveLength(8);

      const contexts = QUICK_CHECK_QUESTIONS.map((q) => q.contextType);
      expect(contexts).toContain('chat');
      expect(contexts).toContain('cafe');
      expect(contexts).toContain('email');
      expect(contexts).toContain('travel');
      expect(contexts).toContain('work');
      expect(contexts).toContain('social');
      expect(contexts).toContain('conversation');
      expect(contexts).toContain('notice');
    });

    it('should evaluate low scores as A1 with non-punitive Glova diagnostic estimate', () => {
      // 1 correct answer
      const answers = { 'qc-1': 'A' };
      const snapshot = evaluateQuickCheckAssessment(answers);

      expect(snapshot.overallLevel).toBe('A1');
      expect(snapshot.isOfficialDisclaimer).toContain('Not an official Cambridge Assessment certificate');
      expect(snapshot.correctCount).toBe(1);
      expect(snapshot.totalCount).toBe(8);
      expect(snapshot.growthArea.opportunityNote).toContain("You've already got the basics down");
    });

    it('should evaluate intermediate scores as B1 with life outcomes', () => {
      // 5 correct answers
      const answers = {
        'qc-1': 'A',
        'qc-2': 'A',
        'qc-3': 'A',
        'qc-4': 'A',
        'qc-5': 'A',
      };
      const snapshot = evaluateQuickCheckAssessment(answers);

      expect(snapshot.overallLevel).toBe('B1');
      expect(snapshot.estimatedCambridgeScore).toBeGreaterThanOrEqual(140);
      expect(snapshot.lifeOutcomes.length).toBeGreaterThanOrEqual(3);
      expect(snapshot.strongAreas.length).toBeGreaterThan(0);
    });

    it('should evaluate high scores as B2', () => {
      // 7 correct answers
      const answers = {
        'qc-1': 'A',
        'qc-2': 'A',
        'qc-3': 'A',
        'qc-4': 'A',
        'qc-5': 'A',
        'qc-6': 'A',
        'qc-7': 'A',
      };
      const snapshot = evaluateQuickCheckAssessment(answers);

      expect(snapshot.overallLevel).toBe('B2');
      expect(snapshot.estimatedCambridgeScore).toBeGreaterThanOrEqual(160);
    });

    it('should provide respectful "Almost" feedback on incorrect options without shame', () => {
      QUICK_CHECK_QUESTIONS.forEach((q) => {
        const incorrectOptions = q.options.filter((o) => !o.isCorrect);
        incorrectOptions.forEach((opt) => {
          expect(opt.feedback).toMatch(/^Almost/);
        });
      });
    });
  });

  describe('2. Quick Win Challenge Integrity', () => {
    it('should define a 2-minute everyday messaging challenge with an actionable rule', () => {
      expect(QUICK_WIN_CHALLENGE.id).toBe('qw-present-perfect');
      expect(QUICK_WIN_CHALLENGE.situation).toContain('texting a classmate');
      expect(QUICK_WIN_CHALLENGE.options).toHaveLength(3);

      const correct = QUICK_WIN_CHALLENGE.options.find((o) => o.isCorrect);
      expect(correct).toBeDefined();
      expect(correct?.text).toContain("I've already eaten");
      expect(QUICK_WIN_CHALLENGE.takeaway).toContain('Quick Rule');
    });
  });

  describe('3. Dashboard "What Next?" & Attention-Friendly Resume State', () => {
    const mockProgressWithResume: UserProgressState = {
      currentLevel: 'A2',
      estimatedCambridgeScore: 128,
      streakDays: 2,
      dailyGoalMinutes: 15,
      minutesStudiedToday: 6,
      skillStats: {
        vocabulary: 55,
        grammar: 50,
        reading: 65,
        listening: 60,
        writing: 45,
        speaking: 40,
      },
      completedQuestionIds: ['qc-1', 'qc-2'],
      masteredWordIds: ['vocab-1'],
      weakTopics: [
        {
          tag: 'prepositions_of_place',
          labelTh: 'Prepositions of Place (in, at, on)',
          errorCount: 2,
          lastFailedAt: '2026-09-29T10:00:00Z',
        },
      ],
      assessmentCompleted: true,
      targetExam: 'KET',
      englishSnapshot: {
        overallLevel: 'A2',
        estimatedCambridgeScore: 128,
        strongSkill: 'Reading real-world messages',
        growthArea: 'Everyday Grammar & Phrasal Patterns',
        nextStepRecommendation: 'Fix 1 common everyday conversation pattern',
        completedAt: '2026-09-29T10:00:00Z',
      },
      lastActivity: {
        type: 'vocabulary',
        title: 'Food & Ordering Vocabulary',
        detail: '3 words remaining in session',
        timestamp: '2026-09-29T10:30:00Z',
      },
    };

    it('should render TODAY\'S NEXT STEP as primary focal area with explicit reasoning', () => {
      const html = renderToString(
        <DashboardView
          progress={mockProgressWithResume}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain("TODAY&#x27;S NEXT STEP");
      expect(html).toContain('แนะนำเพราะ: ตรวจพบข้อผิดพลาด 2 ครั้ง');
      expect(html).toContain('Grammar &amp; Phrasing');
    });

    it('should render "ดำเนินการต่อจากจุดเดิม" resume section when lastActivity exists', () => {
      const html = renderToString(
        <DashboardView
          progress={mockProgressWithResume}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('ดำเนินการต่อจากจุดเดิม');
      expect(html).toContain('Food &amp; Ordering Vocabulary');
      expect(html).toContain('3 words remaining in session');
      expect(html).toContain('ทำต่อทันที');
    });

    it('should display the emotional CEFR building journey toward the next level', () => {
      const html = renderToString(
        <DashboardView
          progress={mockProgressWithResume}
          onNavigate={() => {}}
          onStartRemediation={() => {}}
        />
      );

      expect(html).toContain('คุณกำลังพัฒนาเพื่อก้าวสู่ระดับ B1');
    });
  });
});
