import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  type: string;
  title: string;
  studentName?: string;
  studentId?: string;
  statusText: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';
}

export const ToastNotification: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      const newToast: ToastItem = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: detail.type || 'info',
        title: detail.title || 'Attendance Notification',
        studentName: detail.studentName,
        studentId: detail.studentId,
        statusText: detail.statusText,
        variant: detail.variant || 'blue',
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 3)]);

      // Auto-remove after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener('dtm_toast_event', handleToastEvent);
    return () => {
      window.removeEventListener('dtm_toast_event', handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getBorderColor = (variant?: string) => {
    switch (variant) {
      case 'emerald':
        return 'border-emerald-500/40 bg-slate-900/95 text-slate-100 shadow-emerald-950/40';
      case 'rose':
        return 'border-rose-500/40 bg-slate-900/95 text-slate-100 shadow-rose-950/40';
      case 'amber':
        return 'border-amber-500/40 bg-slate-900/95 text-slate-100 shadow-amber-950/40';
      case 'purple':
        return 'border-purple-500/40 bg-slate-900/95 text-slate-100 shadow-purple-950/40';
      default:
        return 'border-blue-500/40 bg-slate-900/95 text-slate-100 shadow-blue-950/40';
    }
  };

  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'emerald':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'rose':
        return <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'amber':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            id={`toast-${toast.id}`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto rounded-xl border p-4 shadow-xl backdrop-blur-md ${getBorderColor(
              toast.variant
            )}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(toast.variant)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-tight text-white">
                    {toast.title}
                  </h4>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {toast.studentName && (
                  <p className="text-xs font-medium text-slate-300 mt-1">
                    {toast.studentName}{' '}
                    {toast.studentId && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({toast.studentId})
                      </span>
                    )}
                  </p>
                )}
                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-800/80 border border-slate-700/60 text-slate-200">
                  {toast.statusText}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
