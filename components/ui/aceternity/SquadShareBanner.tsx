'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Check, Sparkles, UserPlus, ShieldAlert } from 'lucide-react';

interface SquadShareBannerProps {
  className?: string;
  squadName?: string;
  memberCount?: number;
  maxMembers?: number;
}

export const SquadShareBanner: React.FC<SquadShareBannerProps> = ({
  className = '',
  squadName = 'Chula Vanguard',
  memberCount = 3,
  maxMembers = 5,
}) => {
  const [copied, setCopied] = useState(false);
  const [createdNotice, setCreatedNotice] = useState(false);
  const inviteCode = 'GLOVA-SQUAD-9981';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://glova.edu/invite?code=${inviteCode}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateSquad = () => {
    setCreatedNotice(true);
    setTimeout(() => setCreatedNotice(false), 3000);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#070B16]/90 backdrop-blur-md p-6 shadow-xl text-slate-900 dark:text-white ${className}`}
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Squad Status & Mission */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-[#F59E0B]/15 px-3 py-0.5 text-xs font-bold text-amber-700 dark:text-[#FDE68A] border border-amber-500/30 dark:border-[#F59E0B]/30">
              <Users className="h-3.5 w-3.5 text-[#F59E0B]" />
              UNIVERSITY SQUAD
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-[#0B1224] px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              {squadName} ({memberCount}/{maxMembers} คน)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-3 w-3" />
              XP BOOST +25%
            </span>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              ชวนเพื่อนมาตั้งตี้ รับ Boost XP x2 & ปลดล็อกฉายาพิเศษ
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-grotesk max-w-xl">
              รวมกลุ่มฝึกคำศัพท์กับเพื่อนร่วมมหาวิทยาลัย ยิ่งตี้ใหญ่ ยิ่งคูณโบนัส XP สูงสุดถึง 100%
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0B1224] px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-200 dark:hover:bg-white/5 active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-400" />
                <span>คัดลอกลิงก์ตี้</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCreateSquad}
            className="inline-flex items-center gap-2 rounded-xl glova-gold-btn px-5 py-2.5 text-sm font-black text-slate-950 shadow-md transition-all active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4 text-slate-950" />
            <span>{createdNotice ? 'กำลังเปิดหน้าต่าง...' : 'สร้างตี้ใหม่'}</span>
          </button>

        </div>
      </div>
    </div>
  );
};
