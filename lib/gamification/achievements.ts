import { Achievement, ItemRarity } from '../../types/gamification';

export const RARITY_PALETTE: Record<ItemRarity, { color: string; bgTint: string; border: string; labelEn: string; labelTh: string }> = {
  common: { color: '#94A3B8', bgTint: 'bg-slate-500/10', border: 'border-slate-400/30', labelEn: 'Common', labelTh: 'ทั่วไป' },
  rare: { color: '#00F0FF', bgTint: 'bg-cyan-500/10', border: 'border-cyan-400/30', labelEn: 'Rare', labelTh: 'หายาก' },
  epic: { color: '#A855F7', bgTint: 'bg-purple-500/10', border: 'border-purple-400/30', labelEn: 'Epic', labelTh: 'เอปิก' },
  legendary: { color: '#F59E0B', bgTint: 'bg-amber-500/10', border: 'border-amber-400/30', labelEn: 'Legendary', labelTh: 'ตำนาน' },
};

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
    rarity: 'common',
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
    rarity: 'common',
    maxProgress: 20,
  },
  {
    id: 'ach_vocab_master',
    code: 'VOCAB_MASTER',
    titleEn: 'Vocabulary Master',
    titleTh: 'ปรมาจารย์คลังคำศัพท์',
    descEn: 'Master 100 vocabulary words with high confidence.',
    descTh: 'เชี่ยวชาญคำศัพท์ระดับสูงครบ 100 คำ',
    icon: 'Sparkles',
    xpReward: 200,
    category: 'learning',
    rarity: 'epic',
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
    rarity: 'rare',
    maxProgress: 3,
  },
  {
    id: 'ach_streak_7',
    code: 'STREAK_7',
    titleEn: '7-Day Streak',
    titleTh: 'สถิติเรียนต่อเนื่อง 7 วัน',
    descEn: 'Maintain a 7-day continuous learning streak.',
    descTh: 'เข้าเรียนต่อเนื่องตลอด 7 วันเต็ม',
    icon: 'Calendar',
    xpReward: 150,
    category: 'streak',
    rarity: 'epic',
    maxProgress: 7,
  },
  {
    id: 'ach_streak_30',
    code: 'STREAK_30',
    titleEn: '30-Day Streak',
    titleTh: 'แชมเปี้ยนเรียน 30 วัน',
    descEn: 'Achieve an unbroken 30-day learning streak.',
    descTh: 'รักษาวินัยการเรียนติดต่อกันครบ 30 วัน',
    icon: 'ShieldCheck',
    xpReward: 400,
    category: 'streak',
    rarity: 'legendary',
    maxProgress: 30,
  },
  {
    id: 'ach_first_ranked',
    code: 'FIRST_RANKED',
    titleEn: 'First Ranked Match',
    titleTh: 'ประเดิมสนามแข่งขันจริง',
    descEn: 'Complete your first competitive ranked battle.',
    descTh: 'ร่วมการประลองคำศัพท์ในโหมดจัดอันดับครั้งแรก',
    icon: 'Swords',
    xpReward: 100,
    category: 'competition',
    rarity: 'rare',
    maxProgress: 1,
  },
  {
    id: 'ach_ranked_win',
    code: 'RANKED_WIN',
    titleEn: 'Ranked Victory',
    titleTh: 'ชัยชนะแรกในสมรภูมิ',
    descEn: 'Win your first competitive ranked vocabulary battle.',
    descTh: 'เอาชนะคู่ต่อสู้ในการแข่งขันโหมดจัดอันดับสำเร็จ',
    icon: 'Trophy',
    xpReward: 125,
    category: 'competition',
    rarity: 'rare',
    maxProgress: 1,
  },
  {
    id: 'ach_perfect_round',
    code: 'PERFECT_ROUND',
    titleEn: 'Perfect Round',
    titleTh: 'รอบประลองสมบูรณ์แบบ',
    descEn: 'Complete a ranked match with 100% correct answers.',
    descTh: 'ทำแบบทดสอบประลองคำศัพท์ถูก 100% ครบทุกข้อ',
    icon: 'Award',
    xpReward: 250,
    category: 'competition',
    rarity: 'epic',
    maxProgress: 1,
  },
  {
    id: 'ach_study_together',
    code: 'STUDY_TOGETHER',
    titleEn: 'Study Together',
    titleTh: 'ก๊วนเพื่อนร่วมเรียนรู้',
    descEn: 'Complete a cooperative learning challenge with a peer.',
    descTh: 'ทำกิจกรรมเรียนรู้ร่วมกับเพื่อนในระบบสังคม',
    icon: 'Users',
    xpReward: 100,
    category: 'social',
    rarity: 'rare',
    maxProgress: 1,
  },
  {
    id: 'ach_friend_challenge',
    code: 'FRIEND_CHALLENGE',
    titleEn: 'Friend Challenge',
    titleTh: 'ท้าดวลเพื่อนสนิท',
    descEn: 'Send or accept a study battle challenge with a friend.',
    descTh: 'ส่งคำท้าหรือตอบรับการประลองภาษาอังกฤษกับเพื่อน',
    icon: 'Zap',
    xpReward: 120,
    category: 'social',
    rarity: 'rare',
    maxProgress: 1,
  },
  {
    id: 'ach_cefr_milestone',
    code: 'CEFR_MILESTONE',
    titleEn: 'CEFR Milestone',
    titleTh: 'ก้าวข้ามระดับ CEFR',
    descEn: 'Reach B2 Independent or higher in English proficiency.',
    descTh: 'ผ่านการประเมินขึ้นสู่ระดับ CEFR B2 หรือสูงกว่า',
    icon: 'TrendingUp',
    xpReward: 350,
    category: 'learning',
    rarity: 'legendary',
    maxProgress: 1,
  },
  {
    id: 'ach_personal_best',
    code: 'PERSONAL_BEST',
    titleEn: 'Personal Best',
    titleTh: 'ทำลายสถิติส่วนบุคคล',
    descEn: 'Answer a question correctly in under 1.5 seconds.',
    descTh: 'ตอบคำถามจับเวลาถูกต้องภายในเวลาไม่เกิน 1.5 วินาที',
    icon: 'Crown',
    xpReward: 150,
    category: 'competition',
    rarity: 'epic',
    maxProgress: 1,
  },
];

// Persistent or in-memory map of unlocked achievements per user
const userAchievementsStore = new Map<string, Record<string, { unlockedAt: string; progress: number }>>();

export function getUserAchievements(userId: string): Achievement[] {
  const userUnlocked = userAchievementsStore.get(userId) || {
    FIRST_STEP: { unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(), progress: 1 },
    VOCAB_STARTER: { unlockedAt: new Date(Date.now() - 86400000).toISOString(), progress: 20 },
    STREAK_3: { unlockedAt: new Date().toISOString(), progress: 3 },
  };

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
