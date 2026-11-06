'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Flame, X, CheckCircle, ShieldAlert } from 'lucide-react';
import { subscribeToPushNotifications } from '@/lib/push-client';

interface NotificationOptInBannerProps {
  onSubscribed?: () => void;
  className?: string;
}

export const NotificationOptInBanner: React.FC<NotificationOptInBannerProps> = ({
  onSubscribed,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Only show if browser supports Notifications and permission is 'default' (not yet asked)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const dismissed = sessionStorage.getItem('glova_notification_opt_in_dismissed');
      if (Notification.permission === 'default' && !dismissed) {
        setIsVisible(true);
      }
    }
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('glova_notification_opt_in_dismissed', 'true');
  };

  const handleEnable = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await subscribeToPushNotifications();
      if (res.success) {
        setStatusMessage('เปิดการแจ้งเตือนเรียบร้อยแล้ว!');
        if (onSubscribed) onSubscribed();
        setTimeout(() => setIsVisible(false), 2000);
      } else {
        setStatusMessage(res.error || 'ไม่สามารถเปิดการแจ้งเตือนได้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Daily Practice Reminder Opt-in"
      className={`relative overflow-hidden rounded-xl bg-card border border-amber-500/30 p-4 shadow-sm transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Flame className="w-5 h-5 fill-amber-500/20" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>รักษาไฟ Streak ไม่ให้ดับลง</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300">
                DAILY HABIT
              </span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              เปิดการแจ้งเตือนผ่านเว็บเบราว์เซอร์เพื่อรับการเตือนฝึกภาษาอังกฤษตามเวลาที่คุณสะดวก
            </p>
            {statusMessage && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {statusMessage}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            ไว้ทีหลัง
          </button>
          <button
            type="button"
            onClick={handleEnable}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors active:scale-95 disabled:opacity-50"
          >
            <Bell className="w-3.5 h-3.5" />
            {isLoading ? 'กำลังเปิด...' : 'เปิดการแจ้งเตือน'}
          </button>
        </div>
      </div>
    </div>
  );
};
