'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  UserMinus,
  BookOpen,
  Zap,
  Award,
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import {
  fetchSocialSummary,
  searchLearners,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  toggleFollow,
  fetchInviteInfo,
  createDuoSession,
  submitDuoSessionAnswer,
} from '../../lib/api/gamification';
import { PublicUserProfile, FriendRequest, InviteInfo, DuoStudySession } from '../../types/gamification';
import { GlovaAvatarWithFrame } from '../../components/gamification/RankFrame';
import { SquadShareBanner } from '@/components/ui/aceternity';
import { CEFRLevel } from '@/types';

export default function SocialPage() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [activeTab, setActiveTab] = useState<'friends' | 'following' | 'requests' | 'study_together'>('friends');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PublicUserProfile[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [friends, setFriends] = useState<PublicUserProfile[]>([]);
  const [following, setFollowing] = useState<PublicUserProfile[]>([]);
  const [followers, setFollowers] = useState<PublicUserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // ================= DUO STUDY TOGETHER STATE =================
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('u_peer_01');
  const [selectedCefr, setSelectedCefr] = useState<CEFRLevel>('B1');
  const [activeDuoSession, setActiveDuoSession] = useState<DuoStudySession | null>(null);
  const [currentDuoIndex, setCurrentDuoIndex] = useState<number>(0);
  const [duoTimeLeftMs, setDuoTimeLeftMs] = useState<number>(4000);
  const [duoSelectedOption, setDuoSelectedOption] = useState<number | null>(null);
  const [isDuoSubmitting, setIsDuoSubmitting] = useState<boolean>(false);
  const [duoFeedback, setDuoFeedback] = useState<{ isCorrect: boolean; correctText: string } | null>(null);

  const duoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const duoStartTimeRef = useRef<number>(Date.now());

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

  const handleDeclineRequest = async (requestId: string) => {
    await declineFriendRequest(userId, requestId);
    loadData();
  };

  const handleRemoveFriend = async (friendId: string) => {
    await removeFriend(userId, friendId);
    loadData();
  };

  const handleToggleFollow = async (targetId: string) => {
    await toggleFollow(userId, targetId);
    loadData();
  };

  const handleCopyInvite = () => {
    if (!invite?.inviteUrl) return;
    navigator.clipboard.writeText(invite.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ================= DUO STUDY METHODS =================
  const startDuoSession = async () => {
    const res = await createDuoSession({
      hostUserId: userId,
      partnerUserId: selectedPartnerId,
      cefrLevel: selectedCefr,
      targetExam: selectedCefr === 'B1' ? 'PET' : selectedCefr === 'B2' ? 'FCE' : 'KET',
    });

    if (res.success && res.data) {
      setActiveDuoSession(res.data);
      setCurrentDuoIndex(0);
      setDuoSelectedOption(null);
      setDuoFeedback(null);
      launchDuoQuestion(0);
    }
  };

  const launchDuoQuestion = (idx: number) => {
    setDuoSelectedOption(null);
    setDuoFeedback(null);
    setDuoTimeLeftMs(4000);
    duoStartTimeRef.current = Date.now();

    if (duoTimerRef.current) clearInterval(duoTimerRef.current);
    duoTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - duoStartTimeRef.current;
      const remaining = Math.max(0, 4000 - elapsed);
      setDuoTimeLeftMs(remaining);

      if (remaining <= 0) {
        if (duoTimerRef.current) clearInterval(duoTimerRef.current);
        handleDuoAnswerSubmit(-1); // Timeout
      }
    }, 50);
  };

  const handleDuoAnswerSubmit = async (chosenIndex: number) => {
    if (!activeDuoSession || isDuoSubmitting) return;
    if (duoTimerRef.current) clearInterval(duoTimerRef.current);

    setIsDuoSubmitting(true);
    setDuoSelectedOption(chosenIndex);

    const timeSpent = Math.min(4000, Date.now() - duoStartTimeRef.current);
    const q = activeDuoSession.questions[currentDuoIndex];

    const res = await submitDuoSessionAnswer({
      sessionId: activeDuoSession.sessionId,
      userId,
      questionIndex: currentDuoIndex,
      chosenIndex,
      timeMs: timeSpent,
    });

    if (res.success && res.session) {
      setActiveDuoSession(res.session);
      setDuoFeedback({
        isCorrect: Boolean(res.isCorrect),
        correctText: q ? q.meaning_th : '',
      });

      // Advance after 1.5s
      setTimeout(() => {
        setIsDuoSubmitting(false);
        const nextIndex = currentDuoIndex + 1;
        if (nextIndex < activeDuoSession.questions.length) {
          setCurrentDuoIndex(nextIndex);
          launchDuoQuestion(nextIndex);
        } else {
          setActiveDuoSession((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null));
        }
      }, 1500);
    } else {
      setIsDuoSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* University Squad Referral Banner */}
      <SquadShareBanner squadName="Chula Vanguard" memberCount={3} maxMembers={5} />

      {/* 1. SOCIAL HUB HEADER */}
      <section className="rounded-3xl bg-white dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs relative overflow-hidden">
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
                  ? 'Connect with university peers, track study streaks, and practice together'
                  : 'เชื่อมต่อกับเพื่อนนักศึกษา ติดตามสถิติการเรียน และร่วมฝึกฝนคำศัพท์'}
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
              placeholder={isEn ? 'Search university students by name...' : 'ค้นหาเพื่อนร่วมเรียนด้วยชื่อ...'}
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
            <p className="text-[11px] font-bold text-muted-foreground pb-2">{isEn ? `Search Results (${searchResults.length})` : `ผลการค้นหา (${searchResults.length})`}</p>
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
                    <UserCheck className="w-3.5 h-3.5" /> {isEn ? 'Friends' : 'เป็นเพื่อนแล้ว'}
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendRequest(peer.userId)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all"
                  >
                    + {isEn ? 'Add Friend' : 'เพิ่มเพื่อน'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. TABS: Friends / Following / Requests / Study Together (Duo) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/70">
        <button
          type="button"
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all text-center ${
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all text-center ${
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all text-center relative ${
            activeTab === 'requests'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>{isEn ? 'Requests' : 'คำขอ'}</span>
          {incomingRequests.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
              {incomingRequests.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('study_together')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center gap-1.5 ${
            activeTab === 'study_together'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isEn ? 'Study Together Duo' : 'เรียนรู้คู่เพื่อนสนิท'}</span>
        </button>
      </div>

      {/* 4. ACTIVE TAB CONTENT LIST */}
      <section className="rounded-3xl bg-card border border-border/70 overflow-hidden shadow-xs">
        {/* TAB 1: FRIENDS */}
        {activeTab === 'friends' && (
          <div className="divide-y divide-border/40">
            {friends.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {isEn ? 'No friends yet. Search for classmates or share your invite link.' : 'ยังไม่มีเพื่อนในระบบ ลองค้นหาหรือแชร์ลิงก์ชวนเพื่อน'}
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPartnerId(peer.userId);
                        setActiveTab('study_together');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{isEn ? 'Study Duo' : 'ชวนเรียนคู่'}</span>
                    </button>
                    <Link
                      href="/compete"
                      className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary text-xs font-bold text-foreground transition-all"
                    >
                      {isEn ? 'Battle' : 'ท้าประลอง'}
                    </Link>
                    <button
                      onClick={() => handleRemoveFriend(peer.userId)}
                      aria-label="Remove friend"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: FOLLOWING */}
        {activeTab === 'following' && (
          <div className="divide-y divide-border/40">
            {following.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {isEn ? 'You are not following any learners yet.' : 'คุณยังไม่ได้ติดตามผู้เรียนคนใด'}
              </div>
            ) : (
              following.map((peer) => (
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
                        Level {peer.gameLevel} • CEFR {peer.cefrLevel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFollow(peer.userId)}
                      className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-rose-600 hover:border-rose-300 text-xs font-bold transition-all"
                    >
                      {isEn ? 'Unfollow' : 'เลิกติดตาม'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: REQUESTS */}
        {activeTab === 'requests' && (
          <div className="divide-y divide-border/40">
            {incomingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {isEn ? 'No pending friend requests.' : 'ไม่มีคำขอเป็นเพื่อนในขณะนี้'}
              </div>
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
                      <p className="text-[10px] text-muted-foreground">
                        {isEn ? 'Sent you a friend request' : 'ต้องการเป็นเพื่อนกับคุณ'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
                    >
                      {isEn ? 'Accept' : 'ยอมรับ'}
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted text-xs font-bold transition-all"
                    >
                      {isEn ? 'Decline' : 'ปฏิเสธ'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: STUDY TOGETHER (DUO) */}
        {activeTab === 'study_together' && (
          <div className="p-6 space-y-6">
            {!activeDuoSession || activeDuoSession.status === 'COMPLETED' ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40">
                  <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    {isEn ? 'Duo Social Learning Room' : 'ห้องเรียนคู่ภาษาอังกฤษ'}
                  </h3>
                  <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-1">
                    {isEn
                      ? 'Pair up with a friend to tackle 5 vocabulary questions together. Compare speeds, review mistakes, and earn bonus XP!'
                      : 'จับคู่กับเพื่อนนักศึกษาทำโจทย์คำศัพท์ 5 ข้อพร้อมกัน เปรียบเทียบความเร็ว และทบทวนข้อผิดพลาดร่วมกัน'}
                  </p>
                </div>

                {/* Configuration Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Partner */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      {isEn ? '1. Select Study Partner' : '1. เลือกเพื่อนร่วมเรียน'}
                    </label>
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-primary/20"
                    >
                      {friends.length > 0 ? (
                        friends.map((f) => (
                          <option key={f.userId} value={f.userId}>
                            {f.displayName} (Level {f.gameLevel})
                          </option>
                        ))
                      ) : (
                        <option value="u_peer_01">Pimchanok K. (Level 28 • Chula)</option>
                      )}
                      <option value="u_peer_02">Thanathorn V. (Level 25 • Thammasat)</option>
                      <option value="u_peer_03">Aomam Chulalongkorn (Level 21)</option>
                    </select>
                  </div>

                  {/* Select Target CEFR */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      {isEn ? '2. Target CEFR Proficiency' : '2. เลือกระดับเป้าหมาย CEFR'}
                    </label>
                    <select
                      value={selectedCefr}
                      onChange={(e) => setSelectedCefr(e.target.value as CEFRLevel)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="A2">A2 Elementary (KET)</option>
                      <option value="B1">B1 Intermediate (PET)</option>
                      <option value="B2">B2 Upper-Intermediate (FCE)</option>
                      <option value="C1">C1 Advanced (CAE)</option>
                    </select>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="button"
                  onClick={startDuoSession}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isEn ? 'Start Duo Study Session (5 Questions)' : 'เริ่มเซสชันเรียนคู่ (5 คำศัพท์)'}</span>
                </button>

                {/* Completed Session Summary (If Just Completed) */}
                {activeDuoSession && activeDuoSession.status === 'COMPLETED' && (
                  <div className="p-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-black text-sm">
                      <Award className="w-5 h-5" />
                      <span>{isEn ? 'Duo Session Completed!' : 'เสร็จสิ้นเซสชันเรียนคู่!'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-xl bg-card border border-border/60">
                        <p className="text-[11px] text-muted-foreground font-bold">{isEn ? 'Your Score' : 'คะแนนของคุณ'}</p>
                        <p className="text-2xl font-black text-foreground mt-0.5">{activeDuoSession.hostScore} pts</p>
                      </div>
                      <div className="p-3 rounded-xl bg-card border border-border/60">
                        <p className="text-[11px] text-muted-foreground font-bold">{activeDuoSession.partnerUser.displayName}</p>
                        <p className="text-2xl font-black text-foreground mt-0.5">{activeDuoSession.partnerScore} pts</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ACTIVE DUO QUIZ ARENA */
              <div className="space-y-6">
                {/* Header info */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 font-bold text-xs">
                      {isEn ? `Question ${currentDuoIndex + 1} of ${activeDuoSession.questions.length}` : `คำถามที่ ${currentDuoIndex + 1} / ${activeDuoSession.questions.length}`}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">CEFR {activeDuoSession.cefrLevel}</span>
                  </div>

                  {/* 4s Timer Bar */}
                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    <span>{(duoTimeLeftMs / 1000).toFixed(1)}s</span>
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-75 ${
                          duoTimeLeftMs < 1500 ? 'bg-rose-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${(duoTimeLeftMs / 4000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Word Prompt */}
                {activeDuoSession.questions[currentDuoIndex] && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Vocabulary</span>
                      <h2 className="text-3xl font-black text-foreground tracking-tight mt-1">
                        {activeDuoSession.questions[currentDuoIndex].word}
                      </h2>
                      <p className="text-xs text-muted-foreground italic mt-1">
                        "{activeDuoSession.questions[currentDuoIndex].meaning_en}"
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeDuoSession.questions[currentDuoIndex].options.map((opt, optIdx) => {
                        const isSelected = duoSelectedOption === optIdx;
                        const isCorrectOpt = optIdx === activeDuoSession.questions[currentDuoIndex].correctIndex;
                        let btnStyle = 'border-border bg-card hover:bg-secondary text-foreground';

                        if (duoFeedback) {
                          if (isCorrectOpt) {
                            btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold';
                          } else if (isSelected && !duoFeedback.isCorrect) {
                            btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isDuoSubmitting || duoFeedback !== null}
                            onClick={() => handleDuoAnswerSubmit(optIdx)}
                            className={`p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {duoFeedback && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {duoFeedback && isSelected && !duoFeedback.isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
