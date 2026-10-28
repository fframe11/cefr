'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (message: string, description?: string, type?: ToastType, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ToastListener = (item: Omit<ToastItem, 'id'>) => void;
let globalToastListener: ToastListener | null = null;

export interface ToastOptions {
  description?: string;
  action?: ToastAction;
}

export const toast = (message: string, options?: ToastOptions) => {
  if (globalToastListener) {
    globalToastListener({ message, description: options?.description, action: options?.action, type: 'info' });
  }
};

toast.success = (message: string, options?: ToastOptions) => {
  if (globalToastListener) {
    globalToastListener({ message, description: options?.description, action: options?.action, type: 'success' });
  }
};

toast.info = (message: string, options?: ToastOptions) => {
  if (globalToastListener) {
    globalToastListener({ message, description: options?.description, action: options?.action, type: 'info' });
  }
};

toast.error = (message: string, options?: ToastOptions) => {
  if (globalToastListener) {
    globalToastListener({ message, description: options?.description, action: options?.action, type: 'error' });
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, description?: string, type: ToastType = 'info', action?: ToastAction) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-4), { id, message, description, type, action }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  useEffect(() => {
    globalToastListener = (item) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-4), { ...item, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };
    return () => {
      globalToastListener = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col items-end gap-2.5 max-w-sm pointer-events-none px-4 md:px-0"
        aria-live="polite"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 sm:gap-3 py-3 px-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 w-fit max-w-[calc(100vw-2rem)] sm:max-w-sm ${
              t.type === 'success'
                ? 'bg-white dark:bg-[#0E1726] border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : t.type === 'error'
                ? 'bg-white dark:bg-[#1C0E14] border-rose-500/40 text-rose-700 dark:text-rose-300'
                : 'bg-white dark:bg-[#23212C] border-slate-200 dark:border-white/15 text-slate-900 dark:text-slate-100'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#FA5D5D] dark:text-[#FA5D5D] shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs min-w-0">
              <p className="font-bold text-slate-900 dark:text-white break-words">{t.message}</p>
              {t.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 break-words">{t.description}</p>
              )}
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="mt-2.5 inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold bg-[#FA5D5D] hover:bg-[#ff4747] text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  {t.action.label}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md transition-colors shrink-0 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
    };
  }
  return context;
};
