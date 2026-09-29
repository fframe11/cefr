import { FriendRequest, InviteInfo, PublicUserProfile, DuoStudySession, DuoQuestion } from '../../types/gamification';
import { sampleRandomVocabulary } from '../vocabulary/production-vocabulary';
import { CEFRLevel } from '@/types';

// Canonical active university peer learners for social interactions
const SEED_USERS: PublicUserProfile[] = [
  {
    userId: 'u_peer_01',
    displayName: 'Pimchanok K.',
    gameLevel: 28,
    totalXp: 8900,
    weeklyXp: 1840,
    cefrLevel: 'B2',
    activeRankFrameId: 'cute_1',
    achievementsCount: 9,
    isFriend: true,
  },
  {
    userId: 'u_peer_02',
    displayName: 'Thanathorn V.',
    gameLevel: 25,
    totalXp: 7450,
    weeklyXp: 1690,
    cefrLevel: 'B2',
    activeRankFrameId: 'gaming_1',
    achievementsCount: 8,
    isFollowing: true,
  },
  {
    userId: 'u_peer_03',
    displayName: 'Aomam Chulalongkorn',
    gameLevel: 21,
    totalXp: 5900,
    weeklyXp: 1380,
    cefrLevel: 'B2',
    activeRankFrameId: 'gaming_2',
    achievementsCount: 6,
    isFollower: true,
  },
  {
    userId: 'u_peer_04',
    displayName: 'Kittisak Tech',
    gameLevel: 19,
    totalXp: 5200,
    weeklyXp: 1250,
    cefrLevel: 'B1',
    activeRankFrameId: 'cute_3',
    achievementsCount: 5,
  },
  {
    userId: 'u_peer_05',
    displayName: 'Sarisa Thammasat',
    gameLevel: 18,
    totalXp: 4600,
    weeklyXp: 1110,
    cefrLevel: 'B1',
    activeRankFrameId: 'gaming_3',
    achievementsCount: 5,
  },
];

// In-memory social relationships store
interface UserSocialState {
  friends: Set<string>;
  following: Set<string>;
  followers: Set<string>;
  incomingRequests: FriendRequest[];
  outgoingRequests: Set<string>;
  inviteCode: string;
  invitedCount: number;
}

const socialStates = new Map<string, UserSocialState>();

function getOrCreateSocialState(userId: string): UserSocialState {
  let state = socialStates.get(userId);
  if (!state) {
    state = {
      friends: new Set(['u_peer_01']),
      following: new Set(['u_peer_02']),
      followers: new Set(['u_peer_03']),
      incomingRequests: [
        {
          id: 'req_01',
          fromUser: SEED_USERS[3], // Kittisak
          toUserId: userId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ],
      outgoingRequests: new Set(),
      inviteCode: `GLOVA-${userId.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      invitedCount: 2,
    };
    socialStates.set(userId, state);
  }
  return state;
}

/**
 * Search university learners by public name without exposing emails or private keys
 */
export function searchPublicLearners(query: string, currentUserId: string): PublicUserProfile[] {
  const cleanQuery = (query || '').trim().toLowerCase();
  const state = getOrCreateSocialState(currentUserId);

  return SEED_USERS.filter((user) => {
    if (user.userId === currentUserId) return false;
    if (!cleanQuery) return true;
    return user.displayName.toLowerCase().includes(cleanQuery);
  }).map((user) => ({
    ...user,
    isFriend: state.friends.has(user.userId),
    isFollowing: state.following.has(user.userId),
    isFollower: state.followers.has(user.userId),
  }));
}

/**
 * Send a friend request
 */
export function sendFriendRequest(fromUserId: string, toUserId: string): { success: boolean; message: string } {
  if (fromUserId === toUserId) {
    return { success: false, message: 'Cannot add yourself as a friend' };
  }
  const fromState = getOrCreateSocialState(fromUserId);
  if (fromState.friends.has(toUserId)) {
    return { success: false, message: 'Already friends' };
  }
  fromState.outgoingRequests.add(toUserId);

  const toState = getOrCreateSocialState(toUserId);
  const fromUser = SEED_USERS.find((u) => u.userId === fromUserId) || {
    userId: fromUserId,
    displayName: `Learner_${fromUserId.slice(-4)}`,
    gameLevel: 10,
    totalXp: 2000,
    weeklyXp: 500,
    cefrLevel: 'B1' as const,
    achievementsCount: 3,
  };

  const alreadyRequested = toState.incomingRequests.some((r) => r.fromUser.userId === fromUserId);
  if (!alreadyRequested) {
    toState.incomingRequests.push({
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fromUser,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  return { success: true, message: 'Friend request sent' };
}

/**
 * Accept a friend request
 */
export function acceptFriendRequest(userId: string, requestId: string): { success: boolean; friend?: PublicUserProfile } {
  const state = getOrCreateSocialState(userId);
  const reqIdx = state.incomingRequests.findIndex((r) => r.id === requestId);
  if (reqIdx === -1) {
    return { success: false };
  }

  const req = state.incomingRequests[reqIdx];
  state.incomingRequests.splice(reqIdx, 1);
  state.friends.add(req.fromUser.userId);

  return { success: true, friend: req.fromUser };
}

/**
 * Decline a friend request
 */
export function declineFriendRequest(userId: string, requestId: string): { success: boolean } {
  const state = getOrCreateSocialState(userId);
  const reqIdx = state.incomingRequests.findIndex((r) => r.id === requestId);
  if (reqIdx === -1) {
    return { success: false };
  }
  state.incomingRequests.splice(reqIdx, 1);
  return { success: true };
}

/**
 * Remove a friend
 */
export function removeFriend(userId: string, friendId: string): { success: boolean } {
  const state = getOrCreateSocialState(userId);
  state.friends.delete(friendId);
  return { success: true };
}

/**
 * Toggle follow/unfollow for a user
 */
export function toggleFollowUser(userId: string, targetUserId: string): { following: boolean } {
  const state = getOrCreateSocialState(userId);
  if (state.following.has(targetUserId)) {
    state.following.delete(targetUserId);
    return { following: false };
  } else {
    state.following.add(targetUserId);
    return { following: true };
  }
}

/**
 * Get user invite info
 */
export function getInviteInfo(userId: string, origin = 'http://localhost:3000'): InviteInfo {
  const state = getOrCreateSocialState(userId);
  return {
    inviteCode: state.inviteCode,
    inviteUrl: `${origin}/invite/${state.inviteCode}`,
    invitedCount: state.invitedCount,
    earnedXp: state.invitedCount * 100,
  };
}

/**
 * Get full social overview for a user
 */
export function getUserSocialSummary(userId: string) {
  const state = getOrCreateSocialState(userId);
  const friendsList = SEED_USERS.filter((u) => state.friends.has(u.userId));
  const followingList = SEED_USERS.filter((u) => state.following.has(u.userId));
  const followersList = SEED_USERS.filter((u) => state.followers.has(u.userId));

  return {
    friends: friendsList,
    following: followingList,
    followers: followersList,
    incomingRequests: state.incomingRequests,
    invite: getInviteInfo(userId),
  };
}

// In-memory Duo Study Together sessions
const duoStudySessions = new Map<string, DuoStudySession>();

/**
 * Creates a lightweight Duo Study Together session between two users
 * Sourced directly from verified 3,860 production vocabulary candidates.
 */
export function createDuoStudySession(
  hostUserId: string,
  partnerUserId: string,
  cefrLevel: CEFRLevel = 'B1',
  targetExam = 'PET'
): DuoStudySession {
  const sessionId = `duo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const hostUser = SEED_USERS.find((u) => u.userId === hostUserId) || {
    userId: hostUserId,
    displayName: 'You (Learner)',
    gameLevel: 15,
    totalXp: 3500,
    weeklyXp: 800,
    cefrLevel,
    achievementsCount: 6,
  };

  const partnerUser = SEED_USERS.find((u) => u.userId === partnerUserId) || {
    userId: partnerUserId,
    displayName: 'Study Partner',
    gameLevel: 16,
    totalXp: 3800,
    weeklyXp: 850,
    cefrLevel,
    achievementsCount: 7,
  };

  // Sample 5 vocabulary words from verified 3,860 universe
  const rawWords = sampleRandomVocabulary([cefrLevel], 5);
  const questions: DuoQuestion[] = rawWords.map((w, idx) => {
    // 3 plausible distractors from the same CEFR level
    const distractors = sampleRandomVocabulary([cefrLevel], 10)
      .filter((d) => d.id !== w.id && d.meaning_th !== w.meaning_th)
      .slice(0, 3)
      .map((d) => d.meaning_th);

    while (distractors.length < 3) {
      distractors.push(`ความหมายสำรอง ${distractors.length + 1}`);
    }

    const options = [w.meaning_th, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = options.indexOf(w.meaning_th);

    return {
      id: `duo_q_${idx}_${w.id}`,
      word: w.word,
      meaning_th: w.meaning_th,
      meaning_en: w.meaning_en,
      options,
      correctIndex,
    };
  });

  const session: DuoStudySession = {
    sessionId,
    hostUser,
    partnerUser,
    cefrLevel,
    targetExam,
    status: 'ACTIVE',
    questions,
    hostAnswers: [],
    partnerAnswers: [],
    hostScore: 0,
    partnerScore: 0,
    createdAt: Date.now(),
  };

  duoStudySessions.set(sessionId, session);
  return session;
}

/**
 * Retrieves an active Duo Study Together session
 */
export function getDuoStudySession(sessionId: string): DuoStudySession | null {
  const session = duoStudySessions.get(sessionId);
  return session ? { ...session } : null;
}

/**
 * Records an answer in a Duo Study Together session
 * Computes scores and synchronizes simulated peer response
 */
export function submitDuoAnswer(
  sessionId: string,
  userId: string,
  questionIndex: number,
  chosenIndex: number,
  timeMs: number
): { success: boolean; session?: DuoStudySession; isCorrect?: boolean; feedback?: string } {
  const session = duoStudySessions.get(sessionId);
  if (!session) return { success: false, feedback: 'Session not found' };
  if (session.status === 'COMPLETED') return { success: false, feedback: 'Session already completed' };

  const question = session.questions[questionIndex];
  if (!question) return { success: false, feedback: 'Invalid question index' };

  const isCorrect = chosenIndex === question.correctIndex;
  const isHost = userId === session.hostUser.userId;

  // Score calculation: 100 base + speed bonus up to 50
  const speedBonus = Math.max(0, Math.round((4000 - Math.min(timeMs, 4000)) / 80));
  const pointsAwarded = isCorrect ? 100 + speedBonus : 0;

  if (isHost) {
    session.hostAnswers.push({ questionIndex, isCorrect, timeMs, chosenIndex });
    session.hostScore += pointsAwarded;

    // Simulate partner response if not yet answered
    const partnerAlreadyAnswered = session.partnerAnswers.some((a) => a.questionIndex === questionIndex);
    if (!partnerAlreadyAnswered) {
      // 80% partner accuracy with realistic ~1800ms reaction time
      const partnerCorrect = Math.random() < 0.8;
      const partnerChosen = partnerCorrect
        ? question.correctIndex
        : (question.correctIndex + 1) % question.options.length;
      const partnerTime = Math.floor(1200 + Math.random() * 1400);
      const partnerBonus = Math.max(0, Math.round((4000 - partnerTime) / 80));

      session.partnerAnswers.push({
        questionIndex,
        isCorrect: partnerCorrect,
        timeMs: partnerTime,
        chosenIndex: partnerChosen,
      });
      if (partnerCorrect) {
        session.partnerScore += 100 + partnerBonus;
      }
    }
  } else {
    session.partnerAnswers.push({ questionIndex, isCorrect, timeMs, chosenIndex });
    session.partnerScore += pointsAwarded;
  }

  // Check if session completed (all 5 questions answered by host)
  if (session.hostAnswers.length >= session.questions.length) {
    session.status = 'COMPLETED';
    session.completedAt = Date.now();
  }

  return { success: true, session: { ...session }, isCorrect };
}

