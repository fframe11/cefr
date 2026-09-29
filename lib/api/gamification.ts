import {
  UserGameProfile,
  Achievement,
  RankingSeasonInfo,
  CompetitionQuestionClient,
  CompetitionAnswerResult,
  CompetitionSummary,
  PublicUserProfile,
  InviteInfo,
  XPEventSource,
} from '../../types/gamification';

export async function fetchGamificationProfile(userId?: string): Promise<UserGameProfile> {
  const url = userId ? `/api/gamification/profile?userId=${encodeURIComponent(userId)}` : '/api/gamification/profile';
  const res = await fetch(url);
  const data = await res.json();
  return data.data;
}

export async function recordLearningXP(params: {
  userId: string;
  source: XPEventSource;
  sourceId?: string;
  multiplier?: number;
  bonus?: number;
}) {
  const res = await fetch('/api/gamification/xp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function fetchAchievements(userId?: string): Promise<Achievement[]> {
  const url = userId ? `/api/gamification/achievements?userId=${encodeURIComponent(userId)}` : '/api/gamification/achievements';
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

export async function fetchLeaderboard(filter: 'weekly' | 'monthly' | 'friends' = 'weekly', userId?: string): Promise<RankingSeasonInfo> {
  const url = `/api/ranking?filter=${filter}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data;
}

export async function startCompetition(userId?: string): Promise<{ sessionId: string; initialQuestion: CompetitionQuestionClient }> {
  const res = await fetch('/api/competition/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  return data.data;
}

export async function submitCompetitionAnswer(params: {
  sessionId: string;
  userId: string;
  questionId: string;
  selectedOption: string;
}): Promise<CompetitionAnswerResult> {
  const res = await fetch('/api/competition/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Submission failed');
  }
  return data.data;
}

export async function finishCompetition(sessionId: string, userId: string): Promise<CompetitionSummary> {
  const res = await fetch('/api/competition/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, userId }),
  });
  const data = await res.json();
  return data.data;
}

export async function searchLearners(query: string, userId?: string): Promise<PublicUserProfile[]> {
  const res = await fetch(`/api/social/friends?search=${encodeURIComponent(query)}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchSocialSummary(userId?: string) {
  const res = await fetch(`/api/social/friends${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`);
  const data = await res.json();
  return data.data;
}

export async function sendFriendRequest(userId: string, targetUserId: string) {
  const res = await fetch('/api/social/friends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'send', userId, targetUserId }),
  });
  return res.json();
}

export async function acceptFriendRequest(userId: string, requestId: string) {
  const res = await fetch('/api/social/friends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'accept', userId, requestId }),
  });
  return res.json();
}

export async function fetchInviteInfo(userId?: string): Promise<InviteInfo> {
  const res = await fetch(`/api/social/invite${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`);
  const data = await res.json();
  return data.data;
}
