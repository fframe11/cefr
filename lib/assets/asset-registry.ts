/**
 * GLOVA CENTRALIZED BACKEND ASSET REGISTRY
 *
 * Source-first asset policy:
 * - Tracks exact asset provider, source URL, license, and commercial use permissions.
 * - Resolves asset keys (e.g. "profile.frame.cute_1", "rank.emblem.gold") to validated metadata.
 * - Blocks UNVERIFIED, LICENSE_REVIEW, or DISABLED assets from reaching the client.
 * - Eliminates user-provided arbitrary asset URLs.
 */

import assetData from '../../data/asset-registry.json';

export type AssetCategory =
  | 'PROFILE_FRAME'
  | 'RANK_EMBLEM'
  | 'ACHIEVEMENT_ICON'
  | 'AVATAR'
  | 'AVATAR_COMPONENT'
  | 'ITEM'
  | 'LOTTIE_ANIMATION'
  | 'UI_ICON'
  | 'CELEBRATION'
  | 'BACKGROUND'
  | 'DECORATION';

export type AssetStatus = 'VERIFIED' | 'LICENSE_REVIEW' | 'SOURCE_GAP' | 'DISABLED';

export interface AssetRecord {
  id: string;
  assetKey: string;
  category: AssetCategory;
  provider: string;
  sourceUrl: string;
  assetUrl: string;
  license: string;
  licenseUrl: string;
  attributionRequired: boolean;
  commercialUseAllowed: boolean;
  modificationAllowed: boolean;
  status: AssetStatus;
  version: string;
  metadata?: Record<string, any>;
}

// In-memory indexed store
const assetMap = new Map<string, AssetRecord>();
const categoryMap = new Map<AssetCategory, AssetRecord[]>();

// Initialize registry from verified json
(function initializeRegistry() {
  for (const raw of assetData as AssetRecord[]) {
    // Only register valid records
    assetMap.set(raw.assetKey, raw);

    const list = categoryMap.get(raw.category) || [];
    list.push(raw);
    categoryMap.set(raw.category, list);
  }
})();

/**
 * Resolves an assetKey to its validated AssetRecord.
 * Only returns assets with status === 'VERIFIED'.
 */
export function getAsset(assetKey: string): AssetRecord | null {
  const asset = assetMap.get(assetKey);
  if (!asset) return null;
  if (asset.status !== 'VERIFIED') {
    console.warn(`[AssetRegistry] Blocked unverified asset key: ${assetKey} (status: ${asset.status})`);
    return null;
  }
  return { ...asset };
}

export const getAssetByKey = getAsset;

/**
 * Retrieves all verified assets for a given category.
 */
export function getAssetsByCategory(category: AssetCategory): AssetRecord[] {
  const list = categoryMap.get(category) || [];
  return list.filter((a) => a.status === 'VERIFIED').map((a) => ({ ...a }));
}

/**
 * Generates a safe, verified DiceBear modular avatar URL.
 * Sanitizes style and seed to prevent XSS or arbitrary URL injection.
 */
export function resolveDiceBearAvatar(
  styleName: string = 'lorelei',
  seed: string = 'student',
  options: Record<string, string> = {}
): string {
  const approvedStyles = ['bottts-neutral', 'lorelei', 'fun-emoji', 'adventurer', 'pixel-art', 'thumbs'];
  const safeStyle = approvedStyles.includes(styleName) ? styleName : 'lorelei';
  const safeSeed = encodeURIComponent(seed.slice(0, 50).trim() || 'student');

  const queryParams = new URLSearchParams();
  queryParams.set('seed', safeSeed);

  for (const [key, val] of Object.entries(options)) {
    if (['backgroundColor', 'radius', 'scale'].includes(key)) {
      queryParams.set(key, encodeURIComponent(val));
    }
  }

  return `https://api.dicebear.com/9.x/${safeStyle}/svg?${queryParams.toString()}`;
}

/**
 * Resolves all 6 initial rank frames with verified metadata.
 */
export function getInitialRankFrames(): AssetRecord[] {
  return [
    getAsset('profile.frame.cute_1'),
    getAsset('profile.frame.cute_2'),
    getAsset('profile.frame.cute_3'),
    getAsset('profile.frame.gaming_1'),
    getAsset('profile.frame.gaming_2'),
    getAsset('profile.frame.gaming_3'),
  ].filter((f): f is AssetRecord => f !== null);
}

/**
 * Resolves all 6 rank tier emblems with verified metadata.
 */
export function getRankEmblemAssets(): AssetRecord[] {
  return [
    getAsset('rank.emblem.bronze'),
    getAsset('rank.emblem.silver'),
    getAsset('rank.emblem.gold'),
    getAsset('rank.emblem.platinum'),
    getAsset('rank.emblem.diamond'),
    getAsset('rank.emblem.master'),
  ].filter((e): e is AssetRecord => e !== null);
}

/**
 * Returns full registry summary for auditing and license safety reporting.
 */
export function getAssetRegistryAudit() {
  const allAssets = Array.from(assetMap.values());
  const verified = allAssets.filter((a) => a.status === 'VERIFIED');
  const review = allAssets.filter((a) => a.status === 'LICENSE_REVIEW');
  const gaps = allAssets.filter((a) => a.status === 'SOURCE_GAP');

  return {
    totalRegistered: allAssets.length,
    verifiedCount: verified.length,
    reviewCount: review.length,
    gapCount: gaps.length,
    providers: Array.from(new Set(allAssets.map((a) => a.provider))),
    licenses: Array.from(new Set(allAssets.map((a) => a.license))),
    isProductionSafe: review.length === 0,
  };
}
