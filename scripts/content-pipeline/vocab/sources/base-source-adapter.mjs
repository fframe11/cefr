/**
 * Base Source Adapter Interface for External Content Sources
 *
 * Enforces strict normalized evidence schema preserving complete multi-value
 * evidence without collapsing to [0] arrays, and attaching immutable provenance.
 */

import crypto from 'node:crypto';

export class BaseSourceAdapter {
  constructor({ sourceName, sourceVersion, sourceLicense, sourceUrl }) {
    this.sourceName = sourceName;
    this.sourceVersion = sourceVersion;
    this.sourceLicense = sourceLicense;
    this.sourceUrl = sourceUrl;
  }

  computeChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  createEvidenceRecord({
    sourceRecordId,
    originalValue,
    normalizedValue,
    language = 'en',
    partOfSpeech = null,
    senseIdentifier = null,
    definition = null,
    translation = null,
    example = null,
    pronunciation = null,
    collocation = null,
    cefrLevel = null,
    synonyms = [],
    antonyms = [],
    provenance = {},
    checksum = null
  }) {
    return {
      source_name: this.sourceName,
      source_version: this.sourceVersion,
      source_record_id: String(sourceRecordId),
      source_license: this.sourceLicense,
      source_url: this.sourceUrl,
      original_value: originalValue,
      normalized_value: normalizedValue,
      language,
      part_of_speech: partOfSpeech,
      sense_identifier: senseIdentifier,
      definition,
      translation,
      example,
      pronunciation,
      collocation,
      cefr_level: cefrLevel,
      synonyms,
      antonyms,
      provenance: {
        ...provenance,
        source_name: this.sourceName,
        source_version: this.sourceVersion,
        license: this.sourceLicense
      },
      retrieved_at: new Date().toISOString(),
      checksum: checksum || this.computeChecksum(JSON.stringify({ originalValue, senseIdentifier, partOfSpeech }))
    };
  }

  async parse(filePath) {
    throw new Error('parse() must be implemented by subclass');
  }
}
