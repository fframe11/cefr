'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GlovaAvatarWithFrame, RANK_FRAME_METADATA } from '../gamification/RankFrame';
import { RankFrameId } from '@/types/gamification';

interface AvatarEditorModalProps {
  currentAvatarUrl: string;
  currentFrameId: RankFrameId;
  currentCustomFrameUrl?: string;
  onSave: (avatarUrl: string, frameId: RankFrameId, customUrl?: string) => Promise<void>;
  onClose: () => void;
}
import { LOTTIE_FRAME_METADATA, LottieFrameId } from '../gamification/LottieProfileFrame';

// Curated high quality avatars matching Glova university/student brand aesthetic
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80',
];

const LOTTIE_FRAMES: LottieFrameId[] = [
  'lottie_cyber_apex',
  'lottie_solar_radiance',
  'lottie_mystic_emerald',
  'lottie_sakura_starlight',
];

const CLASSIC_FRAMES: RankFrameId[] = [
  'gaming_1',
  'gaming_2',
  'gaming_3',
  'cute_1',
  'cute_2',
  'cute_3',
];

export const AvatarEditorModal: React.FC<AvatarEditorModalProps> = ({
  currentAvatarUrl,
  currentFrameId,
  currentCustomFrameUrl,
  onSave,
  onClose,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatarUrl);
  const [selectedFrame, setSelectedFrame] = useState<RankFrameId>(currentFrameId);
  const [customUrlInput, setCustomUrlInput] = useState<string>(currentCustomFrameUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('รูปภาพมีขนาดใหญ่เกิน 5MB กรุณาเลือกรูปอื่น');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedAvatar, selectedFrame, customUrlInput.trim() || undefined);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/40 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">แก้ไขรูปโปรไฟล์และกรอบยศ</h3>
              <p className="text-xs text-muted-foreground">อัปโหลดรูปของคุณเอง หรือเลือกรูปและกรอบที่ชอบ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Live Preview Center Block */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-muted/20 p-5">
            <GlovaAvatarWithFrame
              avatarUrl={selectedAvatar}
              username="ตัวอย่าง"
              frameId={selectedFrame}
              customAnimationUrl={customUrlInput.trim() || undefined}
              size="xl"
            />
            <p className="mt-3 text-xs font-semibold text-foreground">
              กรอบปัจจุบัน: {customUrlInput.trim() ? 'URL อนิเมชันสาธารณะที่กำหนดเอง' : (RANK_FRAME_METADATA[selectedFrame]?.nameTh || 'ไม่มีกรอบ')}
            </p>
          </div>

          {/* Upload Custom Photo Option */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              1. อัปโหลดรูปภาพของคุณเอง
            </h4>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/[0.04] p-4 text-xs font-bold text-primary transition-all hover:bg-primary/[0.08]"
            >
              <Upload className="h-4 w-4" />
              <span>เลือกไฟล์รูปภาพจากเครื่องของคุณ (JPG, PNG, WebP)</span>
            </button>
          </div>

          {/* Preset Avatars Gallery */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              2. หรือเลือกรูปโปรไฟล์แนะนำ
            </h4>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4">
              {PRESET_AVATARS.map((url, idx) => {
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={`preset_${idx}`}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative overflow-hidden rounded-2xl border-2 p-1 transition-all ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-border/60 hover:border-border'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Avatar preset ${idx + 1}`}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    {isSelected && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lottie Open Source Animated Frames */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. กรอบอนิเมชัน Lottie (Open Source ถูกลิขสิทธิ์ 100%)
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="h-3 w-3" />
                <span>CC / MIT License (ปลอดภัย 100%)</span>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {LOTTIE_FRAMES.map((fId) => {
                const isSelected = selectedFrame === fId;
                const meta = LOTTIE_FRAME_METADATA[fId];
                return (
                  <button
                    key={`lottie_frame_${fId}`}
                    type="button"
                    onClick={() => setSelectedFrame(fId)}
                    className={`flex items-start gap-2.5 rounded-2xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/30 font-bold'
                        : 'border-border/60 hover:border-emerald-500/40 hover:bg-muted/30'
                    }`}
                  >
                    <span
                      className="mt-0.5 h-3.5 w-3.5 rounded-full shrink-0 shadow-sm animate-pulse"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="block text-xs font-bold truncate text-foreground">
                          {meta.nameTh}
                        </span>
                        <span className="rounded bg-background/80 px-1 py-0.5 text-[8px] font-mono text-muted-foreground border border-border/40 shrink-0">
                          Lottie
                        </span>
                      </div>
                      <span className="block text-[10px] text-muted-foreground truncate">
                        {meta.nameEn}
                      </span>
                      <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>Public Animated URL • {meta.license.split(' ')[0]}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Classic SVG Vector Frames */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              4. หรือเลือกกรอบเวกเตอร์ Classic (Vector Halo)
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CLASSIC_FRAMES.map((fId) => {
                const isSelected = selectedFrame === fId;
                const meta = RANK_FRAME_METADATA[fId];
                return (
                  <button
                    key={`frame_${fId}`}
                    type="button"
                    onClick={() => setSelectedFrame(fId)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 font-bold'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] truncate font-semibold text-foreground">
                        {meta.nameTh}
                      </span>
                      <span className="block text-[9px] text-muted-foreground uppercase">
                        {meta.category} • อันดับ {meta.rank}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Custom Public Lottie Animation URL Input */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>5. หรือใส่ URL อนิเมชัน Lottie สาธารณะโดยตรง</span>
              </h4>
              <span className="text-[10px] font-mono text-muted-foreground">JSON / CDN</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              สามารถใส่ Direct URL ของไฟล์ Lottie JSON จาก GitHub, jsdelivr, หรือ CDN สาธารณะที่ปลอดภัย
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://raw.githubusercontent.com/.../data.json"
                className="flex-1 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-mono"
              />
              {customUrlInput && (
                <button
                  type="button"
                  onClick={() => setCustomUrlInput('')}
                  className="rounded-xl px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                  title="ล้างค่า URL"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {customUrlInput.trim().startsWith('http') && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="h-3 w-3" />
                <span>กำลังพรีวิวกรอบจาก URL สาธารณะที่ระบุ</span>
              </p>
            )}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-700 dark:text-amber-300">
              <p className="font-semibold flex items-center gap-1">
                <span>🛡️ ความปลอดภัยลิขสิทธิ์ 100%</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ระบบ Glova อนุญาตเฉพาะไฟล์โอเพนซอร์ส (MIT, CC0, CC-BY) หรือ Public Domain เท่านั้น ห้ามนำ Assets ลิขสิทธิ์ของ Discord หรือ Steam มาใช้
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border/40 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-50"
          >
            {isSaving ? (
              <span>กำลังบันทึก...</span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>บันทึกรูปโปรไฟล์</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
