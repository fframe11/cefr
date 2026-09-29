/**
 * Game Level Progression Engine
 * Completely distinct from CEFR academic levels (A1-C2).
 * Level 1 begins at 0 XP. Each subsequent level requires progressively more XP.
 */

export interface LevelProgress {
  level: number;
  currentLevelBaseXp: number;
  nextLevelBaseXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
}

/**
 * Cumulative XP required to achieve level N:
 * Level 1 = 0
 * Level 2 = 100
 * Level 3 = 250
 * Level 4 = 450
 * Level 5 = 700
 * General formula: BaseXP(N) = 25 * (N - 1) * (N + 2)
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(25 * (level - 1) * (level + 2));
}

export function calculateGameLevel(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, Math.floor(totalXp || 0));

  let level = 1;
  while (xpForLevel(level + 1) <= safeXp) {
    level++;
    if (level >= 100) break; // Level cap
  }

  const currentLevelBaseXp = xpForLevel(level);
  const nextLevelBaseXp = xpForLevel(level + 1);
  const xpInCurrentLevel = safeXp - currentLevelBaseXp;
  const xpNeededForNextLevel = nextLevelBaseXp - currentLevelBaseXp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / Math.max(1, xpNeededForNextLevel)) * 100))
  );

  return {
    level,
    currentLevelBaseXp,
    nextLevelBaseXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}
