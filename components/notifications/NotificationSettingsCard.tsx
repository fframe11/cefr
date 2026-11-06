'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Flame,
  Snowflake,
  Clock,
  Globe,
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  getNotificationSettings,
  updateNotificationSettings,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestPushNotification,
} from '@/lib/push-client';

export const NotificationSettingsCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState(20);
  const [timezone, setTimezone] = useState('Asia/Bangkok');
  const [freezeAvailable, setFreezeAvailable] = useState(1);
  const [freezeUsed, setFreezeUsed] = useState(0);
  const [activeSubsCount, setActiveSubsCount] = useState(0);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getNotificationSettings();
      if (data) {
        setEnabled(data.settings.daily_reminder_enabled);
        setReminderHour(data.settings.preferred_reminder_hour);
        setTimezone(data.settings.timezone || 'Asia/Bangkok');
        setFreezeAvailable(data.settings.streak_freeze_available);
        setFreezeUsed(data.settings.streak_freeze_used_this_month);
        setActiveSubsCount(data.active_subscriptions_count);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleEnabled = async () => {
    const nextVal = !enabled;
    setEnabled(nextVal);
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateNotificationSettings({ daily_reminder_enabled: nextVal });
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: nextVal ? 'เปิดการแจ้งเตือนเตือนความจำแล้ว' : 'ปิดการแจ้งเตือนแล้ว',
        });
      } else {
        setEnabled(!nextVal);
        setStatusMessage({ type: 'error', text: res.error || 'ไม่สามารถบันทึกการตั้งค่าได้' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleHourChange = async (hour: number) => {
    setReminderHour(hour);
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateNotificationSettings({ preferred_reminder_hour: hour });
      if (res.success) {
        setStatusMessage({ type: 'success', text: `ตั้งเวลาแจ้งเตือนเป็น ${String(hour).padStart(2, '0')}:00 น.` });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'บันทึกเวลาไม่สำเร็จ' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribeDevice = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await subscribeToPushNotifications({ preferredReminderHour: reminderHour });
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'เชื่อมต่ออุปกรณ์นี้เข้ากับระบบแจ้งเตือนเรียบร้อย' });
        await loadSettings();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'ไม่สามารถลงทะเบียนการแจ้งเตือนได้' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeDevice = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await unsubscribeFromPushNotifications();
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'ยกเลิกการแจ้งเตือนบนอุปกรณ์นี้แล้ว' });
        await loadSettings();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'ไม่สามารถยกเลิกได้' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await sendTestPushNotification();
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `ส่งข้อความทดสอบสำเร็จ (${res.sent} เครื่องได้รับ)`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'ส่งการแจ้งเตือนทดสอบไม่สำเร็จ' });
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl bg-card border border-border/40 p-5 shadow-xs space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Flame className="w-5 h-5 fill-amber-500/20" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span>การแจ้งเตือน & การรักษาสถิติ Streak</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                PRACTICE HABIT
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              ตั้งเวลาแจ้งเตือนรายวันเพื่อรักษาสถิติการเรียน และจัดการสิทธิ์ Streak Freeze
            </p>
          </div>
        </div>
      </div>

      {/* Status feedback */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Toggle Notification */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="reminder-toggle" className="text-sm font-medium text-foreground cursor-pointer">
              การแจ้งเตือนรายวัน
            </label>
            <p className="text-xs text-muted-foreground">ส่งเตือนผ่าน Web Push เมื่อยังไม่ได้ฝึก</p>
          </div>
          <button
            id="reminder-toggle"
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={handleToggleEnabled}
            disabled={saving || loading}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              enabled ? 'bg-amber-500' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Time Picker */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="reminder-hour-select" className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>เวลาที่ต้องการให้เตือน</span>
            </label>
            <p className="text-xs text-muted-foreground">ระบบจะส่งเตือนหากยังไม่ฝึกในเวลานี้</p>
          </div>
          <select
            id="reminder-hour-select"
            value={reminderHour}
            onChange={(e) => handleHourChange(Number(e.target.value))}
            disabled={!enabled || saving || loading}
            className="px-2.5 py-1.5 rounded-md bg-background border border-border text-xs font-mono font-medium text-foreground focus-visible:ring-2 focus-visible:ring-primary outline-none"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, '0')}:00 น.
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Streak Freeze & Device Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak Freeze Card */}
        <div className="p-4 rounded-lg bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-semibold text-foreground">Streak Freeze (ฟรีซหยุดเวลา)</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              {freezeAvailable} สิทธิ์พร้อมใช้
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ระบบมอบสิทธิ์ Streak Freeze ฟรี 1 ครั้งในทุกเดือน หากคุณลืมฝึก 1 วัน สิทธิ์นี้จะช่วยคงสถิติ Streak ไม่ให้รีเซ็ตเป็น 0
          </p>
        </div>

        {/* Connected Devices & Test */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/30 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">อุปกรณ์ที่รับการแจ้งเตือน</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {activeSubsCount} อุปกรณ์ ({timezone})
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {activeSubsCount === 0 ? (
              <button
                type="button"
                onClick={handleSubscribeDevice}
                disabled={saving || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>เปิดรับบนเครื่องนี้</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUnsubscribeDevice}
                disabled={saving || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <BellOff className="w-3.5 h-3.5" />
                <span>ยกเลิกบนเครื่องนี้</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testing || activeSubsCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted/50 text-foreground transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testing ? 'กำลังส่ง...' : 'ทดสอบแจ้งเตือน'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
