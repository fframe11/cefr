import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Lock, Mail, Award, Flame, Check, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CambridgeExamCode } from '../../types';
import { LoadingSpinner } from './LoadingSpinner';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocalTargetExam: CambridgeExamCode;
  currentLocalDailyGoal: number;
  onProfileUpdated?: (updated: { targetExam: CambridgeExamCode; dailyGoalMinutes: number }) => void;
}

const CAMBRIDGE_EXAMS: { code: CambridgeExamCode; name: string; cefr: string }[] = [
  { code: 'KET', name: 'A2 Key (KET)', cefr: 'A2' },
  { code: 'PET', name: 'B1 Preliminary (PET)', cefr: 'B1' },
  { code: 'FCE', name: 'B2 First (FCE)', cefr: 'B2' },
  { code: 'CAE', name: 'C1 Advanced (CAE)', cefr: 'C1' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentLocalTargetExam,
  currentLocalDailyGoal,
  onProfileUpdated,
}) => {
  const { status, user, profile, signInWithPassword, signUpWithPassword, signOut, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Edit State
  const [selectedExam, setSelectedExam] = useState<CambridgeExamCode>(currentLocalTargetExam);
  const [dailyGoal, setDailyGoal] = useState<number>(currentLocalDailyGoal);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Sync profile fields from context or local props
  useEffect(() => {
    if (profile) {
      setSelectedExam(profile.target_exam);
      setDailyGoal(profile.daily_goal_minutes);
    } else {
      setSelectedExam(currentLocalTargetExam);
      setDailyGoal(currentLocalDailyGoal);
    }
  }, [profile, currentLocalTargetExam, currentLocalDailyGoal]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (activeTab === 'signin') {
        const { error } = await signInWithPassword(email, password);
        if (error) {
          setAuthError(error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } else {
          onClose();
        }
      } else {
        const { error } = await signUpWithPassword(email, password);
        if (error) {
          setAuthError(error.message || 'ไม่สามารถลงทะเบียนได้');
        } else {
          setProfileSuccessMsg('ลงทะเบียนสำเร็จและเข้าสู่ระบบเรียบร้อย');
          setTimeout(() => onClose(), 1200);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setAuthError(null);

    try {
      if (status === 'authenticated') {
        await updateProfile({
          target_exam: selectedExam,
          daily_goal_minutes: dailyGoal,
        });
      }

      if (onProfileUpdated) {
        onProfileUpdated({
          targetExam: selectedExam,
          dailyGoalMinutes: dailyGoal,
        });
      }

      setProfileSuccessMsg('บันทึกการตั้งค่าเป้าหมายเรียบร้อย');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch (err: any) {
      setAuthError(err?.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UserIcon className="w-4 h-4" />
            </div>
            <h2 id="profile-modal-title" className="text-base font-semibold text-foreground">
              {status === 'authenticated' ? 'โปรไฟล์และการตั้งค่า' : 'เข้าสู่ระบบ / บัญชีผู้ใช้'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors touch-target"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authenticated User View */}
        {status === 'authenticated' && user ? (
          <div className="space-y-4">
            {/* Identity Banner */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">เข้าสู่ระบบด้วย</p>
              <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
            </div>

            {/* Server-Owned Read-Only Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">ระดับภาษา CEFR</p>
                  <p className="text-sm font-bold text-foreground">
                    {profile?.current_cefr_level || 'A1'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">สถิติเรียนต่อเนื่อง</p>
                  <p className="text-sm font-bold text-foreground">
                    {profile?.streak_days || 0} วัน
                  </p>
                </div>
              </div>
            </div>

            {/* Client-Editable Settings */}
            <div className="space-y-3.5 pt-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                การตั้งค่าเป้าหมายการเรียน
              </h3>

              {/* Target Exam Selection */}
              <div className="space-y-1.5">
                <label htmlFor="target-exam-select" className="text-xs font-medium text-foreground">
                  ข้อสอบ Cambridge เป้าหมาย
                </label>
                <select
                  id="target-exam-select"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value as CambridgeExamCode)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {CAMBRIDGE_EXAMS.map((exam) => (
                    <option key={exam.code} value={exam.code}>
                      {exam.name} (ระดับ {exam.cefr})
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Goal Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="daily-goal-range" className="font-medium text-foreground">
                    เป้าหมายการฝึกฝนรายวัน
                  </label>
                  <span className="font-bold text-primary">{dailyGoal} นาที/วัน</span>
                </div>
                <input
                  id="daily-goal-range"
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                />
              </div>

              {/* Feedback messages */}
              {profileSuccessMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}
              {authError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors touch-target"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>

                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 touch-target"
                >
                  {isSavingProfile ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Unauthenticated Guest View */
          <div className="space-y-4">
            {/* Guest notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs leading-relaxed space-y-1">
              <p className="font-semibold">กำลังใช้งานในโหมดผู้ใช้ทั่วไป</p>
              <p className="text-[11px] opacity-90">
                ข้อมูลและความก้าวหน้าจะถูกบันทึกไว้ในเบราว์เซอร์นี้ หากต้องการบันทึกถาวรหรือซิงก์ข้ามอุปกรณ์ กรุณาเข้าสู่ระบบ
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setAuthError(null); }}
                className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'signin' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setAuthError(null); }}
                className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'signup' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                ลงทะเบียนใหม่
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">อีเมล</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">รหัสผ่าน</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {profileSuccessMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 touch-target mt-2"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" className="p-0 text-primary-foreground" />
                ) : activeTab === 'signin' ? (
                  'เข้าสู่ระบบ'
                ) : (
                  'สร้างบัญชีผู้ใช้'
                )}
              </button>
            </form>

            {/* Guest Settings Section */}
            <div className="pt-3 border-t border-border/60 space-y-2.5">
              <h4 className="text-xs font-semibold text-muted-foreground">ตั้งค่าเป้าหมายสำหรับ Guest</h4>
              <div className="flex gap-2">
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value as CambridgeExamCode)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground"
                >
                  {CAMBRIDGE_EXAMS.map((exam) => (
                    <option key={exam.code} value={exam.code}>
                      {exam.code}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
                >
                  อัปเดต
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
