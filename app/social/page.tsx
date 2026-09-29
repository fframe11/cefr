'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Share2,
  Copy,
  Sparkles,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import {
  fetchSocialSummary,
  searchLearners,
  sendFriendRequest,
  acceptFriendRequest,
  fetchInviteInfo,
} from '../../lib/api/gamification';
import { PublicUserProfile, FriendRequest, InviteInfo } from '../../types/gamification';
import { GlovaAvatarWithFrame } from '../../components/gamification/RankFrame';
import { SquadShareBanner } from '@/components/ui/aceternity';

export default function SocialPage() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [activeTab, setActiveTab] = useState<'friends' | 'following' | 'followers' | 'requests'>('friends');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PublicUserProfile[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [friends, setFriends] = useState<PublicUserProfile[]>([]);
  const [following, setFollowing] = useState<PublicUserProfile[]>([]);
  const [followers, setFollowers] = useState<PublicUserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const loadData = () => {
    fetchSocialSummary(userId).then((res) => {
      if (res) {
        setFriends(res.friends || []);
        setFollowing(res.following || []);
        setFollowers(res.followers || []);
        setIncomingRequests(res.incomingRequests || []);
        setInvite(res.invite || null);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchLearners(searchQuery, userId);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetId: string) => {
    await sendFriendRequest(userId, targetId);
    setSearchResults((prev) =>
      prev.map((u) => (u.userId === targetId ? { ...u, isFollowing: true } : u))
    );
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(userId, requestId);
    loadData();
  };

  const handleCopyInvite = () => {
    if (!invite?.inviteUrl) return;
    navigator.clipboard.writeText(invite.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* University Squad Referral Banner */}
      <SquadShareBanner squadName="Chula Vanguard" memberCount={3} maxMembers={5} />

      {/* 1. SOCIAL HUB HEADER */}
      <section className="rounded-3xl bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/70 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-display">
                {isEn ? 'Friends & Study Squad' : 'เพื่อนและก๊วนเรียนภาษา'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-grotesk">
                {isEn
                  ? 'Connect with university peers, track study streaks, and invite classmates'
                  : 'เชื่อมต่อกับเพื่อนนักศึกษา ติดตามสถิติการเรียน และร่วมประลองคำศัพท์'}
              </p>
            </div>
          </div>

          {/* Invite Quick Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyInvite}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/90 transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isEn ? 'Copied Link!' : 'คัดลอกลิงก์แล้ว!') : (isEn ? 'Copy Invite Link' : 'คัดลอกลิงก์ชวนเพื่อน')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. SEARCH UNIVERSITY LEARNERS (PRIVACY-SAFE) */}
      <section className="rounded-3xl bg-card border border-border/70 p-5 sm:p-6 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search university students by name or handle...' : 'ค้นหาเพื่อนร่วมเรียนด้วยชื่อ...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
          >
            {isEn ? 'Search' : 'ค้นหา'}
          </button>
        </form>

        {/* Search Results Drawer */}
        {searchResults.length > 0 && (
          <div className="pt-2 divide-y divide-border/40">
            <p className="text-[11px] font-bold text-muted-foreground pb-2">ผลการค้นหา ({searchResults.length})</p>
            {searchResults.map((peer) => (
              <div key={peer.userId} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <GlovaAvatarWithFrame frameId={peer.activeRankFrameId} size="sm">
                    <div className="w-8 h-8 rounded-full bg-secondary text-foreground font-bold text-xs flex items-center justify-center">
                      {peer.displayName.slice(0, 2)}
                    </div>
                  </GlovaAvatarWithFrame>
                  <div>
                    <p className="text-xs font-bold text-foreground">{peer.displayName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Level {peer.gameLevel} • CEFR {peer.cefrLevel}
                    </p>
                  </div>
                </div>

                {peer.isFriend ? (
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> เป็นเพื่อนแล้ว
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendRequest(peer.userId)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all"
                  >
                    + เพิ่มเพื่อน
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. TABS: Friends / Following / Followers / Requests */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/70 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'friends'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isEn ? `Friends (${friends.length})` : `เพื่อน (${friends.length})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'following'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isEn ? `Following (${following.length})` : `กำลังติดตาม (${following.length})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center relative ${
            activeTab === 'requests'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>{isEn ? 'Requests' : 'คำขอ'}</span>
          {incomingRequests.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
              {incomingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. ACTIVE TAB CONTENT LIST */}
      <section className="rounded-3xl bg-card border border-border/70 overflow-hidden shadow-xs">
        {activeTab === 'friends' && (
          <div className="divide-y divide-border/40">
            {friends.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                ยังไม่มีเพื่อนในระบบ ลองค้นหาหรือแชร์ลิงก์ชวนเพื่อน
              </div>
            ) : (
              friends.map((peer) => (
                <div key={peer.userId} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <GlovaAvatarWithFrame frameId={peer.activeRankFrameId} size="md">
                      <div className="w-10 h-10 rounded-full bg-secondary text-foreground font-bold text-xs flex items-center justify-center">
                        {peer.displayName.slice(0, 2)}
                      </div>
                    </GlovaAvatarWithFrame>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-foreground">{peer.displayName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Level {peer.gameLevel} • {peer.weeklyXp} {isEn ? 'XP this week' : 'XP สัปดาห์นี้'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/compete"
                    className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary text-xs font-bold text-foreground transition-all"
                  >
                    {isEn ? 'Battle' : 'ท้าประลอง'}
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="divide-y divide-border/40">
            {incomingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">ไม่มีคำขอเป็นเพื่อนในขณะนี้</div>
            ) : (
              incomingRequests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <GlovaAvatarWithFrame frameId={req.fromUser.activeRankFrameId} size="sm">
                      <div className="w-8 h-8 rounded-full bg-secondary text-foreground font-bold text-xs flex items-center justify-center">
                        {req.fromUser.displayName.slice(0, 2)}
                      </div>
                    </GlovaAvatarWithFrame>
                    <div>
                      <p className="text-xs font-bold text-foreground">{req.fromUser.displayName}</p>
                      <p className="text-[10px] text-muted-foreground">ต้องการเป็นเพื่อนกับคุณ</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
                    >
                      ยอมรับ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
