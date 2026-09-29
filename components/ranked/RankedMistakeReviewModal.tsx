'use client';

import React, { useState } from 'react';
import { MissedWordReview } from '@/types/ranked';
import { BookOpen, CheckCircle2, XCircle, X, PlusCircle, Check } from 'lucide-react';
import { updateVocabularyMastery } from '@/lib/api/vocabulary-mastery';

interface RankedMistakeReviewModalProps {
  missedWords: MissedWordReview[];
  onClose: () => void;
  userId?: string;
}

export const RankedMistakeReviewModal: React.FC<RankedMistakeReviewModalProps> = ({
  missedWords,
  onClose,
  userId = 'user_current',
}) => {
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const handleAddToReviewQueue = async (word: string) => {
    setIsAdding(word);
    try {
      // Feed into spaced repetition mastery review queue as needs-review
      await updateVocabularyMastery({
        vocabulary_id: word,
        is_correct: false,
      });
      setAddedWords((prev) => new Set(prev).add(word));
    } catch (err) {
      console.error('Failed to add word to review queue:', err);
      // Optimistic addition
      setAddedWords((prev) => new Set(prev).add(word));
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-3xl border border-border/60 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">ทบทวนคำศัพท์ที่ตอบผิด</h3>
              <p className="text-xs text-muted-foreground">ข้อผิดพลาดจากแมตช์แข่งขันช่วยเสริมคลังคำศัพท์ให้แม่นยำขึ้น</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Word Cards Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {missedWords.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-bold text-foreground">ยอดเยี่ยมมาก! ไม่มีคำศัพท์ที่ตอบผิดในรอบนี้</p>
            </div>
          ) : (
            missedWords.map((item, idx) => {
              const isAdded = addedWords.has(item.word);
              return (
                <div
                  key={`missed_${idx}_${item.word}`}
                  className="rounded-2xl border border-border/50 bg-muted/20 p-4 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-foreground">{item.word}</span>
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        CEFR {item.cefrLevel}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isAdded || isAdding === item.word}
                      onClick={() => handleAddToReviewQueue(item.word)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isAdded
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 active:translate-y-0.5'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>บันทึกเข้าคลังทบทวนแล้ว</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>เพิ่มเข้าคลังทบทวน</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Answers compare */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-800 dark:text-rose-200">
                      <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <div>
                        <span className="block text-[10px] font-semibold text-rose-600 dark:text-rose-400">คำตอบที่คุณเลือก:</span>
                        <span className="line-through">{item.chosenAnswer}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">คำตอบที่ถูกต้อง:</span>
                        <span className="font-bold">{item.correctAnswer}</span>
                      </div>
                    </div>
                  </div>

                  {/* English & Thai Meaning */}
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p><span className="font-semibold text-foreground">ความหมายภาษาไทย:</span> {item.thaiMeaning}</p>
                    {item.exampleSentence && (
                      <p className="italic text-muted-foreground/90">"{item.exampleSentence}"</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-muted/60 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-muted active:translate-y-0.5"
          >
            ปิดหน้าต่างทบทวน
          </button>
        </div>
      </div>
    </div>
  );
};
