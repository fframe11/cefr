'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GlovaAvatarWithFrame, RANK_FRAME_METADATA } from '../gamification/RankFrame';
import { RankFrameId } from '@/types/gamification';

interface AvatarEditorModalProps {
  currentAvatarUrl: string;
  currentFrameId: RankFrameId;
  onSave: (avatarUrl: string, frameId: RankFrameId) => Promise<void>;
  onClose: () => void;
}

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

const AVAILABLE_FRAMES: RankFrameId[] = [
  'cute_1',
  'cute_2',
  'cute_3',
  'gaming_1',
  'gaming_2',
  'gaming_3',
];

export const AvatarEditorModal: React.FC<AvatarEditorModalProps> = ({
  currentAvatarUrl,
  currentFrameId,
  onSave,
  onClose,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatarUrl);
  const [selectedFrame, setSelectedFrame] = useState<RankFrameId>(currentFrameId);
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
      await onSave(selectedAvatar, selectedFrame);
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
              size="xl"
            />
            <p className="mt-3 text-xs font-semibold text-foreground">
              กรอบปัจจุบัน: {RANK_FRAME_METADATA[selectedFrame]?.nameTh || 'ไม่มีกรอบ'}
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

          {/* Rank Frame Selector */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              3. เลือกกรอบยศประจำตัว (Rank Frame)
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AVAILABLE_FRAMES.map((fId) => {
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
