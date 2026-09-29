import { Achievement } from '../../types/gamification';

export const ACHIEVEMENTS_CATALOG: Omit<Achievement, 'currentProgress' | 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'ach_first_step',
    code: 'FIRST_STEP',
    titleEn: 'First Steps',
    titleTh: 'ก้าวแรกแห่งการเรียนรู้',
    descEn: 'Complete your first learning activity on Glova.',
    descTh: 'ทำกิจกรรมการเรียนรู้แรกบนแพลตฟอร์มสำเร็จ',
    icon: 'Footprints',
    xpReward: 50,
    category: 'learning',
    maxProgress: 1,
  },
  {
    id: 'ach_vocab_starter',
    code: 'VOCAB_STARTER',
    titleEn: 'Vocabulary Starter',
    titleTh: 'ผู้เริ่มต้นสะสมคำศัพท์',
    descEn: 'Master your first 20 vocabulary items.',
    descTh: 'จดจำคำศัพท์เชี่ยวชาญครบ 20 คำแรก',
    icon: 'BookOpen',
    xpReward: 75,
    category: 'learning',
    maxProgress: 20,
  },
  {
    id: 'ach_vocab_master',
    code: 'VOCAB_MASTER',
    titleEn: 'Lexical Maestro',
    titleTh: 'ปรมาจารย์คลังคำศัพท์',
    descEn: 'Master 100 vocabulary words with high confidence.',
    descTh: 'เชี่ยวชาญคำศัพท์ระดับสูงครบ 100 คำ',
    icon: 'Sparkles',
    xpReward: 150,
    category: 'learning',
    maxProgress: 100,
  },
  {
    id: 'ach_streak_3',
    code: 'STREAK_3',
    titleEn: 'Consistency Spark',
    titleTh: 'ความสม่ำเสมอ 3 วัน',
    descEn: 'Maintain a 3-day continuous learning streak.',
    descTh: 'เข้าเรียนติดต่อกันอย่างต่อเนื่อง 3 วัน',
    icon: 'Flame',
    xpReward: 50,
    category: 'streak',
    maxProgress: 3,
  },
  {
    id: 'ach_streak_7',
    code: 'STREAK_7',
    titleEn: 'Weekly Warrior',
    titleTh: 'สถิติเรียนต่อเนื่อง 7 วัน',
    descEn: 'Maintain a 7-day continuous learning streak.',
    descTh: 'เข้าเรียนต่อเนื่องตลอด 7 วันเต็ม',
    icon: 'Calendar',
    xpReward: 120,
    category: 'streak',
    maxProgress: 7,
  },
  {
    id: 'ach_streak_30',
    code: 'STREAK_30',
    titleEn: 'Habit Champion',
    titleTh: 'แชมเปี้ยน 30 วัน',
    descEn: 'Achieve an unbroken 30-day learning streak.',
    descTh: 'รักษาวินัยการเรียนติดต่อกันครบ 30 วัน',
    icon: 'ShieldCheck',
    xpReward: 300,
    category: 'streak',
    maxProgress: 30,
  },
  {
    id: 'ach_speed_thinker',
    code: 'SPEED_THINKER',
    titleEn: 'Speed Thinker',
    titleTh: 'คิดไวตอบฉับไว',
    descEn: 'Answer 5 competition questions under 2.5 seconds.',
    descTh: 'ตอบคำถามในโหมดแข่งขันเร็วกว่า 2.5 วินาทีครบ 5 ข้อ',
    icon: 'Zap',
    xpReward: 100,
    category: 'competition',
    maxProgress: 5,
  },
  {
    id: 'ach_perfect_round',
    code: 'PERFECT_ROUND',
    titleEn: 'Flawless Victory',
    titleTh: 'ชัยชนะไร้พ่าย',
    descEn: 'Complete a vocabulary competition round with 100% accuracy.',
    descTh: 'ทำแบบทดสอบประลองคำศัพท์ถูก 100% ตลอดทั้งรอบ',
    icon: 'Award',
    xpReward: 150,
    category: 'competition',
    maxProgress: 1,
  },
  {
    id: 'ach_competitor',
    code: 'COMPETITOR',
    titleEn: 'Battle Ready',
    titleTh: 'นักประลองสนามสอบ',
    descEn: 'Complete 5 vocabulary competition battles.',
    descTh: 'ร่วมการประลองคำศัพท์จับเวลาครบ 5 ครั้ง',
    icon: 'Swords',
    xpReward: 100,
    category: 'competition',
    maxProgress: 5,
  },
  {
    id: 'ach_high_roller',
    code: 'HIGH_ROLLER',
    titleEn: 'C1 Apex Climber',
    titleTh: 'ไต่ระดับถึง C1 Expert',
    descEn: 'Climb to adaptive difficulty Stage 5 (C1 level).',
    descTh: 'ตอบถูกต่อเนื่องจนขึ้นสู่ระดับความยากสูงสุด Stage 5',
    icon: 'TrendingUp',
    xpReward: 200,
    category: 'competition',
    maxProgress: 5,
  },
  {
    id: 'ach_social_butterfly',
    code: 'SOCIAL_BUTTERFLY',
    titleEn: 'Study Squad',
    titleTh: 'ก๊วนเพื่อนนักเรียน',
    descEn: 'Add your first study friend or invite a university peer.',
    descTh: 'เพิ่มเพื่อนหรือส่งลิงก์ชวนเพื่อนมาร่วมเรียนรู้',
    icon: 'Users',
    xpReward: 60,
    category: 'social',
    maxProgress: 1,
  },
  {
    id: 'ach_league_champion',
    code: 'LEAGUE_CHAMPION',
    titleEn: 'Podium Finisher',
    titleTh: 'ขึ้นโพเดียม Top 3',
    descEn: 'Finish in the Top 3 of your weekly ranking league.',
    descTh: 'ทำคะแนนติดอันดับ 1-3 บนตารางคะแนนประจำสัปดาห์',
    icon: 'Crown',
    xpReward: 250,
    category: 'competition',
    maxProgress: 1,
  },
];

// Persistent or in-memory map of unlocked achievements per user
const userAchievementsStore = new Map<string, Record<string, { unlockedAt: string; progress: number }>>();

export function getUserAchievements(userId: string): Achievement[] {
  const userUnlocked = userAchievementsStore.get(userId) || {};

  return ACHIEVEMENTS_CATALOG.map((item) => {
    const record = userUnlocked[item.code];
    const isUnlocked = Boolean(record?.unlockedAt);
    const currentProgress = record?.progress ?? (isUnlocked ? item.maxProgress : 0);

    return {
      ...item,
      isUnlocked,
      currentProgress,
      unlockedAt: record?.unlockedAt,
    };
  });
}

export function updateAchievementProgress(
  userId: string,
  code: string,
  incrementBy = 1
): { newlyUnlocked: boolean; achievement?: Achievement } {
  const userUnlocked = userAchievementsStore.get(userId) || {};
  const item = ACHIEVEMENTS_CATALOG.find((a) => a.code === code);
  if (!item) return { newlyUnlocked: false };

  const current = userUnlocked[code] || { progress: 0, unlockedAt: '' };
  if (current.unlockedAt) {
    return { newlyUnlocked: false }; // Already unlocked
  }

  const nextProgress = Math.min(item.maxProgress, current.progress + incrementBy);
  const isNowUnlocked = nextProgress >= item.maxProgress;
  const unlockedAt = isNowUnlocked ? new Date().toISOString() : '';

  userUnlocked[code] = {
    progress: nextProgress,
    unlockedAt,
  };
  userAchievementsStore.set(userId, userUnlocked);

  if (isNowUnlocked) {
    const fullAchievement: Achievement = {
      ...item,
      isUnlocked: true,
      currentProgress: nextProgress,
      unlockedAt,
    };
    return { newlyUnlocked: true, achievement: fullAchievement };
  }

  return { newlyUnlocked: false };
}
