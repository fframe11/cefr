'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface LockedStudioNoticeProps {
  studioName?: string;
  studioNameEn?: string;
}

export const LockedStudioNotice: React.FC<LockedStudioNoticeProps> = ({
  studioName = 'หมวดการเรียนรู้นี้ยังไม่เปิดให้บริการ',
  studioNameEn = 'This Section is Restricted',
}) => {
  const router = useRouter();
  const { language } = useTranslation();
  const isEn = language === 'en';

  return (
    <div className="w-full max-w-2xl mx-auto my-12 px-4">
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#23212C] border border-slate-200/80 dark:border-white/10 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FA5D5D]" />
            <span>{isEn ? 'Restricted Access' : 'สิทธิ์การเข้าถึงถูกจำกัด'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEn ? studioNameEn : studioName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {isEn
              ? 'This section is currently unavailable. Coming soon. Testers may access the Cambridge Practice Exam showcase.'
              : 'เนื้อหาและคลังแบบทดสอบในส่วนนี้ยังไม่สามารถใช้งานได้ พบกันเร็วๆนี้ สำหรับผู้ทดสอบระบบสามารถเข้าใช้งานได้ในห้องสอบจำลองเคมบริดจ์'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/mock-exams')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Award className="w-4 h-4" />
            <span>{isEn ? 'Go to Cambridge Practice Exam' : 'เข้าสู่ห้องสอบจำลองเคมบริดจ์'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <span>{isEn ? 'Back to Dashboard' : 'กลับหน้าหลัก'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
