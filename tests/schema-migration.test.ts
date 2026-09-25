import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Schema Migrations Verification', () => {
  const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

  it('should find all 4 approved migration files', () => {
    expect(fs.existsSync(migrationsDir)).toBe(true);
    const files = fs.readdirSync(migrationsDir).sort();
    expect(files).toEqual([
      '20260925000001_create_cefr_platform_schema.sql',
      '20260925000002_create_indexes.sql',
      '20260925000003_create_rls_policies.sql',
      '20260925000004_seed_reference_data.sql',
    ]);
  });

  const EXPECTED_20_TABLES = [
    'cefr_levels',
    'skills',
    'user_profiles',
    'vocabularies',
    'vocabulary_collocations',
    'grammar_topics',
    'reading_passages',
    'listening_exercises',
    'writing_prompts',
    'speaking_prompts',
    'questions',
    'question_options',
    'mock_exams',
    'mock_exam_sections',
    'mock_exam_questions',
    'user_mock_exam_attempts',
    'user_question_attempts',
    'user_skill_progress',
    'user_weaknesses',
    'user_vocabulary_mastery',
  ];

  it('should declare all 20 application tables in schema migration', () => {
    const schemaSql = fs.readFileSync(
      path.join(migrationsDir, '20260925000001_create_cefr_platform_schema.sql'),
      'utf-8'
    );

    for (const table of EXPECTED_20_TABLES) {
      const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?public\\.${table}\\b`, 'i');
      expect(tableRegex.test(schemaSql), `Missing table declaration for: ${table}`).toBe(true);
    }
  });

  it('should verify user_profiles references auth.users(id) ON DELETE CASCADE', () => {
    const schemaSql = fs.readFileSync(
      path.join(migrationsDir, '20260925000001_create_cefr_platform_schema.sql'),
      'utf-8'
    );
    expect(schemaSql).toMatch(/REFERENCES\s+auth\.users\(id\)\s+ON\s+DELETE\s+CASCADE/i);
  });

  it('should verify questions table uses explicit parent FKs and single parent check constraint', () => {
    const schemaSql = fs.readFileSync(
      path.join(migrationsDir, '20260925000001_create_cefr_platform_schema.sql'),
      'utf-8'
    );
    expect(schemaSql).toMatch(/grammar_topic_id\s+UUID\s+NULL\s+REFERENCES\s+public\.grammar_topics\(id\)\s+ON\s+DELETE\s+SET\s+NULL/i);
    expect(schemaSql).toMatch(/reading_passage_id\s+UUID\s+NULL\s+REFERENCES\s+public\.reading_passages\(id\)\s+ON\s+DELETE\s+SET\s+NULL/i);
    expect(schemaSql).toMatch(/listening_exercise_id\s+UUID\s+NULL\s+REFERENCES\s+public\.listening_exercises\(id\)\s+ON\s+DELETE\s+SET\s+NULL/i);
    expect(schemaSql).toMatch(/CONSTRAINT\s+chk_single_parent_content\s+CHECK\s*\(\s*num_nonnulls\(/i);
  });

  it('should verify context integrity constraint on user_question_attempts', () => {
    const schemaSql = fs.readFileSync(
      path.join(migrationsDir, '20260925000001_create_cefr_platform_schema.sql'),
      'utf-8'
    );
    expect(schemaSql).toMatch(/chk_attempt_context_integrity\s+CHECK\s*\(\s*\(context_type\s*=\s*'mock_exam'\s+AND\s+context_attempt_id\s+IS\s+NOT\s+NULL\)/i);
  });

  it('should verify partial unique index on contextual question attempts in indexes migration', () => {
    const indexSql = fs.readFileSync(
      path.join(migrationsDir, '20260925000002_create_indexes.sql'),
      'utf-8'
    );
    expect(indexSql).toMatch(/CREATE\s+UNIQUE\s+INDEX\s+(IF\s+NOT\s+EXISTS\s+)?uq_attempt_question\s+ON\s+public\.user_question_attempts\s*\(context_attempt_id,\s*question_id\)\s+WHERE\s+context_attempt_id\s+IS\s+NOT\s+NULL/i);
    expect(indexSql).toMatch(/idx_user_mock_exam_attempts_mock_exam_id\s+ON\s+public\.user_mock_exam_attempts\s*\(mock_exam_id\)/i);
  });

  it('should verify all 20 application tables have RLS enabled in rls migration', () => {
    const rlsSql = fs.readFileSync(
      path.join(migrationsDir, '20260925000003_create_rls_policies.sql'),
      'utf-8'
    );

    for (const table of EXPECTED_20_TABLES) {
      const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
      expect(rlsRegex.test(rlsSql), `Missing RLS enable statement for: ${table}`).toBe(true);
    }
  });

  it('should verify user tables are strictly SELECT-only for authenticated clients (no direct client writes)', () => {
    const rlsSql = fs.readFileSync(
      path.join(migrationsDir, '20260925000003_create_rls_policies.sql'),
      'utf-8'
    );

    // Verify user_profiles: SELECT only, no client UPDATE
    expect(rlsSql).toMatch(/CREATE\s+POLICY\s+"Users can read own profile"\s+ON\s+public\.user_profiles\s+FOR\s+SELECT/i);
    expect(rlsSql).not.toMatch(/CREATE\s+POLICY\s+"Users can update own profile"/i);
    expect(rlsSql).not.toMatch(/ON\s+public\.user_profiles\s+FOR\s+UPDATE\s+TO\s+authenticated/i);

    // Verify user_vocabulary_mastery: SELECT only, no client INSERT or UPDATE
    expect(rlsSql).toMatch(/CREATE\s+POLICY\s+"Users can read own vocabulary mastery"\s+ON\s+public\.user_vocabulary_mastery\s+FOR\s+SELECT/i);
    expect(rlsSql).not.toMatch(/CREATE\s+POLICY\s+"Users can update own vocabulary mastery"/i);
    expect(rlsSql).not.toMatch(/CREATE\s+POLICY\s+"Users can insert own vocabulary mastery"/i);
    expect(rlsSql).not.toMatch(/ON\s+public\.user_vocabulary_mastery\s+FOR\s+UPDATE\s+TO\s+authenticated/i);
    expect(rlsSql).not.toMatch(/ON\s+public\.user_vocabulary_mastery\s+FOR\s+INSERT\s+TO\s+authenticated/i);

    // Verify user progress, weaknesses, and attempts are SELECT-only
    expect(rlsSql).not.toMatch(/ON\s+public\.user_skill_progress\s+FOR\s+(UPDATE|INSERT|DELETE)\s+TO\s+authenticated/i);
    expect(rlsSql).not.toMatch(/ON\s+public\.user_weaknesses\s+FOR\s+(UPDATE|INSERT|DELETE)\s+TO\s+authenticated/i);
    expect(rlsSql).not.toMatch(/ON\s+public\.user_question_attempts\s+FOR\s+(UPDATE|INSERT|DELETE)\s+TO\s+authenticated/i);
    expect(rlsSql).not.toMatch(/ON\s+public\.user_mock_exam_attempts\s+FOR\s+(UPDATE|INSERT|DELETE)\s+TO\s+authenticated/i);
  });

  it('should verify reference data seed seeds 6 CEFR levels and 6 skills', () => {
    const seedSql = fs.readFileSync(
      path.join(migrationsDir, '20260925000004_seed_reference_data.sql'),
      'utf-8'
    );
    expect(seedSql).toMatch(/'A1'/);
    expect(seedSql).toMatch(/'A2'/);
    expect(seedSql).toMatch(/'B1'/);
    expect(seedSql).toMatch(/'B2'/);
    expect(seedSql).toMatch(/'C1'/);
    expect(seedSql).toMatch(/'C2'/);
    expect(seedSql).toMatch(/'vocabulary'/);
    expect(seedSql).toMatch(/'grammar'/);
    expect(seedSql).toMatch(/'reading'/);
    expect(seedSql).toMatch(/'listening'/);
    expect(seedSql).toMatch(/'writing'/);
    expect(seedSql).toMatch(/'speaking'/);
  });
});

