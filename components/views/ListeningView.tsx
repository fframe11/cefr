'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LISTENING_BANK } from '../../data/listeningBank';
import { ListeningExercise, Question } from '../../types';
import { AudioPlayer } from '../common/AudioPlayer';
import { QuestionCard } from '../common/QuestionCard';
import {
  Headphones,
  FileText,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Heart,
  Share2,
  Bookmark,
  Pin,
  MoreHorizontal,
  Download,
  Lock,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Layers,
  Award,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Sliders,
  Maximize2,
  Check,
  GraduationCap,
} from 'lucide-react';
import { getListeningExercises, mapListeningDtoToExercise } from '../../lib/api/content/listening';
import { getQuestions, mapQuestionDtoToQuestion } from '../../lib/api/questions';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { GlovaLevelBadge } from '../ui';
import { RemotionPlayerWrapper, ListeningWaveformComposition } from '../remotion';
import { useTranslation } from '../../i18n';
import { useToast } from '../common/Toast';

interface ListeningViewProps {
  onQuestionCompleted?: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
}

type TabType = 'test' | 'files' | 'transcript' | 'feedback' | 'more';

export const ListeningView: React.FC<ListeningViewProps> = ({ onQuestionCompleted }) => {
  let router: { push: (url: string) => void } | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    router = {
      push: (url: string) => {
        if (typeof window !== 'undefined') window.location.href = url;
      },
    };
  }
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { showToast } = useToast();

  // Core Data State
  const [exercises, setExercises] = useState<ListeningExercise[]>(LISTENING_BANK);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(LISTENING_BANK[0]?.id || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseQuestions, setExerciseQuestions] = useState<Record<string, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Piotr Kosmala Video Course Player State
  const [activeTab, setActiveTab] = useState<TabType>('test');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(21);
  const [totalSeconds, setTotalSeconds] = useState(225); // 03:45
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(50);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(248);
  const [isPinned, setIsPinned] = useState(false);
  const [showMarkerTip, setShowMarkerTip] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['listen-a2-airport']);

  // Fetch exercises from API
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListeningExercises({ page: 1, limit: 50 });
      if (res && res.exercises && res.exercises.length > 0) {
        const mapped = res.exercises.map(mapListeningDtoToExercise);
        setExercises(mapped);
        if (!selectedExerciseId || !mapped.some((e) => e.id === selectedExerciseId)) {
          setSelectedExerciseId(mapped[0].id);
        }
      } else {
        setExercises(LISTENING_BANK);
      }
    } catch (err: any) {
      console.warn('[ListeningView] API fetch failed, falling back to static listening bank:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดแบบฝึกหัดฟังจากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      setExercises(LISTENING_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedExerciseId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const currentExercise = useMemo(() => {
    return exercises.find((l) => l.id === selectedExerciseId) || exercises[0] || LISTENING_BANK[0];
  }, [exercises, selectedExerciseId]);

  // Fetch questions for current exercise
  const fetchQuestionsForExercise = useCallback(async (exerciseId: string) => {
    if (exerciseQuestions[exerciseId]) return;
    setLoadingQuestions(true);
    try {
      const res = await getQuestions({ listening_exercise_id: exerciseId });
      if (res && res.questions && res.questions.length > 0) {
        const mapped = res.questions.map(mapQuestionDtoToQuestion);
        setExerciseQuestions((prev) => ({ ...prev, [exerciseId]: mapped }));
      } else {
        const staticExercise = LISTENING_BANK.find((e) => e.id === exerciseId);
        setExerciseQuestions((prev) => ({ ...prev, [exerciseId]: staticExercise?.questions || [] }));
      }
    } catch (err: any) {
      console.warn('[ListeningView] Failed to fetch questions for exercise, using static fallback:', err?.message || err);
      const staticExercise = LISTENING_BANK.find((e) => e.id === exerciseId);
      setExerciseQuestions((prev) => ({ ...prev, [exerciseId]: staticExercise?.questions || [] }));
    } finally {
      setLoadingQuestions(false);
    }
  }, [exerciseQuestions]);

  useEffect(() => {
    if (currentExercise?.id) {
      fetchQuestionsForExercise(currentExercise.id);
      setActiveQuestionIdx(0);
      setPlaybackSeconds(21);
    }
  }, [currentExercise?.id, fetchQuestionsForExercise]);

  const displayedQuestions = (currentExercise && exerciseQuestions[currentExercise.id]) || currentExercise?.questions || [];
  const currentQuestion = displayedQuestions[activeQuestionIdx];

  // Simulated Playback Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000 / selectedSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalSeconds, selectedSpeed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < displayedQuestions.length - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
    } else {
      handleNextChapter();
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx((prev) => prev - 1);
    }
  };

  const handleNextChapter = () => {
    const currentIndex = exercises.findIndex((e) => e.id === currentExercise?.id);
    if (currentIndex !== -1 && currentIndex < exercises.length - 1) {
      const nextId = exercises[currentIndex + 1].id;
      setSelectedExerciseId(nextId);
      setActiveQuestionIdx(0);
      setIsPlaying(false);
      showToast(isEn ? 'Advancing to next lesson chapter' : 'ไปยังบทเรียนถัดไปเรียบร้อยแล้ว', 'info');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited((prev) => !prev);
    setFavoriteCount((prev) => (isFavorited ? prev - 1 : prev + 1));
    showToast(isFavorited ? (isEn ? 'Removed from favorites' : 'นำออกจากรายการโปรดแล้ว') : (isEn ? 'Added to favorites' : 'บันทึกลงรายการโปรดแล้ว'), 'success');
  };

  const handleShareCourse = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(isEn ? 'Course link copied to clipboard' : 'คัดลอกลิงก์บทเรียนเรียบร้อยแล้ว', 'success');
    }
  };

  const handleDownloadFile = (fileName: string) => {
    showToast(isEn ? `Downloading ${fileName}...` : `กำลังดาวน์โหลดเอกสาร ${fileName}...`, 'success');
  };

  // Structured Curriculum Modules (Piotr Kosmala 3-module system)
  const curriculumModules = useMemo(() => {
    return [
      {
        id: 'mod-1',
        title: isEn ? 'Preparation & Foundation' : 'การเตรียมตัวและพื้นฐานภาษา',
        duration: '10:00',
        badgeType: 'free',
        badgeLevel: 'A2 KEY',
        lessons: [
          {
            id: 'listen-a2-airport',
            title: isEn ? 'Airport Flight Announcement' : 'ประกาศเที่ยวบินที่สนามบิน',
            duration: '02:30',
            isComplete: true,
          },
          {
            id: 'listen-a2-hotel',
            title: isEn ? 'Hotel Check-in Dialogue' : 'บทสนทนาเช็กอินโรงแรม',
            duration: '03:15',
            isComplete: true,
          },
          {
            id: 'listen-a2-directions',
            title: isEn ? 'Asking for Street Directions' : 'การถามทางในเมืองหลวง',
            duration: '02:15',
            isComplete: completedLessonIds.includes('listen-a2-directions'),
          },
          {
            id: 'listen-a2-phonics',
            title: isEn ? 'Phonetics & Word Stress' : 'การออกเสียงและการเน้นเสียงหนักเบา',
            duration: '02:00',
            isComplete: false,
          },
        ],
      },
      {
        id: 'mod-2',
        title: isEn ? 'Intermediate Discourse & Podcasts' : 'การฟังระดับกลางและพอดแคสต์สารคดี',
        duration: '15:00',
        badgeType: 'premium',
        badgeLevel: 'B1 PET',
        lessons: [
          {
            id: 'listen-b1-interview',
            title: isEn ? 'Podcast: Sustainable Architecture' : 'พอดแคสต์: สถาปัตยกรรมเพื่อความยั่งยืน',
            duration: '03:45',
            isComplete: completedLessonIds.includes('listen-b1-interview'),
          },
          {
            id: 'listen-b1-climate',
            title: isEn ? 'Environmental Science Debate' : 'การอภิปรายวิทยาศาสตร์สิ่งแวดล้อม',
            duration: '04:15',
            isComplete: false,
          },
          {
            id: 'listen-b1-technology',
            title: isEn ? 'Tech Industry News Brief' : 'รายงานข่าวความก้าวหน้าทางเทคโนโลยี',
            duration: '03:30',
            isComplete: false,
          },
          {
            id: 'listen-b1-travel',
            title: isEn ? 'Cultural Exchange Interview' : 'สัมภาษณ์นักศึกษาแลกเปลี่ยนวัฒนธรรม',
            duration: '03:30',
            isComplete: false,
          },
        ],
      },
      {
        id: 'mod-3',
        title: isEn ? 'Advanced Academic Synthesis & CAE' : 'การสังเคราะห์เชิงวิชาการระดับสูงและข้อสอบเคมบริดจ์',
        duration: '35:00',
        badgeType: 'premium',
        badgeLevel: 'B2 / C1',
        lessons: [
          {
            id: 'listen-b2-lecture',
            title: isEn ? 'University Lecture: Language Evolution' : 'การบรรยายวิชาการ: วิวัฒนาการทางภาษา',
            duration: '08:30',
            isComplete: completedLessonIds.includes('listen-b2-lecture'),
          },
          {
            id: 'listen-c1-monologue',
            title: isEn ? 'Cognitive Science Monologue' : 'บทบรรยายเดี่ยว: ประสาทวิทยาศาสตร์เชิงปัญญา',
            duration: '09:15',
            isComplete: false,
          },
          {
            id: 'listen-c1-mock-full',
            title: isEn ? 'Full Cambridge Timed Listening Simulation' : 'ชุดข้อสอบจำลองการฟังเคมบริดจ์เต็มรูปแบบ',
            duration: '17:15',
            isComplete: false,
          },
        ],
      },
    ];
  }, [isEn, completedLessonIds]);

  return (
    <div className="w-full space-y-6 pb-20 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. TOP BAR / COURSE HEADER (Piotr Kosmala Clean Breadcrumb System) */}
      <nav
        aria-label="Course Navigation Bar"
        className="w-full bg-white dark:bg-[#1E1B28] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 border border-border/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
      >
        {/* Brand & Breadcrumb Route */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-2xl bg-[#FA5D5D] text-white flex items-center justify-center font-black shadow-sm shrink-0">
            <Headphones className="w-5 h-5 text-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
              <span>{isEn ? 'Tutorials' : 'บทเรียน'}</span>
              <span>/</span>
              <span className="text-[#FA5D5D]">{isEn ? 'Courses' : 'คอร์สเรียน'}</span>
              <span>/</span>
              <span>{isEn ? 'Listening Lab' : 'สตูดิโอการฟัง'}</span>
            </div>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
              {isEn ? 'Cambridge English Video Preparation Masterclass' : 'คอร์สเตรียมสอบวิดีโอมาสเตอร์คลาสเคมบริดจ์'}
            </span>
          </div>
        </div>

        {/* Right Badges & User Status */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <span className="px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-xs font-mono font-black uppercase tracking-wider">
            {isEn ? 'Free User' : 'สมาชิกทั่วไป'}
          </span>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-border/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/landing/mondly_tutor_jordan.jpg"
              alt="Learner profile avatar"
              width={26}
              height={26}
              className="w-6.5 h-6.5 rounded-full object-cover"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isEn ? 'Student Portal' : 'ผู้เรียน'}
            </span>
          </div>
        </div>
      </nav>

      {/* Loading state indicator */}
      {loading && exercises.length === 0 && (
        <div className="min-h-[420px] flex items-center justify-center p-12 bg-white dark:bg-[#1E1B28] rounded-[36px] border border-border">
          <LoadingSpinner
            size="lg"
            text={isEn ? 'Loading video courses and modules...' : 'กำลังโหลดคอร์สวิดีโอและหลักสูตร...'}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchExercises} />
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN ASYMMETRIC 2-COLUMN LAYOUT (Piotr Kosmala 70% / 30% Architecture)  */}
      {/* ========================================================================= */}
      {currentExercise && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================================= */}
          {/* LEFT COLUMN: 70% WIDTH (Video Stage + Action Bar + Tabs + Content)     */}
          {/* ======================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* A. 16:9 Video Player Container (Piotr Kosmala Lecture Stage) */}
            <div className="relative w-full aspect-video rounded-[28px] sm:rounded-[36px] overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl group">
              {/* Studio Workspace Photographic Background */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/learning/course_video_monitor.jpg"
                alt="Lecture desk with monitors and headphones in language learning studio"
                className="w-full h-full object-cover object-center filter brightness-95"
                width={1280}
                height={720}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-black/30 to-black/40 pointer-events-none" />

              {/* Top Bar inside Video Frame: Accent & Level Pill */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentExercise.cefrLevel} • {currentExercise.targetExam}</span>
                  </span>
                  {currentExercise.speakerAccents && (
                    <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/90 font-mono text-[11px] font-medium hidden sm:inline-block">
                      {currentExercise.speakerAccents}
                    </span>
                  )}
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-mono font-bold border border-white/15">
                    {formatTime(playbackSeconds)} / {formatTime(totalSeconds)}
                  </span>
                </div>
              </div>

              {/* Side Skip Buttons (Piotr Kosmala Skip 10s Circular Controls) */}
              <button
                type="button"
                onClick={() => setPlaybackSeconds((prev) => Math.max(0, prev - 10))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-20 group-hover:scale-105 active:scale-95"
                aria-label="Skip backward 10 seconds"
              >
                <RotateCcw className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => setPlaybackSeconds((prev) => Math.min(totalSeconds, prev + 10))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-20 group-hover:scale-105 active:scale-95"
                aria-label="Skip forward 10 seconds"
              >
                <RotateCw className="w-5 h-5 text-white" />
              </button>

              {/* Floating Timeline Marker Tooltip (Piotr Kosmala Key Insight / Important Note) */}
              {showMarkerTip && (
                <div className="absolute bottom-20 left-[35%] -translate-x-1/2 z-20 max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/25 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                      IMPORTANT
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMarkerTip(false)}
                      className="text-white/60 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs font-bold leading-snug text-white/95">
                    {isEn
                      ? 'Notice the revised boarding time announcement: Gate B4 at 10:15.'
                      : 'สังเกตจุดสำคัญ: เวลาขึ้นเครื่องใหม่คือ 10:15 น. ที่ประตู B4'}
                  </p>
                  {/* Tooltip Downward Caret Arrow */}
                  <div className="w-3 h-3 bg-black/80 border-r border-b border-white/25 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                </div>
              )}

              {/* Bottom Video Controls Overlay Bar */}
              <div className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent space-y-3">
                {/* Timeline Seekbar with Colored Bookmark Pins */}
                <div className="relative w-full group/seek">
                  {/* Seek Bar Background Track */}
                  <div
                    className="w-full h-1.5 sm:h-2 rounded-full bg-white/20 hover:h-2.5 transition-all cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      setPlaybackSeconds(Math.round(ratio * totalSeconds));
                    }}
                  >
                    {/* Elapsed Progress Fill */}
                    <div
                      className="h-full rounded-full bg-white transition-all relative"
                      style={{ width: `${(playbackSeconds / totalSeconds) * 100}%` }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md absolute right-0 top-1/2 -translate-y-1/2 scale-0 group-hover/seek:scale-100 transition-transform" />
                    </div>

                    {/* Bookmark Pins along Timeline (Piotr Kosmala colored checkpoints) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sky-400 border border-black cursor-pointer shadow-xs"
                      style={{ left: '15%' }}
                      title="Vocabulary Landmark: Heathrow & Delay"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaybackSeconds(Math.round(0.15 * totalSeconds));
                      }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black cursor-pointer shadow-xs"
                      style={{ left: '35%' }}
                      title="Important: Revised Boarding Time"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaybackSeconds(Math.round(0.35 * totalSeconds));
                        setShowMarkerTip(true);
                      }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black cursor-pointer shadow-xs"
                      style={{ left: '65%' }}
                      title="Question 1 Checkpoint"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaybackSeconds(Math.round(0.65 * totalSeconds));
                        setActiveTab('test');
                        setActiveQuestionIdx(0);
                      }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-400 border border-black cursor-pointer shadow-xs"
                      style={{ left: '88%' }}
                      title="Question 2 Checkpoint"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaybackSeconds(Math.round(0.88 * totalSeconds));
                        setActiveTab('test');
                        setActiveQuestionIdx(1);
                      }}
                    />
                  </div>
                </div>

                {/* Transport Buttons & Indicators */}
                <div className="flex items-center justify-between text-white text-xs">
                  {/* Left Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-9 h-9 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold hover:scale-105 transition-transform cursor-pointer"
                      aria-label={isPlaying ? 'Pause lecture' : 'Play lecture'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlaybackSeconds(0)}
                      className="text-white/80 hover:text-white p-1.5 transition-colors cursor-pointer"
                      title="Restart audio"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <span className="font-mono text-xs font-bold text-white/90">
                      {formatTime(playbackSeconds)} / {formatTime(totalSeconds)}
                    </span>
                  </div>

                  {/* Right Controls: Speed, Volume, Fullscreen */}
                  <div className="flex items-center gap-4">
                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/15">
                      {[0.75, 1.0, 1.25].map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => setSelectedSpeed(speed)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                            selectedSpeed === speed ? 'bg-white text-slate-950' : 'text-white/70 hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>

                    {/* Volume with indicator */}
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-white/80" />
                      <div className="w-16 h-1.5 rounded-full bg-white/20 relative hidden sm:block">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${volume}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-white/70">{volume}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast(isEn ? 'Fullscreen mode' : 'โหมดเต็มจอ', 'info')}
                      className="text-white/80 hover:text-white p-1 cursor-pointer"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Action Bar (Piotr Kosmala Favorite, Share, Notes, Pin Row) */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-1 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Favorite Button */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`touch-target px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isFavorited
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      : 'bg-white dark:bg-[#1E1B28] border-border text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isEn ? 'FAVORITE' : 'ถูกใจ'}</span>
                  <span className="text-[11px] font-mono opacity-80">({favoriteCount})</span>
                </button>

                {/* Share Course Button */}
                <button
                  type="button"
                  onClick={handleShareCourse}
                  className="touch-target px-4 py-2 rounded-full bg-white dark:bg-[#1E1B28] border border-border text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'SHARE COURSE' : 'แชร์บทเรียน'}</span>
                </button>

                {/* Contact Creator / Study Notes */}
                <button
                  type="button"
                  onClick={() => showToast(isEn ? 'Personal study notebook opened' : 'เปิดสมุดจดบันทึกการเรียนรู้เรียบร้อยแล้ว', 'info')}
                  className="touch-target px-4 py-2 rounded-full bg-white dark:bg-[#1E1B28] border border-border text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isEn ? 'STUDY NOTES' : 'สมุดจดบันทึก'}</span>
                </button>
              </div>

              {/* Pin & More Options */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinned(!isPinned);
                    showToast(isPinned ? (isEn ? 'Unpinned' : 'ยกเลิกการปักหมุด') : (isEn ? 'Pinned to top' : 'ปักหมุดบทเรียนนี้แล้ว'), 'info');
                  }}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isPinned
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                      : 'bg-white dark:bg-[#1E1B28] border-border text-slate-600 dark:text-slate-400'
                  }`}
                  title="Pin course"
                >
                  <Pin className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => showToast(isEn ? 'Course settings menu' : 'เมนูการตั้งค่าคอร์ส', 'info')}
                  className="p-2 rounded-full bg-white dark:bg-[#1E1B28] border border-border text-slate-600 dark:text-slate-400 hover:border-slate-400 cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* C. Instructor & Next Chapter Row */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/landing/mondly_tutor_kaitlin.jpg"
                    alt="Lead Cambridge Examiner"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-xs"
                  />
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">
                      {isEn ? 'Author:' : 'ผู้สอน:'} <strong className="text-slate-900 dark:text-white font-extrabold">Dr. Sarah Mitchell</strong>
                    </span>
                    <span className="text-[11px] text-[#FA5D5D] font-bold">
                      {isEn ? 'Oxford Faculty • Cambridge Lead Examiner' : 'อาจารย์ภาควิชาออกซ์ฟอร์ด • หัวหน้าผู้ตรวจข้อสอบเคมบริดจ์'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextChapter}
                  className="touch-target px-5 py-2.5 rounded-full border border-sky-500/30 text-sky-700 dark:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>{isEn ? 'NEXT CHAPTER' : 'บทเรียนถัดไป'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentExercise.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {isEn
                    ? 'In this masterclass session, master the art of extracting crucial timetable data, gate adjustments, and conditional delay causes under pressure without getting distracted by background noise.'
                    : 'ในบทเรียนนี้ ฝึกฝนทักษะการจับใจความข้อมูลเวลาที่เปลี่ยนแปลง การเปลี่ยนประตูขึ้นเครื่อง และสาเหตุความล่าช้าจากประกาศทางการ โดยไม่ถูกรบกวนด้วยเสียงประกาศรอบข้าง'}
                </p>
              </div>
            </div>

            {/* D. Segmented Tabs Bar (Piotr Kosmala 5 Tabs: Attached Files, Practice Test, Transcript, etc.) */}
            <div className="flex items-center gap-2 border-b border-border/80 overflow-x-auto pb-px scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('test')}
                className={`touch-target px-4 sm:px-6 py-3 font-extrabold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'test'
                    ? 'border-[#FA5D5D] text-[#FA5D5D]'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>{isEn ? 'Practice Test & Questions' : 'แบบทดสอบและคำถาม'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FA5D5D]/15 text-[#FA5D5D]">
                  {displayedQuestions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('files')}
                className={`touch-target px-4 sm:px-6 py-3 font-extrabold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'files'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{isEn ? 'Attached Files' : 'เอกสารประกอบการเรียน'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300">
                  4
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transcript')}
                className={`touch-target px-4 sm:px-6 py-3 font-extrabold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'transcript'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isEn ? 'Audio Script' : 'บทสนทนา'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('feedback')}
                className={`touch-target px-4 sm:px-6 py-3 font-extrabold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'feedback'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{isEn ? 'Examiner Critique' : 'เกณฑ์ตรวจเคมบริดจ์'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('more')}
                className={`touch-target px-4 sm:px-6 py-3 font-extrabold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'more'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{isEn ? 'Related Courses' : 'คอร์สที่เกี่ยวข้อง'}</span>
              </button>
            </div>

            {/* E. Tab Content Panels */}
            {/* TAB 1: PRACTICE TEST & COMPREHENSION QUESTIONS (NO LLM CHAT!) */}
            {activeTab === 'test' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 px-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#FA5D5D]" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {isEn ? 'Comprehension Practice Assessment' : 'แบบทดสอบวัดความเข้าใจตามแนวทางข้อสอบเคมบริดจ์'}
                    </h3>
                  </div>

                  {displayedQuestions.length > 0 && (
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-mono font-bold bg-white dark:bg-[#1E1B28] px-3.5 py-1 rounded-full border border-border/80 shadow-xs">
                      {isEn
                        ? `Question ${activeQuestionIdx + 1} of ${displayedQuestions.length}`
                        : `ข้อที่ ${activeQuestionIdx + 1} จาก ${displayedQuestions.length}`}
                    </span>
                  )}
                </div>

                {loadingQuestions && displayedQuestions.length === 0 && (
                  <div className="min-h-[220px] flex items-center justify-center p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-border">
                    <LoadingSpinner
                      size="md"
                      text={isEn ? 'Loading comprehension test...' : 'กำลังโหลดข้อสอบวัดผล...'}
                    />
                  </div>
                )}

                {!loadingQuestions && displayedQuestions.length === 0 && (
                  <EmptyState
                    title={isEn ? 'No test questions available for this module yet' : 'ยังไม่มีข้อสอบสำหรับบทเรียนนี้'}
                    description={
                      isEn
                        ? 'Cambridge certified examiners are crafting questions for this session. Please select another audio exercise to continue.'
                        : 'ยังไม่มีข้อสอบสำหรับบทเรียนนี้ในขณะนี้ กรุณาเลือกบทเรียนเสียงอื่นจากแถบด้านบนเพื่อเริ่มฝึกฟัง'
                    }
                  />
                )}

                {currentQuestion && (
                  <div className="space-y-5">
                    <QuestionCard
                      key={currentQuestion.id}
                      question={currentQuestion}
                      questionNumber={activeQuestionIdx + 1}
                      totalQuestions={displayedQuestions.length}
                      onAnswer={(selectedKey, isCorrect) => {
                        onQuestionCompleted?.(currentQuestion.id, isCorrect, currentQuestion.weaknessTag);
                        if (isCorrect && !completedLessonIds.includes(currentExercise.id)) {
                          setCompletedLessonIds((prev) => [...prev, currentExercise.id]);
                        }
                      }}
                      showExplanationImmediately={true}
                    />

                    {/* Question Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handlePrevQuestion}
                        disabled={activeQuestionIdx === 0}
                        className="touch-target px-5 py-2.5 rounded-full bg-white dark:bg-[#1E1B28] border border-border text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{isEn ? 'Previous Question' : 'ข้อก่อนหน้า'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="touch-target px-6 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>
                          {activeQuestionIdx < displayedQuestions.length - 1
                            ? isEn
                              ? 'Next Question'
                              : 'ข้อถัดไป'
                            : isEn
                            ? 'Complete & Next Chapter'
                            : 'เสร็จสิ้นและไปบทถัดไป'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ATTACHED FILES (Piotr Kosmala Free & Premium Downloads) */}
            {activeTab === 'files' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Free Downloads Section */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                    {isEn ? 'FREE DOWNLOADS' : 'เอกสารดาวน์โหลดฟรี'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* File 1: PDF Handout */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1B28] border border-border/80 flex items-center justify-between gap-3 shadow-xs hover:border-sky-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate max-w-[180px]">
                            {isEn ? 'Airport-Flight-Vocabulary.pdf' : 'คำศัพท์ประกาศสนามบิน.pdf'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">12.2 MB</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile('Airport-Flight-Vocabulary.pdf')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {/* File 2: Word Syntax Worksheet */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1B28] border border-border/80 flex items-center justify-between gap-3 shadow-xs hover:border-purple-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate max-w-[180px]">
                            {isEn ? 'Listening-Syntax-Worksheet.docx' : 'ใบงานไวยากรณ์การฟัง.docx'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">4.8 MB</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile('Listening-Syntax-Worksheet.docx')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {/* File 3: Annotated Script */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1B28] border border-border/80 flex items-center justify-between gap-3 shadow-xs hover:border-emerald-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate max-w-[180px]">
                            {isEn ? 'Official-Transcript-Annotated.pdf' : 'บทพูดพร้อมคำอธิบายเฉลย.pdf'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">7.2 MB</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile('Official-Transcript-Annotated.pdf')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Premium Downloads Section (Locked by default) */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                    {isEn ? 'PREMIUM DOWNLOADS' : 'เอกสารเฉพาะสมาชิกระดับพรีเมียม'}
                  </span>
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                          {isEn ? 'Complete-Cambridge-KET-PET-Vault.zip' : 'คลังข้อสอบเคมบริดจ์ฉบับสมบูรณ์.zip'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">17.6 MB • Premium Subscription</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(isEn ? 'Unlocked with Glova Premium' : 'ปลดล็อกด้วยแพ็กเกจ Glova Premium', 'info')}
                      className="px-3.5 py-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
                    >
                      {isEn ? 'Unlock' : 'ปลดล็อก'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO SCRIPT / TRANSCRIPT */}
            {activeTab === 'transcript' && (
              <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {isEn ? 'Full English Audio Transcript' : 'บทพูดภาษาอังกฤษ:'}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    CEFR {currentExercise.cefrLevel} Level Audio
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/80 leading-relaxed text-sm text-slate-800 dark:text-slate-200 font-sans whitespace-pre-line space-y-2">
                  {currentExercise.audioScript || 'No transcript available for this exercise.'}
                </div>

                <div className="pt-2">
                  <AudioPlayer
                    script={currentExercise.audioScript || ''}
                    title={currentExercise.title}
                    accent={currentExercise.speakerAccents}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: EXAMINER CRITIQUE & CEFR RUBRIC */}
            {activeTab === 'feedback' && (
              <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 border-b border-border/80 pb-3">
                  <Award className="w-4 h-4 text-purple-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {isEn ? 'Cambridge Examiner Rubric & Trap Analysis' : 'การวิเคราะห์เกณฑ์ตรวจเคมบริดจ์และจุดหลอกที่พบบ่อย'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                    <span className="text-xs font-black text-rose-700 dark:text-rose-400 block uppercase">
                      {isEn ? 'Common Distractors & Traps' : 'จุดหลอกและกับดักที่ผู้สอบมักตอบผิด'}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {isEn
                        ? 'Cambridge listening tests deliberately mention initial times (e.g. 09:30 or 10:45) before stating the revised actual boarding time (10:15). Always listen for correction markers like "revised" or "delayed".'
                        : 'ข้อสอบการฟังของเคมบริดจ์มักพูดถึงเวลาเก่า (เช่น 09:30 หรือ 10:45) ก่อนจะบอกเวลาขึ้นเครื่องที่ปรับปรุงจริง (10:15) ควรฟังคำเชื่อมแสดงการแก้ไข เช่น "revised" หรือ "delayed" เสมอ'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block uppercase">
                      {isEn ? 'Scoring Criterion: Information Retrieval' : 'เกณฑ์การให้คะแนน: การดึงข้อมูลเฉพาะ'}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {isEn
                        ? 'At CEFR A2/B1 level, full points require isolating concrete details (numbers, gate letters, causes) from connected rapid speech.'
                        : 'ที่ระดับ CEFR A2/B1 การจะได้คะแนนเต็มต้องสามารถจับคู่ตัวเลข ตัวอักษรระบุประตู และสาเหตุที่แท้จริงจากการพูดต่อเนื่องได้อย่างแม่นยำ'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: MORE RELATED COURSES */}
            {activeTab === 'more' && (
              <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 border-b border-border/80 pb-3">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {isEn ? 'Related Cambridge Courses by Dr. Sarah Mitchell' : 'คอร์สเคมบริดจ์ที่เกี่ยวข้องโดย ดร. ซาร่าห์ มิทเชลล์'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => router.push('/reading')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/80 hover:border-primary/50 transition-all cursor-pointer space-y-2"
                  >
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600">
                      Reading Studio • B2
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {isEn ? 'Speed Scanning for Academic Journals' : 'การอ่านกวาดสายตาจับใจความบทความวิชาการ'}
                    </h4>
                    <p className="text-xs text-slate-500">85 Passages • Timed Challenges</p>
                  </div>

                  <div
                    onClick={() => router.push('/mock-exams')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/80 hover:border-primary/50 transition-all cursor-pointer space-y-2"
                  >
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FA5D5D]/10 text-[#FA5D5D]">
                      Cambridge Vault • C1 CAE
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {isEn ? 'Full CAE Examination Simulation' : 'จำลองข้อสอบเคมบริดจ์ CAE เสมือนจริง'}
                    </h4>
                    <p className="text-xs text-slate-500">4 Full Sections • Official Timer</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: 30% WIDTH (Piotr Kosmala Course Curriculum Sidebar)       */}
          {/* ======================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Top Back Action Button */}
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="touch-target px-5 py-2.5 rounded-full border border-sky-500/40 text-sky-700 dark:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isEn ? 'BACK' : 'ย้อนกลับ'}</span>
            </button>

            {/* Course Title & Progress Header */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEn ? 'Cambridge Listening & Exam Prep' : 'คอร์สการฟังและการเตรียมสอบเคมบริดจ์'}
              </h2>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
                  <span>
                    {isEn
                      ? `${completedLessonIds.length} of 11 Lessons Completed`
                      : `เรียนจบแล้ว ${completedLessonIds.length} จาก 11 บทเรียน`}
                  </span>
                  <span>{Math.round((completedLessonIds.length / 11) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(completedLessonIds.length / 11) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Structured Module Accordions (Piotr Kosmala 3 Modules) */}
            <div className="space-y-4">
              {curriculumModules.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xs p-5 sm:p-6 space-y-4"
                >
                  {/* Module Header with Badges and Total Duration */}
                  <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {mod.title}
                      </h3>
                      <div className="flex items-center gap-2 pt-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                            mod.badgeType === 'free'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                          }`}
                        >
                          {mod.badgeType === 'free' ? 'FREE' : 'PREMIUM'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                          {mod.badgeLevel}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-500 shrink-0">
                      {mod.duration}
                    </span>
                  </div>

                  {/* Lesson Items inside Module */}
                  <div className="space-y-1.5">
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.id === currentExercise.id;
                      const isComplete = lesson.isComplete || completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            setSelectedExerciseId(lesson.id);
                            setActiveQuestionIdx(0);
                            setIsPlaying(false);
                            setActiveTab('test');
                          }}
                          className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 font-extrabold shadow-2xs border border-sky-500/25'
                              : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            {/* Status Icon (Checkmark / Pause Playing / Play) */}
                            {isComplete ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : isActive ? (
                              <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                                {isPlaying ? (
                                  <Pause className="w-3 h-3 fill-white" />
                                ) : (
                                  <Play className="w-3 h-3 fill-white ml-0.5" />
                                )}
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                                <Play className="w-3 h-3 ml-0.5" />
                              </div>
                            )}

                            <span className="text-xs truncate font-bold">
                              {lesson.title}
                            </span>
                          </div>

                          <span className="font-mono text-[11px] text-slate-400 shrink-0 font-medium">
                            {lesson.duration}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
