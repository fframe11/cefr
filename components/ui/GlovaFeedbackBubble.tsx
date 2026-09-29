'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MessageSquareHeart,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Lightbulb,
  Heart,
  Star,
} from 'lucide-react';
import {
  FEEDBACK_BUBBLE_CONFIG,
  FeedbackCategory,
  FeedbackState,
  FeedbackSubmissionPayload,
  GLOVA_MOTION,
  CEFRTier,
} from '@/lib/design-tokens/tokens';
import { useTranslation } from '../../i18n';

export interface GlovaFeedbackBubbleProps {
  currentView?: string;
  currentSkill?: string;
  customTip?: string;
  cefrLevel?: CEFRTier;
  targetExam?: string;
  exerciseId?: string;
  onSubmit?: (payload: FeedbackSubmissionPayload) => Promise<void> | void;
  className?: string;
}

export const GlovaFeedbackBubble: React.FC<GlovaFeedbackBubbleProps> = ({
  currentView = 'general',
  currentSkill,
  customTip,
  cefrLevel,
  targetExam,
  exerciseId,
  onSubmit,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { t, language } = useTranslation();

  // State Machine
  const [state, setState] = useState<FeedbackState>('CLOSED');
  const [category, setCategory] = useState<FeedbackCategory>('CONTENT_ERROR');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bubbleTriggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOpen = state !== 'CLOSED';
  const isSubmitting = state === 'SUBMITTING';
  const isSuccess = state === 'SUCCESS';
  const isError = state === 'ERROR';

  // Keyboard accessibility: ESC closes modal, Trap Tab inside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setState('CLOSED');
        bubbleTriggerRef.current?.focus();
      }

      // Tab trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (state === 'OPEN') {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [state]);

  const handleOpen = () => {
    setState('OPEN');
    setErrorMessage(null);
  };

  const handleClose = () => {
    setState('CLOSED');
    bubbleTriggerRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < FEEDBACK_BUBBLE_CONFIG.minMessageLength) {
      setErrorMessage(`Please enter at least ${FEEDBACK_BUBBLE_CONFIG.minMessageLength} characters.`);
      return;
    }

    const payload: FeedbackSubmissionPayload = {
      category,
      rating,
      message: trimmed,
      includeMetadata,
      metadata: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        view: currentView,
        exerciseId,
        cefrLevel,
        targetExam,
        viewport: {
          width: typeof window !== 'undefined' ? window.innerWidth : 0,
          height: typeof window !== 'undefined' ? window.innerHeight : 0,
        },
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        locale: 'th',
        timestamp: new Date().toISOString(),
      },
    };

    setState('SUBMITTING');
    setErrorMessage(null);

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // UI Shell Simulation (zero backend network call, preserves draft on failure)
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      setState('SUCCESS');
      setMessage('');

      // Auto-collapse after 2.0s
      setTimeout(() => {
        setState('CLOSED');
        bubbleTriggerRef.current?.focus();
      }, 2000);
    } catch (err: any) {
      setState('ERROR');
      setErrorMessage(err?.message || 'Failed to send feedback. Please try again.');
    }
  };

  const getCategoryIcon = (catId: FeedbackCategory) => {
    switch (catId) {
      case 'CONTENT_ERROR':
        return <FileQuestion className="w-3.5 h-3.5" />;
      case 'BUG':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'SUGGESTION':
        return <Lightbulb className="w-3.5 h-3.5" />;
      case 'PRAISE':
        return <Heart className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`fixed z-50 bottom-20 md:bottom-6 right-4 md:right-6 select-none ${className}`}>
      {/* Floating Bubble Trigger */}
      <motion.button
        ref={bubbleTriggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Send feedback to Glova team"
        onClick={isOpen ? handleClose : handleOpen}
        whileHover={shouldReduceMotion ? undefined : GLOVA_MOTION.microInteractions.floatingBubbleHover}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
        transition={GLOVA_MOTION.spring.snappy}
        className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-900/95 dark:bg-slate-900 text-white shadow-xl ring-1 ring-primary/40 border border-white/10 hover:ring-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/80 focus-visible:ring-offset-2 touch-target"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5 text-slate-300" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              key="bubble-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquareHeart className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-slate-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Compact Feedback Modal / Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={GLOVA_MOTION.spring.gentle}
            style={{ transformOrigin: 'bottom right' }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl p-5 overflow-hidden flex flex-col gap-4 text-foreground"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <MessageSquareHeart className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
                <h3 id="feedback-dialog-title" className="text-sm font-bold tracking-tight text-foreground">
                  {t('feedback.title')}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close feedback dialog"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-2 text-emerald-400 animate-in fade-in-50 duration-200">
                <CheckCircle2 className="w-10 h-10" />
                <h4 className="text-base font-bold text-foreground">{t('feedback.success_title')}</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {t('feedback.success_desc')}
                </p>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {/* Category Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {language === 'th' ? 'ประเภทความคิดเห็น' : 'Feedback Category'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FEEDBACK_BUBBLE_CONFIG.categories.map((cat) => {
                      const isSelected = category === cat.id;
                      const catLabel = language === 'en' ? (cat as any).labelEn || cat.labelTh : cat.labelTh;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id as FeedbackCategory)}
                          className={`flex items-center gap-1.5 px-2.5 py-2 text-xs rounded-lg font-medium border text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/40 ring-1 ring-indigo-500/20'
                              : 'bg-secondary/50 text-muted-foreground border-border/40 hover:bg-secondary'
                          }`}
                        >
                          <span className="shrink-0">{getCategoryIcon(cat.id as FeedbackCategory)}</span>
                          <span className="truncate">{catLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {language === 'th' ? 'ความพึงพอใจ' : 'Satisfaction'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`Rate ${star} out of 5 stars`}
                        className="p-1 rounded hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground/40'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <label htmlFor="feedback-message" className="font-semibold">
                      {language === 'th' ? 'ข้อความ / รายละเอียด' : 'Message / Details'}
                    </label>
                    <span className="tabular-nums text-[11px]">
                      {message.length}/{FEEDBACK_BUBBLE_CONFIG.maxMessageLength}
                    </span>
                  </div>
                  <textarea
                    id="feedback-message"
                    ref={textareaRef}
                    rows={3}
                    maxLength={FEEDBACK_BUBBLE_CONFIG.maxMessageLength}
                    placeholder={t('feedback.message_placeholder')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-xs rounded-lg p-2.5 bg-background border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none leading-relaxed"
                  />
                  {errorMessage && (
                    <span className="text-[11px] text-rose-400 font-medium">
                      {errorMessage}
                    </span>
                  )}
                </div>

                {/* Metadata Capture Toggle */}
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="rounded border-border text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span>
                    {t('feedback.attach_metadata', { level: cefrLevel || 'B1' })}
                  </span>
                </label>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/30">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    {t('feedback.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || message.trim().length < FEEDBACK_BUBBLE_CONFIG.minMessageLength}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('feedback.sending')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('feedback.send')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
