import { FriendRequest, InviteInfo, PublicUserProfile } from '../../types/gamification';

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
  const state = getOrCreateSocialState(fromUserId);
  if (state.friends.has(toUserId)) {
    return { success: false, message: 'Already friends' };
  }
  state.outgoingRequests.add(toUserId);
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
