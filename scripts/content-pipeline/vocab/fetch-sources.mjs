#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { computeSha256, validateAllSourcesFromManifest } from './core.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
const manifestPath = path.join(projectRoot, 'scripts/content-pipeline/sources/source-manifest.json');

async function downloadFile(url, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
  return {
    bytes: buffer.length,
    sha256: computeSha256(buffer),
  };
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const src of manifest.sources) {
    if (src.source_id === 'oewn') {
      const zipAbs = path.resolve(projectRoot, src.full_archive_local_path);
      console.log(`[fetch] Downloading ${src.source_name} v${src.version} -> ${src.full_archive_local_path}`);
      const dl = await downloadFile(src.download_url, zipAbs);
      if (src.full_archive_sha256 && dl.sha256 !== src.full_archive_sha256) {
        throw new Error(`SHA-256 mismatch for OEWN zip: expected ${src.full_archive_sha256}, got ${dl.sha256}`);
      }

      const extractDir = path.resolve(projectRoot, 'scripts/content-pipeline/sources/oewn/extracted');
      fs.mkdirSync(extractDir, { recursive: true });
      execSync(`tar -xf "${zipAbs}" -C "${extractDir}"`);

      const sensePath = path.join(extractDir, 'oewn2024/index.sense');
      const cefrjPath = path.resolve(
        projectRoot,
        'scripts/content-pipeline/sources/cefr-j/cefrj-vocabulary-profile-1.5.csv'
      );
      const octPath = path.resolve(
        projectRoot,
        'scripts/content-pipeline/sources/octanove/octanove-vocabulary-profile-c1c2-1.0.csv'
      );

      const senseLines = fs.readFileSync(sensePath, 'utf8').trim().split(/\r?\n/);
      const cefrjLines = fs.readFileSync(cefrjPath, 'utf8').trim().split(/\r?\n/).slice(1);
      const octLines = fs.readFileSync(octPath, 'utf8').trim().split(/\r?\n/).slice(1);

      const neededLemmas = new Set();
      for (const line of [...cefrjLines, ...octLines]) {
        const hw = line.split(',')[0].trim().normalize('NFC').toLowerCase();
        for (const variant of hw.split('/')) {
          const clean = variant.trim();
          if (clean) neededLemmas.add(clean);
        }
      }

      const matchedLines = [];
      for (const line of senseLines) {
        const pct = line.indexOf('%');
        if (pct === -1) continue;
        const lemma = line.slice(0, pct).replace(/_/g, ' ').toLowerCase();
        if (neededLemmas.has(lemma)) matchedLines.push(line);
      }

      const outAbs = path.resolve(projectRoot, src.local_path);
      fs.writeFileSync(outAbs, matchedLines.join('\n') + '\n', 'utf8');
      continue;
    }

    const targetAbs = path.resolve(projectRoot, src.local_path);
    console.log(`[fetch] Downloading ${src.source_name} v${src.version} -> ${src.local_path}`);
    await downloadFile(src.download_url, targetAbs);
  }

  const verification = validateAllSourcesFromManifest(manifest, projectRoot);
  if (!verification.valid) {
    console.error('[fetch] Source verification failed:', JSON.stringify(verification, null, 2));
    process.exit(1);
  }
  console.log('[fetch] All 7 GREEN vocabulary sources downloaded and verified against SHA-256 checksums.');
}

main().catch((err) => {
  console.error('[fetch] Fatal error:', err);
  process.exit(1);
});
