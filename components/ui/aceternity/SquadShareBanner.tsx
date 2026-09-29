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
      className={`relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 via-card to-background p-6 shadow-sm dark:border-violet-500/30 dark:from-violet-950/20 dark:via-zinc-950/80 dark:to-zinc-900 ${className}`}
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Squad Status & Mission */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/25 dark:text-violet-300">
              <Users className="h-3.5 w-3.5" />
              UNIVERSITY SQUAD
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground font-tech">
              {squadName} ({memberCount}/{maxMembers} คน)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Sparkles className="h-3 w-3" />
              XP BOOST +25%
            </span>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-foreground">
              ชวนเพื่อนมาตั้งตี้ รับ Boost XP x2 & ปลดล็อกฉายาพิเศษ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground font-grotesk max-w-xl">
              รวมกลุ่มฝึกคำศัพท์กับเพื่อนร่วมมหาวิทยาลัย ยิ่งตี้ใหญ่ ยิ่งคูณโบนัส XP สูงสุดถึง 100%
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-xl border border-border/90 bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span>คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span>คัดลอกลิงก์ตี้</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCreateSquad}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            <span>{createdNotice ? 'กำลังเปิดหน้าต่าง...' : 'สร้างตี้ใหม่'}</span>
          </button>

        </div>
      </div>
    </div>
  );
};
