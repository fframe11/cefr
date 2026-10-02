'use client';
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'ไม่สามารถดำเนินการได้ในขณะนี้',
  message = 'กรุณาตรวจสอบข้อมูลที่กรอกหรือสัญญาณอินเทอร์เน็ต แล้วลองใหม่อีกครั้ง',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive space-y-3 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold leading-normal">{title}</h4>
          <p className="text-xs sm:text-sm text-destructive/90 mt-0.5 leading-normal max-w-readable">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="pl-8">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/15 hover:bg-destructive/25 text-xs font-semibold transition-colors touch-target cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ลองโหลดข้อมูลอีกครั้ง</span>
          </button>
        </div>
      )}
    </div>
  );
};
