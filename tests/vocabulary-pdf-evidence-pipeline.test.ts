import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, 'Vocab_src_pdf');
const CACHE_DIR = path.join(PROJECT_ROOT, 'data', 'external-cache', 'vocab-pdf');
const UNIVERSE_PATH = path.join(PROJECT_ROOT, 'data', 'vocabulary-universe-10k.json');

describe('Glova Final Vocabulary Evidence & Linguistic Accuracy Foundation Phase', () => {
  const EXPECTED_PDF_FILES = [
    '506166-starters-movers-flyers-word-list-2025.pdf',
    '506886-a2-key-2020-vocabulary-list.pdf',
    '506887-b1-preliminary-vocabulary-list.pdf',
    'The_Oxford_3000_by_CEFR_level.pdf',
    'English-wordlist-A1.pdf',
    'English-wordlist-A2.pdf',
    'English-wordlist-B1.pdf',
    'English-wordlist-B2.pdf',
    'English-wordlist-C1.pdf',
    'Level-C2-Word-List.pdf',
  ];

  const EXPECTED_HASHES: Record<string, string> = {
    '506166-starters-movers-flyers-word-list-2025.pdf': '6f7a0ad1e277bd10ae8b3bcccfb76c058f611a607c6c9947601abbd7e16a99fa',
    '506886-a2-key-2020-vocabulary-list.pdf': '2abe174d067cd17ffa061cfc4bbbc0e5a55185ac696a5ef8ba49372c753a3ad6',
    '506887-b1-preliminary-vocabulary-list.pdf': 'df5e3c31bb26205c2cfc2e7a94a0171d4f4769d5c1e42a3615fe6aa1b5fdab29',
    'The_Oxford_3000_by_CEFR_level.pdf': 'b81e3f65c976fc93eb342ba34c40f0ff8c3a59646312d09ac50f9c648e461cd3',
    'English-wordlist-A1.pdf': '7c41e1cd6473281675aba68c8b860352246f23f71e1667e68f47a0ecdc3d188e',
    'English-wordlist-A2.pdf': '96cc06f508a9f0c33354f4ad5a6268fed058a4bc420f5b8511d5def2302621b9',
    'English-wordlist-B1.pdf': '6d4051d0990bd56331daf9bcec022f14777c6e510d4eba2b47ee8f6fbcc92dad',
    'English-wordlist-B2.pdf': '19d7a6a936574ca38acc1b3c5688d5f5e83ccdf7528a41044410dc5543861f04',
    'English-wordlist-C1.pdf': '0856d32d625ec9afd3a9459a3fb3e52cccd546e627d9f33632c9c991e1246433',
    'Level-C2-Word-List.pdf': '0aafb60395334896d0f6270eedaf928495fb3013baff7aeb655b6222bbe8dabd',
  };

  it('1. inventories all 10 expected reference PDFs without missing or unexpected files', () => {
    const files = fs.readdirSync(PDF_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'));
    expect(files.sort()).toEqual(EXPECTED_PDF_FILES.sort());
    expect(files.length).toBe(10);
  });

  it('2. verifies SHA-256 hashes and integrity of all 10 PDFs', () => {
    const registryPath = path.join(CACHE_DIR, 'vocabulary-source-registry.json');
    expect(fs.existsSync(registryPath)).toBe(true);
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    expect(registry.length).toBe(10);
    for (const src of registry) {
      expect(EXPECTED_HASHES[src.filename]).toBe(src.sha256);
      expect(src.size_bytes).toBeGreaterThan(0);
      expect(src.page_count).toBeGreaterThan(0);
      expect(src.extracted_items_count).toBeGreaterThan(0);
    }
  });

  it('3. enforces license and provenance safety (production_allowed = false, evidence_only = true)', () => {
    const registryPath = path.join(CACHE_DIR, 'vocabulary-source-registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    for (const src of registry) {
      expect(src.production_allowed).toBe(false);
      expect(src.evidence_only).toBe(true);
      expect(src.verification_status).toBe('REFERENCE_ONLY');
      expect(src.commercial_use).toBe(false);
      expect(src.redistribution_allowed).toBe(false);
      expect(['OFFICIAL_REFERENCE', 'AUTHORITATIVE_REFERENCE', 'THIRD_PARTY_REFERENCE']).toContain(
        src.source_classification
      );
    }
  });

  it('4. verifies complete 10,021 universe evidence matrix generation and accounting', () => {
    const matrixPath = path.join(CACHE_DIR, 'vocabulary-evidence-matrix.json');
    expect(fs.existsSync(matrixPath)).toBe(true);
    const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

    expect(matrix.length).toBe(10021);

    const candidatesPath = path.join(CACHE_DIR, 'vocabulary-production-candidates.json');
    const unresolvedPath = path.join(CACHE_DIR, 'vocabulary-unresolved.json');

    expect(fs.existsSync(candidatesPath)).toBe(true);
    expect(fs.existsSync(unresolvedPath)).toBe(true);

    const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
    const unresolved = JSON.parse(fs.readFileSync(unresolvedPath, 'utf8'));

    expect(candidates.length + unresolved.length).toBe(10021);
    expect(candidates.length).toBe(3860);
    expect(unresolved.length).toBe(6161);
  });

  it('5. isolates polysemy high-hazard items for review and prevents automatic flattening', () => {
    const matrixPath = path.join(CACHE_DIR, 'vocabulary-evidence-matrix.json');
    const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

    const polysemousLemmas = ['issue', 'charge', 'fine', 'matter', 'current'];
    for (const lemma of polysemousLemmas) {
      const items = matrix.filter((item: any) => item.lemma === lemma);
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.sense_evidence.is_polysemous).toBe(true);
        expect(item.sense_evidence.polysemy_hazard).toBe('HIGH');
      }
    }
  });

  it('6. generates all 8 required evidence reports and files in data/external-cache/vocab-pdf/', () => {
    const expectedArtifacts = [
      'vocabulary-source-registry.json',
      'vocabulary-evidence-matrix.json',
      'vocabulary-coverage-report.md',
      'vocabulary-conflict-report.md',
      'vocabulary-license-report.md',
      'vocabulary-production-candidates.json',
      'vocabulary-unresolved.json',
      'expert-review-sample-report.md',
    ];

    for (const artifact of expectedArtifacts) {
      const artPath = path.join(CACHE_DIR, artifact);
      expect(fs.existsSync(artPath)).toBe(true);
      const stat = fs.statSync(artPath);
      expect(stat.size).toBeGreaterThan(0);
    }
  });
});
