import { describe, it, expect } from 'vitest';
import { evaluateEssay, EssayEvaluationError } from '../lib/writing/evaluator';
import { profileLexicon } from '../lib/writing/lexicon-profiler';
import { detectGrammarIssues } from '../lib/writing/grammar-rules';

describe('TASK-02: Automated Essay Scoring (AES) & NLP CEFR Rubric Grader', () => {
  // AC-1: Word count validation
  describe('AC-1: Word Count Validation', () => {
    it('rejects submissions with fewer than 50 words', () => {
      const shortText = 'This is a very short text with only ten words here.';
      expect(() =>
        evaluateEssay({
          prompt_id: 'wrt_test_01',
          target_cefr: 'B2',
          submission_text: shortText,
          min_words: 140,
          max_words: 190,
        })
      ).toThrowError(EssayEvaluationError);
    });

    it('accepts submissions with 50 words or more', () => {
      // 55 words
      const text55Words = `
        In recent years, modern technology has developed rapidly and changed our daily lives completely.
        Firstly, computers allow people to communicate with others around the world instantly.
        Moreover, students can access massive learning resources through online platforms.
        However, excessive screen time might cause physical health problems.
        Therefore, people should maintain a balanced lifestyle while utilizing technological tools effectively.
      `.trim();

      const result = evaluateEssay({
        prompt_id: 'wrt_test_02',
        target_cefr: 'B2',
        submission_text: text55Words,
        min_words: 50,
        max_words: 100,
      });

      expect(result.word_count).toBeGreaterThanOrEqual(50);
      expect(result.overall_score).toBeGreaterThan(0);
      expect(result.rubric_scores).toBeDefined();
    });
  });

  // AC-2: Rubric Consistency
  describe('AC-2: 4-Axis Cambridge Rubrics Consistency', () => {
    it('returns all 4 Cambridge rubric dimensions scored between 0 and 5.0', () => {
      const essay = `
        In modern society, education plays an indispensable role in shaping individuals and communities.
        
        Firstly, acquiring higher education enables young professionals to develop crucial critical thinking skills. Consequently, they are better equipped to solve complex problems and collaborate effectively in multidisciplinary environments.
        
        Furthermore, academic institutions provide opportunities for students from diverse backgrounds to exchange perspectives. This cross-cultural dialogue fosters tolerance and mutual understanding, which are essential in an interconnected world.
        
        In conclusion, investing in quality education yields substantial long-term benefits for both individuals and the global community. Therefore, governments should prioritize accessible education for all citizens.
      `.trim();

      const res = evaluateEssay({
        prompt_id: 'wrt_b2_essay_01',
        target_cefr: 'B2',
        submission_text: essay,
        min_words: 100,
        max_words: 180,
      });

      // Check all 4 dimensions
      expect(res.rubric_scores.content).toBeGreaterThanOrEqual(0);
      expect(res.rubric_scores.content).toBeLessThanOrEqual(5.0);

      expect(res.rubric_scores.communicative_achievement).toBeGreaterThanOrEqual(0);
      expect(res.rubric_scores.communicative_achievement).toBeLessThanOrEqual(5.0);

      expect(res.rubric_scores.organisation).toBeGreaterThanOrEqual(0);
      expect(res.rubric_scores.organisation).toBeLessThanOrEqual(5.0);

      expect(res.rubric_scores.language).toBeGreaterThanOrEqual(0);
      expect(res.rubric_scores.language).toBeLessThanOrEqual(5.0);

      // Check overall score & band
      expect(res.overall_score).toBeGreaterThanOrEqual(0);
      expect(res.overall_score).toBeLessThanOrEqual(100);
      expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).toContain(res.cefr_band);
    });
  });

  // AC-3: Lexical Profiling
  describe('AC-3: Lexical Profiling with Oxford Lexicon', () => {
    it('calculates percentage distribution of A1-A2, B1-B2, and C1-C2', () => {
      const sampleText = `
        The proliferation of ubiquitous digital technology has created an unprecedented paradigm shift.
        Consequently, researchers must meticulously scrutinize tangible evidence to mitigate detrimental effects.
      `;

      const profile = profileLexicon(sampleText);
      expect(profile.a1_a2_percent).toBeGreaterThanOrEqual(0);
      expect(profile.b1_b2_percent).toBeGreaterThanOrEqual(0);
      expect(profile.c1_c2_percent).toBeGreaterThanOrEqual(0);
      expect(profile.b1_b2_percent + profile.c1_c2_percent).toBeGreaterThan(20);
      expect(profile.advanced_words_found?.length).toBeGreaterThan(0);
    });

    it('identifies vocabulary upgrade opportunities for common words', () => {
      const basicText = 'This is a good idea and a big problem because it helps people.';
      const profile = profileLexicon(basicText);
      expect(profile.suggested_upgrades?.length).toBeGreaterThan(0);
      const upgradeKeys = profile.suggested_upgrades?.map((u) => u.original);
      expect(upgradeKeys).toContain('good');
    });
  });

  // AC-5: Unit Testing B1, B2, C1 Essays
  describe('AC-5: Accuracy for B1, B2, and C1 Essays', () => {
    it('correctly grades an authentic B1 Intermediate essay within +/- 1 band', () => {
      const b1Essay = `
        I would like to tell you about my hometown. It is a nice and quiet city near the mountains.
        
        In my hometown, there are many parks where people can walk and do exercise every morning. Also, the food is very good and not expensive. You can find delicious street food everywhere.
        
        However, the public transport is not very good. There are only few buses and people usually drive motorbikes.
        
        In conclusion, I like my hometown very much because people are friendly and helpful. I think tourists should visit my city in winter.
      `.trim();

      const res = evaluateEssay({
        prompt_id: 'wrt_b1_essay_01',
        target_cefr: 'B1',
        submission_text: b1Essay,
        min_words: 90,
        max_words: 130,
      });

      expect(['A2', 'B1', 'B2']).toContain(res.cefr_band);
    });

    it('correctly grades an authentic B2 Upper-Intermediate essay', () => {
      const b2Essay = `
        In recent years, technology has developed rapidly and changed our daily lives completely.
        
        On the one hand, digital devices enable people to communicate globally with colleagues and friends. Furthermore, online platforms provide students with comprehensive access to academic resources, which significantly enhances self-directed learning.
        
        On the other hand, excessive screen time can have detrimental effects on physical health and personal relationships. Many individuals spend hours browsing social media instead of engaging in meaningful face-to-face interactions.
        
        Taking everything into account, while technological innovations offer remarkable advantages, individuals must maintain self-discipline to ensure a balanced lifestyle.
      `.trim();

      const res = evaluateEssay({
        prompt_id: 'wrt_b2_essay_01',
        target_cefr: 'B2',
        submission_text: b2Essay,
        min_words: 100,
        max_words: 150,
      });

      expect(['B1', 'B2', 'C1']).toContain(res.cefr_band);
      expect(res.rubric_scores.organisation).toBeGreaterThanOrEqual(3.5);
    });

    it('correctly grades an advanced C1 essay with high lexical sophistication', () => {
      const c1Essay = `
        The proliferation of artificial intelligence within contemporary society represents an unprecedented paradigm shift.
        
        Firstly, automated systems possess the potential to revolutionize scientific inquiry by expediting the analysis of intricate datasets. Consequently, medical researchers can identify promising therapeutic compounds with unprecedented velocity, thereby mitigating the societal burden of chronic illnesses.
        
        Nevertheless, the ubiquitous adoption of algorithmic decision-making introduces profound ethical predicaments. When algorithmic biases are left unchecked, socio-economic inequalities are inevitably exacerbated. Furthermore, the opacity of deep neural networks poses formidable challenges to regulatory oversight and institutional accountability.
        
        Taking all these dimensions into consideration, society must implement robust legislative frameworks and meticulous auditing mechanisms. Only through vigilant oversight can humanity harness the transformative capabilities of artificial intelligence while safeguarding fundamental democratic values.
      `.trim();

      const res = evaluateEssay({
        prompt_id: 'wrt_c1_essay_01',
        target_cefr: 'C1',
        submission_text: c1Essay,
        min_words: 130,
        max_words: 200,
      });

      expect(['B2', 'C1', 'C2']).toContain(res.cefr_band);
      expect(res.rubric_scores.language).toBeGreaterThanOrEqual(4.0);
      expect(res.overall_score).toBeGreaterThanOrEqual(75);
    });
  });

  // Grammar Issue Detection & Offsets
  describe('Grammar Issue Detection and Character Offsets', () => {
    it('detects Subject-Verb Agreement error with exact offset and replacement', () => {
      const text = 'In modern life, technologies has transformed everything.';
      const issues = detectGrammarIssues(text);

      expect(issues.length).toBeGreaterThan(0);
      const sva = issues.find((i) => i.rule_id === 'SUBJECT_VERB_AGREEMENT');
      expect(sva).toBeDefined();
      expect(sva?.original_text).toBe('technologies has');
      expect(sva?.replacement).toBe('technologies have');
      expect(sva?.offset).toBe(16);
      expect(sva?.length).toBe('technologies has'.length);
      expect(text.substring(sva!.offset, sva!.offset + sva!.length)).toBe('technologies has');
    });

    it('detects modal verb errors and collocation errors', () => {
      const text = 'Students can able to learn quickly and must to study hard. Success depend of diligence.';
      const issues = detectGrammarIssues(text);

      expect(issues.some((i) => i.rule_id === 'MODAL_VERB_REDUNDANCY')).toBe(true);
      expect(issues.some((i) => i.rule_id === 'MODAL_INFINITIVE_ERROR')).toBe(true);
      expect(issues.some((i) => i.rule_id === 'PREPOSITION_COLLOCATION')).toBe(true);
    });
  });
});
