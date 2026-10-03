'use client';

import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, Palette, User, Shield, Smile, Bot, Compass, Wand2 } from 'lucide-react';
import { GlovaAvatarWithFrame, RANK_FRAME_METADATA } from '../gamification/RankFrame';
import { RankFrameId } from '@/types/gamification';
import { resolveDiceBearAvatar } from '@/lib/assets/asset-registry';

interface AvatarEditorModalProps {
  currentAvatarUrl: string;
  currentFrameId: RankFrameId;
  onSave: (avatarUrl: string, frameId: RankFrameId) => Promise<void>;
  onClose: () => void;
}

const DICEBEAR_STYLES = [
  { id: 'lorelei', nameTh: 'ตัวการ์ตูนสดใส', nameEn: 'Lorelei Anime', icon: User },
  { id: 'bottts-neutral', nameTh: 'หุ่นยนต์ไซเบอร์', nameEn: 'Bottts Cyber', icon: Bot },
  { id: 'fun-emoji', nameTh: 'อีโมจิอารมณ์ดี', nameEn: 'Fun Emoji', icon: Smile },
  { id: 'adventurer', nameTh: 'นักผจญภัย RPG', nameEn: 'Adventurer RPG', icon: Compass },
  { id: 'pixel-art', nameTh: 'พิกเซลอาร์ตเรโทร', nameEn: 'Pixel Art', icon: Wand2 },
];

const BG_COLORS = [
  { id: 'b6e3f4', name: 'Pastel Blue', hex: '#b6e3f4' },
  { id: 'c0aede', name: 'Soft Lilac', hex: '#c0aede' },
  { id: 'd1d4f9', name: 'Lavender', hex: '#d1d4f9' },
  { id: 'ffd5dc', name: 'Blush Pink', hex: '#ffd5dc' },
  { id: 'ffdfbf', name: 'Peach Warm', hex: '#ffdfbf' },
  { id: 'b9e8d3', name: 'Mint Glow', hex: '#b9e8d3' },
];

const INITIAL_FRAMES: RankFrameId[] = [
  'cute_1',
  'cute_2',
  'cute_3',
  'gaming_1',
  'gaming_2',
  'gaming_3',
  'lottie_cyber_apex',
  'lottie_solar_radiance',
];

export const AvatarEditorModal: React.FC<AvatarEditorModalProps> = ({
  currentAvatarUrl,
  currentFrameId,
  onSave,
  onClose,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('lorelei');
  const [avatarSeed, setAvatarSeed] = useState<string>(() => `student_${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedBg, setSelectedBg] = useState<string>('c0aede');
  const [selectedFrame, setSelectedFrame] = useState<RankFrameId>(currentFrameId || 'cute_1');
  const [isSaving, setIsSaving] = useState(false);

  // Derive live DiceBear avatar URL
  const activeAvatarUrl = resolveDiceBearAvatar(selectedStyle, avatarSeed, {
    backgroundColor: selectedBg,
  });

  const handleRandomize = () => {
    const randomAdjectives = ['Swift', 'Bright', 'Clever', 'Cyber', 'Starlight', 'Golden', 'Apex', 'Cosmic'];
    const randomNouns = ['Falcon', 'Scholar', 'Champion', 'Hero', 'Spark', 'Wizard', 'Novice', 'Maestro'];
    const adj = randomAdjectives[Math.floor(Math.random() * randomAdjectives.length)];
    const noun = randomNouns[Math.floor(Math.random() * randomNouns.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setAvatarSeed(`${adj}${noun}_${num}`);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await onSave(activeAvatarUrl, selectedFrame);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/40 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">แต่งตัวอวาตาร์และกรอบยศ (Dressing Room)</h3>
              <p className="text-xs text-muted-foreground">สร้างอวาตาร์เฉพาะตัวด้วย DiceBear และเลือกกรอบยศที่ชอบ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            title="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. LIVE AVATAR & FRAME PREVIEW */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="flex flex-col items-center">
              <GlovaAvatarWithFrame
                size="xl"
                avatarUrl={activeAvatarUrl}
                frameId={selectedFrame}
                username="Student"
                showBadge
              />
              <span className="mt-3 text-xs font-bold text-foreground">
                {RANK_FRAME_METADATA[selectedFrame]?.nameTh || 'กรอบยศ'}
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRandomize}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all active:translate-y-0.5"
              >
                <RefreshCw className="h-4 w-4" />
                <span>สุ่มรูปลักษณ์ใหม่ (Randomize)</span>
              </button>
              <div className="text-[11px] text-muted-foreground text-center sm:text-left">
                เมล็ดพันธุ์อวาตาร์: <code className="font-mono text-foreground font-semibold">{avatarSeed}</code>
              </div>
            </div>
          </div>

          {/* 2. AVATAR STYLE SELECTOR */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#FA5D5D]" />
              <span>1. เลือกสไตล์อวาตาร์ (DiceBear Modular Engine)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DICEBEAR_STYLES.map((style) => {
                const IconComponent = style.icon;
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-[#FA5D5D] bg-[#FA5D5D]/10 font-bold text-[#FA5D5D] dark:text-[#FA5D5D] ring-1 ring-[#FA5D5D]/30'
                        : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span className="text-xs truncate">{style.nameTh}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. BACKGROUND COLOR SELECTOR */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-amber-500" />
              <span>2. สีพื้นหลังอวาตาร์</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {BG_COLORS.map((bg) => {
                const isSelected = selectedBg === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setSelectedBg(bg.id)}
                    className={`group relative h-9 w-9 rounded-xl transition-all border ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: bg.hex }}
                    title={bg.name}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 text-slate-800 absolute inset-0 m-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. RANK FRAME SELECTOR (Approved 6 Initial Frames) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-rose-500" />
              <span>3. เลือกสวมใส่กรอบโปรไฟล์ (6 Rank Frames + Lottie)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_FRAMES.map((frameId) => {
                const meta = RANK_FRAME_METADATA[frameId];
                if (!meta) return null;
                const isSelected = selectedFrame === frameId;

                return (
                  <button
                    key={frameId}
                    type="button"
                    onClick={() => setSelectedFrame(frameId)}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 font-bold ring-1 ring-amber-500/30'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs truncate font-semibold text-foreground">
                        {meta.nameTh}
                      </span>
                      <span className="block text-[10px] text-muted-foreground uppercase">
                        {meta.category === 'cute' ? 'หมวดคิ้วท์' : 'หมวดเกมมิ่ง'} • อันดับ {meta.rank}
                      </span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-amber-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border/40 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-50 active:translate-y-0.5"
          >
            {isSaving ? (
              <span>กำลังบันทึก...</span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>บันทึกการแต่งตัว</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
