/**
 * GLOVA RANKED CLIENT API SDK
 * Safe client wrappers for competitive ranked routes.
 */

import {
  CompetitiveGameMode,
  ClientRankedQuestion,
  QuestionSubmissionResult,
  RankedMatchResult,
  RankedProfile,
  RankedLeaderboardEntry,
  TierInfo,
} from '@/types/ranked';

export async function fetchRankedProfile(userId: string = 'user_current'): Promise<{
  profile: RankedProfile;
  tierInfo: { tier: string; division: string; threshold: any };
  progress: { percent: number; current: number; max: number };
  season: any;
} | null> {
  try {
    const res = await fetch(`/api/ranked/profile?userId=${encodeURIComponent(userId)}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function startRankedMatchmaking(mode: CompetitiveGameMode = 'vocabulary', userId: string = 'user_current'): Promise<{
  status: 'QUEUED' | 'MATCHED';
  matchId?: string;
  match?: any;
} | null> {
  try {
    const res = await fetch('/api/ranked/matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enqueue', mode, userId }),
    });
    const json = await res.json();
    return json.success ? json : null;
  } catch {
    return null;
  }
}

export async function pollRankedMatchmaking(userId: string = 'user_current'): Promise<{
  status: 'SEARCHING' | 'MATCHED';
  matchId?: string;
  match?: any;
} | null> {
  try {
    const res = await fetch('/api/ranked/matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'poll', userId }),
    });
    const json = await res.json();
    return json.success ? json : null;
  } catch {
    return null;
  }
}

export async function cancelRankedMatchmaking(userId: string = 'user_current'): Promise<boolean> {
  try {
    const res = await fetch('/api/ranked/matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', userId }),
    });
    const json = await res.json();
    return json.success && json.cancelled;
  } catch {
    return false;
  }
}

export async function fetchRankedQuestion(matchId: string, userId: string = 'user_current'): Promise<ClientRankedQuestion | null> {
  try {
    const res = await fetch(`/api/ranked/question?matchId=${encodeURIComponent(matchId)}&userId=${encodeURIComponent(userId)}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function submitRankedAnswer(params: {
  matchId: string;
  chosenIndex: number;
  sessionToken: string;
  userId?: string;
}): Promise<QuestionSubmissionResult | null> {
  try {
    const res = await fetch('/api/ranked/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function finishRankedMatch(matchId: string, userId: string = 'user_current'): Promise<RankedMatchResult | null> {
  try {
    const res = await fetch('/api/ranked/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, userId }),
    });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function fetchRankedLeaderboard(filter: 'global' | 'friends' | 'university' = 'global', userId: string = 'user_current'): Promise<{
  top3: RankedLeaderboardEntry[];
  entries: RankedLeaderboardEntry[];
  currentUserEntry: RankedLeaderboardEntry;
  totalParticipants: number;
} | null> {
  try {
    const res = await fetch(`/api/ranked/leaderboard?filter=${filter}&userId=${encodeURIComponent(userId)}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}
